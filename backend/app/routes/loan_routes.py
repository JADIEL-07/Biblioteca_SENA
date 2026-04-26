from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.loan import Loan, LoanDetail
from ..models.item import Item
from ..models.user import User
from datetime import datetime, timedelta
from sqlalchemy import func, or_, String

loan_bp = Blueprint('loans', __name__)

@loan_bp.route('/', methods=['GET'])
@jwt_required()
def get_loans():
    search = request.args.get('search', '')
    start_date = request.args.get('startDate', '')
    end_date = request.args.get('endDate', '')
    category = request.args.get('category', 'ALL')

    query = Loan.query.join(User, Loan.user_id == User.id).outerjoin(LoanDetail).outerjoin(Item)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Loan.id.cast(String).ilike(search_filter),
                User.name.ilike(search_filter),
                User.email.ilike(search_filter),
                User.phone.ilike(search_filter),
                User.id.ilike(search_filter),
                Item.name.ilike(search_filter),
                Item.code.ilike(search_filter),
                Loan.status.ilike(search_filter)
            )
        )
        
    if start_date:
        query = query.filter(Loan.loan_date >= f"{start_date} 00:00:00")
    if end_date:
        query = query.filter(Loan.loan_date <= f"{end_date} 23:59:59")
    if category != 'ALL':
        query = query.filter(Item.category.has(name=category))

    loans = query.order_by(Loan.loan_date.desc()).all()
    result = []
    for loan in loans:
        user = User.query.get(loan.user_id)
        admin = User.query.get(loan.admin_id) if loan.admin_id else None
        items = []
        for detail in loan.details:
            items.append({
                "id": detail.item_id,
                "name": detail.item.name if detail.item else "Ítem eliminado",
                "category": detail.item.category.name if detail.item and detail.item.category else "N/A",
                "nit": detail.item.nit if detail.item else None,
                "delivery_status": detail.delivery_status,
                "return_status": detail.return_status
            })
        
        result.append({
            "id": loan.id,
            "user_id": loan.user_id,
            "user_name": user.name if user else "Usuario eliminado",
            "user_email": user.email if user else "",
            "user_phone": user.phone if user else "",
            "admin_name": admin.name if admin else "Sistema",
            "loan_date": loan.loan_date.isoformat(),
            "due_date": loan.due_date.isoformat(),
            "return_date": loan.return_date.isoformat() if loan.return_date else None,
            "status": loan.status,
            "fine_amount": loan.fine_amount,
            "items": items
        })
    return jsonify(result), 200

@loan_bp.route('/', methods=['POST'])
@jwt_required()
def create_loan():
    data = request.get_json()
    user_id = data.get('user_id')
    item_ids = data.get('item_ids', []) # Lista de IDs de ítems
    days = data.get('days', 7)
    
    if not user_id or not item_ids:
        return jsonify({"error": "Faltan datos obligatorios"}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
        
    loan = Loan(
        user_id=user_id,
        admin_id=get_jwt_identity(),
        due_date=datetime.now() + timedelta(days=days),
        status='ACTIVE'
    )
    db.session.add(loan)
    db.session.flush() # Para obtener el ID del préstamo
    
    for item_id in item_ids:
        item = Item.query.get(item_id)
        if item and item.status_obj and item.status_obj.name in ['AVAILABLE', 'EXCELENTE', 'BUENO', 'REGULAR']:
            detail = LoanDetail(
                loan_id=loan.id,
                item_id=item_id,
                delivery_status='GOOD'
            )
            from ..models.item import Status
            loaned_status = Status.query.filter_by(name='LOANED').first()
            if not loaned_status:
                loaned_status = Status(name='LOANED')
                db.session.add(loaned_status)
                db.session.flush()
            item.status_id = loaned_status.id
            db.session.add(detail)
        else:
            db.session.rollback()
            return jsonify({"error": f"El ítem {item_id} no está disponible"}), 400
            
    db.session.commit()
    return jsonify({"success": True, "message": "Préstamo creado exitosamente"}), 201

@loan_bp.route('/<int:id>/return', methods=['POST'])
@jwt_required()
def return_loan(id):
    loan = Loan.query.get_or_404(id)
    data = request.get_json()
    
    loan.return_date = datetime.now()
    loan.status = 'RETURNED'
    
    for detail in loan.details:
        item = Item.query.get(detail.item_id)
        if item:
            from ..models.item import Status
            avail_status = Status.query.filter_by(name='AVAILABLE').first()
            item.status_id = avail_status.id
            detail.return_status = data.get('return_status', 'GOOD')
            
    # Calcular multa si es tarde
    if datetime.now() > loan.due_date:
        loan.fine_amount = 5000.0 # Ejemplo: multa fija por retraso
        
    db.session.commit()
    return jsonify({"success": True, "message": "Préstamo devuelto exitosamente"}), 200
