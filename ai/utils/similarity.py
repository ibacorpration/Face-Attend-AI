import numpy as np

def l2_normalize(x: np.ndarray, axis: int = -1, epsilon: float = 1e-10) -> np.ndarray:
    """Normalize the array using L2 norm."""
    norm = np.linalg.norm(x, axis=axis, keepdims=True)
    return x / (norm + epsilon)

def cosine_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    """
    Compute cosine similarity between two embeddings.
    Assumes embeddings are already L2 normalized. If not, normalize them first.
    """
    # Just in case they are not normalized, we normalize them to be safe
    emb1_norm = l2_normalize(emb1)
    emb2_norm = l2_normalize(emb2)
    return float(np.dot(emb1_norm, emb2_norm.T))

def verify_match(similarity: float, threshold: float) -> bool:
    """Check if similarity exceeds threshold."""
    return similarity >= threshold
