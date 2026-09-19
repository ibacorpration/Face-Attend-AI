from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: str = "present"
    similarity_score: Optional[float] = None
    needs_review: bool = False

class AttendanceCreate(AttendanceBase):
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None

class AttendanceResponse(AttendanceBase):
    id: int
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
