"""
Gnaneswar Fitness Platform - Booking Models
Appointment scheduling and time slot management.
"""

from datetime import datetime, timezone
from app.extensions import db


class TimeSlot(db.Model):
    """Available coaching time slots."""
    __tablename__ = "time_slots"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday .. 6=Sunday
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    slot_type = db.Column(db.Enum("consultation", "training", "assessment", "follow_up", name="slot_type_enum"), default="training", nullable=False)
    max_bookings = db.Column(db.Integer, default=1, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    appointments = db.relationship("Appointment", backref="time_slot", lazy="dynamic")

    def to_dict(self) -> dict:
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return {
            "id": self.id,
            "day_of_week": self.day_of_week,
            "day_name": days[self.day_of_week] if 0 <= self.day_of_week <= 6 else "Unknown",
            "start_time": self.start_time.strftime("%H:%M") if self.start_time else None,
            "end_time": self.end_time.strftime("%H:%M") if self.end_time else None,
            "slot_type": self.slot_type,
            "max_bookings": self.max_bookings,
            "is_active": self.is_active,
        }

    def __repr__(self) -> str:
        return f"<TimeSlot day={self.day_of_week} {self.start_time}-{self.end_time}>"


class Appointment(db.Model):
    """Booked coaching appointment."""
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    time_slot_id = db.Column(db.Integer, db.ForeignKey("time_slots.id"), nullable=True)
    appointment_date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    appointment_type = db.Column(db.Enum("consultation", "training", "assessment", "follow_up", name="appt_type"), default="training", nullable=False)
    status = db.Column(db.Enum("pending", "confirmed", "cancelled", "completed", "no_show", name="appt_status"), default="pending", nullable=False, index=True)
    notes = db.Column(db.Text, nullable=True)
    cancel_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": f"{self.user.first_name} {self.user.last_name}" if self.user else None,
            "time_slot_id": self.time_slot_id,
            "appointment_date": self.appointment_date.isoformat() if self.appointment_date else None,
            "start_time": self.start_time.strftime("%H:%M") if self.start_time else None,
            "end_time": self.end_time.strftime("%H:%M") if self.end_time else None,
            "appointment_type": self.appointment_type,
            "status": self.status,
            "notes": self.notes,
            "cancel_reason": self.cancel_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<Appointment {self.id} user={self.user_id} date={self.appointment_date}>"
