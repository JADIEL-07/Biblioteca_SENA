from datetime import datetime
from .. import db
from .base import Base

# Status flow:
#   QUEUED  -> en cola, ítem aún no disponible para esta persona
#   READY   -> ítem disponible, tiene 5h para reclamar (expiration_date fijada)
#   CLAIMED -> reclamado, convertido en préstamo
#   EXPIRED -> pasaron las 5h sin reclamar
#   CANCELLED -> cancelado por el usuario o admin
class Reservation(Base):
    __tablename__ = 'reservations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    reservation_date = db.Column(db.DateTime, default=datetime.utcnow)
    ready_at = db.Column(db.DateTime, nullable=True)         # cuándo pasó a READY
    expiration_date = db.Column(db.DateTime, nullable=True)  # ready_at + 5h
    last_reminder_sent = db.Column(db.DateTime, nullable=True)  # último recordatorio horario
    status = db.Column(db.String(20), default='QUEUED', index=True)
    admin_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=True)
    converted_at = db.Column(db.DateTime)
    converted_loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=True)
    is_deleted = db.Column(db.Boolean, default=False)
