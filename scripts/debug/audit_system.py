from app import create_app, db
from app.models.user import User, Role

app = create_app()
with app.app_context():
    print("--- ROLES ---")
    for role in Role.query.all():
        print(f"ID: {role.id}, Name: {role.name}")
    
    print("\n--- USERS ---")
    for user in User.query.all():
        role_name = user.role.name if user.role else "None"
        print(f"User: {user.name}, Email: {user.email}, Role: {role_name} (ID: {user.role_id})")
