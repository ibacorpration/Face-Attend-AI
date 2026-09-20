#!/bin/bash
set -e

echo "Downloading models if not present in volume..."
python scripts/download_models.py

echo "Starting FaceAttend AI FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"