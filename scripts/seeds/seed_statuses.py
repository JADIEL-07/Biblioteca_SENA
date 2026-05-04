from app import create_app, db
from app.models.item import Status

def seed_statuses():
    app = create_app()
    with app.app_context():
        statuses = [
            'DISPONIBLE',
            'EXCELENTE',
            'BUENO',
            'REGULAR',
            'MALO',
            'DAÑADO',
            'EN MANTENIMIENTO',
            'PRESTADO'
        ]
        
        for name in statuses:
            if not Status.query.filter_by(name=name).first():
                db.session.add(Status(name=name))
                print(f"Estado '{name}' agregado.")
            else:
                print(f"Estado '{name}' ya existe.")
        
        db.session.commit()
        print("Sincronización de estados completada.")

if __name__ == "__main__":
    seed_statuses()
