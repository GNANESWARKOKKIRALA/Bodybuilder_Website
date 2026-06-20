"""
Gnaneswar Fitness Platform - Community Routes
API endpoints for community forum posts, replies, and gamified badges.
"""

from flask import Blueprint, request, jsonify, g, current_app
from app.extensions import db
from app.models.community import ForumPost, ForumReply, Badge, UserBadge
from app.middleware.auth_middleware import token_required, admin_required

community_bp = Blueprint("community", __name__)


# ──── Forum Posts Endpoints ────

@community_bp.route("/posts", methods=["GET"])
@token_required
def get_forum_posts():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))
    category = request.args.get("category")
    search = request.args.get("search")

    query = ForumPost.query

    if category:
        query = query.filter(ForumPost.category == category)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                ForumPost.title.ilike(search_term),
                ForumPost.content.ilike(search_term)
            )
        )

    # Order pinned posts first, then newest
    query = query.order_by(ForumPost.is_pinned.desc(), ForumPost.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "message": "Forum posts retrieved successfully",
        "data": {
            "items": [p.to_dict(include_replies=False) for p in pagination.items],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_pages": pagination.pages,
                "total_items": pagination.total,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }
    }), 200


@community_bp.route("/posts/<int:post_id>", methods=["GET"])
@token_required
def get_forum_post_detail(post_id):
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Forum post not found", "data": None}), 404

    # Increment views
    post.views_count += 1
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Forum post detail retrieved successfully",
        "data": {"post": post.to_dict(include_replies=True)}
    }), 200


@community_bp.route("/posts", methods=["POST"])
@token_required
def create_forum_post():
    data = request.get_json() or {}
    title = data.get("title")
    content = data.get("content")
    category = data.get("category", "general")

    if not title or not content:
        return jsonify({"success": False, "message": "Title and content are required", "data": None}), 400

    if category not in ("general", "workout", "nutrition", "motivation", "progress", "question"):
        return jsonify({"success": False, "message": "Invalid category value", "data": None}), 400

    post = ForumPost(
        author_id=g.current_user.id,
        title=title,
        content=content,
        category=category
    )

    db.session.add(post)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Forum post created successfully",
        "data": {"post": post.to_dict()}
    }), 201


@community_bp.route("/posts/<int:post_id>", methods=["PUT"])
@token_required
def update_forum_post(post_id):
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Forum post not found", "data": None}), 404

    # Check authorization (only author or admin can edit)
    if g.current_user.role != "admin" and post.author_id != g.current_user.id:
        return jsonify({"success": False, "message": "Unauthorized action", "data": None}), 403

    data = request.get_json() or {}
    
    if "title" in data:
        post.title = data["title"]
    if "content" in data:
        post.content = data["content"]
    if "category" in data:
        if data["category"] in ("general", "workout", "nutrition", "motivation", "progress", "question"):
            post.category = data["category"]
            
    # Admin only options
    if g.current_user.role == "admin":
        if "is_pinned" in data:
            post.is_pinned = data["is_pinned"]
        if "is_locked" in data:
            post.is_locked = data["is_locked"]

    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Forum post updated successfully",
        "data": {"post": post.to_dict()}
    }), 200


@community_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@token_required
def delete_forum_post(post_id):
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Forum post not found", "data": None}), 404

    # Check authorization
    if g.current_user.role != "admin" and post.author_id != g.current_user.id:
        return jsonify({"success": False, "message": "Unauthorized action", "data": None}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"success": True, "message": "Forum post deleted successfully", "data": None}), 200


# ──── Forum Replies Endpoints ────

@community_bp.route("/posts/<int:post_id>/replies", methods=["POST"])
@token_required
def create_forum_reply(post_id):
    post = ForumPost.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Forum post not found", "data": None}), 404

    if post.is_locked and g.current_user.role != "admin":
        return jsonify({"success": False, "message": "This post is locked for replies", "data": None}), 403

    data = request.get_json() or {}
    content = data.get("content")
    if not content:
        return jsonify({"success": False, "message": "Reply content is required", "data": None}), 400

    reply = ForumReply(
        post_id=post_id,
        author_id=g.current_user.id,
        content=content
    )

    db.session.add(reply)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Reply posted successfully",
        "data": {"reply": reply.to_dict()}
    }), 201


@community_bp.route("/replies/<int:reply_id>", methods=["PUT"])
@token_required
def update_forum_reply(reply_id):
    reply = ForumReply.query.get(reply_id)
    if not reply:
        return jsonify({"success": False, "message": "Reply not found", "data": None}), 404

    # Check authorization
    if g.current_user.role != "admin" and reply.author_id != g.current_user.id:
        return jsonify({"success": False, "message": "Unauthorized action", "data": None}), 403

    data = request.get_json() or {}
    content = data.get("content")
    if not content:
        return jsonify({"success": False, "message": "Reply content is required", "data": None}), 400

    reply.content = content
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Reply updated successfully",
        "data": {"reply": reply.to_dict()}
    }), 200


@community_bp.route("/replies/<int:reply_id>", methods=["DELETE"])
@token_required
def delete_forum_reply(reply_id):
    reply = ForumReply.query.get(reply_id)
    if not reply:
        return jsonify({"success": False, "message": "Reply not found", "data": None}), 404

    # Check authorization
    if g.current_user.role != "admin" and reply.author_id != g.current_user.id:
        return jsonify({"success": False, "message": "Unauthorized action", "data": None}), 403

    db.session.delete(reply)
    db.session.commit()
    return jsonify({"success": True, "message": "Reply deleted successfully", "data": None}), 200


# ──── Badge / Gamification Endpoints ────

@community_bp.route("/badges", methods=["GET"])
@token_required
def get_badges():
    badges = Badge.query.filter_by(is_active=True).all()
    return jsonify({
        "success": True,
        "message": "Badges retrieved successfully",
        "data": {"badges": [b.to_dict() for b in badges]}
    }), 200


@community_bp.route("/badges/earned", methods=["GET"])
@token_required
def get_my_earned_badges():
    user_id = g.current_user.id
    
    # Allow admins to view earned badges for a specific user
    client_id_str = request.args.get("client_id")
    if client_id_str and g.current_user.role == "admin":
        user_id = int(client_id_str)

    earned = UserBadge.query.filter_by(user_id=user_id).all()
    return jsonify({
        "success": True,
        "message": "Earned badges retrieved successfully",
        "data": {"earned_badges": [ub.to_dict() for ub in earned]}
    }), 200
