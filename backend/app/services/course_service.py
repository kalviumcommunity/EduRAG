from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate


class CourseService:
    @staticmethod
    def get_course_by_id(db: Session, course_id: int) -> Course:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise NotFoundException(f"Course with ID {course_id} not found.")
        return course

    @staticmethod
    def list_courses(
        db: Session, page: int = 1, page_size: int = 20, active_only: bool = False
    ) -> Tuple[List[Course], int]:
        query = db.query(Course)
        if active_only:
            query = query.filter(Course.is_active.is_(True))

        total = query.count()
        offset = (page - 1) * page_size
        courses = query.order_by(Course.created_at.desc()).offset(offset).limit(page_size).all()
        return courses, total

    @staticmethod
    def create_course(db: Session, data: CourseCreate) -> Course:
        course = Course(
            name=data.name,
            description=data.description,
            is_active=data.is_active,
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course(db: Session, course_id: int, data: CourseUpdate) -> Course:
        course = CourseService.get_course_by_id(db, course_id)
        if data.name is not None:
            course.name = data.name
        if data.description is not None:
            course.description = data.description
        if data.is_active is not None:
            course.is_active = data.is_active

        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def delete_course(db: Session, course_id: int) -> None:
        course = CourseService.get_course_by_id(db, course_id)
        db.delete(course)
        db.commit()
