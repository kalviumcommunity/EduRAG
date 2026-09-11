from typing import List, Optional
from fastapi import APIRouter, Depends, Form, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, get_current_admin
from app.models.user import User
from app.schemas.document import DocumentOut, DocumentUploadResponse
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    course_id: int = Form(...),
    title: str = Form(...),
    document_type: str = Form(..., description="Type: 'lecture', 'textbook', or 'solved_example'"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Upload an educational document (PDF, DOCX, or TXT) for a course (Admin only).
    """
    doc = DocumentService.upload_document(
        db=db,
        course_id=course_id,
        title=title,
        document_type=document_type,
        file=file,
    )
    return DocumentUploadResponse(
        id=doc.id,
        title=doc.title,
        document_type=doc.document_type,
        file_name=doc.file_name,
        processing_status=doc.processing_status,
        message="Document uploaded and processed successfully",
    )


@router.get("", response_model=List[DocumentOut])
def list_documents(
    course_id: Optional[int] = Query(None, description="Filter by course ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List uploaded documents and their processing status.
    """
    documents, _ = DocumentService.list_documents(
        db=db, course_id=course_id, page=page, page_size=page_size
    )
    return documents


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get metadata and status of a specific document.
    """
    return DocumentService.get_document_by_id(db, document_id)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Delete a document and purge its text chunks/embeddings (Admin only).
    """
    DocumentService.delete_document(db, document_id)
    return None
