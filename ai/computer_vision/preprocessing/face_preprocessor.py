import cv2
import numpy as np
from typing import Tuple

class FacePreprocessor:
    def __init__(self, output_size: Tuple[int, int] = (112, 112)):
        self.output_size = output_size
        # Standard landmarks for ArcFace 112x112
        self.reference_landmarks = np.array([
            [38.2946, 51.6963],
            [73.5318, 51.5014],
            [56.0252, 71.7366],
            [41.5493, 92.3655],
            [70.7299, 92.2041]
        ], dtype=np.float32)

    def align_face(self, image: np.ndarray, face_data: np.ndarray) -> np.ndarray:
        """
        Align face using Similarity Transform based on 5 landmarks from YuNet.
        face_data format from YuNet:
        [x, y, w, h, right_eye_x, right_eye_y, left_eye_x, left_eye_y, nose_x, nose_y, right_mouth_x, right_mouth_y, left_mouth_x, left_mouth_y, score]
        Note: YuNet's "right/left" are from the observer's perspective.
        """
        landmarks = np.array([
            [face_data[4], face_data[5]],   # Right eye (observer)
            [face_data[6], face_data[7]],   # Left eye (observer)
            [face_data[8], face_data[9]],   # Nose
            [face_data[10], face_data[11]], # Right mouth (observer)
            [face_data[12], face_data[13]]  # Left mouth (observer)
        ], dtype=np.float32)

        # Estimate affine transform (Similarity transform)
        tform, _ = cv2.estimateAffinePartial2D(landmarks, self.reference_landmarks, method=cv2.LMEDS)
        
        # Apply transform
        aligned_face = cv2.warpAffine(image, tform, self.output_size, borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0))
        
        return aligned_face

    def preprocess_for_arcface(self, aligned_face: np.ndarray) -> np.ndarray:
        """
        Prepare aligned BGR image for ArcFace ONNX.
        ArcFace expects: RGB, float32, normalized to [-1, 1], shape (1, 3, 112, 112)
        """
        # Convert BGR to RGB
        rgb_face = cv2.cvtColor(aligned_face, cv2.COLOR_BGR2RGB)
        
        # HWC to CHW
        rgb_face = np.transpose(rgb_face, (2, 0, 1))
        
        # Normalize to [-1, 1]
        rgb_face = (rgb_face.astype(np.float32) - 127.5) / 127.5
        
        # Add batch dimension
        blob = np.expand_dims(rgb_face, axis=0)
        return blob
