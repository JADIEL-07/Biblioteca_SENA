from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from ..models.audit_log import AuditLog
from ..models.user import User
from sqlalchemy import func

audit_bp = Blueprint('audit', __name__)

def admin_required(fn):
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        role = str(claims.get('role', '')).upper()
        if role not in ['ADMIN', 'ADMINISTRADOR']:
            return jsonify({"error": "Admin privileges required"}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return jwt_required()(wrapper)

@audit_bp.route('/', methods=['GET'])
@admin_required
def get_audit_logs():
    search = request.args.get('search', '')
    start_date = request.args.get('startDate', '')
    end_date = request.args.get('endDate', '')
    
    query = AuditLog.query.outerjoin(User, AuditLog.user_id == User.id)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            func.concat(AuditLog.id, ' ', User.name, ' ', AuditLog.action, ' ', AuditLog.entity).ilike(search_filter)
        )
        
    if start_date:
        query = query.filter(AuditLog.created_at >= f"{start_date} 00:00:00")
    if end_date:
        query = query.filter(AuditLog.created_at <= f"{end_date} 23:59:59")

    logs = query.order_by(AuditLog.created_at.desc()).limit(100).all()
    result = []
    for log in logs:
        user = User.query.get(log.user_id) if log.user_id else None
        result.append({
            "id": log.id,
            "user": user.name if user else "Sistema/Anónimo",
            "user_id": log.user_id,
            "user_email": user.email if user else "",
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "entity_name": User.query.get(log.entity_id).name if log.entity == 'users' and log.entity_id else "",
            "ip": log.ip,
            "user_agent": log.user_agent,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        })
    return jsonify(result), 200
