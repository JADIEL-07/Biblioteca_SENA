from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE items ADD COLUMN nit TEXT'))
            conn.execute(text('ALTER TABLE items ADD COLUMN stock INTEGER DEFAULT 1'))
            conn.commit()
            print("Columnas nit y stock añadidas exitosamente.")
    except Exception as e:
        print(f"Error o ya existen: {e}")
