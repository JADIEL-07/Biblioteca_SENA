from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        with db.engine.connect() as conn:
            # Lista de nuevas columnas
            cols = [
                "ALTER TABLE maintenance ADD COLUMN reported_by TEXT",
                "ALTER TABLE maintenance ADD COLUMN diagnosis TEXT",
                "ALTER TABLE maintenance ADD COLUMN solution TEXT",
                "ALTER TABLE maintenance ADD COLUMN severity TEXT DEFAULT 'LOW'",
                "ALTER TABLE maintenance ADD COLUMN maintenance_type TEXT DEFAULT 'CORRECTIVE'",
                "ALTER TABLE maintenance ADD COLUMN report_date DATETIME",
                "ALTER TABLE maintenance ADD COLUMN estimated_end_date DATETIME",
                "ALTER TABLE maintenance ADD COLUMN requires_replacement BOOLEAN DEFAULT 0",
                "ALTER TABLE maintenance ADD COLUMN observations TEXT",
                "ALTER TABLE maintenance ADD COLUMN is_deleted BOOLEAN DEFAULT 0"
            ]
            for col in cols:
                try:
                    conn.execute(text(col))
                except Exception as ex:
                    print(f"Omitiendo: {ex}")
            
            conn.commit()
            print("Estructura Pro de mantenimiento actualizada.")
    except Exception as e:
        print(f"Error general: {e}")
