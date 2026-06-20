"""
Gnaneswar Fitness Platform - Chat Routes
API endpoints for direct 1-to-1 coach-client messaging.
"""

from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.chat import ChatMessage
from app.models.user import User
from app.models.payment import Subscription
from app.middleware.auth_middleware import token_required, admin_required
from datetime import date

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/conversations", methods=["GET"])
@admin_required
def get_conversations():
    """Retrieve all conversations for the coach (admin)."""
    # Get all clients and leads
    users = User.query.filter(User.role != "admin").all()
    
    conversations = []
    for u in users:
        # Find the latest message between admin and this user
        latest_msg = ChatMessage.query.filter(
            db.or_(
                db.and_(ChatMessage.sender_id == g.current_user.id, ChatMessage.receiver_id == u.id),
                db.and_(ChatMessage.sender_id == u.id, ChatMessage.receiver_id == g.current_user.id)
            )
        ).order_by(ChatMessage.created_at.desc()).first()
        
        # Count unread messages from this user to admin
        unread_count = ChatMessage.query.filter_by(
            sender_id=u.id,
            receiver_id=g.current_user.id,
            is_read=False
        ).count()
        
        conversations.append({
            "user": u.to_dict(include_profile=True),
            "latest_message": latest_msg.to_dict() if latest_msg else None,
            "unread_count": unread_count
        })
        
    # Sort conversations by latest message time (newest first)
    # Put conversations with no messages at the end
    def get_sort_key(c):
        if c["latest_message"]:
            return c["latest_message"]["created_at"]
        return "0000-00-00T00:00:00"
        
    conversations.sort(key=get_sort_key, reverse=True)
    
    return jsonify({
        "success": True,
        "message": "Conversations retrieved successfully",
        "data": conversations
    }), 200


@chat_bp.route("/messages/<int:user_id>", methods=["GET"])
@token_required
def get_chat_history(user_id):
    """Retrieve 1-to-1 chat history between current user and target user."""
    # If the current user is a client/lead, they can only view messages with the admin
    if g.current_user.role != "admin":
        # Find the admin user
        admin = User.query.filter_by(role="admin").first()
        if not admin or user_id != admin.id:
            return jsonify({"success": False, "message": "Unauthorized to view this chat history", "data": None}), 403

    messages = ChatMessage.query.filter(
        db.or_(
            db.and_(ChatMessage.sender_id == g.current_user.id, ChatMessage.receiver_id == user_id),
            db.and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id == g.current_user.id)
        )
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return jsonify({
        "success": True,
        "message": "Chat history retrieved successfully",
        "data": [msg.to_dict() for msg in messages]
    }), 200


@chat_bp.route("/messages", methods=["POST"])
@token_required
def send_message():
    """Send a direct 1-to-1 message. Only paid (active subscription) clients can message the coach."""
    data = request.get_json() or {}
    receiver_id = data.get("receiver_id")
    message_text = data.get("message")

    if not message_text or not message_text.strip():
        return jsonify({"success": False, "message": "Message content is required", "data": None}), 400

    # If the sender is a client/lead, they default to sending to the admin (coach)
    if g.current_user.role != "admin":
        # --- SUBSCRIPTION GATE ---
        active_sub = Subscription.query.filter_by(
            user_id=g.current_user.id,
            status="active"
        ).filter(Subscription.end_date >= date.today()).first()

        if not active_sub:
            return jsonify({
                "success": False,
                "message": "Chat with Coach is a premium feature. Please upgrade your plan to message Coach Gnaneswar.",
                "data": {"upgrade_required": True}
            }), 403
        # -------------------------

        admin = User.query.filter_by(role="admin").first()
        if not admin:
            return jsonify({"success": False, "message": "Coach account is not available", "data": None}), 404
        receiver_id = admin.id
    else:
        if not receiver_id:
            return jsonify({"success": False, "message": "Receiver ID is required for admins", "data": None}), 400

        receiver = User.query.get(receiver_id)
        if not receiver:
            return jsonify({"success": False, "message": "Receiver user not found", "data": None}), 404

    msg = ChatMessage(
        sender_id=g.current_user.id,
        receiver_id=receiver_id,
        message=message_text.strip()
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Message sent successfully",
        "data": msg.to_dict()
    }), 201


@chat_bp.route("/messages/<int:user_id>/read", methods=["PUT"])
@token_required
def mark_messages_read(user_id):
    """Mark all messages from target user as read."""
    unread_messages = ChatMessage.query.filter_by(
        sender_id=user_id,
        receiver_id=g.current_user.id,
        is_read=False
    ).all()
    
    for msg in unread_messages:
        msg.is_read = True
        
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"{len(unread_messages)} messages marked as read",
        "data": None
    }), 200
