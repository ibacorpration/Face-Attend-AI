from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdminUserBase(BaseModel):
    username: str

class AdminUserCreate(AdminUserBase):
    password: str

class AdminUserUpdatePassword(BaseModel):
    password: str

class AdminUserResponse(AdminUserBase):
    id: int
    created_at: datetime
    has_face: bool

    class Config:
        from_attributes = True
