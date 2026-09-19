from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from backend.db.session import get_db
from backend.core.deps import get_current_admin
from backend.db.models import AdminUser
from backend.services.employee_service import EmployeeService
from backend.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter()
employee_service = EmployeeService()

# Every route below now requires a valid admin Bearer token.
# (recognition.py's /verify stays public on purpose -- that's the kiosk endpoint.)

@router.post("/", response_model=EmployeeResponse)
def create_employee(
    employee_in: EmployeeCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return employee_service.create_employee(db, employee_in)

@router.post("/{employee_id}/face")
async def upload_employee_face(
    employee_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    contents = await file.read()
    employee_service.register_face(db, employee_id, contents, file.filename)
    return {"message": "Face registered successfully"}

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return employee_service.get_employee(db, employee_id)

@router.get("/", response_model=List[EmployeeResponse])
def get_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return employee_service.get_employees(db, skip=skip, limit=limit)

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return employee_service.update_employee(db, employee_id, employee_in)

@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    return employee_service.delete_employee(db, employee_id)