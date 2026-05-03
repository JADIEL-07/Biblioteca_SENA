from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..services.auth_service import AuthService
from ..services.token_service import TokenService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400
        
    name = data.get('nombre') or data.get('name')
    email = data.get('correo') or data.get('email')
    password = data.get('password')
    phone = data.get('telefono') or data.get('phone')
    document_type = data.get('document_type') or data.get('tipo_documento')
    document_number = data.get('document_number') or data.get('numero_documento')
    
    if not name or not email or not password:
        return jsonify({"error": "Missing required fields (name, email, password)"}), 400
        
    result, status = AuthService.register_user(
        name, 
        email, 
        password,
        document_number=document_number,
        document_type=document_type,
        phone=phone,
        role_id=data.get('role_id', 7),
        formation_ficha=data.get('formation_ficha')
    )
    return jsonify(result), status

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Credentials required"}), 400
        
    identifier = data.get('nombre') or data.get('name') or data.get('email')
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({"error": "Identifier and password required"}), 400
        
    result, status = AuthService.login(identifier, password)
    return jsonify(result), status

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    refresh_jti = get_jwt()['jti']
    access, refresh = TokenService.validate_and_rotate_refresh_token(user_id, refresh_jti)
    if not access:
        return jsonify({"error": "Session expired"}), 401
    return jsonify({"access_token": access, "refresh_token": refresh}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email') or data.get('correo')
    if not email:
        return jsonify({"error": "Email required"}), 400
    result, status = AuthService.forgot_password(email)
    return jsonify(result), status

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    if not token or not new_password:
        return jsonify({"error": "Token and new password required"}), 400
    result, status = AuthService.reset_password(token, new_password)
    return jsonify(result), status

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    if not old_password or not new_password:
        return jsonify({"error": "Contraseña actual y nueva son requeridas"}), 400
    user_id = get_jwt_identity()
    result, status = AuthService.change_password(user_id, old_password, new_password)
    return jsonify(result), status
