"""
Gnaneswar Fitness Platform - Authentication Middleware
JWT token verification and role-based access control decorators.
"""

from functools import wraps
from flask import request, jsonify, g
import jwt
from app.config import BaseConfig
from app.models.user import User


def _decode_token(token: str) -> dict | None:
    """Decode and validate a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(token, BaseConfig.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    """Decorator that requires a valid JWT access token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

        if not token:
            return jsonify({"success": False, "message": "Authentication token is missing", "data": None}), 401

        payload = _decode_token(token)
        if payload is None:
            return jsonify({"success": False, "message": "Token is invalid or expired", "data": None}), 401

        if payload.get("type") != "access":
            return jsonify({"success": False, "message": "Invalid token type", "data": None}), 401

        user = User.query.get(payload.get("user_id"))
        if user is None:
            return jsonify({"success": False, "message": "User not found", "data": None}), 401

        if not user.is_active:
            return jsonify({"success": False, "message": "Account has been deactivated", "data": None}), 403

        g.current_user = user
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator that requires admin role and owner email."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user.role != "admin" or g.current_user.email != "gapbodybuilder@gmail.com":
            return jsonify({"success": False, "message": "Admin access required", "data": None}), 403
        return f(*args, **kwargs)

    return decorated


def client_or_admin_required(f):
    """Decorator that requires client or admin role (not lead)."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user.role not in ("admin", "client"):
            return jsonify({"success": False, "message": "Client or admin access required", "data": None}), 403
        return f(*args, **kwargs)

    return decorated


def optional_token(f):
    """Decorator that optionally attaches user info if token is present."""
    @wraps(f)
    def decorated(*args, **kwargs):
        g.current_user = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            payload = _decode_token(token)
            if payload and payload.get("type") == "access":
                user = User.query.get(payload.get("user_id"))
                if user and user.is_active:
                    g.current_user = user
        return f(*args, **kwargs)

    return decorated
