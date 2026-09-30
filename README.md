# 🎓 EduRAG — Grounded AI Study Studio & Knowledge Workspace

<div align="center">

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Vector%20DB-PostgreSQL%20%2B%20pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Architecture](https://img.shields.io/badge/UX%20Flow-Google%20NotebookLM%20Inspired-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://notebooklm.google/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Transform textbooks, lecture slides, and research notes into grounded, verifiable AI notebooks, 3D flashcards, two-host audio podcasts, and self-testing study studios.</strong>
</p>

[✨ Live Features](#-key-features) • [⚡ Quick Start](#-quick-start) • [🏗️ Architecture](#-system-architecture) • [🛠️ Tech Stack](#-tech-stack) • [📖 API Reference](#-api-reference)

---

</div>

## 🌟 Overview

**EduRAG** (powered by **LearnMate**) is a state-of-the-art educational knowledge studio inspired by the clean UX flow of **Google NotebookLM** and modern pastel dashboard design. 

Unlike generic chatbots that produce hallucinations, EduRAG operates on a strict **Grounded Retrieval-Augmented Generation (RAG)** pipeline. Every summary, answer, flashcard, and quiz is anchored in your uploaded course materials with direct page citations and relevance scoring.

---

## ✨ Key Features

### 📓 1. Google NotebookLM-Inspired Study Canvas
* **Dynamic 3-Column Studio Flow**: Sources & documents on the left, interactive grounded conversation canvas in the center, and multi-modal study tools on the right.
* **Granular Knowledge Selection**: Filter which source documents are active for specific queries or revision sessions.
* **Direct Page Citations**: Every response includes clickable source references with relevance scores and exact page numbers.

### 🎙️ 2. Two-Host Audio Podcasts (Deep Dive Overviews)
* Generate lifelike, conversational podcast discussions between two AI hosts covering core concepts from your lecture notes.
* Real-time audio playback controls with narration speeds and transcript synchronization.

### 🗂️ 3. Multi-Modal Study Studio Tools
* **Interactive 3D Flashcards**: Flip cards dynamically between question and answer with difficulty rating and mastery tracking.
* **Practice Quizzes & Self-Tests**: Instant multiple-choice questions with answer explanations and scoring.
* **Hierarchical Concept Maps**: Visual tree diagrams breaking down complex topics into digestible sub-branches.
* **Executive Study Guides**: Key term glossaries, exam cheat sheets, and formula summaries.

### 🎨 4. Premium Aesthetic & UI/UX
* Curated pastel color palette (lavender, sky, mint, rose, peach).
* Softened typography contrast (slate/charcoal) engineered for long reading sessions.
* Context-aware header with interactive breadcrumb subject switcher (`Notebooks / [Course Name] ▾`).
* User profile drawer with live scholar statistics and citation accuracy metrics.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ React 18 + Vite Frontend"]
        UI["Dashboard & Notebook Studio"]
        Tools["Audio Overview | 3D Flashcards | Quizzes"]
        Auth["JWT Session Storage"]
    end

    subgraph Server["⚡ FastAPI Backend Engine"]
        Router["/api/v1 Routes"]
        AuthSvc["Auth & User Service"]
        DocSvc["Document Processing & Chunking"]
        RAG["RAG Retrieval & Prompt Synthesizer"]
        Monitor["Provider Quota & Health Monitor"]
    end

    subgraph Storage["🗄️ Storage & Vector DB"]
        PG[("PostgreSQL")]
        VEC[("pgvector Embeddings")]
        FS["Encrypted File Storage"]
    end

    subgraph LLMProviders["🤖 LLM & Embedding Providers"]
        NVIDIA["NVIDIA Nemotron"]
        GEMINI["Google Gemini"]
        GROQ["Groq LLaMA 3"]
        OPENAI["OpenAI GPT-4o"]
    end

    UI -->|REST API Requests| Router
    Router --> AuthSvc
    Router --> DocSvc
    Router --> RAG
    Router --> Monitor
    DocSvc --> FS
    DocSvc -->|Embeddings| VEC
    RAG -->|Similarity Search| VEC
    RAG --> LLMProviders
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React 18, Vite** | Fast, component-driven client architecture |
| **Styling** | **Vanilla CSS (Design Tokens)** | Custom glassmorphism, responsive grids & pastel tokens |
| **Icons & Media**| **Lucide React** | Clean, minimalist vector iconography |
| **Backend** | **Python 3.12+, FastAPI** | High-performance asynchronous REST API |
| **Database** | **PostgreSQL + pgvector** | Relational metadata & high-dimensional vector search |
| **ORM & Migrations**| **SQLAlchemy, Alembic** | Schema management and type-safe database queries |
| **LLM Orchestration**| **Nemotron / Gemini / Groq / OpenAI** | RAG query synthesis, podcast scripting & embeddings |

---

## ⚡ Quick Start

### Prerequisites
* **Node.js 18+** & **npm**
* **Python 3.12+**
* **Docker Desktop** (for PostgreSQL with `pgvector`)

---

### Step 1: Clone Repository & Start Vector Database

```bash
git clone https://github.com/kalviumcommunity/EduRAG.git
cd EduRAG

# Start PostgreSQL with pgvector extension
cd backend
docker compose up -d db
```

---

### Step 2: Configure & Start FastAPI Backend

```bash
# 1. Create and activate Python virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env

# 4. Run database migrations
alembic upgrade head

# 5. Start development backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> **API Documentation**: Access Swagger UI at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Step 3: Start React Frontend

In a separate terminal at the repository root:

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## ⚙️ Environment Configuration

Edit `backend/.env` to configure your database connection and preferred AI provider:

```dotenv
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/edurag

# Security
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI Provider Settings (Options: mock, nvidia, gemini, groq, openai)
LLM_PROVIDER=nvidia
LLM_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
EMBEDDING_PROVIDER=nvidia
EMBEDDING_MODEL=nvidia/nemotron-3-embed-1b
NVIDIA_API_KEY=your_nvidia_api_key_here
```

---

## 📖 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Create a student account | No |
| `POST` | `/api/v1/auth/login` | Obtain JWT bearer token | No |
| `GET` | `/api/v1/auth/me` | Retrieve active user profile | Yes |
| `GET` | `/api/v1/courses` | List all enrolled course notebooks | Yes |
| `POST` | `/api/v1/courses` | Create a new course notebook | Yes |
| `GET` | `/api/v1/courses/{id}/documents` | List indexed documents for a course | Yes |
| `POST` | `/api/v1/documents/upload` | Upload & vectorize PDF/DOCX/Text | Yes |
| `POST` | `/api/v1/chat/ask` | Grounded RAG query with citations | Yes |
| `GET` | `/api/v1/chat/sessions` | Retrieve conversation histories | Yes |

---

## 🔒 Security & Privacy

* **Zero Key Leakage**: API provider keys stay strictly on the backend and are never sent to the browser.
* **Isolated Vector Namespaces**: Document embeddings are strictly partitioned by course and user access boundaries.
* **Role-Based Access Control**: Document ingestion is restricted to authenticated notebook managers.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by the EduRAG Team. Inspired by Google NotebookLM.</sub>
</div>
