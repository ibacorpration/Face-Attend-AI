<div align="center">

# Smart Face Attend

<br/>
<p>
  <img
    src="https://github.com/user-attachments/assets/595f8e5d-7914-4350-acd4-c57a689e0f88"
    alt="Face Attend AI Dashboard"
    width="100%"
  />
</p>

<br/>

</div>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/OpenCV-Computer_Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV" />
  <img src="https://img.shields.io/badge/ONNX_Runtime-Inference-005CED?style=for-the-badge" alt="ONNX Runtime" />
  <img src="https://img.shields.io/badge/ChromaDB-Vector_DB-FF6B35?style=for-the-badge" alt="ChromaDB" />
</p>

<br/>

</div>

---

# 🚀 Running Deployment

<a href="https://iba-corpration.up.railway.app">
  🤖 Web site : https://iba-corpration.up.railway.app 
</a>

---

## 📌 Overview

**Face Attend AI** is an AI-powered workforce attendance platform developed for **IBA Corpration**.

The system combines **Computer Vision, Face Recognition, Liveness Detection, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs)** into a single intelligent platform for secure attendance management and HR assistance.

Instead of relying on traditional attendance methods, Face Attend AI uses a complete AI pipeline to detect, validate, recognize, and authenticate employees before recording attendance.

The platform also includes an integrated **AI Assistant** capable of retrieving information from a knowledge base and generating contextual answers using modern LLMs.

### 🎯 Main Goals

* Automate employee attendance using face recognition.
* Reduce attendance fraud using liveness detection.
* Provide a secure and scalable AI inference pipeline.
* Give administrators complete employee and attendance management.
* Provide intelligent HR assistance through RAG and LLMs.
* Deliver a modern, responsive, production-oriented user experience.

---

# ✨ Features

## 🧠 Computer Vision

### Face Detection

Uses **YuNet** through OpenCV to detect faces efficiently in real time.

**Pipeline:**

```text
Camera Frame
     ↓
YuNet Face Detection
     ↓
Face Quality Validation
     ↓
Liveness Detection
     ↓
Face Alignment
     ↓
ArcFace Recognition
     ↓
Cosine Similarity
     ↓
Identity Decision
```

### Face Recognition

Face recognition is powered by **ArcFace embeddings** running through ONNX Runtime.

The system:

* Generates a 512-dimensional face embedding.
* Applies L2 normalization.
* Compares embeddings using cosine similarity.
* Uses configurable recognition thresholds.
* Supports borderline matching logic.
* Stores biometric embeddings securely.

### 🛡️ Liveness Detection

The system includes a liveness verification stage to reduce spoofing attempts.

Before recognition is performed, the system validates whether the detected face belongs to a live person.

Recognition is not performed when liveness verification fails.

### 🔐 Secure Biometric Storage

Employee face embeddings are stored securely with model-version tracking.

The biometric pipeline supports:

* Encrypted embeddings
* Private storage
* Model versioning
* Controlled biometric deletion
* Secure employee management

---

# 🤖 Chatbot

Face Attend AI includes an integrated **Retrieval-Augmented Generation (RAG)** chatbot.

The assistant combines:

```text
User Question
      ↓
Query Processing
      ↓
Semantic Search
      ↓
ChromaDB
      ↓
Relevant Documents
      ↓
Context Construction
      ↓
Gemini / Groq LLM
      ↓
AI Response
```

### Chatbot (RAG)

* **Vector Database:** ChromaDB
* **Embeddings:** Sentence Transformers
* **Document Processing:** PyPDF
* **Primary LLM:** Google Gemini
* **Fallback LLM:** Groq
* **Semantic Retrieval:** Vector similarity search

The architecture is designed so that the LLM layer can use a primary provider with automatic fallback support.

---

# 👨‍💼 Admin Dashboard

The platform provides an administrative dashboard for managing the attendance system.

### Employee Management

Administrators can:

* Add employees
* Edit employee information
* Search employees
* Filter employees
* Enable / disable employees
* Delete employees
* Manage biometric data
* Enroll multiple face images

### Employee Information

Each employee can have:

* Employee code
* Name
* Department
* Salary
* Phone number
* Account status
* Face biometric data
* Attendance records

---

# 📊 Attendance Management

The system records employee attendance through AI-powered face authentication.

Supported operations include:

* Employee check-in
* Employee check-out
* Attendance history
* Attendance monitoring
* Monthly attendance reports
* Data exporting

The goal is to replace manual attendance workflows with an automated AI-driven process.

---

# 🖥️ Interactive Kiosk

Face Attend AI includes a dedicated attendance kiosk experience designed for employee-facing devices.

The kiosk provides:

* Camera-based face capture
* Real-time recognition feedback
* Liveness verification
* Check-in / check-out interaction
* Visual feedback
* Smooth micro-animations
* Responsive UI

---

# 🏗️ Architecture

Face Attend AI follows a modular architecture separating the frontend, backend, AI systems, and data layer.

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │  TypeScript + Vite   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI         │
                    │    REST API Layer    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
   ┌─────────────────────┐          ┌─────────────────────┐
   │  Computer Vision    │          │    RAG Chatbot      │
   │                     │          │                     │
   │ YuNet               │          │ ChromaDB            │
   │ Liveness            │          │ Embeddings          │
   │ Alignment           │          │ Gemini              │
   │ ArcFace             │          │ Groq                │
   │ ONNX Runtime        │          │ Document Retrieval  │
   └──────────┬──────────┘          └─────────────────────┘
              │
              ▼
   ┌─────────────────────┐
   │      Database       │
   │       SQLite        │
   │    SQLAlchemy       │
   └─────────────────────┘
```

---

# 🧠 AI Pipeline

The Computer Vision pipeline is intentionally separated into independent stages.

```text
Camera
  │
  ▼
Face Detection
  │
  │ YuNet
  ▼
Quality Assessment
  │
  ▼
Liveness Detection
  │
  ├── Failed → Reject
  │
  ▼
Face Alignment
  │
  ▼
Preprocessing
  │
  ▼
ArcFace
  │
  ▼
512-D Embedding
  │
  ▼
L2 Normalization
  │
  ▼
Cosine Similarity
  │
  ├── Unknown
  ├── Borderline
  └── Recognized
```

This separation makes the AI pipeline easier to maintain, test, and extend.

---

# 📁 Project Structure

```text
Face Attend AI/
│
├── ai/
│   ├── computer_vision/
│   │   ├── models/
│   │   ├── detection/
│   │   ├── recognition/
│   │   ├── liveness/
│   │   └── ...
│   │
│   └── chatbot/
│       └── rag/
│           ├── embeddings/
│           ├── retrieval/
│           ├── llms/
│           ├── documents/
│           └── ...
│
├── backend/
│   ├── api/
│   ├── auth/
│   ├── database/
│   ├── models/
│   ├── schemas/
│   └── services/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   └── ...
│
├── data/
│   └── face_attendance.db
│
├── storage/
│   ├── employee_images/
│   └── attendance_evidence/
│
├── tests/
│
├── main.py
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

# 🛠️ Technology Stack

## Artificial Intelligence

| Technology                | Purpose              |
| ------------------------- | -------------------- |
| **YuNet**                 | Face Detection       |
| **ArcFace**               | Face Recognition     |
| **ONNX Runtime**          | AI Model Inference   |
| **OpenCV**                | Computer Vision      |
| **NumPy**                 | Numerical Processing |
| **ChromaDB**              | Vector Database      |
| **Sentence Transformers** | Text Embeddings      |
| **Gemini**                | Primary LLM          |
| **Groq**                  | LLM Fallback         |
| **PyPDF**                 | PDF Processing       |

## Backend

| Technology       | Purpose                    |
| ---------------- | -------------------------- |
| **Python 3.10+** | Backend & AI               |
| **FastAPI**      | REST API                   |
| **SQLAlchemy**   | ORM                        |
| **Pydantic**     | Validation & Configuration |
| **SQLite**       | Database                   |
| **PyJWT**        | Authentication             |
| **Bcrypt**       | Password Hashing           |

## Frontend

| Technology        | Purpose             |
| ----------------- | ------------------- |
| **React**         | UI                  |
| **TypeScript**    | Type Safety         |
| **Vite**          | Development & Build |
| **Tailwind CSS**  | Styling             |
| **React Router**  | Routing             |
| **Framer Motion** | Animations          |
| **GSAP**          | Advanced Animations |
| **Axios**         | API Communication   |
| **Lucide React**  | Icons               |

---

# ⚙️ Configuration

Create your environment file from the provided example:

```bash
cp .env.example .env
```

Configure the required environment variables.

Example:

```env
APP_TIMEZONE=Africa/Cairo

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
  
```
---

# 🚀 Running Locally

## 1. Clone the Repository

```bash
git clone https://github.com/ibacorpration/Face-Attend-AI.git
cd Face-Attend-AI
```

## 2. Backend Setup

Create and activate a virtual environment:

### Windows

```powershell
python -m venv venv
venv\Scripts\activate
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

# 🎨 Frontend Setup

Open a second terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available on the Vite development URL shown in the terminal.

---

# 🐳 Docker

The application can also be started using Docker Compose.

```bash
docker-compose up --build -d
```

To stop the services:

```bash
docker-compose down
```

---

# 🔐 Security

Security is an important part of the platform architecture.

The system includes:

* JWT-based authentication
* Password hashing
* Rate limiting
* Encrypted biometric embeddings
* Private employee storage
* Controlled biometric deletion
* Environment-based secrets
* Input validation
* Role-based administrative access

---

# 🧪 Testing

Backend tests are implemented using **pytest**.

Run the test suite with:

```bash
pytest
```

For frontend testing:

```bash
cd frontend
npm run test
```
---

# 👨‍💻 Project Focus

### Core AI

* Computer Vision
* Face Detection
* Face Recognition
* Liveness Detection
* ONNX Model Inference
* Embeddings
* Similarity Matching
* NLP
* RAG
* LLM Integration

### Software Engineering

* REST APIs
* Authentication
* Database Design
* Modular Architecture
* Clean Separation of Responsibilities
* Frontend / Backend Integration
* Docker
* Deployment

---
