from pydantic import BaseModel, Field
from typing import List, Optional
from ai.rag.schemas.embeddings import SearchResultChunk


class ChatMessage(BaseModel):
    role: str = Field(..., example="user")
    content: str = Field(..., example="Explain RAG pipeline components")


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    stream: bool = False


class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[str] = None
    sources: List[SearchResultChunk] = []
