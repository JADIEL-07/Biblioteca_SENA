from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    users = User.query.all()
    for u in users:
        print(f"ID: '{u.id}' | Name: {u.name} | Role: {u.role.name if u.role else 'N/A'}")
