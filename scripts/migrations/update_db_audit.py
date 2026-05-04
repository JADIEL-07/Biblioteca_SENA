from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text('ALTER TABLE audit_logs ADD COLUMN entity_name VARCHAR(100)'))
        db.session.commit()
        print("Columna 'entity_name' agregada.")
    except Exception as e:
        print(f"Error o ya existe: {e}")
        db.session.rollback()

    try:
        # SQLite no permite cambiar tipos de columna fácilmente, pero entity_id ya estaba allí.
        # Solo nos aseguramos de que los inserts de strings funcionen (SQLite es dinámico).
        pass
    except Exception as e:
        print(f"Error: {e}")
