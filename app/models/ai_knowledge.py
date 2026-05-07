from datetime import datetime
from app.extensions import db
from app.models.base import Base

class AILearnedResponse(Base):
    __tablename__ = 'ai_learned_responses'

    id = db.Column(db.Integer, primary_key=True)
    query_text = db.Column(db.String(500), nullable=False)
    query_keywords = db.Column(db.String(500), nullable=False, index=True)
    response_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    use_count = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f"<AILearnedResponse {self.query_text[:20]}>"
