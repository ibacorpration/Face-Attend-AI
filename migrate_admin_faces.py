import sqlite3
import os

db_path = os.path.join(os.getcwd(), 'data', 'face_attendance.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE admin_users ADD COLUMN face_embedding BLOB;")
except sqlite3.OperationalError as e:
    print("face_embedding already exists:", e)

try:
    cursor.execute("ALTER TABLE admin_users ADD COLUMN image_data BLOB;")
except sqlite3.OperationalError as e:
    print("image_data already exists:", e)

conn.commit()
conn.close()
print("Migration completed.")
