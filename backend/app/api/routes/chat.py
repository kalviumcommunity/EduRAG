from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse, ChatSessionOut
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat & RAG"])


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def ask_question(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ask a question grounded in course material. Returns AI answer with source citations.
    """
    return ChatService.process_chat_query(
        db=db,
        user_id=current_user.id,
        course_id=data.course_id,
        question=data.question,
        session_id=data.session_id,
    )


@router.get("/sessions", response_model=List[ChatSessionOut])
def get_user_chat_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all chat sessions belonging to the current user.
    """
    sessions, _ = ChatService.get_user_sessions(
        db=db, user_id=current_user.id, page=page, page_size=page_size
    )
    return sessions


@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_chat_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get full details and message history of a specific chat session.
    """
    return ChatService.get_session_details(db, session_id=session_id, user_id=current_user.id)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a chat session and all its messages.
    """
    ChatService.delete_session(db, session_id=session_id, user_id=current_user.id)
    return None
