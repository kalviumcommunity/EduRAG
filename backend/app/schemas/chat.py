from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SourceCitation(BaseModel):
    document_id: Optional[int] = None
    document_title: str
    document_type: str
    page_number: Optional[int] = None
    relevance_score: float

    model_config = ConfigDict(from_attributes=True)


class ChatRequest(BaseModel):
    course_id: int
    question: str = Field(..., min_length=1)
    session_id: Optional[int] = None


class ChatResponse(BaseModel):
    session_id: int
    answer: str
    sources: List[SourceCitation] = []


class MessageOut(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionOut(BaseModel):
    id: int
    user_id: int
    course_id: int
    course_name: Optional[str] = None
    title: str
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageOut]] = None

    model_config = ConfigDict(from_attributes=True)
