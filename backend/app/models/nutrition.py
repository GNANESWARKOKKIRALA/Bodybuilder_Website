"""
Gnaneswar Fitness Platform - Nutrition Models
Models for nutrition plans, meals, and dietary tracking.
"""

from datetime import datetime, timezone
from app.extensions import db


class NutritionPlan(db.Model):
    """A structured nutrition / meal plan."""
    __tablename__ = "nutrition_plans"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    goal = db.Column(db.Enum("weight_loss", "muscle_gain", "maintenance", "endurance", name="nutrition_goal"), nullable=True)
    daily_calories = db.Column(db.Integer, nullable=True)
    protein_grams = db.Column(db.Float, nullable=True)
    carbs_grams = db.Column(db.Float, nullable=True)
    fat_grams = db.Column(db.Float, nullable=True)
    diet_type = db.Column(db.Enum("vegetarian", "non_vegetarian", "vegan", "eggetarian", name="plan_diet_type"), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    meals = db.relationship("Meal", backref="plan", cascade="all, delete-orphan", lazy="joined", order_by="Meal.meal_order")

    def to_dict(self, include_meals: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "goal": self.goal,
            "daily_calories": self.daily_calories,
            "protein_grams": self.protein_grams,
            "carbs_grams": self.carbs_grams,
            "fat_grams": self.fat_grams,
            "diet_type": self.diet_type,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_meals:
            data["meals"] = [m.to_dict() for m in self.meals]
        return data

    def __repr__(self) -> str:
        return f"<NutritionPlan {self.name}>"


class Meal(db.Model):
    """Individual meal within a nutrition plan."""
    __tablename__ = "meals"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("nutrition_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    meal_type = db.Column(db.Enum("breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner", "evening_snack", name="meal_type_enum"), nullable=False)
    meal_order = db.Column(db.Integer, default=0, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    foods = db.Column(db.Text, nullable=True)  # JSON list of food items
    calories = db.Column(db.Integer, nullable=True)
    protein_grams = db.Column(db.Float, nullable=True)
    carbs_grams = db.Column(db.Float, nullable=True)
    fat_grams = db.Column(db.Float, nullable=True)
    time_suggestion = db.Column(db.String(50), nullable=True)  # e.g., "7:00 AM"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "plan_id": self.plan_id,
            "meal_type": self.meal_type,
            "meal_order": self.meal_order,
            "name": self.name,
            "description": self.description,
            "foods": self.foods,
            "calories": self.calories,
            "protein_grams": self.protein_grams,
            "carbs_grams": self.carbs_grams,
            "fat_grams": self.fat_grams,
            "time_suggestion": self.time_suggestion,
        }

    def __repr__(self) -> str:
        return f"<Meal {self.name}>"


class NutritionLog(db.Model):
    """Daily nutrition tracking entry."""
    __tablename__ = "nutrition_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    log_date = db.Column(db.Date, nullable=False, index=True)
    meal_type = db.Column(db.Enum("breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner", "evening_snack", name="log_meal_type"), nullable=False)
    food_items = db.Column(db.Text, nullable=False)
    calories = db.Column(db.Integer, nullable=True)
    protein_grams = db.Column(db.Float, nullable=True)
    carbs_grams = db.Column(db.Float, nullable=True)
    fat_grams = db.Column(db.Float, nullable=True)
    water_ml = db.Column(db.Integer, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "log_date": self.log_date.isoformat() if self.log_date else None,
            "meal_type": self.meal_type,
            "food_items": self.food_items,
            "calories": self.calories,
            "protein_grams": self.protein_grams,
            "carbs_grams": self.carbs_grams,
            "fat_grams": self.fat_grams,
            "water_ml": self.water_ml,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<NutritionLog user={self.user_id} date={self.log_date}>"
