from app import create_app, db
from app.models import Item, Loan, Reservation

app = create_app()
with app.app_context():
    try:
        Loan.query.delete()
        Reservation.query.delete()
        Item.query.delete()
        db.session.commit()
        print('DATABASE_CLEAN_SUCCESS')
    except Exception as e:
        db.session.rollback()
        print(f'DATABASE_CLEAN_ERROR: {str(e)}')
