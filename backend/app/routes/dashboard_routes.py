from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models.item import Item
from ..models.user import User, Role
from ..models.loan import Loan
from ..models.reservation import Reservation
from ..models.maintenance import Maintenance
from ..models.movement import Movement
from sqlalchemy import func
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    # 1. Main Metrics
    total_items = Item.query.count()
    available = Item.query.filter_by(status_id=1).count() # Assuming 1 = AVAILABLE
    active_loans = Loan.query.filter_by(status='ACTIVE').count()
    maintenance = Maintenance.query.filter_by(status='IN_PROGRESS').count()
    active_reservations = Reservation.query.filter_by(status='ACTIVE').count()
    total_users = User.query.count()

    # Mock charts
    loans_data = [
        {"name": "Jan", "total": 120},
        {"name": "Feb", "total": 150},
        {"name": "Mar", "total": 110},
        {"name": "Apr", "total": 180},
        {"name": "May", "total": 210},
        {"name": "Jun", "total": 240},
    ]

    categories_data = [
        {"name": "Books", "value": 482, "color": "#10b981"},
        {"name": "Tech", "value": 312, "color": "#3b82f6"},
        {"name": "Tools", "value": 215, "color": "#f59e0b"},
        {"name": "Furniture", "value": 123, "color": "#8b5cf6"},
        {"name": "Others", "value": 100, "color": "#94a3b8"},
    ]

    recent_activity = [
        {"id": 1, "user": "Admin SENA", "action": "added new item", "target": "Epson X41", "time": "15 min ago", "type": "add"},
        {"id": 2, "user": "System", "action": "approved loan", "target": "#LOAN-55", "time": "1h ago", "type": "approve"},
    ]

    return jsonify({
        "metrics": {
            "total": total_items,
            "disponibles": available,
            "prestamos": active_loans,
            "mantenimiento": maintenance,
            "reservas": active_reservations,
            "usuarios": total_users
        },
        "trends": {
            "total": "+12 this month",
            "disponibles": f"{(available/total_items*100):.1f}% of total" if total_items > 0 else "0%",
            "prestamos": f"{(active_loans/total_items*100):.1f}% of total" if total_items > 0 else "0%",
            "mantenimiento": "4.7% of total",
            "reservas": "5 today",
            "usuarios": "8 this month"
        },
        "charts": {
            "loans": loans_data,
            "categories": categories_data
        },
        "activity": recent_activity
    })
