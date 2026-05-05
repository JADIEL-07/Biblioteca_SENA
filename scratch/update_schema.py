from app import create_app, db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Usamos sqlalchemy text() para mayor compatibilidad
        db.session.execute(text('ALTER TABLE items ADD COLUMN physical_condition VARCHAR(100)'))
        db.session.commit()
        print('SCHEMA_UPDATE_SUCCESS')
    except Exception as e:
        db.session.rollback()
        # Si ya existe, simplemente ignoramos el error
        if 'duplicate column name' in str(e).lower() or 'already exists' in str(e).lower():
            print('SCHEMA_UPDATE_ALREADY_DONE')
        else:
            print(f'SCHEMA_UPDATE_ERROR: {str(e)}')
