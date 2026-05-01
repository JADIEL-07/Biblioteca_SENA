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
        roles = ['ADMIN', 'INSTRUCTOR', 'APRENDIZ', 'GUEST', 'OPERADOR']
        for role_name in roles:
            if not Role.query.filter_by(name=role_name).first():
                db.session.add(Role(name=role_name))
        
        # Seed Statuses (Estados Físicos)
        from app.models.item import Status
        item_statuses = ['EXCELENTE', 'BUENO', 'REGULAR', 'MALO', 'DAÑADO', 'DISPONIBLE', 'PRESTADO', 'EN MANTENIMIENTO']
        for s_name in item_statuses:
            if not Status.query.filter_by(name=s_name).first():
                db.session.add(Status(name=s_name))

        # Seed Default Category/Location
        from app.models.item import Category, Location
        if not Category.query.filter_by(name='GENERAL').first():
            db.session.add(Category(name='GENERAL'))
        if not Location.query.filter_by(name='ALMACEN GENERAL').first():
            db.session.add(Location(name='ALMACEN GENERAL'))

        db.session.commit()
        print("Seeding completed successfully (Roles, Status, Category, Location).")

if __name__ == "__main__":
    seed_data()
