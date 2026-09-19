# Architecture

## Overview
FaceAttend AI follows a modular architecture separating Frontend, Backend, and AI components. The root `main.py` is solely responsible for application assembly and startup.

## Conceptual Diagram

```mermaid
graph TD
    subgraph Frontend [FRONTEND - HTML / CSS / JS]
        UI1(Employee UI)
        UI2(Admin Dashboard)
    end

    subgraph Backend [BACKEND - FastAPI]
        B1(Auth)
        B2(Employees)
        B3(Attendance)
        B4(Recognition API)
        B5(Review Queue)
    end

    subgraph AI_Pipeline [AI - Computer Vision]
        A1(YuNet)
        A2(Quality Check)
        A3(Liveness)
        A4(ArcFace)
        A5(Recognition)
    end

    subgraph Database [DATABASE - SQLite]
        D1(Employees)
        D2(Face Embeddings)
        D3(Attendance)
        D4(Admins)
    end

    Frontend --> Backend
    Backend --> AI_Pipeline
    Backend --> Database
```

## Component Details
- **AI**: Independent from FastAPI, this layer handles all computer vision operations.
- **Backend**: Consumes AI services and manages application state, providing REST endpoints.
- **Database**: Stores the application state, configuration, and biometrics.
- **Frontend**: Communicates with the backend using REST APIs.
