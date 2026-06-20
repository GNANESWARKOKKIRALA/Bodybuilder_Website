"""
Gnaneswar Fitness Platform - Auth Service
Handles user registration, login, JWT token generation and refresh.
"""

from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from app.config import BaseConfig
from app.extensions import db
from app.models.user import User, UserProfile


class AuthService:
    """Authentication service with JWT token management."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plaintext password with bcrypt."""
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify a plaintext password against a bcrypt hash."""
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

    @staticmethod
    def generate_access_token(user: User) -> str:
        """Generate a JWT access token for the given user."""
        payload = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "type": "access",
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(seconds=BaseConfig.JWT_ACCESS_TOKEN_EXPIRES),
        }
        return jwt.encode(payload, BaseConfig.JWT_SECRET_KEY, algorithm="HS256")

    @staticmethod
    def generate_refresh_token(user: User) -> str:
        """Generate a JWT refresh token for the given user."""
        payload = {
            "user_id": user.id,
            "type": "refresh",
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(seconds=BaseConfig.JWT_REFRESH_TOKEN_EXPIRES),
        }
        return jwt.encode(payload, BaseConfig.JWT_SECRET_KEY, algorithm="HS256")

    @staticmethod
    def decode_token(token: str) -> dict | None:
        """Decode a JWT token. Returns the payload dict or None."""
        try:
            return jwt.decode(token, BaseConfig.JWT_SECRET_KEY, algorithms=["HS256"])
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None

    @classmethod
    def register(cls, email: str, password: str, first_name: str, last_name: str, phone: str | None = None) -> tuple[User | None, str]:
        """
        Register a new user.
        Returns (user, message). user is None on failure.
        """
        if User.query.filter_by(email=email.lower().strip()).first():
            return None, "An account with this email already exists"

        user = User(
            email=email.lower().strip(),
            password_hash=cls.hash_password(password),
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            phone=phone,
            role="lead",
        )
        db.session.add(user)
        db.session.flush()

        # Create empty profile
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

        return user, "Registration successful"

    @classmethod
    def login(cls, email: str, password: str) -> tuple[dict | None, str]:
        """
        Authenticate a user.
        Returns (token_data, message). token_data is None on failure.
        """
        user = User.query.filter_by(email=email.lower().strip()).first()
        if not user:
            return None, "Invalid email or password"

        if not cls.verify_password(password, user.password_hash):
            return None, "Invalid email or password"

        if not user.is_active:
            return None, "Your account has been deactivated. Please contact support."

        user.last_login = datetime.now(timezone.utc)
        db.session.commit()

        token_data = {
            "token": cls.generate_access_token(user),
            "access_token": cls.generate_access_token(user),
            "refresh_token": cls.generate_refresh_token(user),
            "token_type": "Bearer",
            "expires_in": BaseConfig.JWT_ACCESS_TOKEN_EXPIRES,
            "user": user.to_dict(include_profile=True),
        }
        return token_data, "Login successful"

    @classmethod
    def refresh_access_token(cls, refresh_token: str) -> tuple[dict | None, str]:
        """
        Issue a new access token from a valid refresh token.
        Returns (token_data, message).
        """
        payload = cls.decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None, "Invalid or expired refresh token"

        user = User.query.get(payload.get("user_id"))
        if not user or not user.is_active:
            return None, "User not found or account deactivated"

        token_data = {
            "access_token": cls.generate_access_token(user),
            "token_type": "Bearer",
            "expires_in": BaseConfig.JWT_ACCESS_TOKEN_EXPIRES,
        }
        return token_data, "Token refreshed successfully"

    @classmethod
    def change_password(cls, user: User, current_password: str, new_password: str) -> tuple[bool, str]:
        """Change a user's password after verifying the current one."""
        if not cls.verify_password(current_password, user.password_hash):
            return False, "Current password is incorrect"

        user.password_hash = cls.hash_password(new_password)
        db.session.commit()
        return True, "Password changed successfully"
