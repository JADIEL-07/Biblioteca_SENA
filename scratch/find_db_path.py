import os
from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    # Obtener la ruta absoluta del archivo de base de datos
    result = db.session.execute(text("PRAGMA database_list")).fetchall()
    for row in result:
        print(f"DATABASE_FILE_PATH: {row[2]}")
