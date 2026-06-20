"""
Gnaneswar Fitness Platform - Blog Models
Blog posts and categories for fitness content.
"""

from datetime import datetime, timezone
from app.extensions import db


class BlogCategory(db.Model):
    """Blog post categories."""
    __tablename__ = "blog_categories"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    posts = db.relationship("BlogPost", backref="category", lazy="dynamic")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "is_active": self.is_active,
            "post_count": self.posts.count() if self.posts else 0,
        }

    def __repr__(self) -> str:
        return f"<BlogCategory {self.name}>"


class BlogPost(db.Model):
    """Blog post for fitness articles and tips."""
    __tablename__ = "blog_posts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(300), nullable=False)
    slug = db.Column(db.String(350), unique=True, nullable=False, index=True)
    excerpt = db.Column(db.String(500), nullable=True)
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(500), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey("blog_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = db.Column(db.Enum("draft", "published", "archived", name="post_status"), default="draft", nullable=False, index=True)
    tags = db.Column(db.String(500), nullable=True)  # comma-separated
    views_count = db.Column(db.Integer, default=0, nullable=False)
    likes_count = db.Column(db.Integer, default=0, nullable=False)
    is_featured = db.Column(db.Boolean, default=False, nullable=False)
    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    author = db.relationship("User", backref="blog_posts", lazy="joined")

    def to_dict(self, include_content: bool = False) -> dict:
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "cover_image": self.cover_image,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "author_id": self.author_id,
            "author_name": f"{self.author.first_name} {self.author.last_name}" if self.author else "Gnaneswar",
            "status": self.status,
            "tags": self.tags.split(",") if self.tags else [],
            "views_count": self.views_count,
            "likes_count": self.likes_count,
            "is_featured": self.is_featured,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_content:
            data["content"] = self.content
        return data

    def __repr__(self) -> str:
        return f"<BlogPost {self.title}>"
