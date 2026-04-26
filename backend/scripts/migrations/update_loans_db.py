from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE loans ADD COLUMN admin_id TEXT'))
            conn.execute(text('ALTER TABLE loans ADD COLUMN fine_amount FLOAT DEFAULT 0.0'))
            conn.commit()
            print("Columnas añadidas exitosamente.")
    except Exception as e:
        print(f"Error o ya existen: {e}")
