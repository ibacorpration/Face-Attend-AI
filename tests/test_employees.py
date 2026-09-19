import pytest
import uuid
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

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
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["employee_code"] == unique_code
    assert data["id"] is not None

def test_get_employees(client):
    response = client.get("/api/v1/employees/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
