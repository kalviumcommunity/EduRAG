import sqlite3
import json
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv('backend/.env')
from app.rag.embeddings import get_embedding_provider

def seed():
    embedder = get_embedding_provider()
    conn = sqlite3.connect('edurag.db')
    cursor = conn.cursor()

    # 1. Promote all users to admin
    cursor.execute("UPDATE users SET role = 'admin'")
    print(f"Updated {cursor.rowcount} users to admin role.")

    # 2. Add courses
    courses_data = [
        (
            "Computer Science 101: Data Structures & Algorithms",
            "Foundational concepts in algorithms, binary search trees, hash maps, sorting, and graph traversals.",
            "Study Guide: Trees and Hash Tables",
            "A Binary Search Tree (BST) maintains the invariant that all keys in the left subtree are less than the node key, and all keys in the right subtree are greater. Average time complexity for search, insertion, and deletion is O(log n).",
            "Hash Tables offer average O(1) time complexity for lookup and insertions using key-hash indexing and collision resolution strategies such as chaining or open addressing."
        ),
        (
            "Artificial Intelligence & RAG Systems",
            "Comprehensive guide to Large Language Models, Vector Embeddings, Semantic Search, and Retrieval-Augmented Generation.",
            "Lecture Notes: Introduction to Retrieval-Augmented Generation (RAG)",
            "Retrieval-Augmented Generation (RAG) combines pre-trained language models with external knowledge retrieval. Instead of relying solely on the parametric knowledge in LLM weights, RAG retrieves relevant document chunks from a vector database and includes them in the prompt context to generate grounded, fact-checked answers.",
            "Key components of a RAG pipeline include: 1. Text Chunking (splitting documents into overlapping segments). 2. Vector Embeddings (converting text into dense vector representations). 3. Vector Database (indexing embeddings with cosine similarity search). 4. Grounded Prompting (providing retrieved source passages to the LLM with instructions to cite sources)."
        ),
        (
            "Web Engineering & Modern Fullstack Architecture",
            "Best practices for building scalable web apps with React, Vite, FastAPI, PostgreSQL, and RESTful API design.",
            "Guide: Fullstack Architecture with FastAPI and React",
            "FastAPI provides high-performance asynchronous RESTful APIs in Python with automatic OpenAPI documentation and Pydantic schema validation.",
            "Vite offers lightning-fast HMR and bundling for modern React single-page applications, proxying /api routes to FastAPI backend services."
        )
    ]

    for title, desc, doc_title, p1, p2 in courses_data:
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute(
            "INSERT INTO courses (name, description, is_active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)",
            (title, desc, now, now)
        )
        course_id = cursor.lastrowid
        print(f"Created Course [{course_id}]: {title}")

        cursor.execute(
            "INSERT INTO documents (course_id, title, document_type, file_name, file_path, processing_status, created_at, updated_at) VALUES (?, ?, 'lecture_notes', ?, 'uploads/sample.txt', 'completed', ?, ?)",
            (course_id, doc_title, f"sample_{course_id}.txt", now, now)
        )
        doc_id = cursor.lastrowid

        for idx, text in enumerate([p1, p2], start=1):
            vec = embedder.embed_text(text)
            cursor.execute(
                "INSERT INTO document_chunks (document_id, content, embedding, page_number, chunk_index, chunk_metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (doc_id, text, json.dumps(vec), idx, idx, json.dumps({"title": doc_title, "page": idx}), now)
            )

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
