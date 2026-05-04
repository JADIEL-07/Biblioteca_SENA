import os
import sys
import subprocess

from app import create_app, db
from app.models.user import User, Role, FormationProgram
from app.models.item import Item, Category, Location, Status, Supplier
from app.models.loan import Loan, LoanDetail
from app.models.reservation import Reservation
from app.models.maintenance import Maintenance
from app.models.movement import Movement, Notification
from app.models.item_output import ItemOutput

app = create_app()

@app.cli.command("init-db")
def init_db():
    """Inicializa la base de datos y crea los roles básicos."""
    db.create_all()
    seed_basic_roles()
    print("Base de datos inicializada correctamente.")

def seed_basic_roles():
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
        print("Roles básicos creados.")

    if not FormationProgram.query.first():
        db.session.add(FormationProgram(id='2672153', name='ADSO'))
        db.session.commit()
        print("Programa de formación por defecto creado.")

if __name__ == "__main__":
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'static')

    print("Iniciando Frontend (Vite)...")
    frontend_proc = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=static_dir,
        shell=True
    )

    print("\n" + "=" * 50)
    print("  SISTEMA INTEGRAL BIBLIOTECA SENA")
    print("=" * 50)
    print(f"  Frontend:  http://localhost:5173")
    print(f"  API:       http://localhost:5000/api/v1")
    print("-" * 50)
    print("  Presiona Ctrl+C para detener todo")
    print("=" * 50 + "\n")

    try:
        with app.app_context():
            db.create_all()
            seed_basic_roles()

        is_dev = os.environ.get('FLASK_ENV', 'development') == 'development'
        app.run(host="0.0.0.0", port=5000, debug=is_dev)
    finally:
        print("\nDeteniendo Frontend...")
        if sys.platform == "win32":
            subprocess.run(
                ['taskkill', '/F', '/T', '/PID', str(frontend_proc.pid)],
                capture_output=True
            )
        else:
            frontend_proc.terminate()
        print("Sistema cerrado correctamente.")
