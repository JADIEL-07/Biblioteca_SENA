from datetime import datetime
from ..extensions import db

class OutputType:
    MAINTENANCE = "MAINTENANCE"
    TRANSFER = "TRANSFER"
    DISPOSAL = "DISPOSAL"
    INTERNAL_USE = "INTERNAL_USE"

class OutputStatus:
    ACTIVE = "ACTIVE"
    RETURNED = "RETURNED"
    CLOSED = "CLOSED"

class ItemOutput(db.Model):
    __tablename__ = 'item_outputs'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False) # Admin/Soporte responsable
    
    type = db.Column(db.String(50), nullable=False) # MAINTENANCE, TRANSFER, etc.
    status = db.Column(db.String(50), default=OutputStatus.ACTIVE)
    
    destination = db.Column(db.String(255))
    description = db.Column(db.Text)
    reason_code = db.Column(db.String(50)) # DAÑO, TRASLADO, EVENTO
    
    created_at = db.Column(db.DateTime, default=datetime.now)
    estimated_return_date = db.Column(db.DateTime, nullable=True)
    actual_return_date = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    # Nota: El backref 'outputs' se añadirá al modelo Item
    user = db.relationship('User', backref=db.backref('outputs_handled', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "item_name": self.item.name if self.item else "Desconocido",
            "item_code": self.item.code if self.item else "N/A",
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else "Desconocido",
            "type": self.type,
            "status": self.status,
            "destination": self.destination,
            "description": self.description,
            "reason_code": self.reason_code,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "estimated_return_date": self.estimated_return_date.isoformat() if self.estimated_return_date else None,
            "actual_return_date": self.actual_return_date.isoformat() if self.actual_return_date else None
        }
