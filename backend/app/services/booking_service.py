"""
Gnaneswar Fitness Platform - Booking Service
Appointment scheduling and time slot management.
"""

from datetime import datetime, timezone
from app.extensions import db
from app.models.booking import Appointment, TimeSlot


class BookingService:
    """Service for appointment booking and time slot management."""

    # ──── Time Slots ────

    @staticmethod
    def get_time_slots(day_of_week: int | None = None, slot_type: str | None = None) -> list[dict]:
        query = TimeSlot.query.filter_by(is_active=True)
        if day_of_week is not None:
            query = query.filter(TimeSlot.day_of_week == day_of_week)
        if slot_type:
            query = query.filter(TimeSlot.slot_type == slot_type)
        query = query.order_by(TimeSlot.day_of_week, TimeSlot.start_time)
        return [ts.to_dict() for ts in query.all()]

    @staticmethod
    def create_time_slot(data: dict) -> TimeSlot:
        slot = TimeSlot(**data)
        db.session.add(slot)
        db.session.commit()
        return slot

    @staticmethod
    def update_time_slot(slot_id: int, data: dict) -> TimeSlot | None:
        slot = TimeSlot.query.get(slot_id)
        if not slot:
            return None
        for key, value in data.items():
            if hasattr(slot, key) and value is not None:
                setattr(slot, key, value)
        db.session.commit()
        return slot

    @staticmethod
    def delete_time_slot(slot_id: int) -> bool:
        slot = TimeSlot.query.get(slot_id)
        if not slot:
            return False
        db.session.delete(slot)
        db.session.commit()
        return True

    # ──── Appointments ────

    @staticmethod
    def get_available_slots(date) -> list[dict]:
        """Get available time slots for a specific date."""
        day_of_week = date.weekday()  # 0=Monday
        slots = TimeSlot.query.filter_by(day_of_week=day_of_week, is_active=True).all()
        available = []
        for slot in slots:
            booked = Appointment.query.filter(
                Appointment.appointment_date == date,
                Appointment.start_time == slot.start_time,
                Appointment.status.in_(["pending", "confirmed"]),
            ).count()
            if booked < slot.max_bookings:
                slot_dict = slot.to_dict()
                slot_dict["remaining_spots"] = slot.max_bookings - booked
                available.append(slot_dict)
        return available

    @staticmethod
    def book_appointment(user_id: int, data: dict) -> tuple[Appointment | None, str]:
        """Book a new appointment."""
        # Check for double booking
        existing = Appointment.query.filter(
            Appointment.user_id == user_id,
            Appointment.appointment_date == data["appointment_date"],
            Appointment.start_time == data["start_time"],
            Appointment.status.in_(["pending", "confirmed"]),
        ).first()
        if existing:
            return None, "You already have an appointment at this time"

        # Check slot availability if time_slot_id is provided
        if data.get("time_slot_id"):
            slot = TimeSlot.query.get(data["time_slot_id"])
            if not slot:
                return None, "Time slot not found"
            booked = Appointment.query.filter(
                Appointment.appointment_date == data["appointment_date"],
                Appointment.time_slot_id == data["time_slot_id"],
                Appointment.status.in_(["pending", "confirmed"]),
            ).count()
            if booked >= slot.max_bookings:
                return None, "This time slot is fully booked"

        appointment = Appointment(user_id=user_id, **data)
        db.session.add(appointment)
        db.session.commit()
        return appointment, "Appointment booked successfully"

    @staticmethod
    def get_user_appointments(user_id: int, page: int = 1, per_page: int = 20, status: str | None = None) -> dict:
        query = Appointment.query.filter_by(user_id=user_id)
        if status:
            query = query.filter(Appointment.status == status)
        query = query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [a.to_dict() for a in pagination.items],
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
    def get_all_appointments(page: int = 1, per_page: int = 20, status: str | None = None, date=None) -> dict:
        query = Appointment.query
        if status:
            query = query.filter(Appointment.status == status)
        if date:
            query = query.filter(Appointment.appointment_date == date)
        query = query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [a.to_dict() for a in pagination.items],
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
    def update_appointment_status(appointment_id: int, status: str, cancel_reason: str | None = None) -> tuple[Appointment | None, str]:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return None, "Appointment not found"
        appointment.status = status
        if cancel_reason:
            appointment.cancel_reason = cancel_reason
        db.session.commit()
        return appointment, f"Appointment {status} successfully"

    @staticmethod
    def cancel_appointment(appointment_id: int, user_id: int, reason: str | None = None) -> tuple[Appointment | None, str]:
        appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
        if not appointment:
            return None, "Appointment not found"
        if appointment.status in ("cancelled", "completed"):
            return None, f"Appointment is already {appointment.status}"
        appointment.status = "cancelled"
        appointment.cancel_reason = reason
        db.session.commit()
        return appointment, "Appointment cancelled successfully"
