from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from backend.db.session import get_db
from backend.services.attendance_service import AttendanceService
from backend.schemas.attendance import AttendanceResponse

router = APIRouter()
attendance_service = AttendanceService()

@router.get("/daily", response_model=List[AttendanceResponse])
def get_daily_attendance(target_date: date = None, db: Session = Depends(get_db)):
    if not target_date:
        from datetime import datetime
        target_date = datetime.now().date()
    return attendance_service.get_attendance_by_date(db, target_date)
