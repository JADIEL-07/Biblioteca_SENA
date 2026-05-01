from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT 0'))
            conn.execute(text('ALTER TABLE users ADD COLUMN last_login DATETIME'))
            conn.execute(text('ALTER TABLE users ADD COLUMN created_by TEXT'))
            conn.commit()
            print("Columnas de seguridad añadidas a users.")
    except Exception as e:
        print(f"Error o ya existen: {e}")
