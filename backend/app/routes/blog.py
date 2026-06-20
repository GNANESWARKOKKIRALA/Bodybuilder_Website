"""
Gnaneswar Fitness Platform - Blog Routes
API endpoints for managing and retrieving blog posts and categories.
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.blog import BlogPost, BlogCategory
from app.middleware.auth_middleware import token_required, admin_required
from app.utils.helpers import slugify  # In case we need it, or we can use custom slugify

blog_bp = Blueprint("blog", __name__)


# ──── Public Retrieval Endpoints ────

@blog_bp.route("", methods=["GET"])
def get_blog_posts():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    category_slug = request.args.get("category")
    search = request.args.get("search")
    is_featured = request.args.get("featured")

    query = BlogPost.query

    # Regular users can only see published posts
    # Admin can see all statuses
    token = request.headers.get("Authorization")
    is_admin_check = False
    if token and token.startswith("Bearer "):
        from app.services.auth_service import AuthService
        payload = AuthService.decode_token(token.split(" ", 1)[1])
        if payload and payload.get("role") == "admin":
            is_admin_check = True

    if not is_admin_check:
        query = query.filter_by(status="published")
    else:
        status_filter = request.args.get("status")
        if status_filter:
            query = query.filter(BlogPost.status == status_filter)

    if category_slug:
        cat = BlogCategory.query.filter_by(slug=category_slug).first()
        if cat:
            query = query.filter(BlogPost.category_id == cat.id)
        else:
            return jsonify({"success": True, "message": "Category not found", "data": {"items": [], "pagination": {}}}), 200

    if is_featured:
        query = query.filter_by(is_featured=is_featured.lower() in ("true", "1"))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                BlogPost.title.ilike(search_term),
                BlogPost.excerpt.ilike(search_term),
                BlogPost.content.ilike(search_term)
            )
        )

    query = query.order_by(BlogPost.published_at.desc(), BlogPost.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "message": "Blog posts retrieved successfully",
        "data": {
            "items": [p.to_dict(include_content=False) for p in pagination.items],
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


@blog_bp.route("/categories", methods=["GET"])
def get_blog_categories():
    categories = BlogCategory.query.filter_by(is_active=True).all()
    return jsonify({
        "success": True,
        "message": "Categories retrieved successfully",
        "data": {"categories": [c.to_dict() for c in categories]}
    }), 200


@blog_bp.route("/<slug>", methods=["GET"])
def get_blog_post_detail(slug):
    post = BlogPost.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({"success": False, "message": "Blog post not found", "data": None}), 404

    # Increment view count
    post.views_count += 1
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Blog post detail retrieved successfully",
        "data": {"post": post.to_dict(include_content=True)}
    }), 200


# ──── Admin CRUD Endpoints ────

@blog_bp.route("", methods=["POST"])
@admin_required
def create_blog_post():
    data = request.get_json() or {}
    title = data.get("title")
    content = data.get("content")
    
    if not title or not content:
        return jsonify({"success": False, "message": "Title and content are required", "data": None}), 400

    # Create slug
    base_slug = data.get("slug")
    if not base_slug:
        import re
        base_slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    
    # Ensure slug uniqueness
    slug = base_slug
    counter = 1
    while BlogPost.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    post = BlogPost(
        title=title,
        slug=slug,
        excerpt=data.get("excerpt"),
        content=content,
        cover_image=data.get("cover_image"),
        category_id=data.get("category_id"),
        author_id=g.current_user.id,
        status=data.get("status", "draft"),
        tags=",".join(data.get("tags", [])) if isinstance(data.get("tags"), list) else data.get("tags"),
        is_featured=data.get("is_featured", False)
    )

    if post.status == "published":
        post.published_at = datetime.now(timezone.utc)

    db.session.add(post)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Blog post created successfully",
        "data": {"post": post.to_dict(include_content=True)}
    }), 201


@blog_bp.route("/<int:post_id>", methods=["PUT"])
@admin_required
def update_blog_post(post_id):
    post = BlogPost.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Blog post not found", "data": None}), 404

    data = request.get_json() or {}
    
    if "title" in data:
        post.title = data["title"]
    if "excerpt" in data:
        post.excerpt = data["excerpt"]
    if "content" in data:
        post.content = data["content"]
    if "cover_image" in data:
        post.cover_image = data["cover_image"]
    if "category_id" in data:
        post.category_id = data["category_id"]
    if "is_featured" in data:
        post.is_featured = data["is_featured"]
    if "tags" in data:
        post.tags = ",".join(data["tags"]) if isinstance(data["tags"], list) else data["tags"]
    
    if "status" in data and data["status"] != post.status:
        post.status = data["status"]
        if post.status == "published" and not post.published_at:
            post.published_at = datetime.now(timezone.utc)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Blog post updated successfully",
        "data": {"post": post.to_dict(include_content=True)}
    }), 200


@blog_bp.route("/<int:post_id>", methods=["DELETE"])
@admin_required
def delete_blog_post(post_id):
    post = BlogPost.query.get(post_id)
    if not post:
        return jsonify({"success": False, "message": "Blog post not found", "data": None}), 404

    db.session.delete(post)
    db.session.commit()

    return jsonify({"success": True, "message": "Blog post deleted successfully", "data": None}), 200


@blog_bp.route("/categories", methods=["POST"])
@admin_required
def create_blog_category():
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"success": False, "message": "Category name is required", "data": None}), 400

    import re
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

    if BlogCategory.query.filter_by(slug=slug).first() or BlogCategory.query.filter_by(name=name).first():
        return jsonify({"success": False, "message": "Category with this name or slug already exists", "data": None}), 400

    cat = BlogCategory(
        name=name,
        slug=slug,
        description=data.get("description"),
        is_active=data.get("is_active", True)
    )

    db.session.add(cat)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Category created successfully",
        "data": {"category": cat.to_dict()}
    }), 201
