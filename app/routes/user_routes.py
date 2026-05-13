from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User, Role
from ..models.loan import Loan
from ..models.reservation import Reservation
from ..models.audit_log import AuditLog
from sqlalchemy import func, or_, String
import bcrypt

user_bp = Blueprint('users_mgmt', __name__)

@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    search = request.args.get('search', '')
    query = User.query.filter_by(is_deleted=False)
    
    if search:
        search_filter = f"%{search}%"
        query = query.outerjoin(Role, User.role_id == Role.id).filter(
            or_(
                User.id.ilike(search_filter),
                User.name.ilike(search_filter),
                User.email.ilike(search_filter),
                User.phone.ilike(search_filter),
                Role.name.ilike(search_filter)
            )
        )
        
    users = query.all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role.name if user.role else "N/A",
            "is_active": user.is_active,
            "is_blocked": user.is_blocked,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "failed_attempts": user.failed_attempts,
            "created_at": user.created_at.isoformat(),
            "profile_image": user.profile_image,
            "dependency_id": user.dependency_id,
            "dependency_name": user.dependency_obj.name if user.dependency_obj else None
        })
    return jsonify(result), 200

@user_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    total = User.query.filter_by(is_deleted=False).count()
    active = User.query.filter_by(is_deleted=False, is_active=True).count()
    inactive = User.query.filter_by(is_deleted=False, is_active=False).count()
    blocked = User.query.filter_by(is_deleted=False, is_blocked=True).count()
    
    # Por rol
    roles_count = db.session.query(Role.name, func.count(User.id)).join(User).group_by(Role.id).all()
    by_role = {r[0]: r[1] for r in roles_count}
    
    return jsonify({
        "total": total,
        "active": active,
        "inactive": inactive,
        "blocked": blocked,
        "by_role": by_role
    }), 200

@user_bp.route('/<string:id>/toggle-active', methods=['POST'])
@jwt_required()
def toggle_user_active(id):
    user = User.query.get_or_404(id)
    user.is_active = not user.is_active
    
    action = "USER_DEACTIVATED" if not user.is_active else "USER_REACTIVATED"
    log = AuditLog(user_id=get_jwt_identity(), action=action, entity_id=None, entity="User")
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"success": True, "is_active": user.is_active}), 200

@user_bp.route('/<string:id>/unblock', methods=['POST'])
@jwt_required()
def unblock_user(id):
    user = User.query.get_or_404(id)
    user.is_blocked = False
    user.failed_attempts = 0
    
    log = AuditLog(user_id=get_jwt_identity(), action="USER_UNBLOCKED", entity_id=None, entity="User")
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"success": True}), 200

@user_bp.route('/<string:id>/change-role', methods=['POST'])
@jwt_required()
def change_user_role(id):
    data = request.get_json()
    new_role_name = data.get('role')
    
    user = User.query.get_or_404(id)
    role = Role.query.filter_by(name=new_role_name).first()
    if not role:
        return jsonify({"error": "Rol no válido"}), 400
        
    user.role_id = role.id
    log = AuditLog(user_id=get_jwt_identity(), action="ROLE_CHANGED", entity_id=None, entity="User", details=f"New role: {new_role_name}")
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"success": True}), 200

@user_bp.route('/<string:id>/detail', methods=['GET'])
@jwt_required()
def get_user_detail(id):
    user = User.query.get_or_404(id)
    
    # Préstamos activos
    active_loans = Loan.query.filter_by(user_id=id, status='ACTIVE').count()
    
    # Reservas activas
    active_res = Reservation.query.filter_by(user_id=id, status='ACTIVE').count()
    
    # Últimos 10 logs de auditoría del usuario
    logs = AuditLog.query.filter_by(user_id=id).order_by(AuditLog.created_at.desc()).limit(10).all()
    
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role.name if user.role else "N/A",
        "active_loans": active_loans,
        "active_reservations": active_res,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "audit_logs": [{
            "action": l.action,
            "date": l.created_at.isoformat(),
            "ip": l.ip
        } for l in logs]
    }), 200
@user_bp.route('/', methods=['POST'])
@jwt_required()
def create_user():
    data = request.get_json()
    
    # Validar si el usuario ya existe
    if User.query.get(data.get('id')):
        return jsonify({"error": "El documento ya está registrado"}), 400
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "El email ya está registrado"}), 400

    role = Role.query.filter_by(name=data.get('role')).first()
    if not role:
        return jsonify({"error": "Rol no válido"}), 400

    # Hash password
    password = data.get('password', data.get('id')) # Default password is ID if not provided
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    new_user = User(
        id=data.get('id'),
        document_type=data.get('document_type', 'CC'),
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        password=hashed_pw,
        role_id=role.id,
        dependency_id=data.get('dependency_id'), # Nuevo: Asignar dependencia
        formation_ficha=data.get('formation_ficha'),
        created_by=get_jwt_identity()
    )

    db.session.add(new_user)
    
    # Audit Log
    log = AuditLog(
        user_id=get_jwt_identity(),
        action="USER_CREATED",
        entity_id=None,
        entity="User",
        details=f"Created user {new_user.name} with role {role.name}"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"success": True, "message": "Usuario creado exitosamente"}), 201

@user_bp.route('/roles', methods=['GET'])
@jwt_required()
def get_roles():
    roles = Role.query.all()
    return jsonify([r.name for r in roles]), 200

@user_bp.route('/profile-image', methods=['PATCH'])
@jwt_required()
def update_profile_image():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
        
    data = request.get_json()
    image_data = data.get('profile_image')
    # Procesar imagen en Base64 y guardarla físicamente
    if image_data and image_data.startswith('data:image'):
        try:
            import os
            import base64
            from flask import current_app
            
            header, encoded = image_data.split(',', 1)
            ext = header.split(';')[0].split('/')[1]
            if ext == 'jpeg': ext = 'jpg'
            
            filename = f"profile_{user.id}.{ext}"
            filepath = os.path.join(current_app.root_path, 'uploads', filename)
            
            with open(filepath, "wb") as fh:
                fh.write(base64.b64decode(encoded))
                
            user.profile_image = f"/uploads/{filename}"
        except Exception as e:
            print("Error guardando foto de perfil:", e)
    else:
        user.profile_image = image_data
    
    log = AuditLog(user_id=user_id, action="PROFILE_IMAGE_UPDATED", entity="User")
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": "Foto de perfil actualizada",
        "profile_image": user.profile_image
    }), 200
