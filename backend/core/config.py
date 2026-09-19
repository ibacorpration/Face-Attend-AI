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

    AI_MODEL_PATH: str = "ai/models/w600k_r50.onnx"
    AI_MODEL_VERSION: str = "arcface-w600k-r50-v1"
    FACE_DETECTOR_MODEL_PATH: str = "ai/models/face_detection_yunet.onnx"

    FACE_RECOGNITION_THRESHOLD: float = 0.50
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

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
