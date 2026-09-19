from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
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
    try:
        if not db.query(AdminUser).first():
            default_admin = AdminUser(
                username="admin", 
                password_hash=get_password_hash("admin")
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

# Mount Frontend Static Files
app.mount("/css", StaticFiles(directory="frontend/css"), name="css")
app.mount("/js", StaticFiles(directory="frontend/js"), name="js")
app.mount("/pages", StaticFiles(directory="frontend/pages"), name="pages")

@app.get("/")
def serve_index():
    from fastapi.responses import FileResponse
    return FileResponse("frontend/index.html")
