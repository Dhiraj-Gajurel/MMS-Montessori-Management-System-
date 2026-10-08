from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from server.models import Admin

def admin_required():
    """Decorator to require JWT authentication for admin routes"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                admin = Admin.query.get(current_user_id)
                if not admin:
                    return jsonify({'error': 'Unauthorized admin user'}), 403
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Invalid or expired authentication token', 'details': str(e)}), 401
        return wrapper
    return decorator
