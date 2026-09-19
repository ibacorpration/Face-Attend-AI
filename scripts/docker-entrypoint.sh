#!/bin/bash
set -e

echo "Starting FaceAttend AI FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"