from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from server.models import Admin
from server.database import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email_or_user = data.get('username') or data.get('email')
    password = data.get('password')
    
    if not email_or_user or not password:
        return jsonify({'error': 'Username/Email and password are required'}), 400
        
    admin = Admin.query.filter(
        (Admin.email == email_or_user) | (Admin.username == email_or_user)
    ).first()
    
    if not admin or not admin.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
        
    access_token = create_access_token(identity=str(admin.id))
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': admin.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_admin():
    admin_id = get_jwt_identity()
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': admin.to_dict()}), 200
