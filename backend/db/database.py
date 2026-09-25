import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase
from backend.core.config import settings

# Ensure the data directory exists if using sqlite
if settings.DATABASE_URL.startswith("sqlite"):
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def init_db():
    # Import models here so they are registered with Base.metadata before creating tables
    import backend.db.models
    Base.metadata.create_all(bind=engine)
    
    if settings.DATABASE_URL.startswith("sqlite"):
        from sqlalchemy import text
        with engine.begin() as conn:
            # Simple migration for image_data
            result = conn.execute(text("PRAGMA table_info(employee_faces)"))
            columns = [row[1] for row in result]
            if "image_data" not in columns:
                conn.execute(text("ALTER TABLE employee_faces ADD COLUMN image_data BLOB"))
