"""
Gnaneswar Fitness Platform - Workout Service
Business logic for workout programs, exercises, and logging.
"""

from datetime import datetime, timezone
from app.extensions import db
from app.models.workout import (
    Exercise, WorkoutProgram, WorkoutDay, WorkoutExercise, WorkoutLog,
)


class WorkoutService:
    """Service for workout program management and exercise logging."""

    # ──── Exercises ────

    @staticmethod
    def get_exercises(
        page: int = 1,
        per_page: int = 20,
        muscle_group: str | None = None,
        difficulty: str | None = None,
        search: str | None = None,
    ) -> dict:
        query = Exercise.query.filter_by(is_active=True)
        if muscle_group:
            query = query.filter(Exercise.muscle_group == muscle_group)
        if difficulty:
            query = query.filter(Exercise.difficulty == difficulty)
        if search:
            query = query.filter(Exercise.name.ilike(f"%{search}%"))
        query = query.order_by(Exercise.muscle_group, Exercise.name)
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [e.to_dict() for e in pagination.items],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_pages": pagination.pages,
                "total_items": pagination.total,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev,
            },
        }

    @staticmethod
    def get_exercise_by_id(exercise_id: int) -> Exercise | None:
        return Exercise.query.get(exercise_id)

    @staticmethod
    def create_exercise(data: dict) -> Exercise:
        exercise = Exercise(**data)
        db.session.add(exercise)
        db.session.commit()
        return exercise

    @staticmethod
    def update_exercise(exercise_id: int, data: dict) -> Exercise | None:
        exercise = Exercise.query.get(exercise_id)
        if not exercise:
            return None
        for key, value in data.items():
            if hasattr(exercise, key) and value is not None:
                setattr(exercise, key, value)
        db.session.commit()
        return exercise

    # ──── Programs ────

    @staticmethod
    def get_programs(
        page: int = 1,
        per_page: int = 20,
        difficulty: str | None = None,
        goal: str | None = None,
    ) -> dict:
        query = WorkoutProgram.query.filter_by(is_active=True)
        if difficulty:
            query = query.filter(WorkoutProgram.difficulty == difficulty)
        if goal:
            query = query.filter(WorkoutProgram.goal == goal)
        query = query.order_by(WorkoutProgram.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [p.to_dict(include_days=False) for p in pagination.items],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_pages": pagination.pages,
                "total_items": pagination.total,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev,
            },
        }

    @staticmethod
    def get_program_by_id(program_id: int) -> WorkoutProgram | None:
        return WorkoutProgram.query.get(program_id)

    @staticmethod
    def create_program(data: dict, created_by: int) -> WorkoutProgram:
        days_data = data.pop("days", [])
        program = WorkoutProgram(created_by=created_by, **data)
        db.session.add(program)
        db.session.flush()

        for day_data in days_data:
            exercises_data = day_data.pop("exercises", [])
            day = WorkoutDay(program_id=program.id, **day_data)
            db.session.add(day)
            db.session.flush()
            for idx, ex_data in enumerate(exercises_data):
                ex_data["order_index"] = idx
                we = WorkoutExercise(workout_day_id=day.id, **ex_data)
                db.session.add(we)

        db.session.commit()
        return program

    @staticmethod
    def update_program(program_id: int, data: dict) -> WorkoutProgram | None:
        program = WorkoutProgram.query.get(program_id)
        if not program:
            return None
        for key in ("name", "description", "difficulty", "duration_weeks", "goal", "image_url", "is_active"):
            if key in data and data[key] is not None:
                setattr(program, key, data[key])
        db.session.commit()
        return program

    @staticmethod
    def delete_program(program_id: int) -> bool:
        program = WorkoutProgram.query.get(program_id)
        if not program:
            return False
        db.session.delete(program)
        db.session.commit()
        return True

    # ──── Workout Logs ────

    @staticmethod
    def log_workout(user_id: int, data: dict) -> WorkoutLog:
        log = WorkoutLog(user_id=user_id, **data)
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_user_logs(
        user_id: int,
        page: int = 1,
        per_page: int = 20,
        start_date=None,
        end_date=None,
    ) -> dict:
        query = WorkoutLog.query.filter_by(user_id=user_id)
        if start_date:
            query = query.filter(WorkoutLog.workout_date >= start_date)
        if end_date:
            query = query.filter(WorkoutLog.workout_date <= end_date)
        query = query.order_by(WorkoutLog.workout_date.desc(), WorkoutLog.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [l.to_dict() for l in pagination.items],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_pages": pagination.pages,
                "total_items": pagination.total,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev,
            },
        }

    @staticmethod
    def delete_workout_log(log_id: int, user_id: int) -> bool:
        log = WorkoutLog.query.filter_by(id=log_id, user_id=user_id).first()
        if not log:
            return False
        db.session.delete(log)
        db.session.commit()
        return True

    @staticmethod
    def get_workout_summary(user_id: int, days: int = 30) -> dict:
        """Get workout summary stats for the last N days."""
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc).date() - timedelta(days=days)
        logs = WorkoutLog.query.filter(
            WorkoutLog.user_id == user_id,
            WorkoutLog.workout_date >= cutoff,
        ).all()

        total_workouts = len(logs)
        total_sets = sum(l.sets_completed for l in logs)
        total_calories = sum(l.calories_burned or 0 for l in logs)
        unique_dates = len(set(l.workout_date for l in logs))
        muscle_groups = {}
        for l in logs:
            if l.exercise:
                mg = l.exercise.muscle_group
                muscle_groups[mg] = muscle_groups.get(mg, 0) + 1

        return {
            "period_days": days,
            "total_workout_entries": total_workouts,
            "unique_workout_days": unique_dates,
            "total_sets": total_sets,
            "total_calories_burned": round(total_calories, 1),
            "muscle_group_distribution": muscle_groups,
        }
