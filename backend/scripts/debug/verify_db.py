from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    print("Verificando columnas de inventario...")
    try:
        # Intentar seleccionar las nuevas columnas
        db.session.execute(text("SELECT brand, model, serial_number, image_url FROM items LIMIT 1"))
        print("OK: Las columnas existen.")
    except Exception as e:
        print(f"ERROR: {e}")
