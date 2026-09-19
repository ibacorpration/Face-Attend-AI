from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
from backend.db.models import Attendance
from backend.schemas.attendance import AttendanceCreate

class AttendanceRepository:
    def get(self, db: Session, attendance_id: int) -> Optional[Attendance]:
        return db.query(Attendance).filter(Attendance.id == attendance_id).first()

    def get_by_employee_and_date(self, db: Session, employee_id: int, target_date: date) -> Optional[Attendance]:
        return db.query(Attendance).filter(
            Attendance.employee_id == employee_id,
            Attendance.date == target_date
        ).first()

    def get_all_by_date(self, db: Session, target_date: date) -> List[Attendance]:
        return db.query(Attendance).filter(Attendance.date == target_date).all()

    def create(self, db: Session, obj_in: AttendanceCreate) -> Attendance:
        db_obj = Attendance(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Attendance) -> Attendance:
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
