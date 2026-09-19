import cv2
import numpy as np
import pytest
import os
from ai.detection.face_detector import FaceDetector
from ai.quality.image_quality_checker import ImageQualityChecker
from ai.liveness.liveness_checker import LivenessChecker
from ai.preprocessing.face_preprocessor import FacePreprocessor
from ai.embedding.face_embedder import FaceEmbedder
from ai.recognition.face_recognizer import FaceRecognizer
from ai.services.face_recognition_service import FaceRecognitionService
from backend.core.config import settings

# Skip tests if models are not downloaded yet
models_exist = os.path.exists(settings.FACE_DETECTOR_MODEL_PATH) and os.path.exists(settings.AI_MODEL_PATH)
pytestmark = pytest.mark.skipif(not models_exist, reason="Models not found. Run download_models.py first.")

@pytest.fixture
def dummy_image():
    # Create a dummy image (e.g., solid color) just to test execution flow
    # In a real test, we would use a real face image
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    # Draw a mock "face" so YuNet might detect something or at least not crash
    # YuNet might not detect a face here, so some tests might handle "No face detected" gracefully
    cv2.circle(img, (320, 240), 100, (200, 200, 200), -1)
    return img

def test_quality_checker(dummy_image):
    checker = ImageQualityChecker()
    res = checker.check_quality(dummy_image)
    assert "is_good" in res

def test_liveness_checker(dummy_image):
    checker = LivenessChecker()
    res = checker.check_liveness([dummy_image])
    assert "is_live" in res

def test_face_detector_init():
    detector = FaceDetector()
    assert detector is not None

def test_face_embedder_init():
    embedder = FaceEmbedder()
    assert embedder is not None

def test_recognition_service(dummy_image):
    service = FaceRecognitionService()
    res = service.process_attendance_frame(dummy_image)
    # Since it's a blank image, it will likely fail quality or detection, which is fine
    # We just want to ensure it doesn't crash
    assert "success" in res
