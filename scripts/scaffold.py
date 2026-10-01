import os
from pathlib import Path

structure = [
    "scripts/",
    ".github/workflows/",
    "ai/computer_vision/models/",
    "ai/computer_vision/detection/",
    "ai/computer_vision/quality/",
    "ai/computer_vision/liveness/",
    "ai/computer_vision/preprocessing/",
    "ai/computer_vision/embedding/",
    "ai/computer_vision/recognition/",
    "ai/computer_vision/services/",
    "ai/computer_vision/utils/",
    "ai/tests/computer_vision/",
    "backend/api/routes/",
    "backend/core/",
    "backend/db/",
    "backend/schemas/",
    "backend/services/",
    "backend/repositories/",
    "frontend/pages/",
    "frontend/css/",
    "frontend/js/",
    "frontend/assets/icons/",
    "storage/employee_images/",
    "storage/attendance_evidence/",
    "data/",
    "tests/",
    "docs/"
]

init_files = [
    "ai/__init__.py",
    "ai/computer_vision/detection/__init__.py",
    "ai/computer_vision/quality/__init__.py",
    "ai/computer_vision/liveness/__init__.py",
    "ai/computer_vision/preprocessing/__init__.py",
    "ai/computer_vision/embedding/__init__.py",
    "ai/computer_vision/recognition/__init__.py",
    "ai/computer_vision/services/__init__.py",
    "ai/computer_vision/utils/__init__.py",
    "ai/tests/computer_vision/__init__.py",
    "backend/__init__.py",
    "backend/api/__init__.py",
    "backend/api/routes/__init__.py",
    "backend/core/__init__.py",
    "backend/db/__init__.py",
    "backend/schemas/__init__.py",
    "backend/services/__init__.py",
    "backend/repositories/__init__.py",
    "tests/__init__.py"
]

for d in structure:
    os.makedirs(d, exist_ok=True)
    if "storage" in d:
        with open(os.path.join(d, ".gitkeep"), "w") as f:
            pass

for f in init_files:
    Path(f).touch()

print("Scaffolded directories and __init__.py files.")
