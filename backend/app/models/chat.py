"""
Gnaneswar Fitness Platform - Chat Message Model
Model for direct 1-to-1 messages between users.
"""

from datetime import datetime, timezone
from app.extensions import db


class ChatMessage(db.Model):
    """Tracks direct 1-to-1 chat messages between users (coach and clients)."""
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    sender = db.relationship("User", foreign_keys=[sender_id], backref=db.backref("sent_messages", lazy="dynamic"))
    receiver = db.relationship("User", foreign_keys=[receiver_id], backref=db.backref("received_messages", lazy="dynamic"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<ChatMessage id={self.id} sender={self.sender_id} receiver={self.receiver_id}>"
