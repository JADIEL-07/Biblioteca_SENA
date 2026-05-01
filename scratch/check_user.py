from app import create_app
from app.models.user import User

app = create_app()
with app.app_context():
    user = User.query.get('1101755660')
    if user:
        print(f"USUARIO ENCONTRADO:")
        print(f"ID: {user.id}")
        print(f"Nombre: {user.name}")
        print(f"Email: {user.email}")
        print(f"Rol ID: {user.role_id}")
        print(f"Activo: {user.is_active}")
        print(f"Bloqueado: {user.is_blocked}")
    else:
        print("Usuario con ID 1101755660 no encontrado.")
