<div align="center">

  <h1>🏢 IBA Corporation</h1>
  
  <p align="center">
    <strong>FaceAttend AI</strong><br>
    <em>A Next-Generation AI Face Recognition Attendance System</em>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>

</div>

<br>

**FaceAttend AI** is a production-ready, full-stack employee attendance system designed specifically for **IBA Corporation**. By leveraging state-of-the-art Computer Vision, Face Detection, Face Recognition, and Liveness checking, it provides a secure, seamless, and futuristic approach to workforce time tracking. 

Built with a high-performance Python/FastAPI backend and a premium, modern React/Vite frontend.

---

## ✨ Key Features

- **Face ID Authentication**: Instant and secure check-in/check-out using highly accurate ArcFace algorithms.
- **Anti-Spoofing (Liveness Check)**: Prevents attendance fraud using advanced face quality and liveness metrics.
- **Premium Admin Dashboard**: A sleek, beautifully animated dark-themed dashboard for managing employees and monitoring live attendance.
- **Excel & CSV Exporting**: Instantly generate and download comprehensive monthly attendance reports.
- **Interactive Kiosk Mode**: A futuristic and engaging user interface for the employee check-in tablet/camera, featuring smooth micro-animations.

---

## 🏗️ Architecture Overview

The system architecture cleanly separates the Frontend, Backend, and AI components.

- **Frontend**: A modern SPA built with React 18, Vite, TypeScript, Tailwind CSS, and Framer Motion.
- **Backend**: FastAPI providing robust REST APIs for Authentication, Employees, Attendance, and Recognition.
- **AI / Computer Vision**: YuNet for fast face detection, ArcFace for highly accurate recognition.
- **Database**: SQLite (via SQLAlchemy 2.x) to store state, configuration, and encrypted face embeddings.

---

## 📁 Repository Structure (High-Level)

To maintain clarity, here is the high-level folder architecture of the monorepo:

```text
IBA Corporation AI Attend/
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
- **Animations**: Framer Motion & GSAP
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
docker-compose up --build -d
```
