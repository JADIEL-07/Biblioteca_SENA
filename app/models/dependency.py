from ..extensions import db
from .base import Base

class Dependency(Base):
    __tablename__ = 'dependencies'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False) # ej. 'BIBLIOTECA', 'ALMACEN'
    
    # Relationships
    locations = db.relationship('Location', backref='dependency_obj', lazy=True)
    users = db.relationship('User', backref='dependency_obj', lazy=True)
