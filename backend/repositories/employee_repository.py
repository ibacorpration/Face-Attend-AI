from sqlalchemy.orm import Session
from typing import Optional, List
from backend.db.models import Employee
from backend.schemas.employee import EmployeeCreate, EmployeeUpdate

class EmployeeRepository:
    def get(self, db: Session, employee_id: int) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.id == employee_id).first()

    def get_by_code(self, db: Session, employee_code: str) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.employee_code == employee_code).first()

    def get_by_email(self, db: Session, email: str) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.email == email).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Employee]:
        return db.query(Employee).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: EmployeeCreate) -> Employee:
        db_obj = Employee(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Employee, obj_in: EmployeeUpdate) -> Employee:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, employee_id: int) -> bool:
        obj = db.query(Employee).filter(Employee.id == employee_id).first()
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True
