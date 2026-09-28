"""
Custom exceptions for the RAG Application.
"""

class RAGException(Exception):
    """Base exception class for RAG application errors."""
    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class DocumentProcessingError(RAGException):
    """Raised when document loading or parsing fails."""
    pass


class UnsupportedFileTypeError(RAGException):
    """Raised when an unsupported file type is provided."""
    pass


class VectorStoreError(RAGException):
    """Raised when vector database operations fail."""
    pass


class EmbeddingError(RAGException):
    """Raised when text embedding generation fails."""
    pass


class RetrievalError(RAGException):
    """Raised when search retrieval fails."""
    pass


class LLMRateLimitError(RAGException):
    """Raised when the LLM provider (e.g. Groq) rejects a request due to a rate/token limit."""
    pass
