from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ai.chatbot.rag.documents.document import DocumentChunk


class BaseVectorStore(ABC):
    """
    Abstract Base Class for Vector Database Storage engines.
    """

    @abstractmethod
    def add_chunks(self, chunks: List[DocumentChunk], embeddings: List[List[float]]) -> int:
        """
        Stores document chunks along with their vector embeddings into the vector store.
        """
        pass

    @abstractmethod
    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 4,
        where_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs vector similarity search given a query embedding.
        """
        pass

    @abstractmethod
    def get_stats(self) -> Dict[str, Any]:
        """
        Returns stats about the vector collection (total count, name, etc.).
        """
        pass

    @abstractmethod
    def delete_by_source(self, source: str) -> int:
        """
        Deletes every chunk/vector whose metadata['source'] matches the given
        filename. Returns the number of chunks removed.
        """
        pass

    @abstractmethod
    def list_sources(self) -> List[str]:
        """
        Returns the distinct list of source filenames currently indexed
        in the vector store (used to reconcile with what's on disk).
        """
        pass
