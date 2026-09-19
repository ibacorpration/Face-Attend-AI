import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.db.session import get_db
from backend.db.models import AdminUser

# Points Swagger's "Authorize" button at the real login endpoint.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    """
    Validates the Bearer JWT sent by the frontend (frontend/js/api.js already
    sends it) and returns the matching AdminUser row.

    Raises 401 if the token is missing, expired, malformed, or refers to a
    user that no longer exists. Use as a route dependency to require login:

        @router.get("/", dependencies=[Depends(get_current_admin)])
        # or, if you need the user object inside the handler:
        def route(admin: AdminUser = Depends(get_current_admin)):
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.PyJWTError:
        raise credentials_exception

    username = payload.get("sub")
    if username is None:
        raise credentials_exception

    admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if admin is None:
        raise credentials_exception

    return admin