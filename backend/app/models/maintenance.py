from datetime import datetime
from .. import db
from .base import Base

class Maintenance(Base):
    __tablename__ = 'maintenance'
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    
    # Personas involucradas
    reported_by = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    technician_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=True)
    
    # Información técnica
    failure_description = db.Column(db.Text, nullable=False) # descripcion_problema
    diagnosis = db.Column(db.Text) # diagnostico
    solution = db.Column(db.Text) # solucion
    
    # Clasificación
    severity = db.Column(db.String(20), default='LOW') # LOW, MEDIUM, HIGH, CRITICAL
    maintenance_type = db.Column(db.String(20), default='CORRECTIVE') # PREVENTIVE, CORRECTIVE
    
    # Estados y Fechas
    status = db.Column(db.String(20), default='PENDING') # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    report_date = db.Column(db.DateTime, default=datetime.utcnow)
    start_date = db.Column(db.DateTime)
    estimated_end_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    
    # Datos Pro
    cost = db.Column(db.Float, default=0.0)
    requires_replacement = db.Column(db.Boolean, default=False)
    observations = db.Column(db.Text)
    
    is_deleted = db.Column(db.Boolean, default=False)

    @property
    def resolution_time(self):
        if self.start_date and self.end_date:
            return self.end_date - self.start_date
        return None
