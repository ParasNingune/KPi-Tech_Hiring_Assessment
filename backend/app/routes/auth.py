from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'customer')
    
    if not email or not password:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400
        
    if role not in ['admin', 'customer']:
        return jsonify({'success': False, 'error': 'Invalid role'}), 400
        
    email = email.lower().strip()
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'error': 'Email already registered'}), 400
        
    try:
        user = User(email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'data': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login_route():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    
    if not email or not password or not role:
        return jsonify({'success': False, 'error': 'Email, password, and role are required'}), 400
        
    email = email.lower().strip()
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
    # Check password and role
    if not user.check_password(password) or user.role != role:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': user.to_dict()
    }), 200
