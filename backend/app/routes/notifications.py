"""
Gnaneswar Fitness Platform - Notification Routes
API endpoints for retrieving, marking as read, and managing in-app notifications.
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.notification import Notification
from app.middleware.auth_middleware import token_required, admin_required

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("", methods=["GET"])
@token_required
def get_my_notifications():
    is_read_str = request.args.get("is_read")
    
    query = Notification.query.filter_by(user_id=g.current_user.id)
    
    if is_read_str is not None:
        query = query.filter(Notification.is_read == (is_read_str.lower() in ("true", "1")))
        
    notifications = query.order_by(Notification.created_at.desc()).all()
    
    # Get unread count
    unread_count = Notification.query.filter_by(user_id=g.current_user.id, is_read=False).count()
    
    return jsonify({
        "success": True,
        "message": "Notifications retrieved successfully",
        "data": {
            "notifications": [n.to_dict() for n in notifications],
            "unread_count": unread_count
        }
    }), 200


@notifications_bp.route("/<int:notif_id>/read", methods=["PUT"])
@token_required
def mark_as_read(notif_id):
    notif = Notification.query.filter_by(id=notif_id, user_id=g.current_user.id).first()
    if not notif:
        return jsonify({"success": False, "message": "Notification not found", "data": None}), 404
        
    if not notif.is_read:
        notif.is_read = True
        notif.read_at = datetime.now(timezone.utc)
        db.session.commit()
        
    return jsonify({"success": True, "message": "Notification marked as read", "data": {"notification": notif.to_dict()}}), 200


@notifications_bp.route("/read-all", methods=["PUT"])
@token_required
def mark_all_as_read():
    unread_notifications = Notification.query.filter_by(user_id=g.current_user.id, is_read=False).all()
    now = datetime.now(timezone.utc)
    for notif in unread_notifications:
        notif.is_read = True
        notif.read_at = now
        
    db.session.commit()
    return jsonify({"success": True, "message": "All notifications marked as read", "data": None}), 200


@notifications_bp.route("", methods=["POST"])
@admin_required
def create_notification():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    title = data.get("title")
    message = data.get("message")
    
    if not title or not message:
        return jsonify({"success": False, "message": "Title and message are required", "data": None}), 400

    # If user_id is "all", broadcast to all users
    if user_id == "all":
        from app.models.user import User
        users = User.query.filter(User.role != "admin").all()
        created_notifs = []
        for u in users:
            n = Notification(
                user_id=u.id,
                title=title,
                message=message,
                notification_type=data.get("notification_type", "info"),
                link=data.get("link")
            )
            db.session.add(n)
            created_notifs.append(n)
        db.session.commit()
        return jsonify({"success": True, "message": f"Notification broadcasted to {len(created_notifs)} users", "data": None}), 201
        
    elif isinstance(user_id, int):
        n = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=data.get("notification_type", "info"),
            link=data.get("link")
        )
        db.session.add(n)
        db.session.commit()
        return jsonify({"success": True, "message": "Notification sent successfully", "data": {"notification": n.to_dict()}}), 201
        
    return jsonify({"success": False, "message": "Invalid user_id parameter", "data": None}), 400


@notifications_bp.route("/<int:notif_id>", methods=["DELETE"])
@token_required
def delete_notification(notif_id):
    notif = Notification.query.get(notif_id)
    if not notif:
        return jsonify({"success": False, "message": "Notification not found", "data": None}), 404
        
    # Check authorization (only owner or admin can delete)
    if g.current_user.role != "admin" and notif.user_id != g.current_user.id:
        return jsonify({"success": False, "message": "Unauthorized action", "data": None}), 403

    db.session.delete(notif)
    db.session.commit()
    return jsonify({"success": True, "message": "Notification deleted successfully", "data": None}), 200
