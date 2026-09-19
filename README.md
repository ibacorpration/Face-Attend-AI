# FaceAttend AI

## AI Face Recognition Attendance System

**Current Development Phase:** Phase 1

### Overview
FaceAttend AI is a production-ready employee attendance system leveraging Computer Vision, Face Detection, Face Recognition, and Liveness checking. This repository is currently in Phase 1, focusing on establishing a clean architecture, database models, and configuration.

### Architecture Overview
The system architecture cleanly separates the Frontend, Backend, and AI components.
- **Frontend**: HTML / CSS / Vanilla JS for Employee UI and Admin Dashboard.
- **Backend**: FastAPI providing routes for Auth, Employees, Attendance, and Recognition API.
- **AI**: YuNet for detection, ArcFace for recognition, Quality checking, and Liveness checking.
- **Database**: SQLite (SQLAlchemy 2.x) to store state, configuration, and encrypted face embeddings.

### Technology Stack
- **Language**: Python 3.10+
- **Backend Framework**: FastAPI
- **ORM**: SQLAlchemy 2.x
- **Configuration**: Pydantic v2 and pydantic-settings
- **Database**: SQLite
- **Testing**: pytest

### Project Structure
- `ai/`: Computer Vision and AI pipeline components (Pending Phase 2).
- `backend/`: FastAPI application, configuration, and database components.
- `frontend/`: UI files.
- `storage/`: Local storage for employee images and attendance evidence.
- `data/`: SQLite database storage.
- `tests/`: Automated tests.
- `main.py`: FastAPI application entry point.

### Database Overview
The following tables are established:
- `employees`: Stores employee information and status.
- `employee_faces`: Stores encrypted face embeddings and references to images.
- `attendance`: Tracks check-in/out times, similarity scores, and status.
- `admin_users`: Stores admin credentials.

### Environment Setup
1. Clone the repository.
2. Copy `.env.example` to `.env` and modify as needed.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application
To run the FastAPI server locally:
```bash
uvicorn main:app --reload
```
The application will automatically initialize the database and tables upon startup.

### Running Tests
To run the test suite:
```bash
pytest
```

### Current Status
**All phases have been successfully completed:**
- **Phase 1**: Database Setup & API Skeleton
- **Phase 2**: Computer Vision Pipeline (Face Detection & Recognition)
- **Phase 3**: FastAPI Backend Features (Auth, Employees, Attendance, Recognition)
- **Phase 4**: Frontend UI Implementation (Glassmorphism, Kiosk, Dashboard)
- **Phase 5**: Dockerization

### How to use
- **Admin Dashboard:** Go to `http://localhost:8000/pages/admin-login.html` (Default credentials: `admin` / `admin`)
- **Employee Kiosk:** Go to `http://localhost:8000/pages/employee.html`

### Docker Deployment
To run the production-ready containerized environment:
```bash
docker-compose up --build
```

