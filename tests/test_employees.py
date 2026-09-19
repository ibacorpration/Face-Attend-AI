import pytest
import uuid
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="module")
def client():
    from backend.core.deps import get_current_admin
    from backend.db.models import AdminUser

    def override_get_current_admin():
        return AdminUser(id=1, username="testadmin")

    app.dependency_overrides[get_current_admin] = override_get_current_admin
    
    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()

def test_create_employee(client):
    unique_code = f"EMP-{uuid.uuid4().hex[:6]}"
    response = client.post(
        "/api/v1/employees/",
        json={
            "employee_code": unique_code,
            "full_name": "Test Employee",
            "email": f"{unique_code}@example.com",
            "department": "Engineering"
        }
    )
    #1- check status code
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["employee_code"] == unique_code
    assert data["id"] is not None

def test_get_employees(client):
    response = client.get("/api/v1/employees/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
