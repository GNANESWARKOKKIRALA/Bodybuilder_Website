"""
Gnaneswar Fitness Platform - Models Package
Imports all models so they are registered with SQLAlchemy.
"""

from .user import User, UserProfile
from .workout import WorkoutProgram, WorkoutDay, Exercise, WorkoutExercise, WorkoutLog
from .nutrition import NutritionPlan, Meal, NutritionLog
from .booking import Appointment, TimeSlot
from .payment import Subscription, Payment
from .blog import BlogPost, BlogCategory
from .gallery import TransformationPhoto, Testimonial
from .progress import ProgressEntry
from .notification import Notification
from .community import ForumPost, ForumReply, Badge, UserBadge
from .contact import ContactSubmission
from .chat import ChatMessage

__all__ = [
    "User", "UserProfile",
    "WorkoutProgram", "WorkoutDay", "Exercise", "WorkoutExercise", "WorkoutLog",
    "NutritionPlan", "Meal", "NutritionLog",
    "Appointment", "TimeSlot",
    "Subscription", "Payment",
    "BlogPost", "BlogCategory",
    "TransformationPhoto", "Testimonial",
    "ProgressEntry",
    "Notification",
    "ForumPost", "ForumReply", "Badge", "UserBadge",
    "ContactSubmission",
    "ChatMessage",
]
