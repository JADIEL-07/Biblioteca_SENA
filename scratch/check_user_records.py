import os
from app import create_app, db
from app.models.loan import Loan, LoanDetail
from app.models.reservation import Reservation

app = create_app()
with app.app_context():
    user_id = '1101755661'
    print(f"--- REVISIÓN DE CUENTA: {user_id} ---")
    
    loans = Loan.query.filter_by(user_id=user_id).all()
    print(f"\nPRÉSTAMOS ENCONTRADOS: {len(loans)}")
    for l in loans:
        items = [d.item.name for d in l.details if d.item] if l.details else []
        print(f"  ID: {l.id} | Status: {l.status} | Items: {items}")
        
    reservations = Reservation.query.filter_by(user_id=user_id).all()
    print(f"\nRESERVAS ENCONTRADAS: {len(reservations)}")
    for r in reservations:
        item = r.item.name if r.item else "Sin Ítem"
        print(f"  ID: {r.id} | Status: {r.status} | Item: {item}")
