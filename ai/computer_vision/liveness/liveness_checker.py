import numpy as np
from backend.core.config import settings

class LivenessChecker:
    def __init__(self, enabled: bool = settings.LIVENESS_ENABLED, mode: str = settings.LIVENESS_MODE):
        self.enabled = enabled
        self.mode = mode
        
    def check_liveness(self, images: list[np.ndarray]) -> dict:
        """
        Placeholder for a real liveness check.
        In a production system, this would analyze multiple frames (motion) 
        or use a deep learning model to detect spoofing (static).
        For Phase 2, we return True if we have valid images and liveness is enabled.
        """
        if not self.enabled:
            return {"is_live": True, "score": 1.0, "reason": "Liveness disabled"}
            
        if not images:
            return {"is_live": False, "score": 0.0, "reason": "No images provided"}
            
        # In a real motion-based system, we'd compare consecutive frames.
        # Here we simulate a pass for the pipeline integration.
        return {"is_live": True, "score": 0.95, "reason": f"Simulated {self.mode} pass"}
