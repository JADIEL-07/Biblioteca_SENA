from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE reservations ADD COLUMN admin_id TEXT'))
            conn.execute(text('ALTER TABLE reservations ADD COLUMN converted_at DATETIME'))
            conn.commit()
            print("Columnas admin_id y converted_at añadidas a reservations.")
    except Exception as e:
        print(f"Error o ya existen: {e}")
