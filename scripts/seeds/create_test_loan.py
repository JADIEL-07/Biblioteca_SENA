from app import create_app, db
from app.models.user import User
from app.models.item import Item, Status
from app.models.loan import Loan, LoanDetail
from datetime import datetime, timedelta

app = create_app()
with app.app_context():
    user = User.query.first()
    item = Item.query.first()
    
    if not user or not item:
        print("Falta usuario o ítem para crear préstamo de prueba.")
    else:
        # Asegurar status LOANED
        loaned_status = Status.query.filter_by(name='LOANED').first()
        if not loaned_status:
            loaned_status = Status(name='LOANED')
            db.session.add(loaned_status)
            db.session.commit()

        loan = Loan(
            user_id=user.id,
            due_date=datetime.now() + timedelta(days=7),
            status='ACTIVE'
        )
        db.session.add(loan)
        db.session.flush()
        
        detail = LoanDetail(
            loan_id=loan.id,
            item_id=item.id,
            delivery_status='EXCELLENT'
        )
        db.session.add(detail)
        
        item.status_id = loaned_status.id
        
        db.session.commit()
        print(f"Préstamo de prueba #{loan.id} creado para {user.name} con ítem {item.name}")
