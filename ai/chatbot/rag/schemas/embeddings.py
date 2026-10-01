from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class VectorSearchRequest(BaseModel):
    """
    Schema for vector search retrieval request.
    """
    query: str = Field(..., description="Search query string", example="What is Retrieval-Augmented Generation?")
    top_k: int = Field(2, ge=1, le=20, description="Number of document chunks to retrieve")
    use_mmr: bool = Field(False, description="Whether to use Maximal Marginal Relevance (MMR) for diversity")
    score_threshold: Optional[float] = Field(None, description="Optional minimum similarity score threshold")


class SearchResultChunk(BaseModel):
    """
    Schema representing a single retrieved document chunk.
    """
    chunk_id: str
    content: str
    similarity_score: float
    metadata: Dict[str, Any]


class VectorSearchResponse(BaseModel):
    """
    Schema for vector search retrieval results response.
    """
    query: str
    retrieved_count: int
    results: List[SearchResultChunk]


class CollectionStatsResponse(BaseModel):
    """
    Schema for vector database collection statistics.
    """
    collection_name: str
    total_vectors: int
    total_documents: int
    embedding_model: str
