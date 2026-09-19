import os
from pathlib import Path

structure = [
    "scripts/",
    ".github/workflows/",
    "ai/models/",
    "ai/detection/",
    "ai/quality/",
    "ai/liveness/",
    "ai/preprocessing/",
    "ai/embedding/",
    "ai/recognition/",
    "ai/services/",
    "ai/utils/",
    "ai/tests/",
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
    "ai/detection/__init__.py",
    "ai/quality/__init__.py",
    "ai/liveness/__init__.py",
    "ai/preprocessing/__init__.py",
    "ai/embedding/__init__.py",
    "ai/recognition/__init__.py",
    "ai/services/__init__.py",
    "ai/utils/__init__.py",
    "ai/tests/__init__.py",
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
