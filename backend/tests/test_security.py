from app.core.security import create_access_token
from app.models.user import User
from app.core.security import get_password_hash


def test_user_cannot_access_other_user_chat_session(client, db, student_user, student_headers):
    # 1. Create a second student user
    user2 = User(
        name="Student Two",
        email="student2@edurag.com",
        password_hash=get_password_hash("Password123!"),
        role="student",
        is_active=True,
    )
    db.add(user2)
    db.commit()
    db.refresh(user2)

    user2_token = create_access_token(subject=user2.id, role=user2.role)
    user2_headers = {"Authorization": f"Bearer {user2_token}"}

    # 2. Student 1 creates course & chat session
    c_res = client.post(
        "/api/v1/courses",
        json={"name": "Security 101", "description": "Intro to Sec"},
        headers=user2_headers,  # wait, course creation requires admin! Let's use admin to create course first
    )
    # Admin creates course:
    # We can create a course directly in DB or via admin fixture
    from app.models.course import Course
    course = Course(name="Security 101", description="Intro to Sec", is_active=True)
    db.add(course)
    db.commit()
    db.refresh(course)

    # Student 1 asks a question and gets session 1
    chat_res = client.post(
        "/api/v1/chat",
        json={"course_id": course.id, "question": "What is security?"},
        headers=student_headers,
    )
    session_id = chat_res.json()["session_id"]

    # Student 2 tries to access Student 1's chat session
    forbidden_res = client.get(f"/api/v1/chat/sessions/{session_id}", headers=user2_headers)
    assert forbidden_res.status_code == 403
    data = forbidden_res.json()
    assert data["error_code"] == "FORBIDDEN"
