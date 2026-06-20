"""
Gnaneswar Fitness Platform - Payment Routes
API endpoints for pricing plans, Razorpay payment processing, and customer invoices.
"""

from flask import Blueprint, request, jsonify, g, current_app
from app.services.payment_service import PaymentService
from app.middleware.auth_middleware import token_required, admin_required

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("/plans", methods=["GET"])
def get_pricing_plans():
    plans = PaymentService.get_plans()
    return jsonify({"success": True, "message": "Plans retrieved successfully", "data": {"plans": plans}}), 200


@payments_bp.route("/orders", methods=["POST"])
@token_required
def create_payment_order():
    data = request.get_json() or {}
    plan_key = data.get("plan_key")
    billing_cycle = data.get("billing_cycle", "monthly")

    if not plan_key:
        return jsonify({"success": False, "message": "plan_key is required", "data": None}), 400

    order_data, message = PaymentService.create_order(g.current_user.id, plan_key, billing_cycle)
    if not order_data:
        return jsonify({"success": False, "message": message, "data": None}), 400

    return jsonify({"success": True, "message": message, "data": order_data}), 201


@payments_bp.route("/verify", methods=["POST"])
@token_required
def verify_payment_signature():
    data = request.get_json() or {}
    payment_id = data.get("payment_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_signature = data.get("razorpay_signature")

    if not all([payment_id, razorpay_payment_id, razorpay_order_id, razorpay_signature]):
        return jsonify({"success": False, "message": "Missing verification parameters", "data": None}), 400

    result, message = PaymentService.verify_payment(
        user_id=g.current_user.id,
        payment_id=payment_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_order_id=razorpay_order_id,
        razorpay_signature=razorpay_signature
    )
    if not result:
        return jsonify({"success": False, "message": message, "data": None}), 400

    return jsonify({"success": True, "message": message, "data": result}), 200


@payments_bp.route("/history", methods=["GET"])
@token_required
def get_payment_history():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))

    # Clients see their own history, Admins see all
    if g.current_user.role == "admin":
        status = request.args.get("status")
        result = PaymentService.get_all_payments(page=page, per_page=per_page, status=status)
    else:
        result = PaymentService.get_user_payments(user_id=g.current_user.id, page=page, per_page=per_page)

    return jsonify({"success": True, "message": "Payment history retrieved", "data": result}), 200


@payments_bp.route("/subscription", methods=["GET"])
@token_required
def get_current_subscription():
    sub = PaymentService.get_active_subscription(g.current_user.id)
    if not sub:
        return jsonify({"success": True, "message": "No active subscription found", "data": {"subscription": None}}), 200
        
    return jsonify({"success": True, "message": "Active subscription retrieved", "data": {"subscription": sub.to_dict()}}), 200


@payments_bp.route("/<int:payment_id>/invoice", methods=["GET"])
@token_required
def get_payment_invoice(payment_id):
    invoice = PaymentService.generate_invoice(payment_id)
    if not invoice:
        return jsonify({"success": False, "message": "Invoice not found or payment not completed", "data": None}), 404

    # Check authorization (clients can only view their own invoices)
    if g.current_user.role != "admin":
        payment = PaymentService.get_all_payments(page=1, per_page=1).get("items")
        # Ensure client owns the payment (verify via DB lookup or by checking user email/id match in invoice)
        from app.models.payment import Payment
        p = Payment.query.get(payment_id)
        if not p or p.user_id != g.current_user.id:
            return jsonify({"success": False, "message": "Unauthorized access to invoice", "data": None}), 403

    return jsonify({"success": True, "message": "Invoice data retrieved", "data": {"invoice": invoice}}), 200
