from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging


# Wait, who can use the chatbot? Employees or Admin? "The frontend already contains the final chatbot UI" - wait, is it for employees or anyone? Let's check how the Chat UI is currently used.
# For now, let's just make it a simple route, and apply Depends if needed later.

from functools import lru_cache
from ai.rag.embeddings.sentence_transformer import SentenceTransformerEmbedding
from ai.rag.vector_store.chroma import ChromaVectorStore
from ai.rag.rag.rag_service import RAGService
from ai.rag.rag.chat_service import RAGChatService
from ai.rag.llms.groq_llm import GroqLLMProvider
from ai.rag.memory.in_memory import InMemoryConversationMemory

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
def get_llm_provider() -> GroqLLMProvider:
    return GroqLLMProvider()

def get_rag_service() -> RAGService:
    embedding_provider = get_embedding_provider()
    vector_store = get_vector_store()
    return RAGService(embedding_provider=embedding_provider, vector_store=vector_store)

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

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, chat_service: RAGChatService = Depends(get_rag_chat_service)):
    try:
        response = chat_service.chat(
            message=request.message,
            conversation_id=request.conversation_id
        )
        # response is assumed to be an object or dict with 'answer' and optionally 'sources'
        # RAGChatService typically returns an Answer object
        # Let's map it securely
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
