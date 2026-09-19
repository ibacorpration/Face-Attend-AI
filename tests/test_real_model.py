import cv2
import urllib.request
import os
import sys

# Add project root to sys path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.services.face_recognition_service import FaceRecognitionService

def test_real_model():
    print("Downloading test image...")
    img_path = 'lena.jpg'
    if not os.path.exists(img_path):
        urllib.request.urlretrieve('https://raw.githubusercontent.com/opencv/opencv/master/samples/data/lena.jpg', img_path)
    
    img = cv2.imread(img_path)
    if img is None:
        print("Failed to load image!")
        sys.exit(1)
        
    print("Initializing AI Service...")
    service = FaceRecognitionService()
    
    print("Processing frame...")
    result = service.process_attendance_frame(img)
    
    assert result["success"] == True, f"Failed: {result.get('error')}"
    
    embedding = result["embedding"]
    print(f"Embedding shape: {embedding.shape}")
    assert embedding.shape == (512,), f"Expected shape (512,), got {embedding.shape}"
    
    import numpy as np
    norm = np.linalg.norm(embedding)
    print(f"Embedding L2 Norm: {norm}")
    assert np.isclose(norm, 1.0, atol=1e-4), f"Expected norm ~1.0, got {norm}"
    
    print("Smoke Test Passed! AI Pipeline is fully functional.")

if __name__ == "__main__":
    test_real_model()
