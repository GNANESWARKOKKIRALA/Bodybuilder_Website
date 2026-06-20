"""
Gnaneswar Fitness Platform - Community Models
Forum posts, replies, badges, and gamification.
"""

from datetime import datetime, timezone
from app.extensions import db


class ForumPost(db.Model):
    """Community forum post / discussion thread."""
    __tablename__ = "forum_posts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.Enum("general", "workout", "nutrition", "motivation", "progress", "question", name="forum_category"), default="general", nullable=False, index=True)
    is_pinned = db.Column(db.Boolean, default=False, nullable=False)
    is_locked = db.Column(db.Boolean, default=False, nullable=False)
    views_count = db.Column(db.Integer, default=0, nullable=False)
    likes_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    replies = db.relationship("ForumReply", backref="post", cascade="all, delete-orphan", lazy="dynamic", order_by="ForumReply.created_at")

    def to_dict(self, include_replies: bool = False) -> dict:
        data = {
            "id": self.id,
            "author_id": self.author_id,
            "author_name": f"{self.author.first_name} {self.author.last_name}" if self.author else None,
            "author_avatar": self.author.avatar_url if self.author else None,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "is_pinned": self.is_pinned,
            "is_locked": self.is_locked,
            "views_count": self.views_count,
            "likes_count": self.likes_count,
            "reply_count": self.replies.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_replies:
            data["replies"] = [r.to_dict() for r in self.replies.all()]
        return data

    def __repr__(self) -> str:
        return f"<ForumPost {self.title[:50]}>"


class ForumReply(db.Model):
    """Reply to a forum post."""
    __tablename__ = "forum_replies"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    likes_count = db.Column(db.Integer, default=0, nullable=False)
    is_best_answer = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "post_id": self.post_id,
            "author_id": self.author_id,
            "author_name": f"{self.author.first_name} {self.author.last_name}" if self.author else None,
            "author_avatar": self.author.avatar_url if self.author else None,
            "content": self.content,
            "likes_count": self.likes_count,
            "is_best_answer": self.is_best_answer,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<ForumReply {self.id} post={self.post_id}>"


class Badge(db.Model):
    """Achievement badge definition."""
    __tablename__ = "badges"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(100), nullable=True)  # emoji or icon class
    category = db.Column(db.Enum("workout", "nutrition", "consistency", "community", "milestone", name="badge_category"), nullable=False)
    requirement_type = db.Column(db.String(100), nullable=True)  # e.g., "workout_count"
    requirement_value = db.Column(db.Integer, nullable=True)  # e.g., 10
    points = db.Column(db.Integer, default=10, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user_badges = db.relationship("UserBadge", backref="badge", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "category": self.category,
            "requirement_type": self.requirement_type,
            "requirement_value": self.requirement_value,
            "points": self.points,
            "is_active": self.is_active,
        }

    def __repr__(self) -> str:
        return f"<Badge {self.name}>"


class UserBadge(db.Model):
    """Junction table for user-earned badges."""
    __tablename__ = "user_badges"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = db.Column(db.Integer, db.ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    earned_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "badge_id": self.badge_id,
            "badge": self.badge.to_dict() if self.badge else None,
            "earned_at": self.earned_at.isoformat() if self.earned_at else None,
        }

    def __repr__(self) -> str:
        return f"<UserBadge user={self.user_id} badge={self.badge_id}>"
