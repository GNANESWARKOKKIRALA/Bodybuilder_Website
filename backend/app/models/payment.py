"""
Gnaneswar Fitness Platform - Payment Models
Subscription plans and payment transaction tracking with Razorpay.
"""

from datetime import datetime, timezone
from app.extensions import db


class Subscription(db.Model):
    """User subscription to a pricing plan."""
    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_name = db.Column(db.String(100), nullable=False)
    plan_price = db.Column(db.Float, nullable=False)  # in INR
    billing_cycle = db.Column(db.Enum("monthly", "quarterly", "yearly", name="billing_cycle_type"), default="monthly", nullable=False)
    status = db.Column(db.Enum("active", "expired", "cancelled", "past_due", name="sub_status"), default="active", nullable=False, index=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    auto_renew = db.Column(db.Boolean, default=True, nullable=False)
    razorpay_subscription_id = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    payments = db.relationship("Payment", backref="subscription", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "plan_name": self.plan_name,
            "plan_price": self.plan_price,
            "billing_cycle": self.billing_cycle,
            "status": self.status,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "auto_renew": self.auto_renew,
            "razorpay_subscription_id": self.razorpay_subscription_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<Subscription {self.plan_name} user={self.user_id}>"


class Payment(db.Model):
    """Individual payment transaction."""
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id = db.Column(db.Integer, db.ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default="INR", nullable=False)
    status = db.Column(db.Enum("pending", "completed", "failed", "refunded", name="payment_status"), default="pending", nullable=False, index=True)
    payment_method = db.Column(db.String(50), nullable=True)
    razorpay_order_id = db.Column(db.String(255), nullable=True, index=True)
    razorpay_payment_id = db.Column(db.String(255), nullable=True, unique=True)
    razorpay_signature = db.Column(db.String(500), nullable=True)
    invoice_number = db.Column(db.String(50), nullable=True, unique=True)
    description = db.Column(db.String(500), nullable=True)
    paid_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "subscription_id": self.subscription_id,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "payment_method": self.payment_method,
            "razorpay_order_id": self.razorpay_order_id,
            "razorpay_payment_id": self.razorpay_payment_id,
            "invoice_number": self.invoice_number,
            "description": self.description,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<Payment {self.id} amount={self.amount} {self.currency}>"
