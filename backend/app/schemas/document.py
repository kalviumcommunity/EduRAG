from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    id: int
    course_id: int
    title: str
    document_type: str
    file_name: str
    processing_status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    id: int
    title: str
    document_type: str
    file_name: str
    processing_status: str
    message: str = "Document uploaded successfully and queued for processing"
