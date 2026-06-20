"""
Gnaneswar Fitness Platform - Helper Utilities
Common helper functions used across the application.
"""

import os
import uuid
import re
from datetime import datetime, timezone
from flask import request, current_app
from werkzeug.utils import secure_filename


def api_response(success: bool, message: str, data=None, status_code: int = 200):
    """Build a consistent JSON API response."""
    from flask import jsonify
    response = jsonify({"success": success, "message": message, "data": data})
    response.status_code = status_code
    return response


def get_pagination_params() -> tuple[int, int]:
    """Extract and validate pagination parameters from the request."""
    try:
        page = max(1, int(request.args.get("page", 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        per_page = min(
            int(request.args.get("per_page", current_app.config.get("DEFAULT_PAGE_SIZE", 20))),
            current_app.config.get("MAX_PAGE_SIZE", 100),
        )
        per_page = max(1, per_page)
    except (ValueError, TypeError):
        per_page = 20
    return page, per_page


def paginate_query(query, page: int, per_page: int) -> dict:
    """Paginate a SQLAlchemy query and return formatted response."""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        "items": [item.to_dict() for item in pagination.items],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_pages": pagination.pages,
            "total_items": pagination.total,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
        },
    }


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def allowed_image(filename: str) -> bool:
    """Check if a filename has an allowed image extension."""
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in current_app.config.get("ALLOWED_IMAGE_EXTENSIONS", {"png", "jpg", "jpeg", "gif", "webp"})


def save_uploaded_image(file, subfolder: str = "general") -> str | None:
    """
    Save an uploaded image file and return its relative path.
    Returns None if the file is invalid.
    """
    if not file or file.filename == "":
        return None

    if not allowed_image(file.filename):
        return None

    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"

    upload_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], subfolder)
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, unique_name)
    file.save(filepath)

    return f"/uploads/{subfolder}/{unique_name}"


def delete_uploaded_file(relative_path: str) -> bool:
    """Delete a previously uploaded file by its relative path."""
    if not relative_path:
        return False
    # Remove leading /uploads/ to get subfolder/filename
    clean_path = relative_path.lstrip("/")
    if clean_path.startswith("uploads/"):
        clean_path = clean_path[len("uploads/"):]
    full_path = os.path.join(current_app.config["UPLOAD_FOLDER"], clean_path)
    if os.path.exists(full_path):
        os.remove(full_path)
        return True
    return False


def generate_invoice_number() -> str:
    """Generate a unique invoice number."""
    now = datetime.now(timezone.utc)
    return f"GNF-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


def calculate_bmi(weight_kg: float, height_cm: float) -> float | None:
    """Calculate BMI from weight (kg) and height (cm)."""
    if not weight_kg or not height_cm or height_cm <= 0:
        return None
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 2)


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float | None:
    """Calculate Basal Metabolic Rate using the Mifflin-St Jeor equation."""
    if not all([weight_kg, height_cm, age]):
        return None
    if gender == "male":
        return round(10 * weight_kg + 6.25 * height_cm - 5 * age + 5, 2)
    elif gender == "female":
        return round(10 * weight_kg + 6.25 * height_cm - 5 * age - 161, 2)
    else:
        return round(10 * weight_kg + 6.25 * height_cm - 5 * age - 78, 2)


def calculate_tdee(bmr: float, activity_level: str) -> float | None:
    """Calculate Total Daily Energy Expenditure from BMR and activity level."""
    if bmr is None:
        return None
    multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extremely_active": 1.9,
    }
    multiplier = multipliers.get(activity_level, 1.55)
    return round(bmr * multiplier, 2)
