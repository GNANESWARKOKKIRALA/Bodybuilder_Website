"""
Gnaneswar Fitness Platform - Payment Service
Razorpay integration, subscription management, and invoice generation.
"""

import hashlib
import hmac
from datetime import datetime, timezone, timedelta
from flask import current_app
from app.extensions import db
from app.models.payment import Subscription, Payment
from app.utils.helpers import generate_invoice_number


# Subscription plan catalog
PLANS = {
    "basic": {"name": "Basic", "price": 999, "features": ["Workout Plans", "Email Support", "Progress Tracking"]},
    "premium": {"name": "Premium", "price": 2999, "features": ["Custom Workout Plans", "Nutrition Plans", "Priority Support", "Progress Tracking", "Community Access"]},
    "elite": {"name": "Elite", "price": 4999, "features": ["Personal Training Sessions", "Custom Workout & Nutrition Plans", "24/7 Support", "Progress Tracking", "Community Access", "Monthly Assessments", "Video Calls"]},
}

BILLING_DURATIONS = {
    "monthly": 30,
    "quarterly": 90,
    "yearly": 365,
}

BILLING_MULTIPLIERS = {
    "monthly": 1,
    "quarterly": 2.7,    # ~10% discount
    "yearly": 10,         # ~17% discount
}


class PaymentService:
    """Service for Razorpay payments, subscriptions, and invoices."""

    @staticmethod
    def get_plans() -> dict:
        """Return available subscription plans."""
        return PLANS

    @staticmethod
    def _get_razorpay_client():
        """Get a Razorpay client instance (lazy import)."""
        try:
            import razorpay
            key_id = current_app.config.get("RAZORPAY_KEY_ID", "")
            key_secret = current_app.config.get("RAZORPAY_KEY_SECRET", "")
            if not key_id or not key_secret:
                return None
            return razorpay.Client(auth=(key_id, key_secret))
        except Exception:
            return None

    @classmethod
    def create_order(cls, user_id: int, plan_key: str, billing_cycle: str = "monthly") -> tuple[dict | None, str]:
        """Create a Razorpay order for a subscription plan."""
        plan = PLANS.get(plan_key)
        if not plan:
            return None, "Invalid plan selected"

        if billing_cycle not in BILLING_DURATIONS:
            return None, "Invalid billing cycle"

        amount = int(plan["price"] * BILLING_MULTIPLIERS.get(billing_cycle, 1) * 100)  # paise

        # Create payment record
        invoice_number = generate_invoice_number()
        start_date = datetime.now(timezone.utc).date()
        end_date = start_date + timedelta(days=BILLING_DURATIONS[billing_cycle])

        # Try creating Razorpay order
        client = cls._get_razorpay_client()
        razorpay_order_id = None

        if client:
            try:
                order_data = {
                    "amount": amount,
                    "currency": "INR",
                    "receipt": invoice_number,
                    "notes": {
                        "plan": plan_key,
                        "billing_cycle": billing_cycle,
                        "user_id": str(user_id),
                    },
                }
                razorpay_order = client.order.create(data=order_data)
                razorpay_order_id = razorpay_order.get("id")
            except Exception as e:
                current_app.logger.error(f"Razorpay order creation failed: {e}")

        payment = Payment(
            user_id=user_id,
            amount=amount / 100,  # store in rupees
            currency="INR",
            status="pending",
            razorpay_order_id=razorpay_order_id,
            invoice_number=invoice_number,
            description=f"{plan['name']} Plan - {billing_cycle.title()}",
        )
        db.session.add(payment)
        db.session.commit()

        return {
            "order_id": razorpay_order_id,
            "payment_id": payment.id,
            "amount": amount,
            "currency": "INR",
            "plan": plan,
            "billing_cycle": billing_cycle,
            "invoice_number": invoice_number,
            "key_id": current_app.config.get("RAZORPAY_KEY_ID", ""),
        }, "Order created successfully"

    @classmethod
    def verify_payment(cls, user_id: int, payment_id: int, razorpay_payment_id: str, razorpay_order_id: str, razorpay_signature: str) -> tuple[dict | None, str]:
        """Verify Razorpay payment signature and activate subscription."""
        payment = Payment.query.filter_by(id=payment_id, user_id=user_id).first()
        if not payment:
            return None, "Payment not found"

        # Verify signature
        client = cls._get_razorpay_client()
        if client:
            try:
                key_secret = current_app.config.get("RAZORPAY_KEY_SECRET", "")
                message = f"{razorpay_order_id}|{razorpay_payment_id}"
                expected_signature = hmac.new(
                    key_secret.encode("utf-8"),
                    message.encode("utf-8"),
                    hashlib.sha256,
                ).hexdigest()

                if expected_signature != razorpay_signature:
                    payment.status = "failed"
                    db.session.commit()
                    return None, "Payment verification failed"
            except Exception as e:
                current_app.logger.error(f"Signature verification error: {e}")

        # Update payment
        payment.status = "completed"
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.paid_at = datetime.now(timezone.utc)

        # Create/update subscription
        desc_parts = (payment.description or "").split(" - ")
        plan_name = desc_parts[0] if desc_parts else "Basic Plan"
        billing_cycle = desc_parts[1].lower() if len(desc_parts) > 1 else "monthly"

        start_date = datetime.now(timezone.utc).date()
        duration = BILLING_DURATIONS.get(billing_cycle, 30)
        end_date = start_date + timedelta(days=duration)

        # Deactivate old subscription
        old_subs = Subscription.query.filter_by(user_id=user_id, status="active").all()
        for s in old_subs:
            s.status = "expired"

        subscription = Subscription(
            user_id=user_id,
            plan_name=plan_name,
            plan_price=payment.amount,
            billing_cycle=billing_cycle,
            status="active",
            start_date=start_date,
            end_date=end_date,
        )
        db.session.add(subscription)
        payment.subscription = subscription

        # Upgrade user role to client
        from app.models.user import User
        user = User.query.get(user_id)
        if user and user.role == "lead":
            user.role = "client"

        db.session.commit()

        return {
            "payment": payment.to_dict(),
            "subscription": subscription.to_dict(),
        }, "Payment verified and subscription activated"

    @staticmethod
    def get_user_payments(user_id: int, page: int = 1, per_page: int = 20) -> dict:
        query = Payment.query.filter_by(user_id=user_id).order_by(Payment.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [p.to_dict() for p in pagination.items],
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
    def get_active_subscription(user_id: int) -> Subscription | None:
        return Subscription.query.filter_by(
            user_id=user_id, status="active"
        ).order_by(Subscription.end_date.desc()).first()

    @staticmethod
    def get_all_payments(page: int = 1, per_page: int = 20, status: str | None = None) -> dict:
        query = Payment.query
        if status:
            query = query.filter(Payment.status == status)
        query = query.order_by(Payment.created_at.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [p.to_dict() for p in pagination.items],
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
    def generate_invoice(payment_id: int) -> dict | None:
        """Generate invoice data for a completed payment."""
        payment = Payment.query.get(payment_id)
        if not payment or payment.status != "completed":
            return None

        user = payment.user
        return {
            "invoice_number": payment.invoice_number,
            "date": payment.paid_at.strftime("%d %B %Y") if payment.paid_at else "",
            "company": {
                "name": "Gnaneswar Fitness Platform",
                "address": "Hyderabad, Telangana, India",
                "email": "billing@gnaneswarfitness.com",
                "phone": "+91 9876543210",
                "gstin": "36XXXXXXXXXXXZX",
            },
            "customer": {
                "name": f"{user.first_name} {user.last_name}" if user else "Customer",
                "email": user.email if user else "",
                "phone": user.phone if user else "",
            },
            "items": [
                {
                    "description": payment.description or "Subscription",
                    "quantity": 1,
                    "unit_price": payment.amount,
                    "total": payment.amount,
                }
            ],
            "subtotal": payment.amount,
            "gst_percentage": 18,
            "gst_amount": round(payment.amount * 0.18, 2),
            "total": round(payment.amount * 1.18, 2),
            "currency": payment.currency,
            "payment_method": payment.payment_method or "Online",
            "razorpay_payment_id": payment.razorpay_payment_id,
            "status": "Paid",
        }
