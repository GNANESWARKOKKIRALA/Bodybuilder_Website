"""
Gnaneswar Fitness Platform - User Models
User account and profile models with authentication support.
"""

from datetime import datetime, timezone
from app.extensions import db


class User(db.Model):
    """Core user account model with authentication fields."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.Enum("admin", "client", "lead", name="user_role"), default="lead", nullable=False, index=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    profile = db.relationship("UserProfile", backref="user", uselist=False, cascade="all, delete-orphan", lazy="joined")
    workout_logs = db.relationship("WorkoutLog", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    nutrition_logs = db.relationship("NutritionLog", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    appointments = db.relationship("Appointment", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    payments = db.relationship("Payment", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    subscriptions = db.relationship("Subscription", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    progress_entries = db.relationship("ProgressEntry", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    notifications = db.relationship("Notification", backref="user", cascade="all, delete-orphan", lazy="dynamic")
    forum_posts = db.relationship("ForumPost", backref="author", cascade="all, delete-orphan", lazy="dynamic")
    forum_replies = db.relationship("ForumReply", backref="author", cascade="all, delete-orphan", lazy="dynamic")
    badges = db.relationship("UserBadge", backref="user", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self, include_profile: bool = False) -> dict:
        data = {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": f"{self.first_name} {self.last_name}",
            "phone": self.phone,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "is_active": self.is_active,
            "email_verified": self.email_verified,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_profile and self.profile:
            data["profile"] = self.profile.to_dict()
        return data

    def __repr__(self) -> str:
        return f"<User {self.email}>"


class UserProfile(db.Model):
    """Extended user profile with fitness-specific data."""
    __tablename__ = "user_profiles"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.Enum("male", "female", "other", name="gender_type"), nullable=True)
    height_cm = db.Column(db.Float, nullable=True)
    weight_kg = db.Column(db.Float, nullable=True)
    target_weight_kg = db.Column(db.Float, nullable=True)
    fitness_goal = db.Column(db.Enum("weight_loss", "muscle_gain", "maintenance", "endurance", "flexibility", "general_fitness", name="fitness_goal_type"), nullable=True)
    experience_level = db.Column(db.Enum("beginner", "intermediate", "advanced", name="experience_level_type"), nullable=True)
    medical_conditions = db.Column(db.Text, nullable=True)
    dietary_preferences = db.Column(db.Enum("vegetarian", "non_vegetarian", "vegan", "eggetarian", name="diet_type"), nullable=True)
    activity_level = db.Column(db.Enum("sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active", name="activity_level_type"), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    instagram_handle = db.Column(db.String(100), nullable=True)
    workout_program_id = db.Column(db.Integer, db.ForeignKey("workout_programs.id", ondelete="SET NULL"), nullable=True)
    nutrition_plan_id = db.Column(db.Integer, db.ForeignKey("nutrition_plans.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "gender": self.gender,
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "target_weight_kg": self.target_weight_kg,
            "fitness_goal": self.fitness_goal,
            "experience_level": self.experience_level,
            "medical_conditions": self.medical_conditions,
            "dietary_preferences": self.dietary_preferences,
            "activity_level": self.activity_level,
            "bio": self.bio,
            "instagram_handle": self.instagram_handle,
            "workout_program_id": self.workout_program_id,
            "nutrition_plan_id": self.nutrition_plan_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<UserProfile user_id={self.user_id}>"
