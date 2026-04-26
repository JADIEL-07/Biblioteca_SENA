from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    user = User.query.filter_by(id='1.098.765.432').first()
    if user:
        print(f"Usuario: {user.name}")
        print(f"ID: {user.id}")
        print(f"Rol ID: {user.role_id}")
        print(f"Rol Name: {user.role.name if user.role else 'SIN ROL'}")
        print(f"Activo: {user.is_active}")
        print(f"Bloqueado: {user.is_blocked}")
    else:
        print("Usuario Admin no encontrado con ese ID.")
