from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    print("Actualizando esquema de inventario...")
    try:
        # Añadir nuevas columnas si no existen
        db.session.execute(text("ALTER TABLE items ADD COLUMN brand VARCHAR(100)"))
        db.session.execute(text("ALTER TABLE items ADD COLUMN model VARCHAR(100)"))
        db.session.execute(text("ALTER TABLE items ADD COLUMN serial_number VARCHAR(100)"))
        db.session.execute(text("ALTER TABLE items ADD COLUMN image_url TEXT"))
        db.session.commit()
        print("✅ Columnas añadidas exitosamente.")
    except Exception as e:
        db.session.rollback()
        print(f"ℹ️ Nota: {e} (Probablemente las columnas ya existen)")
