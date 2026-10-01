from typing import List, Dict, Any, Optional
from ai.chatbot.rag.embeddings.base import BaseEmbeddingProvider
from ai.chatbot.rag.vector_store.base import BaseVectorStore
from ai.chatbot.rag.exceptions import RetrievalError
import logging
logger = logging.getLogger(__name__)


class SimilarityRetriever:
    """
    Standard cosine/dot similarity retriever.
    """

    def __init__(self, embedding_provider: BaseEmbeddingProvider, vector_store: BaseVectorStore):
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        score_threshold: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []

        try:
            logger.info(f"Retrieving top {top_k} similarity matches for query: '{query}'")
            query_embedding = self.embedding_provider.embed_query(query)
            results = self.vector_store.similarity_search(query_embedding, top_k=top_k)

            if score_threshold is not None:
                results = [r for r in results if r["similarity_score"] >= score_threshold]

            logger.info(f"Retrieved {len(results)} chunks after threshold filtering.")
            return results
        except Exception as e:
            logger.error(f"Retrieval failed for query '{query}': {e}")
            raise RetrievalError(f"Similarity search failed: {e}")
