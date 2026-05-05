from app import create_app
from app.models import Category

app = create_app()
with app.app_context():
    print([c.name for c in Category.query.all()])
