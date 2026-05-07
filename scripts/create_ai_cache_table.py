import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models.ai_knowledge import AILearnedResponse

app = create_app()

with app.app_context():
    AILearnedResponse.__table__.create(db.engine, checkfirst=True)
    print("Tabla ai_learned_responses creada o ya existía.")
