from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    employee_code: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    status: str
    consent_given_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    has_face: bool = False

    model_config = ConfigDict(from_attributes=True)
