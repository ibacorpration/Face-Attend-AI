import numpy as np
from ai.computer_vision.detection.face_detector import FaceDetector
from ai.computer_vision.preprocessing.face_preprocessor import FacePreprocessor
from ai.computer_vision.embedding.face_embedder import FaceEmbedder
from ai.computer_vision.utils.similarity import l2_normalize

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
        import cv2
        # Resize image if it's too large to prevent OOM crashes
        max_size = 1024
        h, w = image.shape[:2]
        if max(h, w) > max_size:
            scale = max_size / max(h, w)
            image = cv2.resize(image, (int(w * scale), int(h * scale)))

        # 1. Detect faces
        faces = self.detector.detect(image)
        if len(faces) == 0:
            from backend.core.error_codes import NO_FACE
            return {"success": False, "error": "No face detected", "error_code": NO_FACE}
            
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
