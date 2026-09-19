import numpy as np
from sqlalchemy.orm import Session
from datetime import datetime, date
from backend.repositories.attendance_repository import AttendanceRepository
from backend.schemas.attendance import AttendanceCreate
from backend.core.config import settings
from backend.db.models import Attendance

class AttendanceService:
    def __init__(self):
        self.repo = AttendanceRepository()

    def process_attendance(self, db: Session, employee_id: int, similarity_score: float, status: str = "present", needs_review: bool = False):
        today = datetime.now().date()
        now = datetime.now()

        existing = self.repo.get_by_employee_and_date(db, employee_id, today)

        if not existing:
            # Check In
            att_in = AttendanceCreate(
                employee_id=employee_id,
                date=today,
                check_in=now,
                status=status,
                similarity_score=similarity_score,
                needs_review=needs_review
            )
            return self.repo.create(db, obj_in=att_in)
        else:
            # Prevent double check-in/out too quickly (cooldown)
            if existing.check_out:
                diff = (now - existing.check_out).total_seconds()
            else:
                diff = (now - existing.check_in).total_seconds()

            if diff < settings.ATTENDANCE_COOLDOWN_SECONDS:
                return existing # Cooldown active, don't update

            # Update Check Out
            existing.check_out = now
            if similarity_score < existing.similarity_score:
                existing.similarity_score = similarity_score
            if needs_review:
                existing.needs_review = True
                
            return self.repo.update(db, db_obj=existing)

    def get_attendance_by_date(self, db: Session, target_date: date):
        return self.repo.get_all_by_date(db, target_date)
