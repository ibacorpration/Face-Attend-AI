import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytz
import os
import sys

# add backend dir to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.db.session import SessionLocal
from backend.services.attendance_service import AttendanceService
from backend.services.employee_service import EmployeeService
from backend.core.config import settings

db = SessionLocal()
try:
    svc = AttendanceService()
    records = svc.get_attendance_by_month(db, 2024, 10)
    print(f"Records: {len(records)}")
    
    emp_svc = EmployeeService()
    employees = emp_svc.get_employees(db)
    print(f"Employees: {len(employees)}")
    
    # Try the loop
    import calendar
    from datetime import datetime
    tz = pytz.timezone(settings.APP_TIMEZONE)
    today = datetime.now(tz).date()
    days_in_month = 31

    emp_attendance = {}
    for r in records:
        if r.status in ["present", "match", "borderline"]:
            emp_attendance.setdefault(r.employee_id, set()).add(r.date)

    for emp in employees:
        if emp.status != 'active':
            continue
        attended_dates = emp_attendance.get(emp.id, set())
        attended_count = len(attended_dates)
        absent_count = max(0, days_in_month - attended_count)
        
        row = [
            emp.full_name,
            emp.phone or "",
            emp.department or "",
            attended_count,
            absent_count
        ]
        print(f"Row: {row}")
    
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
finally:
    db.close()
