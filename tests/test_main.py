import pytest
from fastapi.testclient import TestClient
from main import app
from backend.db.database import engine, Base
from sqlalchemy import text

@pytest.fixture(scope="module")
def client():
    # Setup
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    # Teardown (could drop tables if using a test db, but for phase 1 we just test creation)
    
def test_app_imports():
    import main
    assert main.app is not None

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_database_tables_exist():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result]
        
        assert "employees" in tables
        assert "employee_faces" in tables
        assert "attendance" in tables
        assert "admin_users" in tables
