import os
import uuid
from typing import Tuple, List, Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import NotFoundException, ValidationException, AppException
from app.core.logging import logger
from app.models.course import Course
from app.models.document import Document
from app.rag.pipeline import RAGPipeline

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
ALLOWED_DOCUMENT_TYPES = {"lecture", "textbook", "solved_example"}


class DocumentService:
    @staticmethod
    def validate_file(file: UploadFile) -> str:
        filename = file.filename or ""
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValidationException(
                f"Invalid file extension '{ext}'. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        return ext

    @staticmethod
    def upload_document(
        db: Session,
        course_id: int,
        title: str,
        document_type: str,
        file: UploadFile,
    ) -> Document:
        # Validate course exists
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise NotFoundException(f"Course with ID {course_id} does not exist.")

        # Validate document type
        doc_type = document_type.lower()
        if doc_type not in ALLOWED_DOCUMENT_TYPES:
            raise ValidationException(
                f"Invalid document type '{document_type}'. Allowed types: {', '.join(ALLOWED_DOCUMENT_TYPES)}"
            )

        # Validate file extension
        ext = DocumentService.validate_file(file)

        # Ensure upload dir exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        # Generate safe unique filename to prevent path traversal
        safe_filename = f"{uuid.uuid4().hex}_{os.path.basename(file.filename or 'doc' + ext)}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        # Read file contents & validate size
        contents = file.file.read()
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise ValidationException(
                f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB"
            )
        if len(contents) == 0:
            raise ValidationException("Uploaded file is empty.")

        with open(file_path, "wb") as f:
            f.write(contents)

        # Create Document in DB
        doc = Document(
            course_id=course_id,
            title=title.strip(),
            document_type=doc_type,
            file_name=file.filename or safe_filename,
            file_path=file_path,
            processing_status="pending",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Trigger synchronous RAG processing (can be background task)
        pipeline = RAGPipeline()
        pipeline.process_document(db, doc.id)

        db.refresh(doc)
        return doc

    @staticmethod
    def get_document_by_id(db: Session, document_id: int) -> Document:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise NotFoundException(f"Document with ID {document_id} not found.")
        return doc

    @staticmethod
    def list_documents(
        db: Session, course_id: Optional[int] = None, page: int = 1, page_size: int = 20
    ) -> Tuple[List[Document], int]:
        query = db.query(Document)
        if course_id:
            query = query.filter(Document.course_id == course_id)

        total = query.count()
        offset = (page - 1) * page_size
        documents = query.order_by(Document.created_at.desc()).offset(offset).limit(page_size).all()
        return documents, total

    @staticmethod
    def delete_document(db: Session, document_id: int) -> None:
        doc = DocumentService.get_document_by_id(db, document_id)
        file_path = doc.file_path

        # Delete from DB (cascades chunks)
        db.delete(doc)
        db.commit()

        # Clean up file on disk
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Could not delete physical file at {file_path}: {e}")
