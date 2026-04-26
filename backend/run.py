"""
Entrypoint principal del backend.

Este archivo es el punto de entrada oficial para arrancar el servidor Flask,
siguiendo la convención estándar de proyectos Flask (run.py en la raíz del backend).

Reemplaza a app/main.py, que se mantiene temporalmente por compatibilidad pero
quedará deprecated.

Uso:
    cd backend
    python run.py

O con la CLI de Flask:
    cd backend
    flask init-db
"""

import os
from app import create_app, db
from app.models.user import User, Role, FormationProgram
from app.models.item import Item, Category, Location, Status, Supplier
from app.models.loan import Loan, LoanDetail
from app.models.reservation import Reservation
from app.models.maintenance import Maintenance
from app.models.movement import Movement, Notification

app = create_app()

@app.cli.command("init-db")
def init_db():
    """Initializes the database and seeds basic roles."""
    db.create_all()
    seed_basic_roles()
    print("Database initialized successfully.")

def seed_basic_roles():
    # Seed roles if empty
    if not Role.query.first():
        roles = [
            'ADMIN', 
            'BIBLIOTECARIO', 
            'ALMACENISTA', 
            'SOPORTE_TECNICO', 
            'EMPRESA', 
            'APRENDIZ', 
            'USUARIO'
        ]
        for r_name in roles:
            db.session.add(Role(name=r_name))
        db.session.commit()
        print("Basic roles seeded successfully.")

    if not FormationProgram.query.first():
        # Crear un programa por defecto para pruebas
        db.session.add(FormationProgram(id='2672153', name='ADSO'))
        db.session.commit()
        print("Default program seeded.")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_basic_roles()

    is_dev = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(host="0.0.0.0", port=5000, debug=is_dev)
