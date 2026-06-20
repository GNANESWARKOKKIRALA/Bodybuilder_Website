"""
Gnaneswar Fitness Platform - Workout Routes
API endpoints for exercise catalog, workout programs, and client logging.
"""

from datetime import datetime
from flask import Blueprint, request, jsonify, g, current_app
from app.services.workout_service import WorkoutService
from app.middleware.auth_middleware import token_required, admin_required, client_or_admin_required

workouts_bp = Blueprint("workouts", __name__)


# ──── Exercise Catalog Endpoints ────

@workouts_bp.route("/exercises", methods=["GET"])
@token_required
def get_exercises():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))
    muscle_group = request.args.get("muscle_group")
    difficulty = request.args.get("difficulty")
    search = request.args.get("search")

    result = WorkoutService.get_exercises(
        page=page,
        per_page=per_page,
        muscle_group=muscle_group,
        difficulty=difficulty,
        search=search
    )
    return jsonify({"success": True, "message": "Exercises retrieved", "data": result}), 200


@workouts_bp.route("/exercises/<int:exercise_id>", methods=["GET"])
@token_required
def get_exercise_detail(exercise_id):
    exercise = WorkoutService.get_exercise_by_id(exercise_id)
    if not exercise:
        return jsonify({"success": False, "message": "Exercise not found", "data": None}), 404
    return jsonify({"success": True, "message": "Exercise detail retrieved", "data": {"exercise": exercise.to_dict()}}), 200


@workouts_bp.route("/exercises", methods=["POST"])
@admin_required
def create_exercise():
    data = request.get_json() or {}
    if not data.get("name") or not data.get("muscle_group"):
        return jsonify({"success": False, "message": "Name and muscle group are required", "data": None}), 400

    exercise = WorkoutService.create_exercise(data)
    return jsonify({"success": True, "message": "Exercise created successfully", "data": {"exercise": exercise.to_dict()}}), 201


@workouts_bp.route("/exercises/<int:exercise_id>", methods=["PUT"])
@admin_required
def update_exercise(exercise_id):
    data = request.get_json() or {}
    exercise = WorkoutService.update_exercise(exercise_id, data)
    if not exercise:
        return jsonify({"success": False, "message": "Exercise not found", "data": None}), 404
    return jsonify({"success": True, "message": "Exercise updated successfully", "data": {"exercise": exercise.to_dict()}}), 200


# ──── Workout Program Endpoints ────

@workouts_bp.route("/programs", methods=["GET"])
@token_required
def get_programs():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))
    difficulty = request.args.get("difficulty")
    goal = request.args.get("goal")

    result = WorkoutService.get_programs(
        page=page,
        per_page=per_page,
        difficulty=difficulty,
        goal=goal
    )
    return jsonify({"success": True, "message": "Programs retrieved", "data": result}), 200


@workouts_bp.route("/programs/<int:program_id>", methods=["GET"])
@token_required
def get_program_detail(program_id):
    program = WorkoutService.get_program_by_id(program_id)
    if not program:
        return jsonify({"success": False, "message": "Program not found", "data": None}), 404
    return jsonify({"success": True, "message": "Program detail retrieved", "data": {"program": program.to_dict(include_days=True)}}), 200


@workouts_bp.route("/programs", methods=["POST"])
@admin_required
def create_program():
    data = request.get_json() or {}
    if not data.get("name") or not data.get("difficulty"):
        return jsonify({"success": False, "message": "Name and difficulty level are required", "data": None}), 400

    program = WorkoutService.create_program(data, created_by=g.current_user.id)
    return jsonify({"success": True, "message": "Workout program created successfully", "data": {"program": program.to_dict(include_days=True)}}), 201


@workouts_bp.route("/programs/<int:program_id>", methods=["PUT"])
@admin_required
def update_program(program_id):
    data = request.get_json() or {}
    program = WorkoutService.update_program(program_id, data)
    if not program:
        return jsonify({"success": False, "message": "Workout program not found", "data": None}), 404
    return jsonify({"success": True, "message": "Workout program updated successfully", "data": {"program": program.to_dict(include_days=True)}}), 200


@workouts_bp.route("/programs/<int:program_id>", methods=["DELETE"])
@admin_required
def delete_program(program_id):
    success = WorkoutService.delete_program(program_id)
    if not success:
        return jsonify({"success": False, "message": "Workout program not found", "data": None}), 404
    return jsonify({"success": True, "message": "Workout program deleted successfully", "data": None}), 200


# ──── Workout Logs Endpoints ────

@workouts_bp.route("/logs", methods=["POST"])
@token_required
def log_workout_entry():
    data = request.get_json() or {}
    if not data.get("exercise_id") or not data.get("sets_completed") or not data.get("workout_date"):
        return jsonify({"success": False, "message": "Exercise ID, sets completed, and date are required", "data": None}), 400

    try:
        data["workout_date"] = datetime.strptime(data["workout_date"], "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Date format must be YYYY-MM-DD", "data": None}), 400

    log = WorkoutService.log_workout(g.current_user.id, data)
    return jsonify({"success": True, "message": "Workout entry logged successfully", "data": {"log": log.to_dict()}}), 201


@workouts_bp.route("/logs", methods=["GET"])
@token_required
def get_workout_logs():
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

    result = WorkoutService.get_user_logs(
        user_id=g.current_user.id,
        page=page,
        per_page=per_page,
        start_date=start_date,
        end_date=end_date
    )
    return jsonify({"success": True, "message": "Workout logs retrieved", "data": result}), 200


@workouts_bp.route("/logs/<int:log_id>", methods=["DELETE"])
@token_required
def delete_workout_log_entry(log_id):
    success = WorkoutService.delete_workout_log(log_id, g.current_user.id)
    if not success:
        return jsonify({"success": False, "message": "Workout log entry not found or unauthorized", "data": None}), 404
    return jsonify({"success": True, "message": "Workout log entry deleted successfully", "data": None}), 200


@workouts_bp.route("/summary", methods=["GET"])
@token_required
def get_workout_summary_stats():
    days = int(request.args.get("days", 30))
    summary = WorkoutService.get_workout_summary(g.current_user.id, days)
    return jsonify({"success": True, "message": "Workout summary stats retrieved", "data": summary}), 200


@workouts_bp.route("/assign", methods=["POST"])
@admin_required
def assign_workout_program():
    data = request.get_json() or {}
    user_id = data.get("userId") or data.get("user_id")
    program_id = data.get("programId") or data.get("program_id")

    if not user_id:
        return jsonify({"success": False, "message": "User ID is required", "data": None}), 400

    from app.models.user import UserProfile
    profile = UserProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"success": False, "message": "User profile not found", "data": None}), 404

    profile.workout_program_id = program_id
    db.session.commit()

    return jsonify({
        "success": True, 
        "message": f"Workout program {'assigned successfully' if program_id else 'removed successfully'}", 
        "data": {"workout_program_id": program_id}
    }), 200


@workouts_bp.route("/my-program", methods=["GET"])
@token_required
def get_my_workout_program():
    from app.models.user import UserProfile
    profile = UserProfile.query.filter_by(user_id=g.current_user.id).first()
    
    if not profile or not profile.workout_program_id:
        return jsonify({
            "success": True,
            "message": "No workout program assigned",
            "data": {"program": None}
        }), 200

    program = WorkoutService.get_program_by_id(profile.workout_program_id)
    if not program or not program.is_active:
        return jsonify({
            "success": True,
            "message": "Assigned program is not active or not found",
            "data": {"program": None}
        }), 200

    return jsonify({
        "success": True,
        "message": "Assigned workout program retrieved successfully",
        "data": {"program": program.to_dict(include_days=True)}
    }), 200
