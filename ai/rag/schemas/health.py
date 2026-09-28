from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """
    Schema for system health status check response.
    """
    status: str = Field("healthy", example="healthy")
    app_name: str
    environment: str
    version: str = "0.1.0"
