from pathlib import Path
from typing import List, Dict, Any, Optional
from ai.rag.loaders.factory import LoaderFactory
from ai.rag.splitters.text_splitter import TextSplitter
from ai.rag.embeddings.base import BaseEmbeddingProvider
from ai.rag.vector_store.base import BaseVectorStore
from ai.rag.retrievers.similarity import SimilarityRetriever
from ai.rag.retrievers.mmr import MMRRetriever
import logging
logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG Orchestrator Service managing document ingestion, embedding indexing, and retrieval.
    """

    def __init__(
        self,
        embedding_provider: BaseEmbeddingProvider,
        vector_store: BaseVectorStore,
        text_splitter: Optional[TextSplitter] = None
    ):
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        self.text_splitter = text_splitter or TextSplitter()
        self.similarity_retriever = SimilarityRetriever(embedding_provider, vector_store)
        self.mmr_retriever = MMRRetriever(embedding_provider, vector_store)

    def ingest_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Parses, chunks, embeds, and stores a document file into the vector database.
        If this file was already indexed before (same filename), its old chunks are
        purged first — so re-running ingestion on the same folder is idempotent and
        never produces duplicate vectors for the same source.
        """
        file_path = Path(file_path)
        logger.info(f"Starting ingestion process for file: {file_path}")

        try:
            removed = self.vector_store.delete_by_source(file_path.name)
            if removed:
                logger.info(f"Replaced previous index for '{file_path.name}': {removed} old chunks removed.")
        except Exception as e:
            logger.warning(f"Could not clear previous chunks for '{file_path.name}': {e}")

        loader = LoaderFactory.get_loader(file_path)
        document = loader.load(file_path)
        chunks = self.text_splitter.split_document(document)

        if not chunks:
            return {
                "filename": file_path.name,
                "file_type": file_path.suffix,
                "file_size_bytes": file_path.stat().st_size if file_path.exists() else 0,
                "chunks_created": 0,
                "vectors_indexed": 0,
                "message": "File processed but produced 0 text chunks."
            }

        texts = [chunk.content for chunk in chunks]
        embeddings = self.embedding_provider.embed_documents(texts)
        indexed_count = self.vector_store.add_chunks(chunks, embeddings)

        logger.info(f"Ingested '{file_path.name}': {len(chunks)} chunks created, {indexed_count} vectors stored.")
        return {
            "filename": file_path.name,
            "file_type": file_path.suffix,
            "file_size_bytes": file_path.stat().st_size if file_path.exists() else 0,
            "chunks_created": len(chunks),
            "vectors_indexed": indexed_count,
            "message": "File successfully ingested and indexed into vector database."
        }

    def delete_document(self, filename: str, delete_file: bool = True, uploads_dir: Optional[Path] = None) -> Dict[str, Any]:
        """
        Fully removes a document from the system: its vectors/chunks from
        the vector store, and (optionally) the physical file from disk.
        """
        removed_vectors = self.vector_store.delete_by_source(filename)

        file_removed = False
        if delete_file:
            from backend.core.config import settings
            target_dir = uploads_dir or (Path.cwd() / "rag_data" / "uploads")
            file_path = Path(target_dir) / filename
            if file_path.exists():
                file_path.unlink()
                file_removed = True

        logger.info(
            f"Deleted document '{filename}': {removed_vectors} vectors removed, "
            f"file_removed={file_removed}."
        )
        return {
            "filename": filename,
            "vectors_removed": removed_vectors,
            "file_removed": file_removed
        }

    def sync_with_uploads_dir(self, uploads_dir: Optional[Path] = None) -> Dict[str, Any]:
        """
        Reconciles the vector store with what's actually present in the
        uploads folder, in both directions:
          - files that exist on disk but aren't indexed yet -> get ingested
          - indexed sources whose file no longer exists on disk -> get purged
        Call this on startup (and periodically) so the RAG index always
        matches exactly what's sitting in the data/uploads folder.
        """
        from backend.core.config import settings
        from ai.rag.constants import SUPPORTED_EXTENSIONS
        target_dir = Path(uploads_dir or (Path.cwd() / "rag_data" / "uploads"))

        files_on_disk = (
            {p.name: p for p in target_dir.glob("*") if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS}
            if target_dir.exists() else {}
        )
        indexed_sources = set(self.vector_store.list_sources())

        removed = []
        for source in indexed_sources:
            if source not in files_on_disk:
                count = self.vector_store.delete_by_source(source)
                removed.append({"filename": source, "vectors_removed": count})

        added = []
        for filename, file_path in files_on_disk.items():
            if filename not in indexed_sources:
                try:
                    result = self.ingest_file(file_path)
                    added.append({"filename": filename, "vectors_indexed": result["vectors_indexed"]})
                except Exception as e:
                    logger.error(f"Sync: failed to ingest new file '{filename}': {e}")

        if removed or added:
            logger.info(f"Sync: {len(added)} new file(s) ingested, {len(removed)} orphaned document(s) removed.")

        return {"removed": removed, "added": added, "checked": len(files_on_disk)}

    def search(
        self,
        query: str,
        top_k: int = 4,
        use_mmr: bool = False,
        score_threshold: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes semantic vector search for a query string.
        """
        if use_mmr:
            return self.mmr_retriever.retrieve(query, top_k=top_k)
        else:
            return self.similarity_retriever.retrieve(query, top_k=top_k, score_threshold=score_threshold)
