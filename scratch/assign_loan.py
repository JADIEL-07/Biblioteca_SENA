from app import create_app, db
from app.models.user import User
from app.models.item import Item
from app.models.loan import Loan, LoanDetail
from datetime import datetime, timedelta

app = create_app()
with app.app_context():
    try:
        user = User.query.get('1101755661')
        item = Item.query.get(7)
        
        if user and item:
            # 1. Crear el préstamo (Cabecera)
            loan = Loan(
                user_id=user.id,
                loan_date=datetime.now(),
                due_date=datetime.now() + timedelta(days=8),
                status='ACTIVE'
            )
            db.session.add(loan)
            db.session.flush() # Para obtener el ID del loan
            
            # 2. Crear el detalle (Vínculo con el ítem)
            detail = LoanDetail(
                loan_id=loan.id,
                item_id=item.id,
                delivery_status='Excelente'
            )
            
            # 3. Cambiar estado del ítem a OCUPADO (ID 8)
            item.status_id = 8
            
            db.session.add(detail)
            db.session.commit()
            print(f'LOAN_ASSIGN_SUCCESS: {item.name} assigned to {user.name} via Loan ID {loan.id}')
        else:
            print(f'LOAN_ASSIGN_ERROR: User or Item (ID: 7) not found.')
    except Exception as e:
        db.session.rollback()
        print(f'LOAN_ASSIGN_ERROR: {str(e)}')
