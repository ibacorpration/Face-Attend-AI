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
