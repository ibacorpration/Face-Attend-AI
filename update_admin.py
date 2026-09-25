import sys
import os
sys.path.append(os.getcwd())
from backend.db.database import SessionLocal
from backend.db.models import AdminUser
from backend.core.security import get_password_hash

db = SessionLocal()
admin = db.query(AdminUser).first()
if admin:
    admin.username = "iba"
    admin.password_hash = get_password_hash("iba")
    db.commit()
    print("Updated admin user to iba/iba")
else:
    print("No admin user found")
db.close()
