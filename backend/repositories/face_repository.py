from sqlalchemy.orm import Session
from typing import List, Optional
from backend.db.models import EmployeeFace
from backend.core.security import encrypt_embedding

class FaceRepository:
    def get_all(self, db: Session) -> List[EmployeeFace]:
        return db.query(EmployeeFace).all()
        
    def get_by_employee(self, db: Session, employee_id: int) -> List[EmployeeFace]:
        return db.query(EmployeeFace).filter(EmployeeFace.employee_id == employee_id).all()

    def create(self, db: Session, employee_id: int, raw_embedding_bytes: bytes, image_path: str, model_version: str) -> EmployeeFace:
        encrypted_embedding = encrypt_embedding(raw_embedding_bytes)
        
        db_obj = EmployeeFace(
            employee_id=employee_id,
            embedding=encrypted_embedding,
            model_version=model_version,
            image_path=image_path
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
