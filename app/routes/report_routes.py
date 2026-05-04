from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.ticket import Ticket
from ..models.user import User
from sqlalchemy import func

report_bp = Blueprint('reports', __name__)

@report_bp.route('/', methods=['GET'])
@jwt_required()
def get_reports():
    search = request.args.get('search', '')
    start_date = request.args.get('startDate', '')
    end_date = request.args.get('endDate', '')
    
    query = Ticket.query.filter_by(is_deleted=False).join(User, Ticket.user_id == User.id)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            func.concat(Ticket.id, ' ', Ticket.subject, ' ', User.name).ilike(search_filter)
        )
        
    if start_date:
        query = query.filter(Ticket.created_at >= f"{start_date} 00:00:00")
    if end_date:
        query = query.filter(Ticket.created_at <= f"{end_date} 23:59:59")

    tickets = query.order_by(Ticket.created_at.desc()).all()
    result = []
    for t in tickets:
        reporter = User.query.get(t.user_id)
        support = User.query.get(t.assigned_to) if t.assigned_to else None
        
        result.append({
            "id": t.id,
            "subject": t.subject,
            "description": t.description,
            "severity": t.severity,
            "status": t.status,
            "reported_by": reporter.name if reporter else "N/A",
            "support_person": support.name if support else "Pendiente",
            "created_at": t.created_at.isoformat()
        })
    return jsonify(result), 200

@report_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_report_stats():
    total = Ticket.query.filter_by(is_deleted=False).count()
    open_t = Ticket.query.filter_by(is_deleted=False, status='OPEN').count()
    critical = Ticket.query.filter_by(is_deleted=False, severity='CRITICAL').count()
    
    return jsonify({
        "total": total,
        "open": open_t,
        "critical": critical
    }), 200
