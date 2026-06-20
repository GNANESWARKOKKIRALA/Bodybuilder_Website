"""
Gnaneswar Fitness Platform - Nutrition Service
Business logic for nutrition plans and dietary logging.
"""

from app.extensions import db
from app.models.nutrition import NutritionPlan, Meal, NutritionLog


class NutritionService:
    """Service for nutrition plan management and food logging."""

    # ──── Nutrition Plans ────

    @staticmethod
    def get_plans(page: int = 1, per_page: int = 20, goal: str | None = None, diet_type: str | None = None) -> dict:
        query = NutritionPlan.query.filter_by(is_active=True)
        if goal:
            query = query.filter(NutritionPlan.goal == goal)
        if diet_type:
            query = query.filter(NutritionPlan.diet_type == diet_type)
        query = query.order_by(NutritionPlan.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [p.to_dict(include_meals=False) for p in pagination.items],
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
    def get_plan_by_id(plan_id: int) -> NutritionPlan | None:
        return NutritionPlan.query.get(plan_id)

    @staticmethod
    def create_plan(data: dict, created_by: int) -> NutritionPlan:
        meals_data = data.pop("meals", [])
        plan = NutritionPlan(created_by=created_by, **data)
        db.session.add(plan)
        db.session.flush()
        for idx, meal_data in enumerate(meals_data):
            meal_data["meal_order"] = idx
            meal = Meal(plan_id=plan.id, **meal_data)
            db.session.add(meal)
        db.session.commit()
        return plan

    @staticmethod
    def update_plan(plan_id: int, data: dict) -> NutritionPlan | None:
        plan = NutritionPlan.query.get(plan_id)
        if not plan:
            return None
        for key in ("name", "description", "goal", "daily_calories", "protein_grams", "carbs_grams", "fat_grams", "diet_type", "is_active"):
            if key in data and data[key] is not None:
                setattr(plan, key, data[key])
        db.session.commit()
        return plan

    @staticmethod
    def delete_plan(plan_id: int) -> bool:
        plan = NutritionPlan.query.get(plan_id)
        if not plan:
            return False
        db.session.delete(plan)
        db.session.commit()
        return True

    # ──── Nutrition Logs ────

    @staticmethod
    def log_nutrition(user_id: int, data: dict) -> NutritionLog:
        log = NutritionLog(user_id=user_id, **data)
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_user_logs(user_id: int, page: int = 1, per_page: int = 20, start_date=None, end_date=None) -> dict:
        query = NutritionLog.query.filter_by(user_id=user_id)
        if start_date:
            query = query.filter(NutritionLog.log_date >= start_date)
        if end_date:
            query = query.filter(NutritionLog.log_date <= end_date)
        query = query.order_by(NutritionLog.log_date.desc(), NutritionLog.created_at.desc())
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
    def delete_nutrition_log(log_id: int, user_id: int) -> bool:
        log = NutritionLog.query.filter_by(id=log_id, user_id=user_id).first()
        if not log:
            return False
        db.session.delete(log)
        db.session.commit()
        return True

    @staticmethod
    def get_daily_summary(user_id: int, date) -> dict:
        """Get nutrition summary for a specific date."""
        logs = NutritionLog.query.filter_by(user_id=user_id, log_date=date).all()
        total_calories = sum(l.calories or 0 for l in logs)
        total_protein = sum(l.protein_grams or 0 for l in logs)
        total_carbs = sum(l.carbs_grams or 0 for l in logs)
        total_fat = sum(l.fat_grams or 0 for l in logs)
        total_water = sum(l.water_ml or 0 for l in logs)
        return {
            "date": date.isoformat() if hasattr(date, "isoformat") else str(date),
            "total_meals": len(logs),
            "total_calories": total_calories,
            "total_protein_grams": round(total_protein, 1),
            "total_carbs_grams": round(total_carbs, 1),
            "total_fat_grams": round(total_fat, 1),
            "total_water_ml": total_water,
            "meals": [l.to_dict() for l in logs],
        }
