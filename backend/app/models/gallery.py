"""
Gnaneswar Fitness Platform - Gallery Models
Transformation photos and client testimonials.
"""

from datetime import datetime, timezone
from app.extensions import db


class TransformationPhoto(db.Model):
    """Before/after transformation showcase."""
    __tablename__ = "transformation_photos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    client_name = db.Column(db.String(200), nullable=False)
    before_image = db.Column(db.String(500), nullable=False)
    after_image = db.Column(db.String(500), nullable=False)
    duration_weeks = db.Column(db.Integer, nullable=True)
    weight_lost_kg = db.Column(db.Float, nullable=True)
    muscle_gained_kg = db.Column(db.Float, nullable=True)
    description = db.Column(db.Text, nullable=True)
    program_followed = db.Column(db.String(200), nullable=True)
    is_featured = db.Column(db.Boolean, default=False, nullable=False)
    is_approved = db.Column(db.Boolean, default=False, nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "client_name": self.client_name,
            "before_image": self.before_image,
            "after_image": self.after_image,
            "duration_weeks": self.duration_weeks,
            "weight_lost_kg": self.weight_lost_kg,
            "muscle_gained_kg": self.muscle_gained_kg,
            "description": self.description,
            "program_followed": self.program_followed,
            "is_featured": self.is_featured,
            "is_approved": self.is_approved,
            "display_order": self.display_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<TransformationPhoto {self.client_name}>"


class Testimonial(db.Model):
    """Client testimonials and reviews."""
    __tablename__ = "testimonials"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    client_name = db.Column(db.String(200), nullable=False)
    client_image = db.Column(db.String(500), nullable=True)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, default=5, nullable=False)  # 1-5 stars
    program_name = db.Column(db.String(200), nullable=True)
    is_featured = db.Column(db.Boolean, default=False, nullable=False)
    is_approved = db.Column(db.Boolean, default=False, nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "client_name": self.client_name,
            "client_image": self.client_image,
            "content": self.content,
            "rating": self.rating,
            "program_name": self.program_name,
            "is_featured": self.is_featured,
            "is_approved": self.is_approved,
            "display_order": self.display_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<Testimonial {self.client_name}>"
