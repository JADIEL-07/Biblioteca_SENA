from .. import db
from .base import Base


class TicketMessage(Base):
    """
    Mensaje dentro del chat de un ticket (Aprendiz <-> Soporte).
    Regla de oro: solo el reporter del ticket y el assignee (Soporte) pueden escribir.
    """
    __tablename__ = 'ticket_messages'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False, index=True)
    sender_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)

    body = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)

    sender = db.relationship('User', foreign_keys=[sender_id], lazy='joined')
    ticket = db.relationship('Ticket', backref=db.backref('messages', lazy='dynamic', cascade='all, delete-orphan'))


class StaffMessage(Base):
    """
    Chat interno entre roles altos (Bibliotecario, Almacenista, Soporte, Admin).
    Conversaciones 1-a-1 entre dos usuarios.
    Los Aprendices NO pueden acceder a este canal bajo ninguna circunstancia.
    """
    __tablename__ = 'staff_messages'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False, index=True)
    receiver_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False, index=True)

    body = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)

    sender = db.relationship('User', foreign_keys=[sender_id], lazy='joined')
    receiver = db.relationship('User', foreign_keys=[receiver_id], lazy='joined')
