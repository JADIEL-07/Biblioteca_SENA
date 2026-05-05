from app import create_app, db
from app.models.dependency import Dependency
from app.models.user import Role
from sqlalchemy import text

app = create_app()
with app.app_context():
    # 1. Create dependencies table
    try:
        db.session.execute(text('DROP TABLE IF EXISTS dependencies'))
        db.session.execute(text('''
            CREATE TABLE dependencies (
                id INTEGER PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        '''))
        db.session.commit()
        print("Tabla dependencies creada o verificada.")
    except Exception as e:
        db.session.rollback()
        print(f"Error creando tabla: {e}")

    # 2. Add default dependencies
    deps = ['BIBLIOTECA', 'ALMACÉN']
    for d_name in deps:
        if not Dependency.query.filter_by(name=d_name).first():
            db.session.add(Dependency(name=d_name))
            print(f"Dependencia {d_name} agregada.")
    db.session.commit()

    # 3. Alter existing tables
    try:
        db.session.execute(text("ALTER TABLE locations ADD COLUMN dependency_id INTEGER REFERENCES dependencies(id)"))
        db.session.commit()
        print("Columna dependency_id agregada a locations.")
    except Exception as e:
        db.session.rollback()
        print("Columna dependency_id en locations puede que ya exista.")

    try:
        db.session.execute(text("ALTER TABLE users ADD COLUMN dependency_id INTEGER REFERENCES dependencies(id)"))
        db.session.commit()
        print("Columna dependency_id agregada a users.")
    except Exception as e:
        db.session.rollback()
        print("Columna dependency_id en users puede que ya exista.")

    # 4. Add ALMACENISTA and BIBLIOTECARIO roles
    roles = ['ALMACENISTA', 'BIBLIOTECARIO']
    for r_name in roles:
        if not Role.query.filter_by(name=r_name).first():
            db.session.add(Role(name=r_name))
            print(f"Rol {r_name} agregado.")
    db.session.commit()

    # 5. Set default dependency for existing locations
    biblio = Dependency.query.filter_by(name='BIBLIOTECA').first()
    if biblio:
        db.session.execute(text(f"UPDATE locations SET dependency_id = {biblio.id} WHERE dependency_id IS NULL"))
        db.session.commit()
        print("Ubicaciones huérfanas asignadas a BIBLIOTECA.")

    print("--- MIGRACIÓN DE BD COMPLETADA ---")
