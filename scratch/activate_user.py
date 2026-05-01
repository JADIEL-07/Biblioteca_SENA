from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    user = User.query.get('1101755660')
    if user:
        user.is_active = True
        user.is_blocked = False
        user.failed_attempts = 0
        db.session.commit()
        print(f"Usuario {user.name} ({user.id}) ACTIVADO exitosamente.")
    else:
        print("Usuario con ID 1101755660 no encontrado.")
