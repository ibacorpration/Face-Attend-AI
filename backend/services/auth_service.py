from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.db.models import AdminUser
from backend.core.security import verify_password, create_access_token
from backend.schemas.auth import Token

class AuthService:
    def authenticate_user(self, db: Session, username: str, password: str) -> AdminUser:
        user = db.query(AdminUser).filter(AdminUser.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def login(self, db: Session, username: str, password: str) -> Token:
        user = self.authenticate_user(db, username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(subject=user.username)
        return Token(access_token=access_token, token_type="bearer")
