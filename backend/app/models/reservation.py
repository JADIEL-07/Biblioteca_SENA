from datetime import datetime, timedelta
from .. import db
from .base import Base

class Reservation(Base):
    __tablename__ = 'reservations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    reservation_date = db.Column(db.DateTime, default=datetime.utcnow)
    expiration_date = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))
    status = db.Column(db.String(20), default='PENDING') # PENDING, ACTIVE, EXPIRED, CANCELLED, COMPLETED
    admin_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=True) # Procesado por
    converted_at = db.Column(db.DateTime) # Fecha en que se convirtió a préstamo
    is_deleted = db.Column(db.Boolean, default=False)
