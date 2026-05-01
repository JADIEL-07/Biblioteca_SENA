from app import create_app, db
from app.models.user import User, Role

app = create_app()
with app.app_context():
    for user in User.query.all():
        role_name = user.role.name if user.role else "None"
        print(f"User: {user.name}, ID: {user.id}, Role: {role_name} (ID: {user.role_id})")
