from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    # Promover a Kevin Jadiel a Admin
    user = User.query.filter_by(email='sierrajadiel07@gmail.com').first()
    if user:
        user.role_id = 1 # ADMIN
        db.session.commit()
        print(f"User {user.name} promoted to ADMIN.")
    else:
        print("User not found.")
