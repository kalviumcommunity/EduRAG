from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import DuplicateException, UnauthorizedException, NotFoundException
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse


class AuthService:
    @staticmethod
    def register_user(db: Session, data: RegisterRequest) -> User:
        existing_user = db.query(User).filter(User.email == data.email.lower()).first()
        if existing_user:
            raise DuplicateException("A user with this email already exists.")

        role = data.role.lower() if data.role else "student"
        if role not in ["student", "admin"]:
            role = "student"

        user = User(
            name=data.name,
            email=data.email.lower(),
            password_hash=get_password_hash(data.password),
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password.")
        if not user.is_active:
            raise UnauthorizedException("User account is inactive.")
        return user

    @staticmethod
    def create_token_for_user(user: User) -> TokenResponse:
        access_token = create_access_token(subject=user.id, role=user.role)
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
        )
