"""
Gnaneswar Fitness Platform - Auth Routes
API endpoints for user authentication and session management.
"""

from flask import Blueprint, request, jsonify, g
from app.services.auth_service import AuthService
from app.middleware.auth_middleware import token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    phone = data.get("phone")

    if not all([email, password, first_name, last_name]):
        return jsonify({"success": False, "message": "Email, password, first name and last name are required", "data": None}), 400

    user, message = AuthService.register(email, password, first_name, last_name, phone)
    if not user:
        return jsonify({"success": False, "message": message, "data": None}), 400

    # Generate tokens for automatic login
    access_token = AuthService.generate_access_token(user)
    refresh_token = AuthService.generate_refresh_token(user)

    token_data = {
        "token": access_token,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "user": user.to_dict(include_profile=True)
    }

    return jsonify({
        "success": True,
        "message": message,
        "data": token_data
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required", "data": None}), 400

    token_data, message = AuthService.login(email, password)
    if not token_data:
        return jsonify({"success": False, "message": message, "data": None}), 401

    return jsonify({
        "success": True,
        "message": message,
        "data": token_data
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    data = request.get_json() or {}
    refresh_token = data.get("refresh_token")

    if not refresh_token:
        return jsonify({"success": False, "message": "Refresh token is required", "data": None}), 400

    token_data, message = AuthService.refresh_access_token(refresh_token)
    if not token_data:
        return jsonify({"success": False, "message": message, "data": 401}), 401

    return jsonify({
        "success": True,
        "message": message,
        "data": token_data
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Stateless JWT logout is handled client-side by deleting the token.
    # We simply return a success message here.
    return jsonify({"success": True, "message": "Logged out successfully", "data": None}), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    return jsonify({
        "success": True,
        "message": "Current user retrieved successfully",
        "data": {"user": g.current_user.to_dict(include_profile=True)}
    }), 200


@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password():
    data = request.get_json() or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"success": False, "message": "Current and new passwords are required", "data": None}), 400

    success, message = AuthService.change_password(g.current_user, current_password, new_password)
    if not success:
        return jsonify({"success": False, "message": message, "data": None}), 400

    return jsonify({"success": True, "message": message, "data": None}), 200


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "message": "Email is required", "data": None}), 400
    # In production, send a reset email. For now, mock success.
    return jsonify({"success": True, "message": "Password reset instructions have been sent to your email", "data": None}), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("new_password")
    if not token or not new_password:
        return jsonify({"success": False, "message": "Token and new password are required", "data": None}), 400
    # Mock password reset success
    return jsonify({"success": True, "message": "Password reset successful. You can now login.", "data": None}), 200


@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json() or {}
    token = data.get("token")
    if not token:
        return jsonify({"success": False, "message": "Verification token is required", "data": None}), 400
    # Mock email verification success
    return jsonify({"success": True, "message": "Email verified successfully", "data": None}), 200
