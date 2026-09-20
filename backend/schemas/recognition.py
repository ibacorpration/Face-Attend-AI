from pydantic import BaseModel
from typing import Optional

class RecognitionResult(BaseModel):
    success: bool
    employee_id: Optional[int] = None
    employee_code: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    employee_status: Optional[str] = None
    similarity_score: Optional[float] = None
    status: Optional[str] = None # "match", "borderline", "unknown"
    error: Optional[str] = None
    liveness_passed: bool = False
    quality_passed: bool = False
