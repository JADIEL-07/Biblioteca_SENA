from app import create_app
from app.models.user import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print("\n--- LISTADO DE USUARIOS ---")
    for u in users:
        role_name = u.role.name if u.role else "N/A"
        print(f"ID: {u.id} | Email: {u.email} | Nombre: {u.name} | Rol: {role_name}")
    print("-" * 30 + "\n")
