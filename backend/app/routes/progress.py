"""
Gnaneswar Fitness Platform - Progress Routes
API endpoints for tracking body weight, body fat %, measurements, and progress photos.
"""

import os
from datetime import datetime
from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models.progress import ProgressEntry
from app.middleware.auth_middleware import token_required

progress_bp = Blueprint("progress", __name__)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config["ALLOWED_IMAGE_EXTENSIONS"]


@progress_bp.route("", methods=["POST"])
@token_required
def log_progress():
    data = request.form.to_dict() if request.form else {}
    
    entry_date_str = data.get("entry_date")
    if not entry_date_str:
        return jsonify({"success": False, "message": "Entry date is required", "data": None}), 400
        
    try:
        entry_date = datetime.strptime(entry_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Date format must be YYYY-MM-DD", "data": None}), 400

    # Handle file uploads (front_photo, side_photo, back_photo)
    photos = {}
    for photo_key in ("front_photo", "side_photo", "back_photo"):
        if photo_key in request.files:
            file = request.files[photo_key]
            if file and file.filename != "" and allowed_file(file.filename):
                filename = secure_filename(f"progress_{g.current_user.id}_{photo_key}_{file.filename}")
                upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], "progress", filename)
                file.save(upload_path)
                photos[photo_key] = f"/uploads/progress/{filename}"

    # Check if entry already exists for this date
    entry = ProgressEntry.query.filter_by(user_id=g.current_user.id, entry_date=entry_date).first()
    
    if not entry:
        entry = ProgressEntry(
            user_id=g.current_user.id,
            entry_date=entry_date
        )
        db.session.add(entry)

    # Helper function to convert to float/int or None
    def to_float(val):
        try:
            return float(val) if val is not None and val != "" else None
        except ValueError:
            return None

    def to_int(val):
        try:
            return int(val) if val is not None and val != "" else None
        except ValueError:
            return None

    # Update fields
    if "weight_kg" in data:
        entry.weight_kg = to_float(data["weight_kg"])
    if "body_fat_percentage" in data:
        entry.body_fat_percentage = to_float(data["body_fat_percentage"])
    if "chest_cm" in data:
        entry.chest_cm = to_float(data["chest_cm"])
    if "waist_cm" in data:
        entry.waist_cm = to_float(data["waist_cm"])
    if "hips_cm" in data:
        entry.hips_cm = to_float(data["hips_cm"])
    if "biceps_cm" in data:
        entry.biceps_cm = to_float(data["biceps_cm"])
    if "thighs_cm" in data:
        entry.thighs_cm = to_float(data["thighs_cm"])
    if "calves_cm" in data:
        entry.calves_cm = to_float(data["calves_cm"])
    if "neck_cm" in data:
        entry.neck_cm = to_float(data["neck_cm"])
    if "shoulders_cm" in data:
        entry.shoulders_cm = to_float(data["shoulders_cm"])
    if "notes" in data:
        entry.notes = data["notes"]
    if "energy_level" in data:
        entry.energy_level = to_int(data["energy_level"])
    if "sleep_hours" in data:
        entry.sleep_hours = to_float(data["sleep_hours"])

    # Update photos if uploaded
    if "front_photo" in photos:
        entry.front_photo = photos["front_photo"]
    if "side_photo" in photos:
        entry.side_photo = photos["side_photo"]
    if "back_photo" in photos:
        entry.back_photo = photos["back_photo"]

    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Progress entry logged successfully",
        "data": {"entry": entry.to_dict()}
    }), 201


@progress_bp.route("", methods=["GET"])
@token_required
def get_progress_history():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    user_id = g.current_user.id
    
    # Allow admins to fetch progress for a specific client
    client_id_str = request.args.get("client_id")
    if client_id_str and g.current_user.role == "admin":
        user_id = int(client_id_str)

    query = ProgressEntry.query.filter_by(user_id=user_id).order_by(ProgressEntry.entry_date.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "message": "Progress history retrieved",
        "data": {
            "items": [e.to_dict() for e in pagination.items],
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


@progress_bp.route("/latest", methods=["GET"])
@token_required
def get_latest_progress():
    user_id = g.current_user.id
    
    # Allow admins to fetch latest progress for a specific client
    client_id_str = request.args.get("client_id")
    if client_id_str and g.current_user.role == "admin":
        user_id = int(client_id_str)

    entry = ProgressEntry.query.filter_by(user_id=user_id).order_by(ProgressEntry.entry_date.desc()).first()
    if not entry:
        return jsonify({"success": True, "message": "No progress entries found", "data": {"entry": None}}), 200
        
    return jsonify({
        "success": True,
        "message": "Latest progress entry retrieved",
        "data": {"entry": entry.to_dict()}
    }), 200


@progress_bp.route("/<int:entry_id>", methods=["DELETE"])
@token_required
def delete_progress_entry(entry_id):
    entry = ProgressEntry.query.get(entry_id)
    if not entry:
        return jsonify({"success": False, "message": "Progress entry not found", "data": None}), 404
        
    # Check authorization (only owner or admin can delete)
    if g.current_user.role != "admin" and entry.user_id != g.current_user.id:
        return jsonify({"success": False, "message": "Unauthorized action", "data": None}), 403

    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({"success": True, "message": "Progress entry deleted successfully", "data": None}), 200
