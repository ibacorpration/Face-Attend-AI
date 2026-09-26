from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.auth_service import AuthService
from backend.schemas.auth import Token
from fastapi import UploadFile, File
import numpy as np
import cv2
from backend.services.ai_singleton import get_ai_service
from ai.utils.similarity import cosine_similarity
from backend.core.config import settings

router = APIRouter()
auth_service = AuthService()

@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return auth_service.login(db, username=form_data.username, password=form_data.password)

@router.post("/face-login", response_model=Token)
async def face_login(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
        
    ai_service = get_ai_service()
    ai_res = ai_service.process_attendance_frame(image)
    
    if not ai_res["success"]:
        raise HTTPException(status_code=400, detail=ai_res.get("error", "No face detected"))
        
    query_embedding = ai_res["embedding"]
    
    from backend.db.models import AdminUser
    admins = db.query(AdminUser).filter(AdminUser.face_embedding.isnot(None)).all()
    
    best_match = None
    highest_sim = -1.0
    
    for admin in admins:
        db_embedding = np.frombuffer(admin.face_embedding, dtype=np.float32)
        sim = cosine_similarity(query_embedding, db_embedding)
        if sim > highest_sim:
            highest_sim = sim
            best_match = admin
            
    if best_match and highest_sim >= settings.FACE_RECOGNITION_THRESHOLD:
        from backend.core.security import create_access_token
        access_token = create_access_token(subject=best_match.username)
        return Token(access_token=access_token, token_type="bearer")
        
    if best_match:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Face not recognized (Score: {highest_sim:.2f} < {settings.FACE_RECOGNITION_THRESHOLD})",
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No admin faces registered. Please register from settings.",
        )
