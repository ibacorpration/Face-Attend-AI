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