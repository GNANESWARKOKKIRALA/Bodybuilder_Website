"""
Gnaneswar Fitness Platform - Validators
Marshmallow schemas and custom validation utilities.
"""

import re
from marshmallow import Schema, fields, validate, validates, ValidationError


# ──── Regex patterns ────

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
PHONE_REGEX = re.compile(r"^\+?[0-9]{7,15}$")


def validate_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email))


def validate_phone(phone: str) -> bool:
    if not phone:
        return True  # phone is optional
    return bool(PHONE_REGEX.match(phone))


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets minimum requirements."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"
    return True, "Password is strong"


# ──── Marshmallow Schemas ────

class RegisterSchema(Schema):
    email = fields.Email(required=True, error_messages={"required": "Email is required"})
    password = fields.Str(required=True, validate=validate.Length(min=8, max=128))
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    phone = fields.Str(validate=validate.Length(max=20), load_default=None)

    @validates("password")
    def check_password_strength(self, value):
        ok, msg = validate_password_strength(value)
        if not ok:
            raise ValidationError(msg)


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class ProfileUpdateSchema(Schema):
    first_name = fields.Str(validate=validate.Length(min=1, max=100))
    last_name = fields.Str(validate=validate.Length(min=1, max=100))
    phone = fields.Str(validate=validate.Length(max=20))
    date_of_birth = fields.Date()
    gender = fields.Str(validate=validate.OneOf(["male", "female", "other"]))
    height_cm = fields.Float(validate=validate.Range(min=50, max=300))
    weight_kg = fields.Float(validate=validate.Range(min=20, max=500))
    target_weight_kg = fields.Float(validate=validate.Range(min=20, max=500))
    fitness_goal = fields.Str(validate=validate.OneOf(["weight_loss", "muscle_gain", "maintenance", "endurance", "flexibility", "general_fitness"]))
    experience_level = fields.Str(validate=validate.OneOf(["beginner", "intermediate", "advanced"]))
    medical_conditions = fields.Str(validate=validate.Length(max=2000))
    dietary_preferences = fields.Str(validate=validate.OneOf(["vegetarian", "non_vegetarian", "vegan", "eggetarian"]))
    activity_level = fields.Str(validate=validate.OneOf(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]))
    bio = fields.Str(validate=validate.Length(max=1000))
    instagram_handle = fields.Str(validate=validate.Length(max=100))


class WorkoutLogSchema(Schema):
    exercise_id = fields.Int(required=True)
    workout_date = fields.Date(required=True)
    sets_completed = fields.Int(required=True, validate=validate.Range(min=1, max=100))
    reps_completed = fields.Str(validate=validate.Length(max=200))
    weight_kg = fields.Float(validate=validate.Range(min=0, max=1000))
    duration_minutes = fields.Int(validate=validate.Range(min=0, max=600))
    calories_burned = fields.Float(validate=validate.Range(min=0))
    notes = fields.Str(validate=validate.Length(max=1000))
    rating = fields.Int(validate=validate.Range(min=1, max=5))


class NutritionLogSchema(Schema):
    log_date = fields.Date(required=True)
    meal_type = fields.Str(required=True, validate=validate.OneOf(["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner", "evening_snack"]))
    food_items = fields.Str(required=True, validate=validate.Length(min=1, max=2000))
    calories = fields.Int(validate=validate.Range(min=0, max=10000))
    protein_grams = fields.Float(validate=validate.Range(min=0, max=1000))
    carbs_grams = fields.Float(validate=validate.Range(min=0, max=1000))
    fat_grams = fields.Float(validate=validate.Range(min=0, max=1000))
    water_ml = fields.Int(validate=validate.Range(min=0, max=10000))
    notes = fields.Str(validate=validate.Length(max=1000))


class AppointmentSchema(Schema):
    appointment_date = fields.Date(required=True)
    start_time = fields.Time(required=True)
    end_time = fields.Time(required=True)
    appointment_type = fields.Str(validate=validate.OneOf(["consultation", "training", "assessment", "follow_up"]), load_default="training")
    time_slot_id = fields.Int()
    notes = fields.Str(validate=validate.Length(max=1000))


class ProgressEntrySchema(Schema):
    entry_date = fields.Date(required=True)
    weight_kg = fields.Float(validate=validate.Range(min=20, max=500))
    body_fat_percentage = fields.Float(validate=validate.Range(min=1, max=60))
    chest_cm = fields.Float(validate=validate.Range(min=30, max=200))
    waist_cm = fields.Float(validate=validate.Range(min=30, max=200))
    hips_cm = fields.Float(validate=validate.Range(min=30, max=200))
    biceps_cm = fields.Float(validate=validate.Range(min=10, max=80))
    thighs_cm = fields.Float(validate=validate.Range(min=20, max=120))
    calves_cm = fields.Float(validate=validate.Range(min=15, max=80))
    neck_cm = fields.Float(validate=validate.Range(min=20, max=60))
    shoulders_cm = fields.Float(validate=validate.Range(min=50, max=200))
    notes = fields.Str(validate=validate.Length(max=1000))
    energy_level = fields.Int(validate=validate.Range(min=1, max=10))
    sleep_hours = fields.Float(validate=validate.Range(min=0, max=24))


class BlogPostSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=3, max=300))
    content = fields.Str(required=True, validate=validate.Length(min=10))
    excerpt = fields.Str(validate=validate.Length(max=500))
    category_id = fields.Int()
    tags = fields.Str(validate=validate.Length(max=500))
    status = fields.Str(validate=validate.OneOf(["draft", "published", "archived"]))
    is_featured = fields.Bool()


class ContactSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=200))
    email = fields.Email(required=True)
    phone = fields.Str(validate=validate.Length(max=20))
    subject = fields.Str(required=True, validate=validate.Length(min=3, max=300))
    message = fields.Str(required=True, validate=validate.Length(min=10, max=5000))


class ForumPostSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=3, max=300))
    content = fields.Str(required=True, validate=validate.Length(min=5))
    category = fields.Str(validate=validate.OneOf(["general", "workout", "nutrition", "motivation", "progress", "question"]), load_default="general")


class ForumReplySchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000))


class PasswordChangeSchema(Schema):
    current_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8, max=128))

    @validates("new_password")
    def check_password_strength(self, value):
        ok, msg = validate_password_strength(value)
        if not ok:
            raise ValidationError(msg)
