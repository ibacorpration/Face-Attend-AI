<div align="center">

  <h1>Face Attend AI</h1>

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/595f8e5d-7914-4350-acd4-c57a689e0f88"
    alt="FaceAttend AI Dashboard"
    width="100%"
  />
</p>

    <em>A Next-Generation AI Face Recognition Attendance System</em><br><br>
    <a href="https://iba-corpration.up.railway.app"><strong>🔗 Live Project: iba-corpration.up.railway.app</strong></a>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>

</div>

<br>

**FaceAttend AI** is an advanced, production-ready AI ecosystem designed specifically for **IBA Corporation**. At its core, the system harnesses state-of-the-art **Computer Vision** (Face Detection, Face Recognition, Liveness Anti-Spoofing) alongside a powerful **Retrieval-Augmented Generation (RAG) Chatbot** to provide a secure, seamless, and intelligent approach to workforce management. 

Engineered with an AI-first architecture, the platform combines high-performance inference pipelines via Python/FastAPI with a premium, modern React/Vite frontend.

---

## ✨ AI & Core Features

- **Advanced Computer Vision Pipeline**:
  - **Face ID Authentication**: Instant and secure check-in/check-out using highly accurate ArcFace embeddings and ONNX Runtime.
  - **Anti-Spoofing (Liveness Check)**: Prevents attendance fraud using robust heuristics and image quality assessment.
- **Intelligent HR Chatbot (RAG)**: A deeply integrated NLP assistant capable of answering complex employee and HR queries using dynamic Vector Search (ChromaDB) and modern LLMs.
- **Premium Admin Dashboard**: A sleek, beautifully animated dark-themed dashboard for managing employees and monitoring live attendance.
- **Data Analytics & Exporting**: Instantly generate and download comprehensive monthly attendance reports.
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

### 🧠 AI
#### Computer Vision
- **Face Detection**: YuNet (High-speed, lightweight detection)
- **Face Recognition**: ArcFace (High-accuracy embeddings)
- **Anti-Spoofing**: Custom algorithms for liveness detection
- **Processing Engine**: OpenCV & ONNX Runtime (High-performance inference)

#### Chatbot (RAG)
- **LLM APIs**: Groq & Google GenAI (Gemini)
- **Vector Database**: ChromaDB
- **Embeddings**: Sentence-Transformers
- **Document Processing**: PyPDF

### ⚙️ Backend
- **Language**: Python 3.10+
- **Framework**: FastAPI (High concurrency for AI inference)
- **ORM**: SQLAlchemy 2.x
- **Config**: Pydantic v2
- **Testing**: pytest

### 🎨 Frontend
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

 <a href="https://iba-corpration.up.railway.app"><strong>🔗 Live Project: iba-corpration.up.railway.app</strong></a>

  - *(Default credentials: `admin` / `123` - or as configured in your DB)*

---

d
```
