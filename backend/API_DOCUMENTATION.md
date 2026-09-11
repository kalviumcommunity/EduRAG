# EduRAG Backend API Integration Guide

This document specifies the exact REST API contract for integrating a React frontend (Vite / Next.js / CRA) with the EduRAG FastAPI backend.

---

## 1. Global Setup & Configuration

- **Base URL**: `http://localhost:8000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **OpenAPI JSON Schema**: `http://localhost:8000/api/v1/openapi.json`
- **CORS Configured Origins**: `http://localhost:5173`, `http://localhost:3000` (All headers & HTTP methods allowed, credentials supported)

---

## 2. Authentication & Header Standard

All protected endpoints require an `Authorization` HTTP header with a Bearer JWT token:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Common Error Response Format

All API errors return a standard JSON structure with HTTP status codes (400, 401, 403, 404, 409, 422, 503):

```json
{
  "success": false,
  "message": "Detailed human-readable error description",
  "error_code": "UNAUTHORIZED | FORBIDDEN | NOT_FOUND | ALREADY_EXISTS | VALIDATION_ERROR | BAD_REQUEST | INTERNAL_SERVER_ERROR"
}
```

---

## 3. Endpoints Specification

### 3.1 AUTHENTICATION (`/auth`)

#### `POST /api/v1/auth/register`
*Register a new user account (student or admin).*

- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Alex Student",
  "email": "alex.student@university.edu",
  "password": "StudentPassword123!",
  "role": "student"
}
```
- **Response `201 Created`**:
```json
{
  "id": 1,
  "name": "Alex Student",
  "email": "alex.student@university.edu",
  "role": "student",
  "is_active": true,
  "created_at": "2026-09-09T12:00:00Z",
  "updated_at": "2026-09-09T12:00:00Z"
}
```

#### `POST /api/v1/auth/login`
*Authenticate user with JSON credentials.*

- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "alex.student@university.edu",
  "password": "StudentPassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "name": "Alex Student",
  "email": "alex.student@university.edu",
  "role": "student"
}
```

#### `POST /api/v1/auth/login/oauth` (Swagger UI Authorization Endpoint)
*OAuth2 form-encoded login.*

- **Headers**: `Content-Type: application/x-www-form-urlencoded`
- **Body**: `username=alex.student@university.edu&password=StudentPassword123!`
- **Response `200 OK`**: Same as `POST /auth/login`.

#### `GET /api/v1/auth/me`
*Retrieve active user profile.*

- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response `200 OK`**:
```json
{
  "id": 1,
  "name": "Alex Student",
  "email": "alex.student@university.edu",
  "role": "student",
  "is_active": true,
  "created_at": "2026-09-09T12:00:00Z",
  "updated_at": "2026-09-09T12:00:00Z"
}
```

---

### 3.2 COURSES (`/courses`)

#### `GET /api/v1/courses`
*List courses. Students see active courses; Admins see all courses.*

- **Headers**: `Authorization: Bearer <TOKEN>`
- **Query Params**: `page` (default `1`), `page_size` (default `20`)
- **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "name": "PHYS 301: Quantum Mechanics",
    "description": "Introduction to Wave-Particle Duality and Quantum Physics",
    "is_active": true,
    "created_at": "2026-09-09T12:00:00Z",
    "updated_at": "2026-09-09T12:00:00Z"
  }
]
```

#### `GET /api/v1/courses/{course_id}`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response `200 OK`**: Single course object.

#### `POST /api/v1/courses` (Admin Only)
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "CS 401: Distributed Systems",
  "description": "Consensus algorithms and fault tolerance",
  "is_active": true
}
```
- **Response `201 Created`**: Single course object.

#### `PUT /api/v1/courses/{course_id}` (Admin Only)
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "CS 401: Advanced Distributed Systems",
  "description": "Updated course description",
  "is_active": true
}
```
- **Response `200 OK`**: Updated course object.

#### `DELETE /api/v1/courses/{course_id}` (Admin Only)
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Response `204 No Content`**

---

### 3.3 DOCUMENTS (`/documents`)

#### `POST /api/v1/documents/upload` (Admin Only)
*Upload an educational PDF, DOCX, or TXT file for RAG ingestion.*

- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `course_id`: `1`
  - `title`: `Quantum Mechanics Lecture 1`
  - `document_type`: `"lecture"` (Options: `"lecture"`, `"textbook"`, `"solved_example"`)
  - `file`: `[File Binary]`
- **Response `201 Created`**:
```json
{
  "id": 5,
  "title": "Quantum Mechanics Lecture 1",
  "document_type": "lecture",
  "file_name": "quantum_lecture1.pdf",
  "processing_status": "completed",
  "message": "Document uploaded and processed successfully"
}
```

#### `GET /api/v1/documents`
*List uploaded documents.*

- **Headers**: `Authorization: Bearer <TOKEN>`
- **Query Params**: `course_id` (optional int filter), `page`, `page_size`
- **Response `200 OK`**:
```json
[
  {
    "id": 5,
    "course_id": 1,
    "title": "Quantum Mechanics Lecture 1",
    "document_type": "lecture",
    "file_name": "quantum_lecture1.pdf",
    "processing_status": "completed",
    "error_message": null,
    "created_at": "2026-09-09T12:00:00Z",
    "updated_at": "2026-09-09T12:00:00Z"
  }
]
```

#### `DELETE /api/v1/documents/{document_id}` (Admin Only)
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Response `204 No Content`**

---

### 3.4 CHAT & RAG PIPELINE (`/chat`)

#### `POST /api/v1/chat`
*Submit a student question grounded in course material.*

- **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "course_id": 1,
  "question": "What is the Heisenberg Uncertainty Principle and its equation?",
  "session_id": null
}
```
*Note*: Pass `"session_id": null` to start a new chat session, or pass existing `session_id` (e.g. `12`) for multi-turn follow-up questions.

- **Response `200 OK`**:
```json
{
  "session_id": 12,
  "answer": "Based on the provided course material:\n\nThe Heisenberg uncertainty principle states that it is impossible to simultaneously measure the exact position and momentum of a particle.\n\nEquation: delta_x * delta_p >= hbar / 2.",
  "sources": [
    {
      "document_id": 5,
      "document_title": "Quantum Mechanics Lecture 1",
      "document_type": "lecture",
      "page_number": 2,
      "relevance_score": 0.8842
    }
  ]
}
```

*Fallback Response when question is out-of-domain*:
```json
{
  "session_id": 13,
  "answer": "I couldn't find sufficient information about this question in the provided course material.",
  "sources": []
}
```

#### `GET /api/v1/chat/sessions`
*List user's chat sessions ordered by most recently active.*

- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response `200 OK`**:
```json
[
  {
    "id": 12,
    "user_id": 1,
    "course_id": 1,
    "course_name": "PHYS 301: Quantum Mechanics",
    "title": "What is the Heisenberg Uncertainty...",
    "created_at": "2026-09-09T12:00:00Z",
    "updated_at": "2026-09-09T12:05:00Z",
    "messages": null
  }
]
```

#### `GET /api/v1/chat/sessions/{session_id}`
*Get full message history for a specific chat session.*

- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response `200 OK`**:
```json
{
  "id": 12,
  "user_id": 1,
  "course_id": 1,
  "course_name": "PHYS 301: Quantum Mechanics",
  "title": "What is the Heisenberg Uncertainty...",
  "created_at": "2026-09-09T12:00:00Z",
  "updated_at": "2026-09-09T12:05:00Z",
  "messages": [
    {
      "id": 101,
      "session_id": 12,
      "role": "user",
      "content": "What is the Heisenberg Uncertainty Principle and its equation?",
      "created_at": "2026-09-09T12:00:00Z"
    },
    {
      "id": 102,
      "session_id": 12,
      "role": "assistant",
      "content": "Based on the provided course material:\n\nThe Heisenberg uncertainty principle states...",
      "created_at": "2026-09-09T12:00:02Z"
    }
  ]
}
```

#### `DELETE /api/v1/chat/sessions/{session_id}`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response `204 No Content`**

---

### 3.5 HEALTH CHECK (`/health`)

#### `GET /health`
*System health and database connectivity check.*

- **Response `200 OK` (Healthy)**:
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": {
    "llm_provider": "mock",
    "embedding_provider": "mock"
  }
}
```
- **Response `503 Service Unavailable` (Unhealthy DB)**:
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "environment": {
    "llm_provider": "mock",
    "embedding_provider": "mock"
  }
}
```
