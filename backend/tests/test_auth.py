def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New Student",
            "email": "newstudent@edurag.com",
            "password": "Password123!",
            "role": "student",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newstudent@edurag.com"
    assert data["role"] == "student"
    assert "password_hash" not in data


def test_register_duplicate_email(client, student_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate Student",
            "email": student_user.email,
            "password": "Password123!",
            "role": "student",
        },
    )
    assert response.status_code == 409
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "ALREADY_EXISTS"


def test_login_success(client, student_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": student_user.email,
            "password": "StudentPass123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "student"


def test_login_invalid_password(client, student_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": student_user.email,
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["error_code"] == "UNAUTHORIZED"


def test_get_me_protected(client, student_headers):
    response = client.get("/api/v1/auth/me", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "student@edurag.com"


def test_unauthorized_access(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
