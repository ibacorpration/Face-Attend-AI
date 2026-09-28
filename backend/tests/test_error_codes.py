import pytest
from fastapi.testclient import TestClient
from main import app
from backend.core.error_codes import (
    NO_FACE, POOR_QUALITY, LIVENESS_FAILED, NOT_RECOGNIZED,
    EMPLOYEE_INACTIVE, NO_CHECKIN, ALREADY_CHECKED_IN, INVALID_IMAGE
)
import numpy as np
from unittest.mock import MagicMock
from backend.services.recognition_service import RecognitionService
from backend.schemas.recognition import RecognitionResult

client = TestClient(app)

def test_invalid_image_400():
    # Empty image
    files = {'file': ('test.jpg', b'', 'image/jpeg')}
    data = {'action': 'check_in'}
    
    response = client.post("/api/v1/recognition/verify", files=files, data=data)
    assert response.status_code == 400
    assert response.json() == {"detail": {"error_code": INVALID_IMAGE}}
    text = response.text.lower()
    for forbidden in ["traceback", "laplacian", "variance", "similarity"]:
        assert forbidden not in text

def test_too_large_image_413(monkeypatch):
    import backend.api.routes.recognition as recog_route
    monkeypatch.setattr(recog_route.settings, "MAX_IMAGE_SIZE_MB", 0) # Force limit to 0
    files = {'file': ('test.jpg', b'dummy', 'image/jpeg')}
    data = {'action': 'check_in'}
    
    response = client.post("/api/v1/recognition/verify", files=files, data=data)
    assert response.status_code == 413
    assert response.json() == {"detail": {"error_code": INVALID_IMAGE}}

def test_recognition_service_error_codes(monkeypatch):
    service = RecognitionService()
    
    class MockAIService:
        def process_attendance_frame(self, img):
            return {"success": False, "error": "No face", "error_code": NO_FACE}
    
    service.ai_service = MockAIService()
    
    res = service.recognize_and_log_attendance(None, np.zeros((10,10,3), dtype=np.uint8), "auto")
    assert res.success is False
    assert res.error_code == NO_FACE
    
    # Test Liveness
    class MockAILiveness:
        def process_attendance_frame(self, img):
            return {"success": False, "error": "fake", "error_code": LIVENESS_FAILED}
            
    service.ai_service = MockAILiveness()
    res = service.recognize_and_log_attendance(None, np.zeros((10,10,3), dtype=np.uint8), "auto")
    assert res.error_code == LIVENESS_FAILED
