from typing import List, Dict, Any, Optional
import numpy as np
from ai.chatbot.rag.embeddings.base import BaseEmbeddingProvider
from ai.chatbot.rag.vector_store.base import BaseVectorStore
from ai.chatbot.rag.exceptions import RetrievalError
import logging
logger = logging.getLogger(__name__)


class MMRRetriever:
    """
    Maximal Marginal Relevance (MMR) retriever to select diverse and relevant chunks.
    """

    def __init__(self, embedding_provider: BaseEmbeddingProvider, vector_store: BaseVectorStore, lambda_param: float = 0.5):
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        self.lambda_param = lambda_param

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        fetch_k: int = 20
    ) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []

        try:
            logger.info(f"Retrieving top {top_k} MMR matches (from fetch_k={fetch_k}) for query: '{query}'")
            query_embedding = self.embedding_provider.embed_query(query)
            
            # Fetch candidate pool
            candidates = self.vector_store.similarity_search(query_embedding, top_k=fetch_k)
            if not candidates:
                return []
            if len(candidates) <= top_k:
                return candidates

            candidate_embeddings = self.embedding_provider.embed_documents([c["content"] for c in candidates])
            
            selected_indices = self._maximal_marginal_relevance(
                query_embedding=np.array(query_embedding),
                embedding_list=candidate_embeddings,
                lambda_mult=self.lambda_param,
                k=top_k
            )

            results = [candidates[i] for i in selected_indices]
            logger.info(f"MMR selected {len(results)} diverse chunks.")
            return results
        except Exception as e:
            logger.error(f"MMR retrieval failed: {e}")
            raise RetrievalError(f"MMR search failed: {e}")

    def _maximal_marginal_relevance(
        self,
        query_embedding: np.ndarray,
        embedding_list: List[List[float]],
        lambda_mult: float = 0.5,
        k: int = 4
    ) -> List[int]:
        embeddings = np.array(embedding_list)
        if len(embeddings) == 0:
            return []

        # Cosine similarity to query
        query_norm = np.linalg.norm(query_embedding)
        doc_norms = np.linalg.norm(embeddings, axis=1)
        doc_norms[doc_norms == 0] = 1e-10

        sim_to_query = np.dot(embeddings, query_embedding) / (doc_norms * query_norm)

        # Selected and unselected indices
        selected = [int(np.argmax(sim_to_query))]
        unselected = list(set(range(len(embedding_list))) - set(selected))

        while len(selected) < min(k, len(embedding_list)) and unselected:
            best_score = -float("inf")
            best_idx = None

            for idx in unselected:
                sim_query = sim_to_query[idx]
                
                # Sim to already selected docs
                selected_embeddings = embeddings[selected]
                selected_norms = doc_norms[selected]
                sim_to_selected = np.max(
                    np.dot(selected_embeddings, embeddings[idx]) / (selected_norms * doc_norms[idx])
                )

                score = lambda_mult * sim_query - (1 - lambda_mult) * sim_to_selected
                if score > best_score:
                    best_score = score
                    best_idx = idx

            if best_idx is not None:
                selected.append(best_idx)
                unselected.remove(best_idx)

        return selected
