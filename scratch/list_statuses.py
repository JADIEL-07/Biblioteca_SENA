from app import create_app
from app.models.item import Status

app = create_app()
with app.app_context():
    print({s.name: s.id for s in Status.query.all()})
