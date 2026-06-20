"""
Gnaneswar Fitness Platform - Workout Models
Models for workout programs, days, exercises, and logging.
"""

from datetime import datetime, timezone
from app.extensions import db


class Exercise(db.Model):
    """Master catalog of exercises."""
    __tablename__ = "exercises"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    muscle_group = db.Column(db.Enum("chest", "back", "shoulders", "arms", "legs", "core", "full_body", "cardio", name="muscle_group_type"), nullable=False, index=True)
    equipment = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    instructions = db.Column(db.Text, nullable=True)
    video_url = db.Column(db.String(500), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    difficulty = db.Column(db.Enum("beginner", "intermediate", "advanced", name="exercise_difficulty"), default="beginner", nullable=False)
    calories_per_rep = db.Column(db.Float, default=0.0, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    workout_exercises = db.relationship("WorkoutExercise", backref="exercise", cascade="all, delete-orphan", lazy="dynamic")
    workout_logs = db.relationship("WorkoutLog", backref="exercise", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "muscle_group": self.muscle_group,
            "equipment": self.equipment,
            "description": self.description,
            "instructions": self.instructions,
            "video_url": self.video_url,
            "image_url": self.image_url,
            "difficulty": self.difficulty,
            "calories_per_rep": self.calories_per_rep,
            "is_active": self.is_active,
        }

    def __repr__(self) -> str:
        return f"<Exercise {self.name}>"


class WorkoutProgram(db.Model):
    """A named workout program (e.g., Beginner Strength)."""
    __tablename__ = "workout_programs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.Enum("beginner", "intermediate", "advanced", name="program_difficulty"), nullable=False)
    duration_weeks = db.Column(db.Integer, default=4, nullable=False)
    goal = db.Column(db.Enum("weight_loss", "muscle_gain", "maintenance", "endurance", "general_fitness", name="program_goal"), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    days = db.relationship("WorkoutDay", backref="program", cascade="all, delete-orphan", lazy="joined", order_by="WorkoutDay.day_number")

    def to_dict(self, include_days: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "difficulty": self.difficulty,
            "duration_weeks": self.duration_weeks,
            "goal": self.goal,
            "image_url": self.image_url,
            "is_active": self.is_active,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_days:
            data["days"] = [day.to_dict(include_exercises=True) for day in self.days]
        return data

    def __repr__(self) -> str:
        return f"<WorkoutProgram {self.name}>"


class WorkoutDay(db.Model):
    """A single day within a workout program."""
    __tablename__ = "workout_days"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    program_id = db.Column(db.Integer, db.ForeignKey("workout_programs.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    focus_area = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)

    # Relationships
    exercises = db.relationship("WorkoutExercise", backref="workout_day", cascade="all, delete-orphan", lazy="joined", order_by="WorkoutExercise.order_index")

    __table_args__ = (
        db.UniqueConstraint("program_id", "day_number", name="uq_program_day"),
    )

    def to_dict(self, include_exercises: bool = False) -> dict:
        data = {
            "id": self.id,
            "program_id": self.program_id,
            "day_number": self.day_number,
            "name": self.name,
            "focus_area": self.focus_area,
            "notes": self.notes,
        }
        if include_exercises:
            data["exercises"] = [we.to_dict() for we in self.exercises]
        return data

    def __repr__(self) -> str:
        return f"<WorkoutDay {self.name}>"


class WorkoutExercise(db.Model):
    """Junction table linking exercises to workout days with prescription."""
    __tablename__ = "workout_exercises"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    workout_day_id = db.Column(db.Integer, db.ForeignKey("workout_days.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    sets = db.Column(db.Integer, default=3, nullable=False)
    reps = db.Column(db.String(50), default="10", nullable=False)  # e.g., "8-12" or "AMRAP"
    rest_seconds = db.Column(db.Integer, default=60, nullable=False)
    order_index = db.Column(db.Integer, default=0, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    superset_group = db.Column(db.Integer, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "workout_day_id": self.workout_day_id,
            "exercise_id": self.exercise_id,
            "exercise": self.exercise.to_dict() if self.exercise else None,
            "sets": self.sets,
            "reps": self.reps,
            "rest_seconds": self.rest_seconds,
            "order_index": self.order_index,
            "notes": self.notes,
            "superset_group": self.superset_group,
        }

    def __repr__(self) -> str:
        return f"<WorkoutExercise day={self.workout_day_id} ex={self.exercise_id}>"


class WorkoutLog(db.Model):
    """Tracks a user's actual workout performance."""
    __tablename__ = "workout_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    workout_date = db.Column(db.Date, nullable=False, index=True)
    sets_completed = db.Column(db.Integer, nullable=False)
    reps_completed = db.Column(db.String(200), nullable=True)  # JSON string: [12,10,8]
    weight_kg = db.Column(db.Float, nullable=True)
    duration_minutes = db.Column(db.Integer, nullable=True)
    calories_burned = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Integer, nullable=True)  # 1-5 difficulty rating
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "exercise_id": self.exercise_id,
            "exercise_name": self.exercise.name if self.exercise else None,
            "workout_date": self.workout_date.isoformat() if self.workout_date else None,
            "sets_completed": self.sets_completed,
            "reps_completed": self.reps_completed,
            "weight_kg": self.weight_kg,
            "duration_minutes": self.duration_minutes,
            "calories_burned": self.calories_burned,
            "notes": self.notes,
            "rating": self.rating,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<WorkoutLog user={self.user_id} date={self.workout_date}>"
