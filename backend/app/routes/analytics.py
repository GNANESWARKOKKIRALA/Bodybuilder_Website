"""
Gnaneswar Fitness Platform - Analytics Routes
API endpoints for compiling and serving admin dashboard analytics.
"""

from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from app.extensions import db
from app.models.user import User
from app.models.payment import Payment, Subscription
from app.models.booking import Appointment
from app.models.workout import WorkoutLog
from app.middleware.auth_middleware import admin_required

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/overview", methods=["GET"])
@admin_required
def get_admin_overview():
    # User counts
    total_users = User.query.count()
    clients_count = User.query.filter_by(role="client").count()
    leads_count = User.query.filter_by(role="lead").count()
    active_users = User.query.filter_by(is_active=True).count()

    # Subscription counts
    active_subscriptions = Subscription.query.filter_by(status="active").count()

    # Revenue
    payments = Payment.query.filter_by(status="completed").all()
    total_revenue = sum(p.amount for p in payments)

    # Booking counts
    total_bookings = Appointment.query.count()
    pending_bookings = Appointment.query.filter_by(status="pending").count()
    confirmed_bookings = Appointment.query.filter_by(status="confirmed").count()

    # Recent registrations (last 5)
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()

    # Recent bookings (last 5)
    recent_bookings = Appointment.query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).limit(5).all()

    # Monthly revenue trends (last 6 months)
    revenue_chart_data = []
    today = datetime.now()
    for i in range(5, -1, -1):
        month_start = (today - timedelta(days=i*30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # End of the month
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        month_payments = Payment.query.filter(
            Payment.status == "completed",
            Payment.created_at >= month_start,
            Payment.created_at < month_end
        ).all()
        
        month_revenue = sum(p.amount for p in month_payments)
        revenue_chart_data.append({
            "month": month_start.strftime("%B %Y"),
            "revenue": round(month_revenue, 2),
            "transactions": len(month_payments)
        })

    # User growth (last 6 months)
    user_growth_data = []
    for i in range(5, -1, -1):
        month_start = (today - timedelta(days=i*30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        month_signups = User.query.filter(
            User.created_at >= month_start,
            User.created_at < month_end
        ).count()

        user_growth_data.append({
            "month": month_start.strftime("%B %Y"),
            "signups": month_signups
        })

    # Goal distribution
    from app.models.user import UserProfile
    goals_data = db.session.query(
        UserProfile.fitness_goal, func.count(UserProfile.id)
    ).group_by(UserProfile.fitness_goal).all()
    
    goals_distribution = {}
    for goal, count in goals_data:
        if not goal:
            goal_name = "unassigned"
        elif hasattr(goal, "value"):
            goal_name = goal.value
        else:
            goal_name = str(goal)
        goal_display = goal_name.replace("_", " ").title()
        goals_distribution[goal_display] = count

    return jsonify({
        "success": True,
        "message": "Admin dashboard overview retrieved successfully",
        "data": {
            "summary": {
                "total_users": total_users,
                "clients_count": clients_count,
                "leads_count": leads_count,
                "active_users": active_users,
                "active_subscriptions": active_subscriptions,
                "total_revenue": round(total_revenue, 2),
                "total_bookings": total_bookings,
                "pending_bookings": pending_bookings,
                "confirmed_bookings": confirmed_bookings
            },
            "recent_registrations": [u.to_dict() for u in recent_users],
            "recent_bookings": [b.to_dict() for b in recent_bookings],
            "revenue_trends": revenue_chart_data,
            "user_growth": user_growth_data,
            "goals_distribution": goals_distribution
        }
    }), 200
