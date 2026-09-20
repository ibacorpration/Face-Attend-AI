import numpy as np
from sqlalchemy.orm import Session
from backend.services.ai_singleton import get_ai_service
from ai.utils.similarity import cosine_similarity, verify_match
from backend.repositories.face_repository import FaceRepository
from backend.repositories.employee_repository import EmployeeRepository
from backend.services.attendance_service import AttendanceService
from backend.schemas.recognition import RecognitionResult
from backend.core.security import decrypt_embedding
from backend.core.config import settings

class RecognitionService:
    def __init__(self):
        self.ai_service = get_ai_service()
        self.face_repo = FaceRepository()
        self.employee_repo = EmployeeRepository()
        self.attendance_service = AttendanceService()

    def recognize_and_log_attendance(self, db: Session, image: np.ndarray) -> RecognitionResult:
        # 1. AI Pipeline to extract embedding
        ai_res = self.ai_service.process_attendance_frame(image)
        
        if not ai_res["success"]:
            return RecognitionResult(
                success=False, 
                error=ai_res.get("error", "AI processing failed")
            )

        query_embedding = ai_res["embedding"]
        
        # 2. Retrieve all stored embeddings and compare (1:N matching)
        all_faces = self.face_repo.get_all(db)
        best_match = None
        highest_sim = -1.0
        
        for face_record in all_faces:
            # Enforce model version matching
            if face_record.model_version != settings.AI_MODEL_VERSION:
                continue
                
            # Decrypt embedding from DB
            raw_bytes = decrypt_embedding(face_record.embedding)
            db_embedding = np.frombuffer(raw_bytes, dtype=np.float32)
            
            sim = cosine_similarity(query_embedding, db_embedding)
            if sim > highest_sim:
                highest_sim = sim
                best_match = face_record
                
        # 3. Evaluate match against thresholds
        threshold = settings.FACE_RECOGNITION_THRESHOLD
        band = settings.FACE_RECOGNITION_BORDERLINE_BAND
        
        if highest_sim >= threshold:
            status = "match"
            needs_review = False
        elif highest_sim >= (threshold - band):
            status = "borderline"
            needs_review = True
        else:
            status = "unknown"
            return RecognitionResult(
                success=False,
                error="Face not recognized",
                similarity_score=highest_sim,
                status=status
            )
            
        # 4. Process Attendance
        employee = self.employee_repo.get(db, best_match.employee_id)
        if not employee or employee.status != "active":
            return RecognitionResult(
                success=False, 
                error="Employee not found or inactive",
                similarity_score=highest_sim
            )
            
        self.attendance_service.process_attendance(
            db=db, 
            employee_id=employee.id, 
            similarity_score=highest_sim,
            status="present",
            needs_review=needs_review
        )
        
        return RecognitionResult(
            success=True,
            employee_id=employee.id,
            employee_code=employee.employee_code,
            full_name=employee.full_name,
            department=employee.department,
            employee_status=employee.status,
            similarity_score=highest_sim,
            status=status,
            liveness_passed=ai_res["liveness"]["is_live"],
            quality_passed=ai_res["quality"]["is_good"]
        )