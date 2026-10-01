import cv2
import numpy as np
import pytest
import os
from ai.computer_vision.detection.face_detector import FaceDetector
from ai.computer_vision.quality.image_quality_checker import ImageQualityChecker
from ai.computer_vision.liveness.liveness_checker import LivenessChecker
from ai.computer_vision.preprocessing.face_preprocessor import FacePreprocessor
from ai.computer_vision.embedding.face_embedder import FaceEmbedder
from ai.computer_vision.recognition.face_recognizer import FaceRecognizer
from ai.computer_vision.services.face_recognition_service import FaceRecognitionService
from ai.computer_vision.utils.similarity import cosine_similarity
from backend.core.config import settings

# Skip tests if models are not downloaded yet
models_exist = os.path.exists(settings.FACE_DETECTOR_MODEL_PATH) and os.path.exists(settings.AI_MODEL_PATH)
pytestmark = pytest.mark.skipif(not models_exist, reason="Models not found. Run download_models.py first.")

@pytest.fixture
def dummy_image():
    # Create a dummy image (e.g., solid color) just to test execution flow
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    # Draw a mock "face" so YuNet might detect something or at least not crash
    cv2.circle(img, (320, 240), 100, (200, 200, 200), -1)
    return img

@pytest.fixture
def dummy_face_bbox():
    # [x, y, w, h, ...] 15 elements array returned by YuNet
    face = np.zeros(15, dtype=np.float32)
    face[0:4] = [220, 140, 200, 200]
    # Landmarks for alignment
    face[4:14] = [260, 180, 300, 180, 280, 210, 260, 240, 300, 240]
    return face

@pytest.fixture
def dummy_embedding():
    # 512-dimensional embedding (typical for ArcFace)
    return np.random.rand(512).astype(np.float32)

def test_quality_checker(dummy_image):
    checker = ImageQualityChecker()
    res = checker.check_quality(dummy_image)
    assert "is_good" in res
    assert "score" in res

def test_liveness_checker(dummy_image):
    checker = LivenessChecker()
    res = checker.check_liveness([dummy_image])
    assert "is_live" in res
    assert "score" in res

def test_face_detector_init():
    detector = FaceDetector()
    assert detector is not None

def test_face_embedder_init():
    embedder = FaceEmbedder()
    assert embedder is not None

def test_face_preprocessor(dummy_image, dummy_face_bbox):
    preprocessor = FacePreprocessor()
    aligned_face = preprocessor.align_face(dummy_image, dummy_face_bbox)
    assert aligned_face is not None
    # ArcFace expects 112x112 image
    assert aligned_face.shape == (112, 112, 3)

def test_similarity(dummy_embedding):
    # Normalize for cosine similarity
    emb1 = dummy_embedding / np.linalg.norm(dummy_embedding)
    emb2 = emb1.copy()
    sim = cosine_similarity(emb1, emb2)
    # Should be exactly 1.0 for identical embeddings
    assert np.isclose(sim, 1.0, atol=1e-5)

def test_face_recognizer_init():
    recognizer = FaceRecognizer()
    assert recognizer is not None

def test_recognition_service(dummy_image):
    service = FaceRecognitionService()
    res = service.process_attendance_frame(dummy_image)
    # We just want to ensure the pipeline doesn't crash
    assert "success" in res
