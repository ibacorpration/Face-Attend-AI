#!/bin/bash
set -e

# Download AI Models if they don't exist
echo "Checking and downloading AI models if necessary..."
python scripts/download_models.py

# Execute the main application
echo "Starting FaceAttend AI FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
