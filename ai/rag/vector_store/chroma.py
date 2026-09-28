from typing import List, Dict, Any, Optional
from pathlib import Path
import chromadb
from chromadb.config import Settings as ChromaSettings
from ai.rag.vector_store.base import BaseVectorStore
from ai.rag.documents.document import DocumentChunk
from backend.core.config import settings
from ai.rag.exceptions import VectorStoreError
import logging
logger = logging.getLogger(__name__)


class ChromaVectorStore(BaseVectorStore):
    """
    ChromaDB persistent vector storage implementation.
    """

    def __init__(self, persist_dir: str = None, collection_name: str = None):
        persist_path = Path(persist_dir or settings.VECTOR_DB_DIR)
        if not persist_path.is_absolute():
            persist_path = settings.BASE_DIR / persist_path

        persist_path.mkdir(parents=True, exist_ok=True)
        self.collection_name = collection_name or settings.COLLECTION_NAME

        try:
            logger.info(f"Initializing ChromaDB client at: {persist_path}")
            self.client = chromadb.PersistentClient(
                path=str(persist_path),
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise VectorStoreError(f"ChromaDB initialization failed: {e}")

    def add_chunks(self, chunks: List[DocumentChunk], embeddings: List[List[float]]) -> int:
        if not chunks or not embeddings:
            return 0
        if len(chunks) != len(embeddings):
            raise VectorStoreError("Mismatch between chunk count and embedding count.")

        try:
            ids = [chunk.id for chunk in chunks]
            documents = [chunk.content for chunk in chunks]
            metadatas = []
            for chunk in chunks:
                meta = chunk.metadata.copy() if chunk.metadata else {}
                if not meta:
                    meta = {"doc_id": chunk.doc_id, "chunk_index": chunk.chunk_index}
                metadatas.append(meta)

            self.collection.upsert(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas
            )
            logger.info(f"Upserted {len(chunks)} chunks into ChromaDB collection '{self.collection_name}'.")
            return len(chunks)
        except Exception as e:
            logger.error(f"Failed to add chunks to ChromaDB: {e}")
            raise VectorStoreError(f"Error adding vectors to store: {e}")

    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 4,
        where_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        try:
            total_count = self.collection.count()
            if total_count == 0:
                return []

            actual_k = min(top_k, total_count)
            query_params = {
                "query_embeddings": [query_embedding],
                "n_results": actual_k,
                "include": ["documents", "metadatas", "distances"]
            }
            if where_metadata:
                query_params["where"] = where_metadata

            results = self.collection.query(**query_params)

            formatted_results = []
            if results and results.get("ids") and results["ids"][0]:
                for i in range(len(results["ids"][0])):
                    chunk_id = results["ids"][0][i]
                    doc_content = results["documents"][0][i]
                    metadata = results["metadatas"][0][i]
                    distance = results["distances"][0][i]
                    # Convert cosine distance to similarity score (1 - distance)
                    similarity = max(0.0, 1.0 - float(distance))

                    formatted_results.append({
                        "chunk_id": chunk_id,
                        "content": doc_content,
                        "metadata": metadata,
                        "similarity_score": round(similarity, 4)
                    })

            return formatted_results
        except Exception as e:
            logger.error(f"Failed similarity search in ChromaDB: {e}")
            raise VectorStoreError(f"Error performing similarity search: {e}")

    def delete_by_source(self, source: str) -> int:
        """
        Deletes every chunk whose metadata['source'] equals `source`.
        This is how a document is fully purged after its file is removed
        from the uploads folder (or replaced by a re-upload).
        """
        try:
            existing = self.collection.get(where={"source": source}, include=[])
            ids = existing.get("ids", [])
            if not ids:
                return 0

            self.collection.delete(ids=ids)
            logger.info(f"Deleted {len(ids)} chunks for source '{source}' from ChromaDB.")
            return len(ids)
        except Exception as e:
            logger.error(f"Failed to delete chunks for source '{source}': {e}")
            raise VectorStoreError(f"Error deleting vectors for '{source}': {e}")

    def list_sources(self) -> List[str]:
        """
        Returns the distinct 'source' filenames present in the collection.
        """
        try:
            total_count = self.collection.count()
            if total_count == 0:
                return []

            records = self.collection.get(include=["metadatas"])
            sources = set()
            for meta in records.get("metadatas", []) or []:
                if meta and meta.get("source"):
                    sources.add(meta["source"])
            return sorted(sources)
        except Exception as e:
            logger.error(f"Failed to list sources in ChromaDB: {e}")
            raise VectorStoreError(f"Error listing indexed sources: {e}")

    def get_stats(self) -> Dict[str, Any]:
        try:
            count = self.collection.count()
            total_documents = len(self.list_sources())
            return {
                "collection_name": self.collection_name,
                "total_vectors": count,
                "total_documents": total_documents,
                "embedding_model": settings.EMBEDDING_MODEL_NAME
            }
        except Exception as e:
            logger.error(f"Failed to get ChromaDB stats: {e}")
            raise VectorStoreError(f"Error reading vector store stats: {e}")
