# EduRAG - Source-Grounded AI Learning Assistant Backend

EduRAG is a production-quality, MVP-focused backend built with **FastAPI**, **PostgreSQL + pgvector**, **SQLAlchemy 2.0**, and **Pydantic v2**. It powers a source-grounded educational AI assistant that ingests course material (lecture transcripts, textbooks, solved examples) and provides strict, hallucination-free answers with precise source citations.

---

## 1. Architecture Overview

EduRAG uses a clean **Modular Monolith** architecture:

```
backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint & health checks
│   ├── core/                    # Security, Config, Exceptions, Logging
│   ├── db/                      # Database engine, base model, session management
│   ├── models/                  # SQLAlchemy ORM models (User, Course, Document, Chunk, Chat, Message)
│   ├── schemas/                 # Pydantic v2 validation schemas
│   ├── api/                     # Dependencies (JWT/RBAC) and route controllers
│   ├── services/                # Business logic services
│   ├── rag/                     # RAG Pipeline (Loader, Cleaner, Chunker, Embedder, Retriever, LLM, Prompts)
│   └── utils/                   # File handling & pagination utilities
├── alembic/                     # Database migrations
├── tests/                       # Pytest unit & integration test suite
├── uploads/                     # Configurable document storage directory
├── docker-compose.yml           # PostgreSQL + pgvector local stack
├── requirements.txt             # Python dependencies
└── README.md
```

---

## 2. Tech Stack

- **Framework**: Python 3.12+, FastAPI, Uvicorn
- **Database**: PostgreSQL with `pgvector` extension
- **ORM & Migrations**: SQLAlchemy 2.0, Alembic
- **Validation & Settings**: Pydantic v2, `pydantic-settings`
- **Security & Auth**: JWT (HS256), bcrypt password hashing (`passlib`)
- **Document Processing**: PyMuPDF (`fitz`), `python-docx`, `python-multipart`
- **AI Abstraction**: Plug-and-play LLM & Embedding provider interfaces (OpenAI, Mock)
- **Testing**: `pytest`, `httpx`, FastAPI `TestClient`

---

## 3. Quickstart & Local Setup

### Prerequisites
- Python 3.12+
- Docker Desktop or PostgreSQL with `pgvector` extension installed

### Step 1: Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```

### Step 2: Start PostgreSQL with pgvector
Run Docker Compose to launch PostgreSQL with pgvector pre-enabled:
```bash
docker-compose up -d db
```

### Step 3: Install Dependencies
Create a virtual environment and install requirements:
```bash
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### Step 4: Run Database Migrations
Apply Alembic migrations to create tables and vector indexes:
```bash
alembic upgrade head
```

### Step 5: Run the Development Server
Start the Uvicorn server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

## 4. RAG Pipeline & Hallucination Control

EduRAG implements a strict source-grounding pipeline:

1. **Document Ingestion**: Extracts text from PDF (preserving page numbers via PyMuPDF), DOCX, and TXT files.
2. **Chunking**: Splits text into configurable overlapping chunks (`CHUNK_SIZE=800`, `CHUNK_OVERLAP=100`) without breaking words.
3. **Embeddings & Vector Storage**: Computes vector embeddings and stores them in PostgreSQL using `pgvector`.
4. **Course-Filtered Retrieval**: Executes cosine similarity search filtered strictly by `course_id`.
5. **Hallucination Control**:
   - Compares max retrieval similarity against `RAG_SIMILARITY_THRESHOLD` (default `0.3`).
   - If similarity score falls below threshold or no chunks exist, returns a guaranteed fallback response:
     > *"I couldn't find sufficient information about this question in the provided course material."*
6. **Source Citations**: Returns detailed source metadata (`document_id`, `document_title`, `document_type`, `page_number`, `relevance_score`) for UI source cards.

---

## 5. Running Tests

Run the comprehensive test suite with Pytest:
```bash
pytest -v
```

---

## 6. Frontend Contract (API Reference for React Developers)

### Base URL: `/api/v1`

#### 1. AUTHENTICATION

##### `POST /api/v1/auth/register`
**Request Body**:
```json
{
  "name": "Alex Student",
  "email": "alex@university.edu",
  "password": "SecurePassword123!",
  "role": "student"
}
```
**Response (201 Created)**:
```json
{
  "id": 1,
  "name": "Alex Student",
  "email": "alex@university.edu",
  "role": "student",
  "is_active": true,
  "created_at": "2026-09-08T12:00:00Z",
  "updated_at": "2026-09-08T12:00:00Z"
}
```

##### `POST /api/v1/auth/login`
**Request Body**:
```json
{
  "email": "alex@university.edu",
  "password": "SecurePassword123!"
}
```
**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user_id": 1,
  "name": "Alex Student",
  "email": "alex@university.edu",
  "role": "student"
}
```

##### `GET /api/v1/auth/me`
**Headers**: `Authorization: Bearer <TOKEN>`
**Response (200 OK)**:
```json
{
  "id": 1,
  "name": "Alex Student",
  "email": "alex@university.edu",
  "role": "student",
  "is_active": true,
  "created_at": "2026-09-08T12:00:00Z",
  "updated_at": "2026-09-08T12:00:00Z"
}
```

---

#### 2. COURSES

##### `GET /api/v1/courses`
**Headers**: `Authorization: Bearer <TOKEN>`
**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Data Structures & Algorithms",
    "description": "Core computer science fundamentals",
    "is_active": true,
    "created_at": "2026-09-08T12:00:00Z",
    "updated_at": "2026-09-08T12:00:00Z"
  }
]
```

##### `POST /api/v1/courses` (Admin Only)
**Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
**Request Body**:
```json
{
  "name": "Operating Systems",
  "description": "Processes, threads, and memory management",
  "is_active": true
}
```

---

#### 3. DOCUMENTS

##### `POST /api/v1/documents/upload` (Admin Only)
**Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
**Content-Type**: `multipart/form-data`
- `course_id`: `1`
- `title`: `Lecture 5 - Binary Search`
- `document_type`: `lecture` (Options: `lecture`, `textbook`, `solved_example`)
- `file`: `(binary file upload PDF/DOCX/TXT)`

**Response (201 Created)**:
```json
{
  "id": 10,
  "title": "Lecture 5 - Binary Search",
  "document_type": "lecture",
  "file_name": "lecture5.pdf",
  "processing_status": "completed",
  "message": "Document uploaded and processed successfully"
}
```

##### `GET /api/v1/documents?course_id=1`
**Headers**: `Authorization: Bearer <TOKEN>`

---

#### 4. CHAT & RAG PIPELINE

##### `POST /api/v1/chat`
**Headers**: `Authorization: Bearer <TOKEN>`
**Request Body**:
```json
{
  "course_id": 1,
  "question": "What is binary search?",
  "session_id": null
}
```

**Response (200 OK)**:
```json
{
  "session_id": 123,
  "answer": "Binary search is an efficient search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half. It operates in O(log n) time complexity.",
  "sources": [
    {
      "document_id": 10,
      "document_title": "Lecture 5 - Binary Search",
      "document_type": "lecture",
      "page_number": 12,
      "relevance_score": 0.91
    }
  ]
}
```

##### `GET /api/v1/chat/sessions`
**Headers**: `Authorization: Bearer <TOKEN>`

##### `GET /api/v1/chat/sessions/{session_id}`
**Headers**: `Authorization: Bearer <TOKEN>`
**Response (200 OK)**:
```json
{
  "id": 123,
  "user_id": 1,
  "course_id": 1,
  "course_name": "Data Structures & Algorithms",
  "title": "What is binary search?...",
  "created_at": "2026-09-08T12:00:00Z",
  "updated_at": "2026-09-08T12:05:00Z",
  "messages": [
    {
      "id": 1,
      "session_id": 123,
      "role": "user",
      "content": "What is binary search?",
      "created_at": "2026-09-08T12:00:00Z"
    },
    {
      "id": 2,
      "session_id": 123,
      "role": "assistant",
      "content": "Binary search is an efficient search algorithm...",
      "created_at": "2026-09-08T12:00:02Z"
    }
  ]
}
```

*For complete endpoint specifications, HTTP status codes, and request/response JSON schemas, see [API_DOCUMENTATION.md](file:///c:/Users/Hp/Desktop/EduRAG/backend/API_DOCUMENTATION.md).*

