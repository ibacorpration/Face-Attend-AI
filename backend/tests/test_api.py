import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_verify_face_invalid_action(monkeypatch):
    # We mock the AI service so it doesn't try to load ONNX models
    def mock_get_ai_service():
        return None
        
    monkeypatch.setattr("backend.services.recognition_service.get_ai_service", mock_get_ai_service)
    
    # Send a request with an invalid action
    files = {'file': ('test.jpg', b'dummy_image_data', 'image/jpeg')}
    data = {'action': 'invalid_action'}
    
    response = client.post("/api/v1/recognition/verify", files=files, data=data)
    
    # Should fail pydantic/fastapi validation for the Form parameter
    assert response.status_code == 422
    assert "Invalid action parameter" in response.text
