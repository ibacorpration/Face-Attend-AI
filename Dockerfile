FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies required for OpenCV and ONNX
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create mount points
RUN mkdir -p /app/data /app/ai/models

# Download AI models during image build
RUN python scripts/download_models.py

# Ensure scripts are executable
RUN chmod +x /app/scripts/docker-entrypoint.sh

# Expose the API port
EXPOSE 8000

# Entrypoint downloads models and starts server
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
