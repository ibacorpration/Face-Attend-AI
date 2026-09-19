import numpy as np
from ai.recognition.face_recognizer import FaceRecognizer
from ai.quality.image_quality_checker import ImageQualityChecker
from ai.liveness.liveness_checker import LivenessChecker
from backend.core.config import settings

class FaceRecognitionService:
    """
    High-level service connecting Quality, Liveness, and Recognition.
    """
    def __init__(self):
        self.quality_checker = ImageQualityChecker()
        self.liveness_checker = LivenessChecker()
        self.recognizer = FaceRecognizer()
        
    def process_attendance_frame(self, image: np.ndarray) -> dict:
        """
        Process a frame for attendance.
        1. Check Liveness
        2. Check Quality
        3. Extract Embedding
        """
        # 1. Liveness check (simulated with single frame here)
        liveness_result = self.liveness_checker.check_liveness([image])
        if not liveness_result["is_live"]:
            return {"success": False, "error": f"Liveness failed: {liveness_result['reason']}"}
            
        # 2. Quality check
        quality_result = self.quality_checker.check_quality(image)
        if not quality_result["is_good"]:
            reasons = ", ".join(quality_result["reasons"])
            return {"success": False, "error": f"Quality failed: {reasons}"}
            
        # 3. Recognition pipeline
        rec_result = self.recognizer.process_image(image)
        if not rec_result["success"]:
            return rec_result
            
        return {
            "success": True,
            "embedding": rec_result["embedding"],
            "quality": quality_result,
            "liveness": liveness_result
        }
