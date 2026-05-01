from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.maintenance import Maintenance
from ..models.item import Item, Status, Category
from ..models.user import User
from sqlalchemy import func, or_, String
from datetime import datetime

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('/', methods=['GET'])
@jwt_required()
def get_maintenances():
    search = request.args.get('search', '')
    start_date = request.args.get('startDate', '')
    end_date = request.args.get('endDate', '')
    severity = request.args.get('severity', 'ALL')
    
    query = Maintenance.query.filter_by(is_deleted=False).join(Item, Maintenance.item_id == Item.id).join(User, Maintenance.reported_by == User.id)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Maintenance.id.cast(String).ilike(search_filter),
                Item.name.ilike(search_filter),
                Item.code.ilike(search_filter),
                User.name.ilike(search_filter),
                User.email.ilike(search_filter),
                Maintenance.status.ilike(search_filter),
                Maintenance.maintenance_type.ilike(search_filter)
            )
        )
        
    if start_date:
        query = query.filter(Maintenance.report_date >= f"{start_date} 00:00:00")
    if end_date:
        query = query.filter(Maintenance.report_date <= f"{end_date} 23:59:59")
    if severity != 'ALL':
        query = query.filter(Maintenance.severity == severity)

    m_list = query.order_by(Maintenance.report_date.desc()).all()
    result = []
    for m in m_list:
        item = Item.query.get(m.item_id)
        reporter = User.query.get(m.reported_by)
        tech = User.query.get(m.technician_id) if m.technician_id else None
        
        result.append({
            "id": m.id,
            "item_name": item.name if item else "Eliminado",
            "item_code": item.code if item else "N/A",
            "item_category": item.category.name if item and item.category else "N/A",
            "item_id": m.item_id,
            "reported_by_name": reporter.name if reporter else "N/A",
            "reported_by_email": reporter.email if reporter else "",
            "technician_name": tech.name if tech else "Pendiente",
            "technician_email": tech.email if tech else "",
            "severity": m.severity,
            "status": m.status,
            "report_date": m.report_date.isoformat(),
            "maintenance_type": m.maintenance_type,
            "cost": m.cost
        })
    return jsonify(result), 200

@maintenance_bp.route('/', methods=['POST'])
@jwt_required()
def create_maintenance():
    data = request.get_json()
    item_id = data.get('item_id')
    
    item = Item.query.get_or_404(item_id)
    
    # Bloquear equipo
    maint_status = Status.query.filter_by(name='IN_MAINTENANCE').first()
    if not maint_status:
        maint_status = Status(name='IN_MAINTENANCE')
        db.session.add(maint_status)
        db.session.flush()
    
    item.status_id = maint_status.id
    
    new_m = Maintenance(
        item_id=item_id,
        reported_by=get_jwt_identity(),
        failure_description=data.get('description'),
        severity=data.get('severity', 'LOW'),
        maintenance_type=data.get('type', 'CORRECTIVE'),
        status='PENDING'
    )
    
    db.session.add(new_m)
    db.session.commit()
    
    return jsonify({"success": True, "id": new_m.id}), 201

@maintenance_bp.route('/<int:id>/complete', methods=['POST'])
@jwt_required()
def complete_maintenance(id):
    m = Maintenance.query.get_or_404(id)
    data = request.get_json()
    
    m.status = 'COMPLETED'
    m.end_date = datetime.utcnow()
    m.solution = data.get('solution')
    m.diagnosis = data.get('diagnosis')
    m.cost = data.get('cost', 0.0)
    
    # Liberar equipo
    item = Item.query.get(m.item_id)
    avail_status = Status.query.filter_by(name='AVAILABLE').first()
    if item and avail_status:
        item.status_id = avail_status.id
        
    db.session.commit()
    return jsonify({"success": True}), 200
