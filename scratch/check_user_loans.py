from app import create_app, db
from app.models.loan import Loan, LoanDetail

app = create_app()
with app.app_context():
    loans = Loan.query.filter_by(user_id='1101755661').all()
    print(f'TOTAL_LOANS: {len(loans)}')
    for l in loans:
        items = [d.item.name for d in l.details if d.item]
        print(f'LOAN_ID: {l.id} | STATUS: {l.status} | ITEMS: {items}')
