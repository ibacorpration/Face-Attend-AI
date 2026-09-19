from datetime import datetime, timedelta
from typing import Optional, Any, Union
import jwt
import bcrypt
from cryptography.fernet import Fernet
from backend.core.config import settings

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_fernet_key() -> bytes:
    key = settings.EMBEDDING_ENCRYPTION_KEY
    if len(key) != 43 or not key.endswith("="):
        # Generate a valid base64 key for development if invalid
        # In production, a 32-byte url-safe base64 string must be provided
        import base64
        import hashlib
        key = base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest())
    return key.encode() if isinstance(key, str) else key

_fernet = Fernet(get_fernet_key())

def encrypt_embedding(embedding_bytes: bytes) -> bytes:
    return _fernet.encrypt(embedding_bytes)

def decrypt_embedding(encrypted_bytes: bytes) -> bytes:
    return _fernet.decrypt(encrypted_bytes)
