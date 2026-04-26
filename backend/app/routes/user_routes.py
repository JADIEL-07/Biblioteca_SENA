from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User, Role
from ..models.loan import Loan
from ..models.reservation import Reservation
from ..models.audit_log import AuditLog
from sqlalchemy import func
import bcrypt

user_bp = Blueprint('users_mgmt', __name__)

@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    search = request.args.get('search', '')
    query = User.query.filter_by(is_deleted=False)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            func.concat(User.id, ' ', User.name, ' ', User.email).ilike(search_filter)
        )
        
    users = query.all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.name if user.role else "N/A",
            "is_active": user.is_active,
            "is_blocked": user.is_blocked,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "failed_attempts": user.failed_attempts,
            "created_at": user.created_at.isoformat()
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
    log = AuditLog(user_id=get_jwt_identity(), action=action, entity_id=id, entity_name="User")
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"success": True, "is_active": user.is_active}), 200

@user_bp.route('/<string:id>/unblock', methods=['POST'])
@jwt_required()
def unblock_user(id):
    user = User.query.get_or_404(id)
    user.is_blocked = False
    user.failed_attempts = 0
    
    log = AuditLog(user_id=get_jwt_identity(), action="USER_UNBLOCKED", entity_id=id, entity_name="User")
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
    log = AuditLog(user_id=get_jwt_identity(), action="ROLE_CHANGED", entity_id=id, entity_name="User", details=f"New role: {new_role_name}")
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
