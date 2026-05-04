from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE tickets ADD COLUMN assigned_to TEXT'))
            conn.execute(text('ALTER TABLE tickets ADD COLUMN severity TEXT DEFAULT "MEDIUM"'))
            conn.execute(text('ALTER TABLE tickets ADD COLUMN is_deleted BOOLEAN DEFAULT 0'))
            conn.commit()
            print("Estructura de tickets actualizada.")
    except Exception as e:
        print(f"Error o ya existen: {e}")
