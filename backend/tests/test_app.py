import pytest
from backend.app import create_app

def test_app_creation():
    """Ensure the Flask app factory creates an app instance without errors."""
    app = create_app()
    assert app is not None
    assert not app.testing
