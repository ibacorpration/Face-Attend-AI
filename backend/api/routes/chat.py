from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
import logging
import threading


# Wait, who can use the chatbot? Employees or Admin? "The frontend already contains the final chatbot UI" - wait, is it for employees or anyone? Let's check how the Chat UI is currently used.
# For now, let's just make it a simple route, and apply Depends if needed later.

from functools import lru_cache
from ai.chatbot.rag.embeddings.sentence_transformer import SentenceTransformerEmbedding
from ai.chatbot.rag.vector_store.chroma import ChromaVectorStore
from ai.chatbot.rag.rag.rag_service import RAGService
from ai.chatbot.rag.rag.chat_service import RAGChatService
from ai.chatbot.rag.llms.groq_llm import GroqLLMProvider
from ai.chatbot.rag.llms.gemini_llm import GeminiLLMProvider
from ai.chatbot.rag.llms.fallback_llm import FallbackLLMProvider
from ai.chatbot.rag.llms.base import BaseLLMProvider
from ai.chatbot.rag.memory.in_memory import InMemoryConversationMemory

logger = logging.getLogger(__name__)
router = APIRouter()

@lru_cache()
def get_embedding_provider() -> SentenceTransformerEmbedding:
    return SentenceTransformerEmbedding()

@lru_cache()
def get_vector_store() -> ChromaVectorStore:
    return ChromaVectorStore()

@lru_cache()
def get_memory() -> InMemoryConversationMemory:
    return InMemoryConversationMemory()

@lru_cache()
def get_llm_provider() -> BaseLLMProvider:
    from backend.core.config import settings
    if settings.LLM_PROVIDER.lower() == "gemini":
        primary = GeminiLLMProvider()
        fallback = GroqLLMProvider()
    else:
        primary = GroqLLMProvider()
        fallback = GeminiLLMProvider()
    return FallbackLLMProvider(primary=primary, fallback=fallback)

def get_rag_service() -> RAGService:
    embedding_provider = get_embedding_provider()
    vector_store = get_vector_store()
    return RAGService(embedding_provider=embedding_provider, vector_store=vector_store)

_rag_index_lock = threading.Lock()
_rag_index_synced = False

def ensure_rag_index_synced(rag_service: RAGService) -> None:
    """
    Indexes rag_data/uploads into the vector store once per process, lazily
    on the first chat request. Startup sync is disabled (ENABLE_RAG_STARTUP_SYNC)
    to save memory, and the vector DB is not persisted between deploys, so
    without this the vector store is empty and file questions get no context.
    """
    global _rag_index_synced
    if _rag_index_synced:
        return
    with _rag_index_lock:
        if _rag_index_synced:
            return
        try:
            uploads_dir = Path.cwd() / "rag_data" / "uploads"
            result = rag_service.sync_with_uploads_dir(uploads_dir)
            logger.info(f"Lazy RAG sync done: {result}")
            _rag_index_synced = True
        except Exception:
            logger.exception("Lazy RAG sync failed")

def get_rag_chat_service() -> RAGChatService:
    rag_service = get_rag_service()
    memory = get_memory()
    llm_provider = get_llm_provider()
    return RAGChatService(rag_service=rag_service, llm_provider=llm_provider, memory=memory)


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = "default"

class SourceModel(BaseModel):
    document: str
    content: str
    page: Optional[int] = None
    similarity: Optional[float] = None

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[SourceModel]] = []

from fastapi.responses import StreamingResponse
import json

@router.post("", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, chat_service: RAGChatService = Depends(get_rag_chat_service)):
    try:
        response = chat_service.chat(
            user_message=request.message,
            conversation_id=request.conversation_id
        )
        answer = response.get("response", str(response))
        sources = response.get("sources", [])
        
        mapped_sources = []
        for s in sources:
            metadata = s.get("metadata", {}) or {}
            mapped_sources.append(SourceModel(
                document=metadata.get("source", "Unknown"),
                content=s.get("content", ""),
                page=metadata.get("page", None),
                similarity=s.get("similarity_score", None)
            ))

        return ChatResponse(
            answer=answer,
            sources=mapped_sources
        )
    except Exception as e:
        logger.exception("Error in chat endpoint")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/stream")
def chat_stream_endpoint(request: ChatRequest, chat_service: RAGChatService = Depends(get_rag_chat_service)):
    def generate():
        try:
            for chunk in chat_service.chat_stream(
                user_message=request.message,
                conversation_id=request.conversation_id
            ):
                if chunk.startswith("[[SOURCES]]"):
                    continue
                # We yield each chunk as SSE
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.exception("Error in chat stream endpoint")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(generate(), media_type="text/event-stream")
