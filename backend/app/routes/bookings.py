"""
Gnaneswar Fitness Platform - Booking Routes
API endpoints for managing training/consultation time slots and scheduling appointments.
"""

from datetime import datetime
from flask import Blueprint, request, jsonify, g, current_app
from app.services.booking_service import BookingService
from app.middleware.auth_middleware import token_required, admin_required

bookings_bp = Blueprint("bookings", __name__)


# ──── Time Slot Management (Admin Only) ────

@bookings_bp.route("/slots", methods=["GET"])
@token_required
def get_time_slots():
    # Regular users can view active slots, admin can view all
    day_of_week_str = request.args.get("day_of_week")
    slot_type = request.args.get("slot_type")
    
    day_of_week = int(day_of_week_str) if day_of_week_str is not None else None
    
    slots = BookingService.get_time_slots(day_of_week=day_of_week, slot_type=slot_type)
    return jsonify({"success": True, "message": "Time slots retrieved", "data": {"slots": slots}}), 200


@bookings_bp.route("/slots", methods=["POST"])
@admin_required
def create_time_slot():
    data = request.get_json() or {}
    if data.get("day_of_week") is None or not data.get("start_time") or not data.get("end_time"):
        return jsonify({"success": False, "message": "Day of week, start time and end time are required", "data": None}), 400

    try:
        data["start_time"] = datetime.strptime(data["start_time"], "%H:%M").time()
        data["end_time"] = datetime.strptime(data["end_time"], "%H:%M").time()
    except ValueError:
        return jsonify({"success": False, "message": "Time format must be HH:MM", "data": None}), 400

    slot = BookingService.create_time_slot(data)
    return jsonify({"success": True, "message": "Time slot created successfully", "data": {"slot": slot.to_dict()}}), 201


@bookings_bp.route("/slots/<int:slot_id>", methods=["PUT"])
@admin_required
def update_time_slot(slot_id):
    data = request.get_json() or {}
    
    try:
        if "start_time" in data:
            data["start_time"] = datetime.strptime(data["start_time"], "%H:%M").time()
        if "end_time" in data:
            data["end_time"] = datetime.strptime(data["end_time"], "%H:%M").time()
    except ValueError:
        return jsonify({"success": False, "message": "Time format must be HH:MM", "data": None}), 400

    slot = BookingService.update_time_slot(slot_id, data)
    if not slot:
        return jsonify({"success": False, "message": "Time slot not found", "data": None}), 404
        
    return jsonify({"success": True, "message": "Time slot updated successfully", "data": {"slot": slot.to_dict()}}), 200


@bookings_bp.route("/slots/<int:slot_id>", methods=["DELETE"])
@admin_required
def delete_time_slot(slot_id):
    success = BookingService.delete_time_slot(slot_id)
    if not success:
        return jsonify({"success": False, "message": "Time slot not found", "data": None}), 404
    return jsonify({"success": True, "message": "Time slot deleted successfully", "data": None}), 200


# ──── Appointment Booking Endpoints ────

@bookings_bp.route("/available-slots", methods=["GET"])
@token_required
def get_available_booking_slots():
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"success": False, "message": "Date parameter (date) is required", "data": None}), 400
        
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Date format must be YYYY-MM-DD", "data": None}), 400

    slots = BookingService.get_available_slots(date)
    return jsonify({"success": True, "message": "Available slots retrieved", "data": {"slots": slots}}), 200


@bookings_bp.route("/appointments", methods=["POST"])
@token_required
def book_appointment():
    data = request.get_json() or {}
    if not data.get("appointment_date") or not data.get("start_time") or not data.get("end_time"):
        return jsonify({"success": False, "message": "Appointment date, start time, and end time are required", "data": None}), 400

    try:
        data["appointment_date"] = datetime.strptime(data["appointment_date"], "%Y-%m-%d").date()
        data["start_time"] = datetime.strptime(data["start_time"], "%H:%M").time()
        data["end_time"] = datetime.strptime(data["end_time"], "%H:%M").time()
    except ValueError:
        return jsonify({"success": False, "message": "Invalid date or time format", "data": None}), 400

    appointment, message = BookingService.book_appointment(g.current_user.id, data)
    if not appointment:
        return jsonify({"success": False, "message": message, "data": None}), 400

    return jsonify({"success": True, "message": message, "data": {"appointment": appointment.to_dict()}}), 201


@bookings_bp.route("/appointments", methods=["GET"])
@token_required
def get_appointments():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", current_app.config["DEFAULT_PAGE_SIZE"]))
    status = request.args.get("status")
    
    # Clients see their own appointments, Admins see all
    if g.current_user.role == "admin":
        date_str = request.args.get("date")
        date = None
        if date_str:
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"success": False, "message": "Date format must be YYYY-MM-DD", "data": None}), 400
        result = BookingService.get_all_appointments(page=page, per_page=per_page, status=status, date=date)
    else:
        result = BookingService.get_user_appointments(user_id=g.current_user.id, page=page, per_page=per_page, status=status)
        
    return jsonify({"success": True, "message": "Appointments retrieved", "data": result}), 200


@bookings_bp.route("/appointments/<int:appointment_id>/status", methods=["PUT"])
@admin_required
def update_appointment_status(appointment_id):
    data = request.get_json() or {}
    status = data.get("status")
    cancel_reason = data.get("cancel_reason")
    
    if not status or status not in ("pending", "confirmed", "cancelled", "completed", "no_show"):
        return jsonify({"success": False, "message": "Invalid status value", "data": None}), 400

    appointment, message = BookingService.update_appointment_status(appointment_id, status, cancel_reason)
    if not appointment:
        return jsonify({"success": False, "message": message, "data": None}), 404
        
    return jsonify({"success": True, "message": message, "data": {"appointment": appointment.to_dict()}}), 200


@bookings_bp.route("/appointments/<int:appointment_id>/cancel", methods=["POST"])
@token_required
def cancel_my_appointment(appointment_id):
    data = request.get_json() or {}
    reason = data.get("reason")
    
    appointment, message = BookingService.cancel_appointment(appointment_id, g.current_user.id, reason)
    if not appointment:
        return jsonify({"success": False, "message": message, "data": None}), 400
        
    return jsonify({"success": True, "message": message, "data": {"appointment": appointment.to_dict()}}), 200


@bookings_bp.route("/appointments/<int:appointment_id>/pay", methods=["POST"])
@token_required
def record_booking_payment(appointment_id):
    """Record a UPI payment transaction for a booking and confirm it."""
    from app.models.booking import Appointment
    from app.extensions import db

    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"success": False, "message": "Appointment not found", "data": None}), 404

    if appointment.user_id != g.current_user.id:
        return jsonify({"success": False, "message": "Unauthorized", "data": None}), 403

    data = request.get_json() or {}
    payment_method = data.get("payment_method", "upi")   # gpay / phonepe / upi
    transaction_ref = data.get("transaction_ref", "")
    amount = data.get("amount", 0)

    # Store transaction reference in notes and confirm the booking
    appointment.notes = (appointment.notes or "") + f" | Payment: {payment_method.upper()} | Ref: {transaction_ref} | ₹{amount}"
    appointment.status = "confirmed"
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Payment recorded and booking confirmed!",
        "data": {"appointment": appointment.to_dict()}
    }), 200
