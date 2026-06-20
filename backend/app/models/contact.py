"""
Gnaneswar Fitness Platform - Contact Model
Contact form submissions from website visitors.
"""

from datetime import datetime, timezone
from app.extensions import db


class ContactSubmission(db.Model):
    """Contact form submission."""
    __tablename__ = "contact_submissions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(255), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    subject = db.Column(db.String(300), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum("new", "read", "replied", "archived", name="contact_status"), default="new", nullable=False, index=True)
    admin_notes = db.Column(db.Text, nullable=True)
    replied_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "subject": self.subject,
            "message": self.message,
            "status": self.status,
            "admin_notes": self.admin_notes,
            "replied_at": self.replied_at.isoformat() if self.replied_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<ContactSubmission {self.id} from={self.email}>"
