"""
Gnaneswar Fitness Platform - Nutrition Routes
API endpoints for meal plan catalog, nutrition logging, and daily summaries.
"""

from datetime import datetime
from flask import Blueprint, request, jsonify, g, current_app
from app.services.nutrition_service import NutritionService
from app.middleware.auth_middleware import token_required, admin_required

nutrition_bp = Blueprint("nutrition", __name__)


# ──── Nutrition Plan Catalog Endpoints ────

@nutrition_bp.route("/plans", methods=["GET"])
@token_required
def get_plans():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))
    goal = request.args.get("goal")
    diet_type = request.args.get("diet_type")

    result = NutritionService.get_plans(
        page=page,
        per_page=per_page,
        goal=goal,
        diet_type=diet_type
    )
    return jsonify({"success": True, "message": "Nutrition plans retrieved", "data": result}), 200


@nutrition_bp.route("/plans/<int:plan_id>", methods=["GET"])
@token_required
def get_plan_detail(plan_id):
    plan = NutritionService.get_plan_by_id(plan_id)
    if not plan:
        return jsonify({"success": False, "message": "Nutrition plan not found", "data": None}), 404
    return jsonify({"success": True, "message": "Nutrition plan detail retrieved", "data": {"plan": plan.to_dict(include_meals=True)}}), 200


@nutrition_bp.route("/plans", methods=["POST"])
@admin_required
def create_plan():
    data = request.get_json() or {}
    if not data.get("name") or not data.get("daily_calories"):
        return jsonify({"success": False, "message": "Name and daily calories target are required", "data": None}), 400

    plan = NutritionService.create_plan(data, created_by=g.current_user.id)
    return jsonify({"success": True, "message": "Nutrition plan created successfully", "data": {"plan": plan.to_dict(include_meals=True)}}), 201


@nutrition_bp.route("/plans/<int:plan_id>", methods=["PUT"])
@admin_required
def update_plan(plan_id):
    data = request.get_json() or {}
    plan = NutritionService.update_plan(plan_id, data)
    if not plan:
        return jsonify({"success": False, "message": "Nutrition plan not found", "data": None}), 404
    return jsonify({"success": True, "message": "Nutrition plan updated successfully", "data": {"plan": plan.to_dict(include_meals=True)}}), 200


@nutrition_bp.route("/plans/<int:plan_id>", methods=["DELETE"])
@admin_required
def delete_plan(plan_id):
    success = NutritionService.delete_plan(plan_id)
    if not success:
        return jsonify({"success": False, "message": "Nutrition plan not found", "data": None}), 404
    return jsonify({"success": True, "message": "Nutrition plan deleted successfully", "data": None}), 200


# ──── Nutrition Logging Endpoints ────

@nutrition_bp.route("/logs", methods=["POST"])
@token_required
def log_nutrition_entry():
    data = request.get_json() or {}
    if not data.get("log_date") or not data.get("meal_type") or not data.get("food_items"):
        return jsonify({"success": False, "message": "Date, meal type, and food items description are required", "data": None}), 400

    try:
        data["log_date"] = datetime.strptime(data["log_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Date format must be YYYY-MM-DD", "data": None}), 400

    log = NutritionService.log_nutrition(g.current_user.id, data)
    return jsonify({"success": True, "message": "Nutrition entry logged successfully", "data": {"log": log.to_dict()}}), 201


@nutrition_bp.route("/logs", methods=["GET"])
@token_required
def get_nutrition_logs():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    start_date = None
    end_date = None
    try:
        if start_date_str:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        if end_date_str:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Date format must be YYYY-MM-DD", "data": None}), 400

    result = NutritionService.get_user_logs(
        user_id=g.current_user.id,
        page=page,
        per_page=per_page,
        start_date=start_date,
        end_date=end_date
    )
    return jsonify({"success": True, "message": "Nutrition logs retrieved", "data": result}), 200


@nutrition_bp.route("/logs/<int:log_id>", methods=["DELETE"])
@token_required
def delete_nutrition_log_entry(log_id):
    success = NutritionService.delete_nutrition_log(log_id, g.current_user.id)
    if not success:
        return jsonify({"success": False, "message": "Nutrition log entry not found or unauthorized", "data": None}), 404
    return jsonify({"success": True, "message": "Nutrition log entry deleted successfully", "data": None}), 200


@nutrition_bp.route("/summary", methods=["GET"])
@token_required
def get_daily_nutrition_summary():
    date_str = request.args.get("date")
    if date_str:
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"success": False, "message": "Date format must be YYYY-MM-DD", "data": None}), 400
    else:
        date = datetime.now().date()

    summary = NutritionService.get_daily_summary(g.current_user.id, date)
    return jsonify({"success": True, "message": "Daily nutrition summary retrieved", "data": summary}), 200


@nutrition_bp.route("/assign", methods=["POST"])
@admin_required
def assign_nutrition_plan():
    data = request.get_json() or {}
    user_id = data.get("userId") or data.get("user_id")
    plan_id = data.get("planId") or data.get("plan_id")

    if not user_id:
        return jsonify({"success": False, "message": "User ID is required", "data": None}), 400

    from app.models.user import UserProfile
    profile = UserProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"success": False, "message": "User profile not found", "data": None}), 404

    profile.nutrition_plan_id = plan_id
    db.session.commit()

    return jsonify({
        "success": True, 
        "message": f"Nutrition plan {'assigned successfully' if plan_id else 'removed successfully'}", 
        "data": {"nutrition_plan_id": plan_id}
    }), 200


@nutrition_bp.route("/my-plan", methods=["GET"])
@token_required
def get_my_nutrition_plan():
    from app.models.user import UserProfile
    profile = UserProfile.query.filter_by(user_id=g.current_user.id).first()
    
    if not profile or not profile.nutrition_plan_id:
        return jsonify({
            "success": True,
            "message": "No nutrition plan assigned",
            "data": {"plan": None}
        }), 200

    plan = NutritionService.get_plan_by_id(profile.nutrition_plan_id)
    if not plan or not plan.is_active:
        return jsonify({
            "success": True,
            "message": "Assigned plan is not active or not found",
            "data": {"plan": None}
        }), 200

    return jsonify({
        "success": True,
        "message": "Assigned nutrition plan retrieved successfully",
        "data": {"plan": plan.to_dict(include_meals=True)}
    }), 200
