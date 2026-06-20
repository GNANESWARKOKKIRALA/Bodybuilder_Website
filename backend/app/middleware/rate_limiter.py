"""
Gnaneswar Fitness Platform - Rate Limiter Middleware
Custom rate limiting configuration for sensitive endpoints.
"""

from app.extensions import limiter

# Pre-built rate limit decorators for common use cases
auth_rate_limit = limiter.limit("5 per minute")
api_rate_limit = limiter.limit("60 per minute")
upload_rate_limit = limiter.limit("10 per minute")
search_rate_limit = limiter.limit("30 per minute")
