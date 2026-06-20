"""
Gnaneswar Fitness Platform - Progress Model
Track body measurements, weight, and photos over time.
"""

from datetime import datetime, timezone
from app.extensions import db


class ProgressEntry(db.Model):
    """Body measurement and progress tracking entry."""
    __tablename__ = "progress_entries"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_date = db.Column(db.Date, nullable=False, index=True)
    weight_kg = db.Column(db.Float, nullable=True)
    body_fat_percentage = db.Column(db.Float, nullable=True)
    chest_cm = db.Column(db.Float, nullable=True)
    waist_cm = db.Column(db.Float, nullable=True)
    hips_cm = db.Column(db.Float, nullable=True)
    biceps_cm = db.Column(db.Float, nullable=True)
    thighs_cm = db.Column(db.Float, nullable=True)
    calves_cm = db.Column(db.Float, nullable=True)
    neck_cm = db.Column(db.Float, nullable=True)
    shoulders_cm = db.Column(db.Float, nullable=True)
    front_photo = db.Column(db.String(500), nullable=True)
    side_photo = db.Column(db.String(500), nullable=True)
    back_photo = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    energy_level = db.Column(db.Integer, nullable=True)  # 1-10
    sleep_hours = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "entry_date", name="uq_user_progress_date"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "entry_date": self.entry_date.isoformat() if self.entry_date else None,
            "weight_kg": self.weight_kg,
            "body_fat_percentage": self.body_fat_percentage,
            "chest_cm": self.chest_cm,
            "waist_cm": self.waist_cm,
            "hips_cm": self.hips_cm,
            "biceps_cm": self.biceps_cm,
            "thighs_cm": self.thighs_cm,
            "calves_cm": self.calves_cm,
            "neck_cm": self.neck_cm,
            "shoulders_cm": self.shoulders_cm,
            "front_photo": self.front_photo,
            "side_photo": self.side_photo,
            "back_photo": self.back_photo,
            "notes": self.notes,
            "energy_level": self.energy_level,
            "sleep_hours": self.sleep_hours,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<ProgressEntry user={self.user_id} date={self.entry_date}>"
