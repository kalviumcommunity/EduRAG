# EduRAG / LearnMate

LearnMate is a React frontend for the EduRAG FastAPI backend. The frontend uses the backend for account sign-in, courses, course chat, citations, saved conversations, and administrator document uploads.

## Run locally

Prerequisites: Node.js, Python 3.12+, and Docker Desktop (for PostgreSQL with pgvector).

1. Start PostgreSQL from the `backend` folder:

   ```powershell
   cd backend
   docker compose up -d db
   ```

2. In `backend`, copy `.env.example` to `.env`, create/activate a Python virtual environment, then install and initialize the backend:

   ```powershell
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   The backend API documentation is at <http://127.0.0.1:8000/docs>. The example settings use mock AI and embedding providers. To use NVIDIA's hosted Nemotron endpoints, edit `backend/.env` and set:

   ```dotenv
   LLM_PROVIDER=nvidia
   LLM_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
   EMBEDDING_PROVIDER=nvidia
   EMBEDDING_MODEL=nvidia/nemotron-3-embed-1b
   NVIDIA_API_KEY=your_key_here
   ```

   The same NVIDIA key is used by both models. Keep it in `backend/.env`, never in frontend files or chat messages. NVIDIA's endpoints are cloud services, so document text used for embeddings and retrieved passages sent with questions go to NVIDIA. The free endpoints are subject to NVIDIA's API trial terms and availability.

3. In another terminal, from the repository root, install and start the frontend:

   ```powershell
   npm install
   npm run dev
   ```

   Open <http://127.0.0.1:5173>. Vite forwards `/api` requests to the local backend on port 8000.

4. Create an account in the app. Public signups always receive the student role. An administrator must grant admin access through a trusted database/admin process before that account can upload course materials. The UI does not let public users promote themselves.

## How the connection works

- The frontend sends JSON requests to `/api/v1` through Vite's local proxy.
- Sign-in returns a bearer token. The frontend keeps it in the current browser tab's `sessionStorage` and sends it in the `Authorization` header for private endpoints.
- Chat requests include the selected course ID and, after the first answer, the conversation session ID. The backend returns the answer and source citations.
- Uploads use `multipart/form-data`, which sends the file and its course/title/type fields. Browser code never receives the AI provider key.
- Set `VITE_API_BASE_URL` to the deployed backend's `/api/v1` URL when deploying the frontend, and configure the backend's `CORS_ORIGINS` for the deployed frontend origin. Use HTTPS in production.
- If changing the embedding provider, reprocess or reupload documents so their stored vectors match the new embedding model.

More backend details and endpoint examples are in [backend/README.md](backend/README.md).
