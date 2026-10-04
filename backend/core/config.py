from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "FaceAttend AI"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "sqlite:///./data/face_attendance.db"
    APP_TIMEZONE: str = "Africa/Cairo"

    JWT_SECRET_KEY: str = "change_this_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    FIRST_SUPERUSER: str = "admin"
    FIRST_SUPERUSER_PASSWORD: str = "changeme"

    AI_MODEL_PATH: str = "ai/computer_vision/models/w600k_r50.onnx"
    AI_MODEL_VERSION: str = "arcface-w600k-r50-v1"
    FACE_DETECTOR_MODEL_PATH: str = "ai/computer_vision/models/face_detection_yunet.onnx"

    FACE_RECOGNITION_THRESHOLD: float = 0.60
    FACE_RECOGNITION_BORDERLINE_BAND: float = 0.05

    LIVENESS_ENABLED: bool = True
    LIVENESS_MODE: str = "motion"

    RECOGNITION_INTERVAL_MS: int = 500
    ATTENDANCE_COOLDOWN_SECONDS: int = 30
    RECOGNITION_RATE_LIMIT_PER_MINUTE: int = 15

    SAVE_ATTENDANCE_SNAPSHOT: bool = False
    MAX_IMAGE_SIZE_MB: int = 5

    EMBEDDING_ENCRYPTION_KEY: str = "change_this_in_production"
    IMAGE_RETENTION_DAYS: int = 90

    CORS_ALLOWED_ORIGINS: str = "http://localhost:8000"

    # RAG Settings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    VECTOR_DB_DIR: str = "rag_data/chroma_db"
    COLLECTION_NAME: str = "rag_documents_v2"
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"
    GROQ_API_KEY: str = ""
    GROQ_MODEL_NAME: str = "llama-3.1-8b-instant"
    LLM_MAX_TOKENS: int = 600
    RAG_TOP_K: int = 3
    DEFAULT_CHUNK_SIZE: int = 500
    DEFAULT_CHUNK_OVERLAP: int = 50
    RAG_SCORE_THRESHOLD: float = 0.5
    RAG_RELATIVE_SCORE_CUTOFF: float = 0.8
    RAG_MAX_CONTEXT_CHARS: int = 3000       
    CHAT_HISTORY_MAX_MESSAGES: int = 10
    CHAT_HISTORY_MAX_CHARS_PER_MSG: int = 500

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
