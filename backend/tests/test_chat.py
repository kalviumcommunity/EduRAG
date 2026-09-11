import io


def test_rag_chat_flow(client, admin_headers, student_headers):
    # 1. Admin creates course
    c_res = client.post(
        "/api/v1/courses",
        json={"name": "Algorithms", "description": "Analysis of algorithms"},
        headers=admin_headers,
    )
    course_id = c_res.json()["id"]

    # 2. Admin uploads lecture document
    file_content = (
        b"Binary search is an efficient algorithm for searching a sorted array. "
        b"It has a time complexity of O(log n). It repeatedly divides the search interval in half."
    )
    client.post(
        "/api/v1/documents/upload",
        data={
            "course_id": course_id,
            "title": "Lecture 5: Binary Search",
            "document_type": "lecture",
        },
        files={"file": ("lecture5.txt", io.BytesIO(file_content), "text/plain")},
        headers=admin_headers,
    )

    # 3. Student asks relevant question
    chat_res = client.post(
        "/api/v1/chat",
        json={
            "course_id": course_id,
            "question": "What is binary search and its time complexity?",
        },
        headers=student_headers,
    )
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "session_id" in data
    assert "answer" in data
    assert len(data["answer"]) > 0

    session_id = data["session_id"]

    # 4. Student retrieves chat sessions history
    sessions_res = client.get("/api/v1/chat/sessions", headers=student_headers)
    assert sessions_res.status_code == 200
    sessions_data = sessions_res.json()
    assert len(sessions_data) >= 1

    # 5. Student views chat session details
    detail_res = client.get(f"/api/v1/chat/sessions/{session_id}", headers=student_headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert len(detail_data["messages"]) >= 2  # user + assistant


def test_chat_invalid_course(client, student_headers):
    response = client.post(
        "/api/v1/chat",
        json={
            "course_id": 99999,
            "question": "What is binary search?",
        },
        headers=student_headers,
    )
    assert response.status_code == 404
    data = response.json()
    assert data["error_code"] == "NOT_FOUND"
