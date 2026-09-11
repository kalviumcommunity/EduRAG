import os
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.logging import logger
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.rag.document_loader import DocumentLoader
from app.rag.text_cleaner import TextCleaner
from app.rag.chunker import TextChunker
from app.rag.embeddings import get_embedding_provider
from app.rag.retriever import VectorRetriever, RetrievedChunk
from app.rag.prompt_builder import PromptBuilder
from app.rag.llm import get_llm_provider
from app.schemas.chat import SourceCitation


class RAGPipeline:
    def __init__(self):
        self.embedding_provider = get_embedding_provider()
        self.llm_provider = get_llm_provider()
        self.retriever = VectorRetriever(embedding_provider=self.embedding_provider)
        self.chunker = TextChunker(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
        )

    def process_document(self, db: Session, document_id: int) -> None:
        """
        Extracts, cleans, chunks, embeds, and stores chunks for a document.
        Updates processing status: pending -> processing -> completed / failed.
        """
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.error(f"Document ID {document_id} not found for processing.")
            return

        try:
            doc.processing_status = "processing"
            db.commit()
            db.refresh(doc)

            file_path = doc.file_path
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found on disk at {file_path}")

            ext = os.path.splitext(file_path)[1]
            extracted_pages = DocumentLoader.load_file(file_path, ext)

            if not extracted_pages:
                raise ValueError("No readable text content extracted from document.")

            # Clean extracted page contents
            for page in extracted_pages:
                page.content = TextCleaner.clean(page.content)

            # Chunk document
            doc_metadata = {
                "course_id": doc.course_id,
                "document_id": doc.id,
                "document_title": doc.title,
                "document_type": doc.document_type,
            }
            chunks = self.chunker.chunk_extracted_pages(extracted_pages, doc_metadata)

            if not chunks:
                raise ValueError("Document yielded no valid text chunks after splitting.")

            # Generate Embeddings in batch
            texts_to_embed = [c.content for c in chunks]
            embeddings = self.embedding_provider.embed_documents(texts_to_embed)

            # Store DocumentChunks in DB
            db_chunks = []
            for chunk, embedding in zip(chunks, embeddings):
                db_chunk = DocumentChunk(
                    document_id=doc.id,
                    content=chunk.content,
                    embedding=embedding,
                    page_number=chunk.page_number,
                    chunk_index=chunk.chunk_index,
                    chunk_metadata=chunk.metadata,
                )
                db_chunks.append(db_chunk)

            db.add_all(db_chunks)
            doc.processing_status = "completed"
            doc.error_message = None
            db.commit()
            logger.info(f"Successfully processed document ID {document_id} into {len(db_chunks)} chunks.")

        except Exception as e:
            db.rollback()
            doc_fail = db.query(Document).filter(Document.id == document_id).first()
            if doc_fail:
                doc_fail.processing_status = "failed"
                doc_fail.error_message = str(e)[:500]
                db.commit()
            logger.error(f"Failed processing document ID {document_id}: {e}")

    def query_rag(
        self,
        db: Session,
        course_id: int,
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> Tuple[str, List[SourceCitation]]:
        """
        Executes vector retrieval with hallucination threshold control & LLM response generation.
        """
        # 1. Vector Retrieval
        retrieved_chunks = self.retriever.retrieve(
            db=db,
            question=question,
            course_id=course_id,
            top_k=settings.TOP_K,
        )

        # 2. Hallucination Threshold Filtering
        relevant_chunks = [
            chunk for chunk in retrieved_chunks
            if chunk.similarity_score >= settings.RAG_SIMILARITY_THRESHOLD
        ]

        # 3. Handle Insufficient Context
        if not relevant_chunks:
            insufficient_msg = (
                "I couldn't find sufficient information about this question in the provided course material."
            )
            return insufficient_msg, []

        # 4. Format Prompt & Context
        formatted_context = PromptBuilder.format_context(relevant_chunks)

        # 5. Send to LLM
        answer = self.llm_provider.generate_answer(
            question=question,
            formatted_context=formatted_context,
            conversation_history=conversation_history,
        )

        # 6. Construct Source Citations
        sources: List[SourceCitation] = []
        seen_citations = set()

        for chunk in relevant_chunks:
            citation_key = (chunk.document_id, chunk.page_number)
            if citation_key not in seen_citations:
                seen_citations.add(citation_key)
                sources.append(
                    SourceCitation(
                        document_id=chunk.document_id,
                        document_title=chunk.document_title,
                        document_type=chunk.document_type,
                        page_number=chunk.page_number,
                        relevance_score=chunk.similarity_score,
                    )
                )

        return answer, sources
