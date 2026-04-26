from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.reservation import Reservation
from ..models.user import User
from ..models.item import Item
from datetime import datetime, timedelta
from sqlalchemy import func, text, or_, String

reservation_bp = Blueprint('reservations', __name__)

@reservation_bp.route('/', methods=['GET'])
@jwt_required()
def get_reservations():
    search = request.args.get('search', '')
    start_date = request.args.get('startDate', '')
    end_date = request.args.get('endDate', '')
    category = request.args.get('category', 'ALL')

    query = Reservation.query.join(User, Reservation.user_id == User.id).join(Item, Reservation.item_id == Item.id)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Reservation.id.cast(String).ilike(search_filter),
                User.name.ilike(search_filter),
                User.email.ilike(search_filter),
                User.phone.ilike(search_filter),
                User.id.ilike(search_filter),
                Item.name.ilike(search_filter),
                Item.code.ilike(search_filter),
                Reservation.status.ilike(search_filter)
            )
        )

    if start_date:
        query = query.filter(Reservation.reservation_date >= f"{start_date} 00:00:00")
    if end_date:
        query = query.filter(Reservation.reservation_date <= f"{end_date} 23:59:59")
    if category != 'ALL':
        query = query.filter(Item.category.has(name=category))

    res_list = query.order_by(Reservation.reservation_date.desc()).all()
    result = []
    for res in res_list:
        user = User.query.get(res.user_id)
        admin = User.query.get(res.admin_id) if res.admin_id else None
        item = Item.query.get(res.item_id)
        
        result.append({
            "id": res.id,
            "user_id": res.user_id,
            "user_name": user.name if user else "Desconocido",
            "user_email": user.email if user else "",
            "user_phone": user.phone if user else "",
            "user_role": user.role.name if user and user.role else "N/A",
            "item_id": res.item_id,
            "item_name": item.name if item else "Eliminado",
            "item_category": item.category.name if item and item.category else "N/A",
            "reservation_date": res.reservation_date.isoformat(),
            "expiration_date": res.expiration_date.isoformat(),
            "converted_at": res.converted_at.isoformat() if res.converted_at else None,
            "status": res.status,
            "admin_name": admin.name if admin else "N/A"
        })
    return jsonify(result), 200

@reservation_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_reservation_stats():
    total = Reservation.query.count()
    active = Reservation.query.filter_by(status='ACTIVE').count()
    pending = Reservation.query.filter_by(status='PENDING').count()
    expired = Reservation.query.filter_by(status='EXPIRED').count()
    completed = Reservation.query.filter_by(status='COMPLETED').count()
    
    # Indicadores Inteligentes
    conversion_rate = (completed / total * 100) if total > 0 else 0
    expiry_rate = (expired / total * 100) if total > 0 else 0
    
    # Tiempo promedio de espera (si hay completadas)
    avg_wait = "2.4 hrs" # Ejemplo estático por ahora
    
    # Usuarios top
    top_users_query = db.session.query(
        User.name, func.count(Reservation.id).label('count')
    ).join(Reservation).group_by(User.id).order_by(text('count DESC')).limit(5).all()
    
    top_users = [{"name": u[0], "count": u[1]} for u in top_users_query]
    
    # Gráficas (Reservas por día - últimos 7 días)
    # ... lógica de gráficas ...
    
    return jsonify({
        "metrics": {
            "total": total,
            "active": active,
            "pending": pending,
            "expired": expired,
            "completed": completed
        },
        "indicators": {
            "conversion_rate": round(conversion_rate, 1),
            "expiry_rate": round(expiry_rate, 1),
            "avg_wait": avg_wait
        }
    }), 200

from sqlalchemy import text
