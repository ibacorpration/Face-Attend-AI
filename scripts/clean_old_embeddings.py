import os
import sys

# Add project root to sys path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.session import SessionLocal
from backend.db.models import EmployeeFace
from backend.core.config import settings

def clean_old_embeddings():
    db = SessionLocal()
    try:
        # Delete all faces that don't match the current AI_MODEL_VERSION
        deleted = db.query(EmployeeFace).filter(EmployeeFace.model_version != settings.AI_MODEL_VERSION).delete()
        db.commit()
        print(f"Successfully deleted {deleted} old/incompatible embeddings.")
    except Exception as e:
        print(f"Error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_old_embeddings()
