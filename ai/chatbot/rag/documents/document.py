from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import uuid


class Document(BaseModel):
    """
    Domain entity representing a parsed document before chunking.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DocumentChunk(BaseModel):
    """
    Domain entity representing a single text chunk of a document for vector indexing.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    doc_id: str
    content: str
    chunk_index: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
