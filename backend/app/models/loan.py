from datetime import datetime
from .. import db

class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    loan_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    return_date = db.Column(db.DateTime)
    admin_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=True) # El que realizó el préstamo
    status = db.Column(db.String(50), default='ACTIVE') # ACTIVE, RETURNED, OVERDUE
    fine_amount = db.Column(db.Float, default=0.0) # Multa si aplica

    # N:M relationship via LoanDetail
    details = db.relationship('LoanDetail', backref='loan', lazy=True)

class LoanDetail(db.Model):
    __tablename__ = 'loan_details'
    id = db.Column(db.Integer, primary_key=True)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    delivery_status = db.Column(db.String(100))
    return_status = db.Column(db.String(100))
    
    item = db.relationship('Item', backref='loan_details')
