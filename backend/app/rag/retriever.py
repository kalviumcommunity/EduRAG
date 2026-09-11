import numpy as np
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.rag.embeddings import BaseEmbeddingProvider, get_embedding_provider


@dataclass
class RetrievedChunk:
    chunk_id: int
    document_id: int
    document_title: str
    document_type: str
    page_number: Optional[int]
    content: str
    similarity_score: float
    metadata: Dict[str, Any]


class VectorRetriever:
    def __init__(self, embedding_provider: Optional[BaseEmbeddingProvider] = None):
        self.embedding_provider = embedding_provider or get_embedding_provider()

    def retrieve(
        self,
        db: Session,
        question: str,
        course_id: int,
        top_k: int = settings.TOP_K,
    ) -> List[RetrievedChunk]:
        # 1. Embed query
        query_vector = self.embedding_provider.embed_text(question)

        # Check DB dialect
        dialect_name = db.bind.dialect.name if db.bind else "postgresql"

        retrieved_results: List[RetrievedChunk] = []
        use_pgvector = False
        if dialect_name == "postgresql":
            try:
                query = (
                    db.query(
                        DocumentChunk,
                        Document.title.label("doc_title"),
                        Document.document_type.label("doc_type"),
                        (1 - DocumentChunk.embedding.cosine_distance(query_vector)).label("similarity"),
                    )
                    .join(Document, DocumentChunk.document_id == Document.id)
                    .filter(Document.course_id == course_id)
                    .filter(Document.processing_status == "completed")
                    .order_by((1 - DocumentChunk.embedding.cosine_distance(query_vector)).desc())
                    .limit(top_k)
                )
                rows = query.all()

                for chunk, doc_title, doc_type, sim_score in rows:
                    score = float(sim_score) if sim_score is not None else 0.0
                    retrieved_results.append(
                        RetrievedChunk(
                            chunk_id=chunk.id,
                            document_id=chunk.document_id,
                            document_title=doc_title,
                            document_type=doc_type,
                            page_number=chunk.page_number,
                            content=chunk.content,
                            similarity_score=round(score, 4),
                            metadata=chunk.chunk_metadata or {},
                        )
                    )
                use_pgvector = True
            except Exception:
                db.rollback()
                use_pgvector = False

        if not use_pgvector:
            # Fallback for SQLite / Non-pgvector PostgreSQL in-memory numpy retrieval
            chunks = (
                db.query(DocumentChunk, Document.title, Document.document_type)
                .join(Document, DocumentChunk.document_id == Document.id)
                .filter(Document.course_id == course_id)
                .filter(Document.processing_status == "completed")
                .all()
            )

            q_vec = np.array(query_vector)
            q_norm = np.linalg.norm(q_vec)

            scored_chunks = []
            for chunk, doc_title, doc_type in chunks:
                if chunk.embedding is not None:
                    c_vec = np.array(chunk.embedding)
                    c_norm = np.linalg.norm(c_vec)
                    if q_norm > 0 and c_norm > 0:
                        sim = float(np.dot(q_vec, c_vec) / (q_norm * c_norm))
                    else:
                        sim = 0.0
                else:
                    sim = 0.0

                scored_chunks.append((sim, chunk, doc_title, doc_type))

            # Sort by similarity descending
            scored_chunks.sort(key=lambda x: x[0], reverse=True)
            top_chunks = scored_chunks[:top_k]

            for sim, chunk, doc_title, doc_type in top_chunks:
                retrieved_results.append(
                    RetrievedChunk(
                        chunk_id=chunk.id,
                        document_id=chunk.document_id,
                        document_title=doc_title,
                        document_type=doc_type,
                        page_number=chunk.page_number,
                        content=chunk.content,
                        similarity_score=round(sim, 4),
                        metadata=chunk.chunk_metadata or {},
                    )
                )

        return retrieved_results

