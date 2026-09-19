from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.repositories.employee_repository import EmployeeRepository
from backend.schemas.employee import EmployeeCreate, EmployeeUpdate

class EmployeeService:
    def __init__(self):
        self.repo = EmployeeRepository()

    def create_employee(self, db: Session, employee_in: EmployeeCreate):
        if self.repo.get_by_code(db, employee_code=employee_in.employee_code):
            raise HTTPException(status_code=400, detail="Employee code already registered")
        if employee_in.email and self.repo.get_by_email(db, email=employee_in.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        return self.repo.create(db, obj_in=employee_in)

    def get_employee(self, db: Session, employee_id: int):
        employee = self.repo.get(db, employee_id=employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee

    def get_employees(self, db: Session, skip: int = 0, limit: int = 100):
        return self.repo.get_all(db, skip=skip, limit=limit)

    def register_face(self, db: Session, employee_id: int, image_bytes: bytes):
        employee = self.get_employee(db, employee_id)
        
        # We need the AI service to extract embedding
        from ai.services.face_recognition_service import FaceRecognitionService as AIFaceRecognitionService
        from backend.repositories.face_repository import FaceRepository
        import numpy as np
        import cv2
        
        ai_service = AIFaceRecognitionService()
        face_repo = FaceRepository()
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
            
        ai_res = ai_service.process_attendance_frame(image)
        if not ai_res["success"]:
            raise HTTPException(status_code=400, detail=ai_res.get("error", "AI could not process face"))
            
        embedding_bytes = ai_res["embedding"].tobytes()
        
        # Save to DB
        return face_repo.create(
            db=db, 
            employee_id=employee_id, 
            raw_embedding_bytes=embedding_bytes,
            image_path="registered_via_api",
            model_version="arcface_1.0"
        )

    def update_employee(self, db: Session, employee_id: int, employee_in: EmployeeUpdate):
        employee = self.get_employee(db, employee_id)
        return self.repo.update(db, db_obj=employee, obj_in=employee_in)

    def delete_employee(self, db: Session, employee_id: int):
        if not self.repo.delete(db, employee_id=employee_id):
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"ok": True}
