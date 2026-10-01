import numpy as np
import onnxruntime as ort
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

class FaceEmbedder:
    def __init__(self, model_path: str = settings.AI_MODEL_PATH):
        self.model_path = model_path
        self._session = None
        self._input_name = None
        self._output_name = None
        self._load_model()
        
    def _load_model(self):
        try:
            # CPU Execution provider for broad compatibility in Phase 2
            providers = ['CPUExecutionProvider']
            self._session = ort.InferenceSession(self.model_path, providers=providers)
            self._input_name = self._session.get_inputs()[0].name
            self._output_name = self._session.get_outputs()[0].name
            logger.info(f"Loaded ArcFace model from {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load ArcFace model: {e}")
            raise
            
    def get_embedding(self, preprocessed_face: np.ndarray) -> np.ndarray:
        """
        Generate embedding from preprocessed face.
        Expects preprocessed_face shape (1, 3, 112, 112).
        Returns an L2-normalized 512-d embedding of type float32.
        """
        if self._session is None:
            raise RuntimeError("ArcFace session not initialized")
            
        embeddings = self._session.run([self._output_name], {self._input_name: preprocessed_face})[0]
        embedding = embeddings[0] # Return the 1D array of the first (and only) item in batch
        
        # Validate finity
        if not np.all(np.isfinite(embedding)):
            raise ValueError("Model output contains non-finite values (NaN or Inf)")
            
        # L2 Normalize
        norm = np.linalg.norm(embedding)
        if norm == 0:
            raise ValueError("Model output has zero norm")
            
        normalized_embedding = embedding / norm
        return normalized_embedding.astype(np.float32)
