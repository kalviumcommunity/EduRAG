import io


def test_upload_document_txt(client, admin_headers):
    # 1. Create a course first
    c_res = client.post(
        "/api/v1/courses",
        json={"name": "Operating Systems", "description": "OS concepts"},
        headers=admin_headers,
    )
    course_id = c_res.json()["id"]

    # 2. Upload text document
    file_content = b"Process scheduling algorithms include FCFS, SJF, and Round Robin."
    file = ("lecture1.txt", io.BytesIO(file_content), "text/plain")

    response = client.post(
        "/api/v1/documents/upload",
        data={
            "course_id": course_id,
            "title": "Lecture 1: Process Scheduling",
            "document_type": "lecture",
        },
        files={"file": file},
        headers=admin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Lecture 1: Process Scheduling"
    assert data["processing_status"] in ["pending", "completed"]


def test_upload_document_student_forbidden(client, student_headers):
    file = ("test.txt", io.BytesIO(b"Hello world"), "text/plain")
    response = client.post(
        "/api/v1/documents/upload",
        data={
            "course_id": 1,
            "title": "Student Upload Attempt",
            "document_type": "lecture",
        },
        files={"file": file},
        headers=student_headers,
    )
    assert response.status_code == 403


def test_upload_invalid_file_extension(client, admin_headers):
    # Create course first
    c_res = client.post(
        "/api/v1/courses",
        json={"name": "Cybersecurity", "description": "Security course"},
        headers=admin_headers,
    )
    course_id = c_res.json()["id"]

    file = ("malicious.exe", io.BytesIO(b"echo hello"), "application/octet-stream")
    response = client.post(
        "/api/v1/documents/upload",
        data={
            "course_id": course_id,
            "title": "Invalid File",
            "document_type": "lecture",
        },
        files={"file": file},
        headers=admin_headers,
    )
    assert response.status_code == 422
    data = response.json()
    assert data["error_code"] == "VALIDATION_ERROR"
