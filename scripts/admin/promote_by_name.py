from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    # Buscar todos los que tengan "Jadiel Sierra" en el nombre
    users = User.query.filter(User.name.contains('Jadiel Sierra')).all()
    for user in users:
        user.role_id = 1 # Promover a ADMIN
        print(f"User {user.name} ({user.email}) promoted to ADMIN.")
    
    db.session.commit()
