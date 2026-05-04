from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE audit_logs ADD COLUMN details TEXT'))
            conn.commit()
            print("Columna 'details' añadida exitosamente.")
    except Exception as e:
        print(f"Error o ya existe: {e}")
