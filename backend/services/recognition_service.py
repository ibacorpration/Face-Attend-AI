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

import logging

logger = logging.getLogger(__name__)
class RecognitionService:
    def __init__(self):
        self.ai_service = get_ai_service()
        self.face_repo = FaceRepository()
        self.employee_repo = EmployeeRepository()
        self.attendance_service = AttendanceService()

    def recognize_and_log_attendance(self, db: Session, image: np.ndarray, action: str = "auto") -> RecognitionResult:
        try:
            # 1. AI Pipeline to extract embedding
            ai_res = self.ai_service.process_attendance_frame(image)
            
            from backend.core.error_codes import (
                NOT_RECOGNIZED, LOW_CONFIDENCE, EMPLOYEE_INACTIVE,
                NO_CHECKIN, ALREADY_CHECKED_IN
            )
            
            if not ai_res["success"]:
                # Log technical detail, don't return to UI
                logger.error(f"AI processing failed: {ai_res.get('error')}")
                return RecognitionResult(
                    success=False, 
                    error_code=ai_res.get("error_code")
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
                    
                try:
                    # Decrypt embedding from DB safely
                    raw_bytes = decrypt_embedding(face_record.embedding)
                    db_embedding = np.frombuffer(raw_bytes, dtype=np.float32)
                    
                    # Calculate similarity (this could throw ValueError if shapes mismatch)
                    sim = cosine_similarity(query_embedding, db_embedding)
                    
                    if sim > highest_sim:
                        highest_sim = sim
                        best_match = face_record
                except Exception as e:
                    logger.exception(f"Warning: Failed to process face_record {face_record.id}")
                    continue
                    
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
                logger.error(f"Face not recognized, sim={highest_sim}")
                return RecognitionResult(
                    success=False,
                    status=status,
                    error_code=NOT_RECOGNIZED
                )
                
            # 4. Process Attendance
            employee = self.employee_repo.get(db, best_match.employee_id)
            if not employee or employee.status != "active":
                return RecognitionResult(
                    success=False, 
                    error_code=EMPLOYEE_INACTIVE
                )
                
            att_record = self.attendance_service.process_attendance(
                db=db, 
                employee_id=employee.id, 
                similarity_score=highest_sim,
                status="present",
                needs_review=needs_review,
                action=action
            )
            
            # Use action/message from attendance service if available
            res_action = att_record.get("action") if isinstance(att_record, dict) else None
            res_message = att_record.get("message") if isinstance(att_record, dict) else None
            already_checked_in = att_record.get("already_checked_in") if isinstance(att_record, dict) else False
            
            error_code = None
            success = True
            
            if status == "borderline":
                error_code = LOW_CONFIDENCE
                success = False # Must be false to trigger retry in UI, although attendance is recorded
            elif res_message == "No check-in found for today":
                error_code = NO_CHECKIN
                success = False
            elif already_checked_in:
                error_code = ALREADY_CHECKED_IN
                success = False
            
            if not success:
                return RecognitionResult(
                    success=False,
                    status=status,
                    error_code=error_code,
                    action=res_action,
                    employee_id=employee.id,
                    employee_code=employee.employee_code,
                    full_name=employee.full_name,
                    department=employee.department
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
                quality_passed=ai_res["quality"]["is_good"],
                action=res_action,
                message=res_message
            )
        except Exception as e:
            logger.exception("CRITICAL ERROR IN recognize_and_log_attendance")
            raise e