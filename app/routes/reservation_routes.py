from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.reservation import Reservation
from ..models.user import User
from ..models.item import Item
from ..services.reservation_queue import enqueue_reservation
from datetime import datetime, timedelta
from sqlalchemy import func, text, or_, String

reservation_bp = Blueprint('reservations', __name__)


@reservation_bp.route('/', methods=['POST'])
@jwt_required()
def create_reservation():
    """Aprendiz reserva un ítem. Entra como QUEUED o READY según stock."""
    data = request.get_json() or {}
    item_id = data.get('item_id')
    if not item_id:
        return jsonify({"error": "item_id es obligatorio"}), 400

    user_id = get_jwt_identity()
    res, err = enqueue_reservation(user_id=user_id, item_id=item_id)
    if err:
        return jsonify({"error": err}), 400

    return jsonify({
        "success": True,
        "id": res.id,
        "status": res.status,
        "expiration_date": res.expiration_date.isoformat() if res.expiration_date else None,
    }), 201


@reservation_bp.route('/<int:rid>/cancel', methods=['POST'])
@jwt_required()
def cancel_reservation(rid):
    user_id = get_jwt_identity()
    res = Reservation.query.filter_by(id=rid, user_id=str(user_id)).first()
    if not res:
        return jsonify({"error": "No encontrada"}), 404
    if res.status not in ('QUEUED', 'READY'):
        return jsonify({"error": "Esta reserva no se puede cancelar"}), 400
    was_ready = res.status == 'READY'
    res.status = 'CANCELLED'
    db.session.commit()
    if was_ready:
        # Liberó un slot — promover al siguiente
        from ..services.reservation_queue import on_item_available
        on_item_available(res.item_id)
        db.session.commit()
    return jsonify({"success": True}), 200

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
            "ready_at": res.ready_at.isoformat() if res.ready_at else None,
            "expiration_date": res.expiration_date.isoformat() if res.expiration_date else None,
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
    ).join(Reservation, User.id == Reservation.user_id).group_by(User.id).order_by(text('count DESC')).limit(5).all()
    
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

@reservation_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_reservations():
    """Solo reservas activas (QUEUED + READY) del aprendiz."""
    user_id = get_jwt_identity()
    only_active = request.args.get('active', 'true').lower() == 'true'
    q = Reservation.query.filter_by(user_id=str(user_id))
    if only_active:
        q = q.filter(Reservation.status.in_(['QUEUED', 'READY']))
    res_list = q.order_by(Reservation.reservation_date.desc()).all()

    result = []
    for res in res_list:
        item = Item.query.get(res.item_id)
        # Calcular posición en cola para QUEUED
        position = None
        if res.status == 'QUEUED':
            position = Reservation.query.filter(
                Reservation.item_id == res.item_id,
                Reservation.status == 'QUEUED',
                Reservation.reservation_date <= res.reservation_date,
            ).count()
        result.append({
            "id": res.id,
            "item_id": res.item_id,
            "item_name": item.name if item else "Eliminado",
            "item_code": item.code if item else "N/A",
            "item_category": item.category.name if item and item.category else "N/A",
            "item_location": item.location.name if item and item.location else "N/A",
            "item_image_url": item.image_url if item else None,
            "reservation_date": res.reservation_date.isoformat(),
            "ready_at": res.ready_at.isoformat() if res.ready_at else None,
            "expiration_date": res.expiration_date.isoformat() if res.expiration_date else None,
            "status": res.status,
            "queue_position": position,
        })
    return jsonify(result), 200
