import pytest
from datetime import datetime, timedelta
import pytz
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.database import Base
from backend.db.models import Attendance, EmployeeFace
from backend.services.attendance_service import AttendanceService
from backend.core.config import settings

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_attendance_first_scan(db_session):
    service = AttendanceService()
    result = service.process_attendance(db_session, employee_id=1, similarity_score=0.9, action="auto")
    
    # In auto mode or check_in mode, if no record, it creates a check_in
    assert "action" in result and result["action"] == "check_in"
    record = db_session.query(Attendance).first()
    assert record.check_in is not None
    assert record.check_out is None

def test_attendance_cooldown(db_session):
    service = AttendanceService()
    # First scan
    service.process_attendance(db_session, employee_id=1, similarity_score=0.9, action="auto")
    
    # Second scan immediately (inside cooldown)
    result = service.process_attendance(db_session, employee_id=1, similarity_score=0.95, action="auto")
    assert "Cooldown active" in result["message"]
    assert result["action"] == "check_in" # Since we haven't checked out yet

def test_attendance_after_cooldown_no_type_error(db_session, monkeypatch):
    service = AttendanceService()
    # Set cooldown to 0
    monkeypatch.setattr(settings, "ATTENDANCE_COOLDOWN_SECONDS", 0)
    
    # First scan (Check In)
    service.process_attendance(db_session, employee_id=1, similarity_score=0.9, action="auto")
    
    # Second scan (Check Out)
    result = service.process_attendance(db_session, employee_id=1, similarity_score=0.95, action="auto")
    assert result["action"] == "check_out"
    
    record = db_session.query(Attendance).first()
    assert record.check_out is not None

def test_attendance_none_similarity_score(db_session, monkeypatch):
    service = AttendanceService()
    monkeypatch.setattr(settings, "ATTENDANCE_COOLDOWN_SECONDS", 0)
    
    # Create manual record with None similarity score
    tz = pytz.timezone(settings.APP_TIMEZONE)
    now = datetime.now(tz)
    att = Attendance(
        employee_id=1,
        date=now.date(),
        check_in=now,
        similarity_score=None
    )
    db_session.add(att)
    db_session.commit()
    
    # Update should not crash
    result = service.process_attendance(db_session, employee_id=1, similarity_score=0.8, action="auto")
    assert result["action"] == "check_out"
    
    record = db_session.query(Attendance).first()
    assert record.similarity_score == 0.8

def test_attendance_action_checkout_no_record(db_session):
    service = AttendanceService()
    result = service.process_attendance(db_session, employee_id=1, similarity_score=0.9, action="check_out")
    assert result["action"] == "check_out"
    assert "No check-in found" in result["message"]

def test_attendance_action_checkin_twice(db_session, monkeypatch):
    service = AttendanceService()
    monkeypatch.setattr(settings, "ATTENDANCE_COOLDOWN_SECONDS", 0)
    
    service.process_attendance(db_session, employee_id=1, similarity_score=0.9, action="check_in")
    result = service.process_attendance(db_session, employee_id=1, similarity_score=0.9, action="check_in")
    assert result["action"] == "check_in"
    assert "Already checked in" in result["message"]
