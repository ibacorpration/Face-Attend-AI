import json
import re
import uuid
from typing import Dict, Any, List, Generator
from ai.rag.rag.rag_service import RAGService
from ai.rag.llms.base import BaseLLMProvider
from ai.rag.llms.groq_llm import GroqLLMProvider
from ai.rag.llms.gemini_llm import GeminiLLMProvider
from ai.rag.llms.fallback_llm import FallbackLLMProvider
from ai.rag.memory.base import BaseMemory
from ai.rag.memory.in_memory import InMemoryConversationMemory
from ai.rag.prompts.templates import RAG_SYSTEM_PROMPT, RAG_USER_PROMPT_TEMPLATE
from backend.core.config import settings
import logging
logger = logging.getLogger(__name__)



_SMALLTALK_PATTERNS = [

    # English
    r'^(hi+|hello+|hey+|hiya|yo|greetings)$',
    r'^(good\s?(morning|evening|afternoon|night))$',
    r'^(thanks?( you)?|thx|ty|appreciate it)$',
    r'^(bye|goodbye|see\s?you|later|take care)$',
    r'^(ok(ay)?|cool|nice|great|got it|sounds good)$',
    r'^(who are you|introduce yourself|what can you do|what is your name)$',

    # Arabic
    r'^(هاي|هلا+|أهلا+|اهلا+|السلام عليكم|صباح الخير|مساء الخير)$',
    r'^(شكرا+|شكراً|تسلم|يعطيك العافية|متشكر|ميرسي|تسلم ايديك|تسلم ايدك)$',
    r'^(مع السلامة|باي|سلام|تصبح على خير)$',
    r'^(عرفني بنفسك|عرفني بيك|من أنت|انت مين|إنت مين|مين انت|ايه اللي تقدر تعمله|بتعمل ايه)$',
    r'^(اوك|أوكي|تمام|كويس|حلو|ماشي)$',

]


def _is_smalltalk(message: str) -> bool:
    normalized = message.strip()
    return any(
        re.match(pattern, normalized, re.IGNORECASE)
        for pattern in _SMALLTALK_PATTERNS
    )


class RAGChatService:
    """
    RAG Chat Service handling conversational RAG flow:
    Retrieval -> Dedup -> Context Budgeting -> History Trimming ->
    Prompt Construction -> LLM Generation -> Memory Update.

    The dedup/budget/trim steps exist specifically to keep per-request
    token usage predictable — sending every retrieved chunk at full length
    plus the full raw conversation history on every single turn is what
    burns through a provider's daily token quota fastest.
    """

    def __init__(
        self,
        rag_service: RAGService,
        llm_provider: BaseLLMProvider = None,
        memory: BaseMemory = None
    ):
        self.rag_service = rag_service
        self.llm_provider = llm_provider or FallbackLLMProvider(
            primary=GeminiLLMProvider(), 
            fallback=GroqLLMProvider()
        )
        self.memory = memory or InMemoryConversationMemory()

    def chat(
        self,
        user_message: str,
        conversation_id: str = None,
        top_k: int = None,
        use_mmr: bool = False
    ) -> Dict[str, Any]:
        conv_id = conversation_id or str(uuid.uuid4())
        logger.info(f"Processing RAG chat completion for conversation: {conv_id}")

        # 1. Retrieve relevant context chunks — skipped entirely for
        #    small talk (greetings, thanks, "who are you"...), so those
        #    replies never get a sources box attached.
        if _is_smalltalk(user_message):
            retrieved_chunks = []
        else:
            # Check if the message contains Arabic characters
            import re
            search_query = user_message
            if bool(re.search(r'[\u0600-\u06FF]', user_message)):
                try:
                    logger.info("Translating Arabic query to English for embedding search...")
                    search_query = self.llm_provider.generate(
                        prompt=f"Translate this query to English. Output ONLY the English translation without any quotes or extra words:\n\n{user_message}",
                        system_prompt="You are a translator.",
                        temperature=0.1
                    ).strip(' "\'\n')
                    logger.info(f"Translated query: {search_query}")
                except Exception as e:
                    logger.error(f"Failed to translate query: {e}")
                    
            retrieved_chunks = self.rag_service.search(
                query=search_query,
                top_k=top_k or settings.RAG_TOP_K,
                use_mmr=use_mmr,
                score_threshold=settings.RAG_SCORE_THRESHOLD
            )

        # 2. Drop chunks that are only loosely related to THIS specific
        #    question (relative to its best match), then dedup + budget
        focused_chunks = self._apply_relative_cutoff(retrieved_chunks)
        deduped_chunks = self._dedup_chunks(focused_chunks)
        context_chunks = self._apply_context_budget(deduped_chunks)
        formatted_context = self._format_context(context_chunks)

        # 3. Retrieve + trim conversation history
        history_list = self.memory.get_history(conv_id)
        formatted_history = self._format_history(history_list)

        # 4. Construct prompt
        prompt = RAG_USER_PROMPT_TEMPLATE.format(
            context=formatted_context,
            history=formatted_history,
            question=user_message
        )

        # 5. Generate LLM response via Groq API
        answer = self.llm_provider.generate(prompt=prompt, system_prompt=RAG_SYSTEM_PROMPT, temperature=0.3)

        # 6. Update conversation memory
        self.memory.add_user_message(conv_id, user_message)
        self.memory.add_ai_message(conv_id, answer)

        return {
            "conversation_id": conv_id,
            "response": answer,
            # Only the chunks that actually made it into the prompt sent to
            # the LLM — this is what the answer was really generated from.
            "sources": context_chunks
        }

    def chat_stream(
        self,
        user_message: str,
        conversation_id: str = None,
        top_k: int = None,
        use_mmr: bool = False
    ) -> Generator[str, None, None]:
        conv_id = conversation_id or str(uuid.uuid4())
        logger.info(f"Processing RAG streaming chat for conversation: {conv_id}")

        if _is_smalltalk(user_message):
            retrieved_chunks = []
        else:
            retrieved_chunks = self.rag_service.search(
                query=user_message,
                top_k=top_k or settings.RAG_TOP_K,
                use_mmr=use_mmr,
                score_threshold=settings.RAG_SCORE_THRESHOLD
            )
        focused_chunks = self._apply_relative_cutoff(retrieved_chunks)
        deduped_chunks = self._dedup_chunks(focused_chunks)
        context_chunks = self._apply_context_budget(deduped_chunks)
        formatted_context = self._format_context(context_chunks)

        history_list = self.memory.get_history(conv_id)
        formatted_history = self._format_history(history_list)

        prompt = RAG_USER_PROMPT_TEMPLATE.format(
            context=formatted_context,
            history=formatted_history,
            question=user_message
        )

        self.memory.add_user_message(conv_id, user_message)

        full_response_acc = []
        for token in self.llm_provider.generate_stream(prompt=prompt, system_prompt=RAG_SYSTEM_PROMPT, temperature=0.3):
            full_response_acc.append(token)
            yield token

        full_answer = "".join(full_response_acc)
        self.memory.add_ai_message(conv_id, full_answer)

        # Final control token: not part of the visible answer text. The
        # frontend recognizes the "[[SOURCES]]" prefix and renders it as
        # the sources box instead of appending it to the chat bubble.
        sources_payload = [
            {
                "chunk_id": c.get("chunk_id"),
                "content": c.get("content"),
                "similarity_score": c.get("similarity_score"),
                "metadata": c.get("metadata"),
            }
            for c in context_chunks
        ]
        yield "[[SOURCES]]" + json.dumps(sources_payload, ensure_ascii=False)

    def _apply_relative_cutoff(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Keeps only chunks whose score is at least
        settings.RAG_RELATIVE_SCORE_CUTOFF of the top match's score for
        THIS question. Without this, a chunk from an unrelated file can
        clear the loose absolute score_threshold and still get shown as a
        "source" even though the answer really only came from the top
        match — e.g. asking about a CV entry shouldn't also cite a barely-
        related project file just because it scraped past the floor.
        """
        if not chunks:
            return chunks
        top_score = max(c.get("similarity_score", 0) for c in chunks)
        if top_score <= 0:
            return chunks
        cutoff = top_score * settings.RAG_RELATIVE_SCORE_CUTOFF
        return [c for c in chunks if c.get("similarity_score", 0) >= cutoff]

    def _dedup_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Drops chunks whose content is an exact or near-exact repeat of one
        already kept (can happen with overlapping chunk boundaries or if a
        file was ever indexed more than once). Keeps the highest-scoring
        copy of each unique piece of text, in score order.
        """
        seen_content = set()
        unique_chunks = []
        for chunk in chunks:
            normalized = " ".join(chunk.get("content", "").split()).lower()
            if normalized in seen_content:
                continue
            seen_content.add(normalized)
            unique_chunks.append(chunk)
        return unique_chunks

    def _apply_context_budget(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Greedily keeps chunks (already in relevance order) until the
        combined character budget (settings.RAG_MAX_CONTEXT_CHARS) is hit,
        truncating the last chunk that goes over instead of dropping it
        entirely. This is what actually caps the size of the context block
        sent to the LLM, regardless of how many chunks top_k returned.
        """
        budget = settings.RAG_MAX_CONTEXT_CHARS
        budgeted = []
        used = 0
        for chunk in chunks:
            content = chunk.get("content", "")
            remaining = budget - used
            if remaining <= 0:
                break
            if len(content) > remaining:
                chunk = {**chunk, "content": content[:remaining].rstrip() + "…"}
            budgeted.append(chunk)
            used += len(chunk["content"])
        return budgeted

    def _format_context(self, chunks: List[Dict[str, Any]]) -> str:
        if not chunks:
            return "No relevant background document context available."

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            source = chunk.get("metadata", {}).get("source", "Document")
            context_parts.append(f"--- Document Source [{i}]: {source} ---\n{chunk['content']}")
        return "\n\n".join(context_parts)

    def _format_history(self, history: List[Dict[str, str]]) -> str:
        if not history:
            return "None"

        trimmed = history[-settings.CHAT_HISTORY_MAX_MESSAGES:]
        max_chars = settings.CHAT_HISTORY_MAX_CHARS_PER_MSG
        lines = []
        for msg in trimmed:
            content = msg["content"]
            if len(content) > max_chars:
                content = content[:max_chars].rstrip() + "…"
            lines.append(f"{msg['role'].capitalize()}: {content}")
        return "\n".join(lines)
