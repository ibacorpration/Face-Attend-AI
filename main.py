from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse
import os
from backend.core.config import settings
from backend.db.database import init_db, engine
from sqlalchemy import text
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database
    init_db()
    
    # Sync RAG documents in background to prevent server startup timeout
    from backend.api.routes.chat import get_rag_service
    from pathlib import Path
    import asyncio
    
    import os
    if os.getenv("ENABLE_RAG_STARTUP_SYNC", "false").lower() == "true":
        def sync_rag_background():
            try:
                print("Starting RAG documents sync in background...")
                rag_service = get_rag_service()
                uploads_dir = Path.cwd() / "rag_data" / "uploads"
                rag_service.sync_with_uploads_dir(uploads_dir)
                print("Successfully synced RAG documents.")
            except Exception as e:
                print(f"Failed to sync RAG documents: {e}")
                
        # Run in a separate thread so it doesn't block FastAPI startup
        asyncio.create_task(asyncio.to_thread(sync_rag_background))
    else:
        print("Skipping RAG documents sync on startup to save memory. Set ENABLE_RAG_STARTUP_SYNC=true to enable.")
    
    # Initialize default admin user
    from backend.db.database import SessionLocal
    from backend.db.models import AdminUser
    from backend.core.security import get_password_hash
    db = SessionLocal()
    
    # Simple migration for new columns
    try:
        db.execute(text("ALTER TABLE admin_users ADD COLUMN face_embedding BLOB"))
        db.commit()
    except Exception:
        db.rollback()
        
    try:
        db.execute(text("ALTER TABLE admin_users ADD COLUMN image_data BLOB"))
        db.commit()
    except Exception:
        db.rollback()
        
    # Clean up orphaned records from before PRAGMA foreign_keys was enabled
    try:
        # 1. Delete faces/attendance where the employee no longer exists at all
        db.execute(text("DELETE FROM employee_faces WHERE employee_id NOT IN (SELECT id FROM employees)"))
        db.execute(text("DELETE FROM attendance WHERE employee_id NOT IN (SELECT id FROM employees)"))
        
        # 2. Delete faces that were created BEFORE the employee was created 
        # (This happens if an ID was reused, the new employee inherits the old face)
        db.execute(text('''
            DELETE FROM employee_faces 
            WHERE created_at < (
                SELECT created_at FROM employees WHERE employees.id = employee_faces.employee_id
            )
        '''))
        
        # 3. Delete attendance records created BEFORE the employee was created
        db.execute(text('''
            DELETE FROM attendance 
            WHERE created_at < (
                SELECT created_at FROM employees WHERE employees.id = attendance.employee_id
            )
        '''))
        db.commit()
        
        # 4. Clean up orphaned image directories from the file system
        from pathlib import Path
        import shutil
        storage_dir = Path("storage/employee_images")
        if storage_dir.exists():
            active_ids = {str(row[0]) for row in db.execute(text("SELECT id FROM employees")).fetchall()}
            for folder in storage_dir.iterdir():
                if folder.is_dir() and folder.name not in active_ids:
                    try:
                        shutil.rmtree(folder)
                    except Exception as ex:
                        print(f"Failed to delete orphaned image folder {folder}: {ex}")
                        
    except Exception as e:
        print(f"Error cleaning up orphaned records: {e}")
        db.rollback()
        
    try:
        if not db.query(AdminUser).first():
            default_admin = AdminUser(
                username=settings.FIRST_SUPERUSER, 
                password_hash=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD)
            )
            db.add(default_admin)
            db.commit()
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.api.api import api_router
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    health_status = {
        "status": "ok",
        "message": "FaceAttend AI is running"
    }
    return health_status

# --- Production Frontend Serving ---
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")

if os.path.isdir(frontend_dist):
    # Mount assets specifically so they are resolved correctly
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Catch-all route for SPA (React Router)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Let FastAPI handle 404s for actual API requests that miss
        if full_path.startswith("api/") or full_path == "health":
            raise HTTPException(status_code=404, detail="Not Found")
            
        # If requesting a static file at root (e.g., favicon, vite.svg)
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise, fall back to index.html for client-side routing
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    # Development fallback
    @app.get("/")
    def serve_index():
        return FileResponse("frontend/index.html")
