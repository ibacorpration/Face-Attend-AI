from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import io
import csv
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from backend.db.session import get_db
from backend.core.deps import get_current_admin
from backend.db.models import AdminUser
from backend.services.attendance_service import AttendanceService
from backend.schemas.attendance import AttendanceResponse

router = APIRouter()
attendance_service = AttendanceService()

@router.get("/daily", response_model=List[AttendanceResponse])
def get_daily_attendance(
    target_date: date = None,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    if not target_date:
        import pytz
        from datetime import datetime
        from backend.core.config import settings
        tz = pytz.timezone(settings.APP_TIMEZONE)
        target_date = datetime.now(tz).date()
    return attendance_service.get_attendance_by_date(db, target_date)

@router.get("/export")
def export_attendance_csv(
    target_date: date = None,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    if not target_date:
        import pytz
        from datetime import datetime
        from backend.core.config import settings
        tz = pytz.timezone(settings.APP_TIMEZONE)
        target_date = datetime.now(tz).date()

    records = attendance_service.get_attendance_by_date(db, target_date)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Employee ID", "Date", "Check In", "Check Out", "Status", "Confidence Score", "Needs Review"])

    for record in records:
        writer.writerow([
            record.employee_id,
            record.date,
            record.check_in.strftime("%Y-%m-%d %H:%M:%S") if record.check_in else "",
            record.check_out.strftime("%Y-%m-%d %H:%M:%S") if record.check_out else "",
            record.status,
            f"{record.similarity_score:.2f}" if record.similarity_score else "",
            record.needs_review
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_{target_date}.csv"}
    )

@router.get("/export/monthly")
def export_monthly_attendance_csv(
    month: str = None,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    import pytz
    from datetime import datetime
    import calendar
    from backend.core.config import settings
    from backend.services.employee_service import employee_service
    
    if not month:
        tz = pytz.timezone(settings.APP_TIMEZONE)
        month = datetime.now(tz).strftime("%Y-%m")
        
    year_str, month_str = month.split("-")
    year_int, month_int = int(year_str), int(month_str)
    
    records = attendance_service.get_attendance_by_month(db, year_int, month_int)
    employees = employee_service.get_employees(db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Employee Name", "Phone", "Department", "Days Attended", "Days Absent"])
    
    # Calculate total working days (e.g. up to today if it's current month, or full month if past)
    tz = pytz.timezone(settings.APP_TIMEZONE)
    today = datetime.now(tz).date()
    if today.year == year_int and today.month == month_int:
        days_in_month = today.day
    else:
        days_in_month = calendar.monthrange(year_int, month_int)[1]
        
    # Group attendance by employee
    emp_attendance = {}
    for r in records:
        if r.status in ["present", "match", "borderline"]: # they checked in
            emp_attendance.setdefault(r.employee_id, set()).add(r.date)
            
    for emp in employees:
        if emp.status != 'active':
            continue
        attended_dates = emp_attendance.get(emp.id, set())
        attended_count = len(attended_dates)
        absent_count = max(0, days_in_month - attended_count)
        
        writer.writerow([
            f"{emp.first_name} {emp.last_name}",
            emp.phone or "",
            emp.department or "",
            attended_count,
            absent_count
        ])
        
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=monthly_attendance_{month}.csv"}
    )