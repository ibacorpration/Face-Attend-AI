# FaceAttend AI (AI-Powered Attendance System)

This file (`elfakr2.md`) contains comprehensive and detailed documentation for the **FaceAttend AI** (or **IBA Corporation - AI Attend**) project, outlining its architecture, technologies used, features, and overall system workflow.

---

## 🏗️ Architecture Overview
The system is cleanly and professionally divided into distinct components (Frontend, Backend, and AI), ensuring scalability and easy maintenance.

### 1. Frontend (User Interface)
- A modern and blazing-fast Single Page Application (SPA).
- **Framework**: React 18 powered by Vite for rapid development.
- **Language**: TypeScript to ensure code quality and minimize runtime errors.
- **Styling**: Tailwind CSS, enhanced with `framer-motion` for interactive animations and a premium feel.
- **Icons**: Lucide React library.
- **Core Pages**:
  - `LandingPage`: The main landing page of the system.
  - `CameraPage`: The employee portal for check-in and check-out via webcam.
  - `Admin`: The management dashboard which includes:
    - Admin Login (`AdminLogin`).
    - General Statistics (`AdminDashboard`).
    - Employee Management (`EmployeesPage`).
    - Attendance Log (`AttendancePage`).
    - Messages & Alerts (`MessagesPage`).
    - General Settings (`SettingsPage`).
  - **IBA Assistant (ChatWidget)**: An integrated AI-powered smart chatbot (digital assistant) to answer user inquiries, featuring session-based chat history persistence.

### 2. Backend & Database
- **Framework**: FastAPI (Python), one of the fastest frameworks for building RESTful APIs.
- **Data Management**: Object-Relational Mapping (ORM) using `SQLAlchemy 2.x`.
- **Database**: SQLite (stored in the `data/` folder) for persisting employee data, attendance logs, and configurations.
- **Data Validation**: Pydantic v2.
- **Testing**: `pytest` for unit testing and ensuring backend stability.

### 3. AI & Computer Vision
- **Face Recognition**: Utilizes the **ArcFace** model to convert faces into embeddings and match them with high precision.
- **Face Detection**: Employs the **YuNet** model for fast and accurate face detection from camera feeds.
- **Liveness Checking**: Anti-spoofing measures to ensure the face belongs to a real person and is not a photograph.
- **AI Assistant (RAG - Chatbot)**: A smart conversational system based on Retrieval-Augmented Generation (RAG) using domain-specific knowledge (`rag_data`) to answer system-related queries.

---

## 📂 Detailed Folder Structure

```text
FaceAttend AI/
├── ai/                 # AI models (Computer Vision, Face extractors, etc.)
├── backend/            # Backend server code (FastAPI)
│   ├── api/            # API routes (e.g., auth, employees, attendance, chat)
│   ├── core/           # Core settings, Security, and Error handling
│   ├── db/             # Database configuration and SQLAlchemy models
│   ├── repositories/   # Direct database interaction layer (Repositories)
│   ├── schemas/        # Data validation models (Pydantic Models)
│   ├── services/       # Business logic layer
│   └── tests/          # Unit Tests
├── frontend/           # User Interface code (React/Vite)
│   ├── src/
│   │   ├── assets/     # Images and icons (e.g., IBA Mascot)
│   │   ├── components/ # Reusable components (e.g., ChatWidget, Sidebar, Layout)
│   │   ├── context/    # Global state sharing (e.g., AuthContext)
│   │   ├── hooks/      # Custom React hooks (e.g., useCamera)
│   │   ├── pages/      # Application pages (Admin, Employee, Landing)
│   │   └── services/   # API interaction services
├── data/               # SQLite database file
├── storage/            # Local media storage directory
│   └── attendance_evidence/  # Captured screenshots as proof of attendance
├── rag_data/           # Text data acting as the Knowledge Base for the Chatbot
├── scripts/            # Helper scripts (e.g., model downloading, data cleaning)
├── venv/               # Python Virtual Environment
├── docker-compose.yml  # Docker configuration for isolated environment execution
├── requirements.txt    # Required Python dependencies
└── main.py             # Entry Point for running the FastAPI server
```

---

## ✨ Key Features

1. **Liveness-Verified Face Attendance**: 
   A secure system that uses the camera to automatically identify employees and log their check-ins/check-outs by matching their face embeddings with the database, while actively ensuring they are physically present (Liveness detection).
   
2. **Comprehensive Employee Management (Admin Panel)**: 
   An admin dashboard allowing managers to add new employees, update their details, and capture or upload face images to train the system.

3. **Statistics Dashboard**: 
   Provides an overview of daily attendance statistics, including the number of present and absent employees.

4. **Integrated Smart Assistant (IBA Chatbot)**: 
   The system includes a chat widget for employees and managers to answer system-related questions. The chat retains the conversation history throughout the logged-in session (via `localStorage`) and starts a fresh chat upon logout, ensuring privacy and a seamless user experience.

5. **Security & Professionalism**: 
   Communication between the frontend and backend is secure and encrypted using JWT tokens and Role-Based Access Control (Admin vs Employee).

---

## 🚀 How to Run

### 1. Running the Backend
- Ensure the virtual environment is activated: `.\venv\Scripts\activate`
- Start the server using: `uvicorn main:app --reload` (or by running `main.py` directly).

### 2. Running the Frontend
- Navigate to the frontend directory: `cd frontend`
- Install dependencies: `npm install`
- Start the development server: `npm run dev`

---
*This file was created as a comprehensive reference guide for the project, making it easier to understand the technologies and how all system components are interconnected.*
