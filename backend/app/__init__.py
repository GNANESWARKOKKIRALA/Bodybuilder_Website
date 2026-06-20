"""
Gnaneswar Fitness Platform - Application Factory
Creates and configures the Flask application instance.
"""

import os
from flask import Flask, jsonify, send_from_directory
from .config import config_by_name
from .extensions import db, cors, migrate, limiter


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure the Flask application using the factory pattern."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/dist'))
    app = Flask(__name__, static_folder=dist_dir, static_url_path='/static_assets')
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    cors.init_app(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)
    migrate.init_app(app, db)
    limiter.init_app(app)

    # Ensure upload directories exist
    upload_base = app.config["UPLOAD_FOLDER"]
    for sub in ("avatars", "progress", "blog", "gallery", "invoices"):
        os.makedirs(os.path.join(upload_base, sub), exist_ok=True)

    # Register blueprints
    _register_blueprints(app)

    # Register error handlers
    _register_error_handlers(app)

    # Auto-create all SQLite tables on first run
    with app.app_context():
        db.create_all()
        _seed_admin(app)

    # Health check
    @app.route("/api/health")
    def health():
        return jsonify({"success": True, "message": "Gnaneswar Fitness Platform API is running", "data": {"version": "1.0.0"}})

    # Serve React Frontend for any non-API routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path.startswith("api/"):
            return jsonify({"success": False, "message": "API endpoint not found", "data": None}), 404
            
        # Check if the requested path matches a file in our static folder (like assets/index.js or favicon.svg)
        file_path = os.path.join(app.static_folder, path)
        if path and os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(app.static_folder, path)
            
        return send_from_directory(app.static_folder, 'index.html')

    return app


def _seed_admin(app) -> None:
    """Create the default admin user if it doesn't exist yet."""
    from .models.user import User
    from .extensions import db
    import bcrypt as _bcrypt

    with app.app_context():
        if not User.query.filter_by(email="gapbodybuilder@gmail.com").first():
            hashed = _bcrypt.hashpw("Kgap@123".encode(), _bcrypt.gensalt()).decode()
            admin = User(
                first_name="Gnaneswar",
                last_name="",
                email="gapbodybuilder@gmail.com",
                password_hash=hashed,
                role="admin",
                is_active=True,
            )
            db.session.add(admin)
            db.session.commit()



def _register_blueprints(app: Flask) -> None:
    """Register all route blueprints with the application."""
    from .routes.auth import auth_bp
    from .routes.users import users_bp
    from .routes.workouts import workouts_bp
    from .routes.nutrition import nutrition_bp
    from .routes.bookings import bookings_bp
    from .routes.payments import payments_bp
    from .routes.blog import blog_bp
    from .routes.gallery import gallery_bp
    from .routes.progress import progress_bp
    from .routes.notifications import notifications_bp
    from .routes.analytics import analytics_bp
    from .routes.community import community_bp
    from .routes.ai_assistant import ai_bp
    from .routes.contact import contact_bp
    from .routes.chat import chat_bp

    prefix = "/api"
    app.register_blueprint(auth_bp, url_prefix=f"{prefix}/auth")
    app.register_blueprint(users_bp, url_prefix=f"{prefix}/users")
    app.register_blueprint(workouts_bp, url_prefix=f"{prefix}/workouts")
    app.register_blueprint(nutrition_bp, url_prefix=f"{prefix}/nutrition")
    app.register_blueprint(bookings_bp, url_prefix=f"{prefix}/bookings")
    app.register_blueprint(payments_bp, url_prefix=f"{prefix}/payments")
    app.register_blueprint(blog_bp, url_prefix=f"{prefix}/blog")
    app.register_blueprint(gallery_bp, url_prefix=f"{prefix}/gallery")
    app.register_blueprint(progress_bp, url_prefix=f"{prefix}/progress")
    app.register_blueprint(notifications_bp, url_prefix=f"{prefix}/notifications")
    app.register_blueprint(analytics_bp, url_prefix=f"{prefix}/analytics")
    app.register_blueprint(community_bp, url_prefix=f"{prefix}/community")
    app.register_blueprint(ai_bp, url_prefix=f"{prefix}/ai")
    app.register_blueprint(contact_bp, url_prefix=f"{prefix}/contact")
    app.register_blueprint(chat_bp, url_prefix=f"{prefix}/chat")


def _register_error_handlers(app: Flask) -> None:
    """Register global error handlers."""

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "message": str(e.description), "data": None}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"success": False, "message": "Authentication required", "data": None}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"success": False, "message": "Access forbidden", "data": None}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource not found", "data": None}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed", "data": None}), 405

    @app.errorhandler(413)
    def payload_too_large(e):
        return jsonify({"success": False, "message": "File too large. Maximum size is 16MB", "data": None}), 413

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({"success": False, "message": "Rate limit exceeded. Please try again later", "data": None}), 429

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "message": "An internal server error occurred", "data": None}), 500
