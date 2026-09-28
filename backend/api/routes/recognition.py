from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import cv2
import numpy as np
from backend.db.session import get_db
from backend.services.recognition_service import RecognitionService
from backend.schemas.recognition import RecognitionResult
import logging
from backend.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()
recognition_service = RecognitionService()

@router.post("/verify", response_model=RecognitionResult)
async def verify_face(
    file: UploadFile = File(...), 
    action: str = Form("auto"),
    db: Session = Depends(get_db)
):
    if action not in ["check_in", "check_out", "auto"]:
        raise HTTPException(status_code=422, detail="Invalid action parameter")
        
    contents = await file.read()
    
    if len(contents) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image size exceeds the maximum limit")
        
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
        
    try:
        result = recognition_service.recognize_and_log_attendance(db, image, action=action)
        return result
    except Exception:
        logger.exception("Error in verify_face")
        raise HTTPException(status_code=500, detail="Attendance processing failed. Please try again.")
