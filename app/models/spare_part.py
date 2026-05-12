from ..extensions import db
from datetime import datetime

class SparePartRequest(db.Model):
    __tablename__ = 'spare_part_requests'

    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    reason = db.Column(db.Text, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    supplier = db.Column(db.String(150), nullable=False)
    
    # Base64 images
    invoice_image = db.Column(db.Text, nullable=False)
    received_image = db.Column(db.Text, nullable=True) # Only populated when received
    
    status = db.Column(db.String(20), default='PENDING') # PENDING, RECEIVED
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    received_at = db.Column(db.DateTime, nullable=True)
    is_deleted = db.Column(db.Boolean, default=False)

    item = db.relationship('Item', backref='spare_part_requests', lazy=True)
    requester = db.relationship('User', backref='spare_part_requests', lazy=True)

    def __repr__(self):
        return f'<SparePartRequest {self.id} for Item {self.item_id}>'
