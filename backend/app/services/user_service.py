"""
Gnaneswar Fitness Platform - User Service
User profile management, search, and admin user operations.
"""

from datetime import datetime, timezone
from app.extensions import db
from app.models.user import User, UserProfile


class UserService:
    """Service for user CRUD, profile updates, and admin operations."""

    @staticmethod
    def get_user_by_id(user_id: int) -> User | None:
        return User.query.get(user_id)

    @staticmethod
    def get_user_by_email(email: str) -> User | None:
        return User.query.filter_by(email=email.lower().strip()).first()

    @staticmethod
    def get_all_users(page: int = 1, per_page: int = 20, role: str | None = None, search: str | None = None, is_active: bool | None = None):
        """Get paginated list of users with optional filters."""
        query = User.query

        if role:
            query = query.filter(User.role == role)

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.phone.ilike(search_term),
                )
            )

        query = query.order_by(User.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "items": [u.to_dict(include_profile=True) for u in pagination.items],
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
    def update_user(user: User, data: dict) -> User:
        """Update basic user fields."""
        for field in ("first_name", "last_name", "phone"):
            if field in data and data[field] is not None:
                setattr(user, field, data[field])
        db.session.commit()
        return user

    @staticmethod
    def update_profile(user: User, data: dict) -> UserProfile:
        """Update extended profile fields."""
        profile = user.profile
        if not profile:
            profile = UserProfile(user_id=user.id)
            db.session.add(profile)

        profile_fields = [
            "date_of_birth", "gender", "height_cm", "weight_kg", "target_weight_kg",
            "fitness_goal", "experience_level", "medical_conditions",
            "dietary_preferences", "activity_level", "bio", "instagram_handle",
        ]
        for field in profile_fields:
            if field in data and data[field] is not None:
                setattr(profile, field, data[field])

        db.session.commit()
        return profile

    @staticmethod
    def update_avatar(user: User, avatar_url: str) -> User:
        """Update user avatar URL."""
        user.avatar_url = avatar_url
        db.session.commit()
        return user

    @staticmethod
    def toggle_active(user_id: int) -> tuple[User | None, str]:
        """Activate or deactivate a user account. Owner admin cannot be deactivated."""
        user = User.query.get(user_id)
        if not user:
            return None, "User not found"
        # Protect owner admin from self-deactivation
        if user.email == "gapbodybuilder@gmail.com":
            return None, "The platform owner account cannot be deactivated"
        user.is_active = not user.is_active
        db.session.commit()
        state = "activated" if user.is_active else "deactivated"
        return user, f"User {state} successfully"

    @staticmethod
    def change_role(user_id: int, new_role: str) -> tuple[User | None, str]:
        """Change user role (admin only)."""
        if new_role not in ("admin", "client", "lead"):
            return None, "Invalid role"
        user = User.query.get(user_id)
        if not user:
            return None, "User not found"
        user.role = new_role
        db.session.commit()
        return user, f"User role changed to {new_role}"

    @staticmethod
    def delete_user(user_id: int) -> tuple[bool, str]:
        """Permanently delete a user account. Owner admin cannot be deleted."""
        user = User.query.get(user_id)
        if not user:
            return False, "User not found"
        if user.email == "gapbodybuilder@gmail.com":
            return False, "The platform owner account cannot be deleted"
        db.session.delete(user)
        db.session.commit()
        return True, "User deleted successfully"

    @staticmethod
    def get_dashboard_stats(user: User) -> dict:
        """Get dashboard statistics for a user."""
        from app.models.workout import WorkoutLog
        from app.models.nutrition import NutritionLog
        from app.models.booking import Appointment
        from app.models.progress import ProgressEntry
        from app.models.community import UserBadge

        total_workouts = WorkoutLog.query.filter_by(user_id=user.id).count()
        total_nutrition_logs = NutritionLog.query.filter_by(user_id=user.id).count()
        upcoming_appointments = Appointment.query.filter(
            Appointment.user_id == user.id,
            Appointment.status.in_(["pending", "confirmed"]),
            Appointment.appointment_date >= datetime.now(timezone.utc).date(),
        ).count()
        progress_entries = ProgressEntry.query.filter_by(user_id=user.id).count()
        badges_earned = UserBadge.query.filter_by(user_id=user.id).count()

        latest_progress = ProgressEntry.query.filter_by(user_id=user.id).order_by(
            ProgressEntry.entry_date.desc()
        ).first()

        return {
            "total_workouts": total_workouts,
            "total_nutrition_logs": total_nutrition_logs,
            "upcoming_appointments": upcoming_appointments,
            "progress_entries": progress_entries,
            "badges_earned": badges_earned,
            "latest_weight": latest_progress.weight_kg if latest_progress else (user.profile.weight_kg if user.profile else None),
        }
