from typing import List
from ai.rag.documents.document import Document, DocumentChunk
from backend.core.config import settings
import logging
logger = logging.getLogger(__name__)


class TextSplitter:
    """
    Splits Document entities into smaller overlapping DocumentChunk objects.
    Utilizes recursive character splitting logic (paragraphs, sentences, words).
    """

    def __init__(self,
                 chunk_size: int = settings.DEFAULT_CHUNK_SIZE,
                 chunk_overlap: int = settings.DEFAULT_CHUNK_OVERLAP
                 ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = ["\n\n", "\n", ". ", " ", ""]
    
    def split_document(self, document: Document) -> List[DocumentChunk]:
        """
        Splits a single document into chunks while preserving metadata.
        """
        raw_text = document.content
        if not raw_text or not raw_text.strip():
            logger.warning(f"Document {document.id} is empty. Skipping chunking.")
            return []

        chunks_text = self._split_text(raw_text)
        document_chunks = []

        for idx, text in enumerate(chunks_text):
            chunk_metadata = document.metadata.copy()
            chunk_metadata.update({
                "doc_id": document.id,
                "chunk_index": idx,
                "total_chunks": len(chunks_text),
                "char_length": len(text)
            })
            chunk = DocumentChunk(
                doc_id=document.id,
                content=text,
                chunk_index=idx,
                metadata=chunk_metadata
            )
            document_chunks.append(chunk)

        logger.info(f"Split document '{document.metadata.get('source', document.id)}' into {len(document_chunks)} chunks.")
        return document_chunks

    def _split_text(self, text: str) -> List[str]:
        """
        Recursive character splitting implementation.
        """
        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = start + self.chunk_size
            if end >= text_len:
                chunks.append(text[start:].strip())
                break

            best_break = end
            for separator in self.separators:
                sep_idx = text.rfind(separator, start + (self.chunk_size // 2), end)
                if sep_idx != -1:
                    best_break = sep_idx + len(separator)
                    break

            chunk_content = text[start:best_break].strip()
            if chunk_content:
                chunks.append(chunk_content)

            start = max(start + 1, best_break - self.chunk_overlap)

        return [c for c in chunks if c]