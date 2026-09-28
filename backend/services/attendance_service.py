import numpy as np
from sqlalchemy.orm import Session
import pytz
from datetime import datetime, date
from backend.repositories.attendance_repository import AttendanceRepository
from backend.schemas.attendance import AttendanceCreate
from backend.core.config import settings
from backend.db.models import Attendance

def _to_aware(dt: datetime, tz) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return tz.localize(dt)
    return dt.astimezone(tz)

class AttendanceService:
    def __init__(self):
        self.repo = AttendanceRepository()

    def process_attendance(self, db: Session, employee_id: int, similarity_score: float, status: str = "present", needs_review: bool = False, action: str = "auto"):
        tz = pytz.timezone(settings.APP_TIMEZONE)
        now = datetime.now(tz)
        today = now.date()

        existing = self.repo.get_by_employee_and_date(db, employee_id, today)

        if not existing:
            if action == "check_out":
                # Check-out requested but no record for today
                return {"action": "check_out", "message": "No check-in found for today"}
                
            # Check In (auto or check_in)
            att_in = AttendanceCreate(
                employee_id=employee_id,
                date=today,
                check_in=now,
                status=status,
                similarity_score=similarity_score,
                needs_review=needs_review
            )
            self.repo.create(db, obj_in=att_in)
            return {"action": "check_in", "message": f"Checked in at {now.strftime('%H:%M')}"}
        else:
            # Already checked in today (whether checked out or not)
            if action == "check_in":
                return {"action": "check_in", "message": "Already checked in", "already_checked_in": True}
                
            # If they want to check out, but already checked out
            if action == "check_out" and existing.check_out:
                return {"action": "check_out", "message": "Already checked out", "already_checked_out": True}

            # Prevent double check-in/out too quickly (cooldown)
            last_event = _to_aware(existing.check_out or existing.check_in, tz)
            diff = (now - last_event).total_seconds()

            if diff < settings.ATTENDANCE_COOLDOWN_SECONDS:
                msg_action = "check_out" if existing.check_out else "check_in"
                return {"action": msg_action, "message": f"Cooldown active (wait {int(settings.ATTENDANCE_COOLDOWN_SECONDS - diff)}s)"}

            # Update Check Out
            existing.check_out = now
            if existing.similarity_score is None or similarity_score < existing.similarity_score:
                existing.similarity_score = similarity_score
            if needs_review:
                existing.needs_review = True
                
            self.repo.update(db, db_obj=existing)
            return {"action": "check_out", "message": f"Checked out at {now.strftime('%H:%M')}"}

    def get_attendance_by_date(self, db: Session, target_date: date):
        return self.repo.get_all_by_date(db, target_date)
