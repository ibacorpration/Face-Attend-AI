from fastapi import APIRouter
from backend.api.routes import auth, employees, attendance, recognition, messages

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(recognition.router, prefix="/recognition", tags=["recognition"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
