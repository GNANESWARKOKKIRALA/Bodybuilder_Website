"""
Gnaneswar Fitness Platform - Gallery Routes
API endpoints for retrieving and managing transformation photos and client testimonials.
"""

from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.gallery import TransformationPhoto, Testimonial
from app.middleware.auth_middleware import token_required, admin_required

gallery_bp = Blueprint("gallery", __name__)


# ──── Public Retrieval Endpoints ────

@gallery_bp.route("/transformations", methods=["GET"])
def get_transformations():
    featured = request.args.get("featured")
    
    query = TransformationPhoto.query
    
    # Regular users can only see approved ones, admins can see all
    token = request.headers.get("Authorization")
    is_admin = False
    if token and token.startswith("Bearer "):
        from app.services.auth_service import AuthService
        payload = AuthService.decode_token(token.split(" ", 1)[1])
        if payload and payload.get("role") == "admin":
            is_admin = True
            
    if not is_admin:
        query = query.filter_by(is_approved=True)
    else:
        approved_filter = request.args.get("approved")
        if approved_filter is not None:
            query = query.filter(TransformationPhoto.is_approved == (approved_filter.lower() in ("true", "1")))

    if featured is not None:
        query = query.filter(TransformationPhoto.is_featured == (featured.lower() in ("true", "1")))

    photos = query.order_by(TransformationPhoto.display_order.asc(), TransformationPhoto.created_at.desc()).all()
    return jsonify({
        "success": True,
        "message": "Transformation photos retrieved successfully",
        "data": {"transformations": [p.to_dict() for p in photos]}
    }), 200


@gallery_bp.route("/testimonials", methods=["GET"])
def get_testimonials():
    featured = request.args.get("featured")
    
    query = Testimonial.query
    
    # Regular users can only see approved ones, admins can see all
    token = request.headers.get("Authorization")
    is_admin = False
    if token and token.startswith("Bearer "):
        from app.services.auth_service import AuthService
        payload = AuthService.decode_token(token.split(" ", 1)[1])
        if payload and payload.get("role") == "admin":
            is_admin = True
            
    if not is_admin:
        query = query.filter_by(is_approved=True)
    else:
        approved_filter = request.args.get("approved")
        if approved_filter is not None:
            query = query.filter(Testimonial.is_approved == (approved_filter.lower() in ("true", "1")))

    if featured is not None:
        query = query.filter(Testimonial.is_featured == (featured.lower() in ("true", "1")))

    reviews = query.order_by(Testimonial.display_order.asc(), Testimonial.created_at.desc()).all()
    return jsonify({
        "success": True,
        "message": "Testimonials retrieved successfully",
        "data": {"testimonials": [r.to_dict() for r in reviews]}
    }), 200


# ──── Admin Management Endpoints ────

@gallery_bp.route("/transformations", methods=["POST"])
@admin_required
def create_transformation():
    data = request.get_json() or {}
    if not data.get("client_name") or not data.get("before_image") or not data.get("after_image"):
        return jsonify({"success": False, "message": "Client name, before image, and after image are required", "data": None}), 400

    photo = TransformationPhoto(
        user_id=data.get("user_id"),
        client_name=data.get("client_name"),
        before_image=data.get("before_image"),
        after_image=data.get("after_image"),
        duration_weeks=data.get("duration_weeks"),
        weight_lost_kg=data.get("weight_lost_kg"),
        muscle_gained_kg=data.get("muscle_gained_kg"),
        description=data.get("description"),
        program_followed=data.get("program_followed"),
        is_featured=data.get("is_featured", False),
        is_approved=data.get("is_approved", True), # Admin uploads are pre-approved
        display_order=data.get("display_order", 0)
    )

    db.session.add(photo)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Transformation photo created successfully",
        "data": {"transformation": photo.to_dict()}
    }), 201


@gallery_bp.route("/transformations/<int:photo_id>", methods=["PUT"])
@admin_required
def update_transformation(photo_id):
    photo = TransformationPhoto.query.get(photo_id)
    if not photo:
        return jsonify({"success": False, "message": "Transformation photo not found", "data": None}), 404

    data = request.get_json() or {}
    
    for field in ("client_name", "before_image", "after_image", "duration_weeks", 
                  "weight_lost_kg", "muscle_gained_kg", "description", 
                  "program_followed", "is_featured", "is_approved", "display_order"):
        if field in data and data[field] is not None:
            setattr(photo, field, data[field])

    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Transformation photo updated successfully",
        "data": {"transformation": photo.to_dict()}
    }), 200


@gallery_bp.route("/transformations/<int:photo_id>", methods=["DELETE"])
@admin_required
def delete_transformation(photo_id):
    photo = TransformationPhoto.query.get(photo_id)
    if not photo:
        return jsonify({"success": False, "message": "Transformation photo not found", "data": None}), 404

    db.session.delete(photo)
    db.session.commit()
    return jsonify({"success": True, "message": "Transformation photo deleted successfully", "data": None}), 200


@gallery_bp.route("/testimonials", methods=["POST"])
@admin_required
def create_testimonial():
    data = request.get_json() or {}
    if not data.get("client_name") or not data.get("content"):
        return jsonify({"success": False, "message": "Client name and testimonial content are required", "data": None}), 400

    review = Testimonial(
        user_id=data.get("user_id"),
        client_name=data.get("client_name"),
        client_image=data.get("client_image"),
        content=data.get("content"),
        rating=data.get("rating", 5),
        program_name=data.get("program_name"),
        is_featured=data.get("is_featured", False),
        is_approved=data.get("is_approved", True), # Admin uploads pre-approved
        display_order=data.get("display_order", 0)
    )

    db.session.add(review)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Testimonial created successfully",
        "data": {"testimonial": review.to_dict()}
    }), 201


@gallery_bp.route("/testimonials/<int:review_id>", methods=["PUT"])
@admin_required
def update_testimonial(review_id):
    review = Testimonial.query.get(review_id)
    if not review:
        return jsonify({"success": False, "message": "Testimonial not found", "data": None}), 404

    data = request.get_json() or {}
    
    for field in ("client_name", "client_image", "content", "rating", 
                  "program_name", "is_featured", "is_approved", "display_order"):
        if field in data and data[field] is not None:
            setattr(review, field, data[field])

    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Testimonial updated successfully",
        "data": {"testimonial": review.to_dict()}
    }), 200


@gallery_bp.route("/testimonials/<int:review_id>", methods=["DELETE"])
@admin_required
def delete_testimonial(review_id):
    review = Testimonial.query.get(review_id)
    if not review:
        return jsonify({"success": False, "message": "Testimonial not found", "data": None}), 404

    db.session.delete(review)
    db.session.commit()
    return jsonify({"success": True, "message": "Testimonial deleted successfully", "data": None}), 200
