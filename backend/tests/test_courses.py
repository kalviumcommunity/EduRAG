def test_create_course_admin(client, admin_headers):
    response = client.post(
        "/api/v1/courses",
        json={"name": "Data Structures & Algorithms", "description": "Core CS Course", "is_active": True},
        headers=admin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Data Structures & Algorithms"
    assert "id" in data


def test_create_course_forbidden_for_student(client, student_headers):
    response = client.post(
        "/api/v1/courses",
        json={"name": "Hacking 101", "description": "Unauthorized"},
        headers=student_headers,
    )
    assert response.status_code == 403
    data = response.json()
    assert data["error_code"] == "FORBIDDEN"


def test_list_courses(client, student_headers, admin_headers):
    # Admin creates course
    client.post(
        "/api/v1/courses",
        json={"name": "Computer Networks", "description": "Networks course", "is_active": True},
        headers=admin_headers,
    )

    # Student views courses
    response = client.get("/api/v1/courses", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
