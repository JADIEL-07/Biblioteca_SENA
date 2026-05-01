"""
⚠️ DEPRECATED — usar `backend/run.py` en su lugar.

Este archivo era el entrypoint original del backend. Durante la migración de
estructura se trasladó la lógica a `backend/run.py` para alinearse con la
convención estándar de proyectos Flask.

Se mantiene aquí por compatibilidad: si existe código o documentación antigua
que invoca `python -m app.main`, seguirá funcionando. Pero el entrypoint
recomendado es `backend/run.py`.

NO ELIMINAR sin verificar antes que ningún script, alias o documento externo
dependa de esta ruta.
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
