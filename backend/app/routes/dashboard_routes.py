from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models.item import Item, Category, Status
from ..models.user import User
from ..models.loan import Loan
from ..models.reservation import Reservation
from ..models.maintenance import Maintenance
from ..models.audit_log import AuditLog
from sqlalchemy import func, desc
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        # 1. Metri-Kpis Principales
        total_items = Item.query.count()
        
        # Identificar estados que restan disponibilidad
        loaned_status = Status.query.filter(Status.name.in_(['PRESTADO', 'LOANED'])).first()
        maint_status = Status.query.filter(Status.name.in_(['EN MANTENIMIENTO', 'MANTENIMIENTO'])).first()
        damaged_status = Status.query.filter(Status.name.in_(['DAÑADO', 'DAÃ‘ADO', 'MALO', 'PERDIDO'])).first()

        active_loans = Item.query.filter_by(status_id=loaned_status.id).count() if loaned_status else 0
        maintenance = Item.query.filter_by(status_id=maint_status.id).count() if maint_status else 0
        damaged = Item.query.filter_by(status_id=damaged_status.id).count() if damaged_status else 0
        
        # Disponible = Total - Prestados - Mantenimiento - Dañados/Perdidos
        available = total_items - active_loans - maintenance - damaged
        
        active_reservations = Reservation.query.filter_by(status='PENDIENTE').count()

        # 2. Datos para Gráfico de Torta (Estados)
        statuses = Status.query.all()
        pie_data = []
        colors = {
            'DISPONIBLE': '#39A900',
            'EXCELENTE': '#39A900',
            'BUENO': '#4ade80',
            'REGULAR': '#fbbf24',
            'PRESTADO': '#eab308',
            'MANTENIMIENTO': '#f97316',
            'EN MANTENIMIENTO': '#f97316',
            'DAÑADO': '#ef4444',
            'MALO': '#ef4444',
            'PERDIDO': '#64748b'
        }
        for s in statuses:
            count = Item.query.filter_by(status_id=s.id).count()
            if count > 0:
                name = s.name.upper()
                pie_data.append({
                    "name": s.name.capitalize(),
                    "value": count,
                    "color": colors.get(name, '#94a3b8')
                })
        
        # Si no hay datos, enviamos los básicos vacíos para el diseño
        if not pie_data:
            pie_data = [{"name": "Sin elementos", "value": 1, "color": "#f1f5f9"}]

        # 3. Datos para Gráfico de Barras (Categorías)
        categories = Category.query.all()
        cat_data = []
        for c in categories:
            count = Item.query.filter_by(category_id=c.id).count()
            if count > 0:
                pct = (count / total_items * 100) if total_items > 0 else 0
                cat_data.append({
                    "name": c.name,
                    "val": count,
                    "pct": round(pct, 1)
                })
        cat_data = sorted(cat_data, key=lambda x: x['val'], reverse=True)[:5]

        # 4. Actividad Reciente (AuditLog)
        recent_logs = AuditLog.query.order_by(desc(AuditLog.created_at)).limit(10).all()
        activity = []
        for log in recent_logs:
            activity.append({
                "id": log.id,
                "user": log.user_id, # Documento del usuario
                "action": log.action,
                "target": f"{log.entity_name} #{log.entity_id}",
                "time": log.created_at.isoformat(),
                "type": log.action.lower()
            })

        # 5. Próximas devoluciones (Reales)
        upcoming_loans = Loan.query.filter(Loan.status == 'ACTIVE').order_by(Loan.return_date.asc()).limit(5).all()
        upcoming_returns = []
        for l in upcoming_loans:
            upcoming_returns.append({
                "id": l.id,
                "item_name": l.item.name if l.item else "Elemento",
                "user_name": l.user.name if l.user else "Usuario",
                "date": l.return_date.isoformat(),
                "image": l.item.image_url if l.item else ""
            })

        # 6. Estructura para gráfico de líneas (Últimos 6 meses)
        trends = []
        for i in range(5, -1, -1):
            month_date = datetime.now() - timedelta(days=i*30)
            month_name = month_date.strftime('%b')
            trends.append({"name": month_name, "value": 0}) 

        return jsonify({
            "metrics": {
                "total": total_items,
                "available": available,
                "loans": active_loans,
                "maintenance": maintenance,
                "reservations": active_reservations
            },
            "pieData": pie_data,
            "catData": cat_data,
            "activity": activity,
            "lineData": trends,
            "upcomingReturns": upcoming_returns
        })
    except Exception as e:
        print(f"[ERROR] dashboard_stats: {e}")
        return jsonify({"error": str(e)}), 500
