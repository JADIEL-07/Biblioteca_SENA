from app import create_app, db
from app.models.user import User, Role, Permission
from app.models.loan import Loan
from app.models.item import Item
from app.models.reservation import Reservation
from app.models.maintenance import Maintenance
from app.models.movement import Movement, Notification

def seed_data():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()

        # Seed Roles
        roles = ['ADMIN', 'INSTRUCTOR', 'APRENDIZ', 'GUEST']
        for role_name in roles:
            if not Role.query.filter_by(name=role_name).first():
                db.session.add(Role(name=role_name))
                print(f"Role '{role_name}' created.")
        
        db.session.commit()
        print("Seeding completed successfully.")

if __name__ == "__main__":
    seed_data()
