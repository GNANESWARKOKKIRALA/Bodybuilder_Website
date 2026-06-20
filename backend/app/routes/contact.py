"""
Gnaneswar Fitness Platform - Contact Routes
API endpoints for contact form inquiries (leads) and admin lead management.
"""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.contact import ContactSubmission
from app.middleware.auth_middleware import admin_required

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("", methods=["POST"])
def submit_contact_form():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")
    phone = data.get("phone")

    if not all([name, email, subject, message]):
        return jsonify({"success": False, "message": "Name, email, subject, and message are required", "data": None}), 400

    submission = ContactSubmission(
        name=name,
        email=email.lower().strip(),
        phone=phone,
        subject=subject,
        message=message
    )

    db.session.add(submission)
    db.session.commit()

    return jsonify({
        "success": True, 
        "message": "Your inquiry has been submitted successfully. We will get back to you shortly!", 
        "data": {"submission": submission.to_dict()}
    }), 201


@contact_bp.route("", methods=["GET"])
@admin_required
def get_contact_submissions():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))
    status = request.args.get("status")

    query = ContactSubmission.query

    if status:
        query = query.filter(ContactSubmission.status == status)

    query = query.order_by(ContactSubmission.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "message": "Inquiries retrieved successfully",
        "data": {
            "items": [s.to_dict() for s in pagination.items],
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


@contact_bp.route("/<int:submission_id>", methods=["GET"])
@admin_required
def get_contact_submission_detail(submission_id):
    submission = ContactSubmission.query.get(submission_id)
    if not submission:
        return jsonify({"success": False, "message": "Inquiry not found", "data": None}), 404

    # Auto mark as read if it's new
    if submission.status == "new":
        submission.status = "read"
        db.session.commit()

    return jsonify({
        "success": True,
        "message": "Inquiry detail retrieved successfully",
        "data": {"submission": submission.to_dict()}
    }), 200


@contact_bp.route("/<int:submission_id>", methods=["PUT"])
@admin_required
def update_contact_submission(submission_id):
    submission = ContactSubmission.query.get(submission_id)
    if not submission:
        return jsonify({"success": False, "message": "Inquiry not found", "data": None}), 404

    data = request.get_json() or {}
    
    if "status" in data:
        status = data["status"]
        if status in ("new", "read", "replied", "archived"):
            submission.status = status
            if status == "replied" and not submission.replied_at:
                submission.replied_at = datetime.now(timezone.utc)
                
    if "admin_notes" in data:
        submission.admin_notes = data["admin_notes"]

    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Inquiry updated successfully",
        "data": {"submission": submission.to_dict()}
    }), 200


@contact_bp.route("/<int:submission_id>", methods=["DELETE"])
@admin_required
def delete_contact_submission(submission_id):
    submission = ContactSubmission.query.get(submission_id)
    if not submission:
        return jsonify({"success": False, "message": "Inquiry not found", "data": None}), 404

    db.session.delete(submission)
    db.session.commit()
    return jsonify({"success": True, "message": "Inquiry deleted successfully", "data": None}), 200
