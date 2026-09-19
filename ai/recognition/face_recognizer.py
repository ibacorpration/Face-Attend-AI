import numpy as np
from ai.detection.face_detector import FaceDetector
from ai.preprocessing.face_preprocessor import FacePreprocessor
from ai.embedding.face_embedder import FaceEmbedder
from ai.utils.similarity import l2_normalize

class FaceRecognizer:
    """
    Coordinates the CV pipeline: Detection -> Preprocessing -> Embedding
    """
    def __init__(self):
        self.detector = FaceDetector()
        self.preprocessor = FacePreprocessor()
        self.embedder = FaceEmbedder()
        
    def process_image(self, image: np.ndarray) -> dict:
        """
        Process an image to find the largest face and extract its embedding.
        Returns a dictionary with success status, embedding, and bounding box.
        """
        # 1. Detect faces
        faces = self.detector.detect(image)
        if len(faces) == 0:
            return {"success": False, "error": "No face detected"}
            
        # 2. Get largest face
        largest_face = self.detector.get_largest_face(faces)
        
        # 3. Align face
        aligned_face = self.preprocessor.align_face(image, largest_face)
        
        # 4. Preprocess for embedding model
        blob = self.preprocessor.preprocess_for_arcface(aligned_face)
        
        # 5. Extract embedding
        raw_embedding = self.embedder.get_embedding(blob)
        
        # 6. Normalize embedding (ArcFace requires L2 normalized embeddings for cosine sim)
        normalized_embedding = l2_normalize(raw_embedding)
        
        return {
            "success": True,
            "embedding": normalized_embedding,
            "face_data": largest_face,
            "aligned_face": aligned_face # Sometimes useful for saving/debugging
        }
