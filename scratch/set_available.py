from app import create_app, db
from app.models.item import Item

app = create_app()
with app.app_context():
    try:
        # Actualizar todos los ítems al status_id 1 (Disponible)
        num_updated = Item.query.update({Item.status_id: 1})
        db.session.commit()
        print(f'SUCCESS: {num_updated} items set to Available')
    except Exception as e:
        db.session.rollback()
        print(f'ERROR: {str(e)}')
