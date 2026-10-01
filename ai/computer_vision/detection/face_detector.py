import cv2
import numpy as np
from typing import Tuple, List, Optional
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

class FaceDetector:
    def __init__(self, model_path: str = settings.FACE_DETECTOR_MODEL_PATH):
        self.model_path = model_path
        self._detector = None
        self._load_model()
        
    def _load_model(self):
        try:
            # We initialize with a default size, it can be dynamically resized before inference
            self._detector = cv2.FaceDetectorYN.create(
                model=self.model_path,
                config="",
                input_size=(320, 320),
                score_threshold=0.6,
                nms_threshold=0.3,
                top_k=5000
            )
            logger.info(f"Loaded YuNet face detector from {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load YuNet model: {e}")
            raise
            
    def detect(self, image: np.ndarray) -> List[np.ndarray]:
        """
        Detect faces in an image.
        Returns a list of faces where each face is an array of 15 elements:
        [x, y, width, height, right_eye_x, right_eye_y, left_eye_x, left_eye_y, nose_x, nose_y, right_mouth_x, right_mouth_y, left_mouth_x, left_mouth_y, score]
        """
        if self._detector is None:
            raise RuntimeError("Face detector not initialized")
            
        # Ensure image is in BGR format for OpenCV
        # (YuNet expects BGR format typically, but check if we convert upstream)
        
        height, width = image.shape[:2]
        self._detector.setInputSize((width, height))
        
        _, faces = self._detector.detect(image)
        
        if faces is None:
            return []
            
        return faces

    def get_largest_face(self, faces: List[np.ndarray]) -> Optional[np.ndarray]:
        """Returns the face with the largest bounding box area."""
        if not len(faces):
            return None
        
        # Area = width (index 2) * height (index 3)
        largest_face = max(faces, key=lambda f: f[2] * f[3])
        return largest_face
