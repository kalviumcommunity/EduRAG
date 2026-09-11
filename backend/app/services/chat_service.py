from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.course import Course
from app.models.chat_session import ChatSession
from app.models.message import Message
from app.rag.pipeline import RAGPipeline
from app.schemas.chat import ChatResponse, SourceCitation


class ChatService:
    @staticmethod
    def process_chat_query(
        db: Session,
        user_id: int,
        course_id: int,
        question: str,
        session_id: Optional[int] = None,
    ) -> ChatResponse:
        # Validate course exists
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise NotFoundException(f"Course with ID {course_id} does not exist.")

        # Get or create chat session
        if session_id:
            session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not session:
                raise NotFoundException(f"Chat session with ID {session_id} not found.")
            if session.user_id != user_id:
                raise ForbiddenException("You do not have permission to access this chat session.")
        else:
            # Auto generate title from first question
            title_snippet = question[:40] + "..." if len(question) > 40 else question
            session = ChatSession(
                user_id=user_id,
                course_id=course_id,
                title=title_snippet,
            )
            db.add(session)
            db.commit()
            db.refresh(session)

        # Load conversation history for prompt builder
        history_messages = (
            db.query(Message)
            .filter(Message.session_id == session.id)
            .order_by(Message.created_at.asc())
            .all()
        )
        history = [{"role": msg.role, "content": msg.content} for msg in history_messages]

        # Execute RAG Pipeline
        pipeline = RAGPipeline()
        answer, sources = pipeline.query_rag(
            db=db,
            course_id=course_id,
            question=question,
            conversation_history=history,
        )

        # Save user message
        user_msg = Message(
            session_id=session.id,
            role="user",
            content=question,
        )
        db.add(user_msg)

        # Save assistant response message
        assistant_msg = Message(
            session_id=session.id,
            role="assistant",
            content=answer,
        )
        db.add(assistant_msg)

        from datetime import datetime, timezone
        session.updated_at = datetime.now(timezone.utc)
        db.commit()

        return ChatResponse(
            session_id=session.id,
            answer=answer,
            sources=sources,
        )

    @staticmethod
    def get_user_sessions(
        db: Session, user_id: int, page: int = 1, page_size: int = 20
    ) -> Tuple[List[ChatSession], int]:
        query = db.query(ChatSession).filter(ChatSession.user_id == user_id)
        total = query.count()
        offset = (page - 1) * page_size
        sessions = query.order_by(ChatSession.updated_at.desc()).offset(offset).limit(page_size).all()
        return sessions, total

    @staticmethod
    def get_session_details(db: Session, session_id: int, user_id: int) -> ChatSession:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise NotFoundException(f"Chat session with ID {session_id} not found.")
        if session.user_id != user_id:
            raise ForbiddenException("You do not have permission to access this chat session.")
        return session

    @staticmethod
    def delete_session(db: Session, session_id: int, user_id: int) -> None:
        session = ChatService.get_session_details(db, session_id, user_id)
        db.delete(session)
        db.commit()
