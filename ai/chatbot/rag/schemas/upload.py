from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class DocumentUploadResponse(BaseModel):
    """
    Schema for file upload and ingestion status response.
    """
    filename: str
    file_type: str
    file_size_bytes: int
    chunks_created: int
    vectors_indexed: int
    message: str = "Document successfully uploaded and indexed."
    metadata: Optional[Dict[str, Any]] = None


class DocumentDeleteResponse(BaseModel):
    """
    Schema for document deletion status response.
    """
    filename: str
    vectors_removed: int
    file_removed: bool
    message: str = "Document removed from the vector store."


class SyncResponse(BaseModel):
    """
    Schema for the uploads-folder <-> vector-store reconciliation result.
    """
    checked: int
    added: list
    removed: list
    message: str = "Sync completed."
