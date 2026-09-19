from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import cv2
import numpy as np
from backend.db.session import get_db
from backend.services.recognition_service import RecognitionService
from backend.schemas.recognition import RecognitionResult

router = APIRouter()
recognition_service = RecognitionService()

@router.post("/verify", response_model=RecognitionResult)
async def verify_face(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
        
    result = recognition_service.recognize_and_log_attendance(db, image)
    return result
