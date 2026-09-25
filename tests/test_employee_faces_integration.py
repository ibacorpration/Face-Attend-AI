import os
import io
import base64
import unittest.mock
from fastapi.testclient import TestClient
from main import app
from backend.core.deps import get_current_admin

def override_get_current_admin():
    from backend.db.models import AdminUser
    return AdminUser(id=1, username="admin")
app.dependency_overrides[get_current_admin] = override_get_current_admin

client = TestClient(app)

def run_tests():
    print("Testing GET /api/v1/employees/...")
    res = client.get("/api/v1/employees/")
    employees = res.json()
    emp = employees[0]
    emp_id = emp["id"]
    original_updated_at = emp["updated_at"]

    print("Testing POST /api/v1/employees/{id}/face...")
    b64_png = b"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    dummy_image = base64.b64decode(b64_png)
    
    files = {"file": ("test.png", io.BytesIO(dummy_image), "image/png")}
    
    # We must patch the AI service to bypass real face detection!
    with unittest.mock.patch('backend.services.ai_singleton.get_ai_service') as mock_ai:
        import numpy as np
        mock_instance = mock_ai.return_value
        mock_instance.process_attendance_frame.return_value = {
            "success": True,
            "embedding": np.zeros((512,), dtype=np.float32)
        }
        res = client.post(f"/api/v1/employees/{emp_id}/face", files=files)
        assert res.status_code == 200, f"Failed POST /face: {res.text}"
    
    print("Testing GET /api/v1/employees/ again to verify has_face is True and updated_at changed...")
    res = client.get("/api/v1/employees/")
    emp_updated = [e for e in res.json() if e["id"] == emp_id][0]
    print(f"New has_face: {emp_updated['has_face']}")
    print(f"New updated_at: {emp_updated['updated_at']}")
    assert emp_updated['has_face'] is True, "has_face should be True"
    assert emp_updated['updated_at'] != original_updated_at, "updated_at did not change"
    
    print("Testing GET /api/v1/employees/{id}/face/image...")
    res = client.get(f"/api/v1/employees/{emp_id}/face/image")
    assert res.status_code == 200, f"Failed GET /face/image: {res.text}"
    assert res.content == dummy_image, "Returned image bytes do not match uploaded image bytes!"
    assert res.headers["content-type"] == "image/jpeg", f"Wrong content-type: {res.headers.get('content-type')}"
    
    print("ALL TESTS PASSED END-TO-END!")

if __name__ == "__main__":
    run_tests()
