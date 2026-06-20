"""
Gnaneswar Fitness Platform - User Routes
API endpoints for user profiles, avatar uploads, and admin user management.
"""

import os
from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.utils import secure_filename
from app.services.user_service import UserService
from app.middleware.auth_middleware import token_required, admin_required

users_bp = Blueprint("users", __name__)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config["ALLOWED_IMAGE_EXTENSIONS"]


@users_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    return jsonify({
        "success": True,
        "message": "Profile retrieved successfully",
        "data": {"user": g.current_user.to_dict(include_profile=True)}
    }), 200


@users_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json() or {}
    
    # Update basic user fields
    user = UserService.update_user(g.current_user, data)
    
    # Update profile fields
    profile = UserService.update_profile(user, data)
    
    return jsonify({
        "success": True,
        "message": "Profile updated successfully",
        "data": {"user": user.to_dict(include_profile=True)}
    }), 200


@users_bp.route("/avatar", methods=["POST"])
@token_required
def upload_avatar():
    if "avatar" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded", "data": None}), 400
        
    file = request.files["avatar"]
    if file.filename == "":
        return jsonify({"success": False, "message": "No file selected", "data": None}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{g.current_user.id}_{file.filename}")
        upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], "avatars", filename)
        file.save(upload_path)
        
        avatar_url = f"/uploads/avatars/{filename}"
        UserService.update_avatar(g.current_user, avatar_url)
        
        return jsonify({
            "success": True,
            "message": "Avatar uploaded successfully",
            "data": {"avatar_url": avatar_url}
        }), 200
        
    return jsonify({"success": False, "message": "Invalid file extension", "data": None}), 400


@users_bp.route("", methods=["GET"])
@admin_required
def get_all_users():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))
    role = request.args.get("role")
    search = request.args.get("search")
    is_active_str = request.args.get("is_active")
    
    is_active = None
    if is_active_str is not None:
        is_active = is_active_str.lower() in ("true", "1")
        
    result = UserService.get_all_users(
        page=page, 
        per_page=per_page, 
        role=role, 
        search=search, 
        is_active=is_active
    )
    
    return jsonify({
        "success": True,
        "message": "Users list retrieved successfully",
        "data": result
    }), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
@admin_required
def get_user_detail(user_id):
    user = UserService.get_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found", "data": None}), 404
        
    return jsonify({
        "success": True,
        "message": "User details retrieved successfully",
        "data": {"user": user.to_dict(include_profile=True)}
    }), 200


@users_bp.route("/<int:user_id>", methods=["PUT"])
@admin_required
def update_user_admin(user_id):
    user = UserService.get_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found", "data": None}), 404
        
    data = request.get_json() or {}
    
    # Update core user
    user = UserService.update_user(user, data)
    
    # Update profile
    UserService.update_profile(user, data)
    
    # Update role if provided
    role = data.get("role")
    if role and role in ("admin", "client", "lead"):
        if role == "admin" and user.email != "gapbodybuilder@gmail.com":
            return jsonify({"success": False, "message": "Only the owner email can be assigned the Admin role", "data": None}), 400
        UserService.change_role(user.id, role)
        
    return jsonify({
        "success": True,
        "message": "User updated successfully",
        "data": {"user": user.to_dict(include_profile=True)}
    }), 200


@users_bp.route("/<int:user_id>/role", methods=["PUT"])
@admin_required
def update_user_role(user_id):
    """Dedicated endpoint for role updates — matches frontend userService.updateUserRole."""
    user = UserService.get_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found", "data": None}), 404

    data = request.get_json() or {}
    role = data.get("role")
    if not role or role not in ("admin", "client", "lead"):
        return jsonify({"success": False, "message": "Invalid or missing role", "data": None}), 400

    if role == "admin" and user.email != "gapbodybuilder@gmail.com":
        return jsonify({"success": False, "message": "Only the system owner can hold the Admin role", "data": None}), 403

    updated_user, msg = UserService.change_role(user.id, role)
    return jsonify({
        "success": True,
        "message": msg,
        "data": {"user": updated_user.to_dict()}
    }), 200


@users_bp.route("/<int:user_id>/toggle-active", methods=["POST"])
@users_bp.route("/<int:user_id>/toggle-status", methods=["PUT"])
@admin_required
def toggle_user_active(user_id):
    user, message = UserService.toggle_active(user_id)
    if not user:
        return jsonify({"success": False, "message": message, "data": None}), 404

    return jsonify({
        "success": True,
        "message": message,
        "data": {"user": user.to_dict()}
    }), 200


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    success, message = UserService.delete_user(user_id)
    if not success:
        return jsonify({"success": False, "message": message, "data": None}), 404
        
    return jsonify({
        "success": True,
        "message": message,
        "data": None
    }), 200
