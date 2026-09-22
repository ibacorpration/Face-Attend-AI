# FaceAttend AI 🎯

## AI Face Recognition Attendance System

**FaceAttend AI** is a production-ready, full-stack employee attendance system leveraging Computer Vision, Face Detection, Face Recognition, and Liveness checking. It features a high-performance Python/FastAPI backend and a premium, modern React/Vite frontend.

---

## 🏗️ Architecture Overview

The system architecture cleanly separates the Frontend, Backend, and AI components.

- **Frontend**: A modern SPA built with React 18, Vite, TypeScript, and Tailwind CSS.
- **Backend**: FastAPI providing robust REST APIs for Authentication, Employees, Attendance, and Recognition.
- **AI / Computer Vision**: YuNet for fast face detection, ArcFace for highly accurate recognition, along with quality and liveness checking.
- **Database**: SQLite (via SQLAlchemy 2.x) to store state, configuration, and encrypted face embeddings.

---

## 📁 Repository Structure (High-Level)

To maintain clarity, here is the high-level folder architecture of the monorepo:

```text
FaceAttend AI/
├── ai/                 # Computer Vision and AI pipeline components (Models, Extractors)
├── backend/            # FastAPI application (Routes, Schemas, Auth, DB Models)
├── frontend/           # React + Vite UI (Pages, Components, Hooks, Services)
├── data/               # SQLite database storage
├── storage/            # Local storage for employee images and attendance evidence
├── tests/              # Automated backend tests (pytest)
├── main.py             # FastAPI entry point
├── requirements.txt    # Python dependencies
└── docker-compose.yml  # Docker environment configuration
```
*(Note: Detailed file architecture for the frontend can be found inside `frontend/README.md`)*

---

## 💻 Technology Stack

### Backend
- **Language**: Python 3.10+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.x
- **Config**: Pydantic v2
- **Testing**: pytest

### Frontend
- **Framework**: React 18 (TypeScript)
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Testing**: Vitest & React Testing Library

---

## 🚀 Environment Setup & Running Locally

### 1. Backend Setup
1. Copy `.env.example` to `.env` in the root folder.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will be available at: `http://localhost:8000`*

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at: `http://localhost:3000` (or the port specified by Vite, e.g., 5173).*

---

## 🌐 How to Use

Once both servers are running:
- **Employee Kiosk (Face Scan):** Navigate to `http://localhost:3000/` or `http://localhost:3000/camera`
- **Admin Dashboard:** Navigate to `http://localhost:3000/admin/login`
  - *(Default credentials: `admin` / `admin` - or as configured in your DB)*

---

## 🐳 Docker Deployment

To run the entire production-ready containerized environment (Backend + AI + Frontend):
```bash
docker-compose up --build
```
