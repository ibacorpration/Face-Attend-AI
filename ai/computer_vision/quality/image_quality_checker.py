import cv2
import numpy as np

class ImageQualityChecker:
    def __init__(self, min_resolution: tuple = (112, 112), blur_threshold: float = 15.0):
        self.min_resolution = min_resolution
        self.blur_threshold = blur_threshold
        
    def check_quality(self, image: np.ndarray) -> dict:
        """
        Check if an image meets basic quality standards.
        Returns a dictionary with status and reasons.
        """
        h, w = image.shape[:2]
        
        is_high_res = w >= self.min_resolution[0] and h >= self.min_resolution[1]
        
        # Check for blur using Variance of Laplacian
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_sharp = laplacian_var >= self.blur_threshold
        
        is_good = is_high_res and is_sharp
        
        reasons = []
        if not is_high_res:
            reasons.append(f"Resolution too low ({w}x{h}). Minimum is {self.min_resolution[0]}x{self.min_resolution[1]}")
        if not is_sharp:
            reasons.append(f"Image is too blurry (Laplacian variance: {laplacian_var:.2f})")
            
        return {
            "is_good": is_good,
            "reasons": reasons,
            "blur_score": float(laplacian_var)
        }
