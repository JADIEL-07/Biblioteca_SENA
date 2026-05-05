import os
from app import create_app, db
from app.models.item import Item

# Forzamos a que Flask use la carpeta instance
app = create_app()
with app.app_context():
    count = Item.query.count()
    db_path = app.config['SQLALCHEMY_DATABASE_URI']
    print(f'DATABASE_URI: {db_path}')
    print(f'TOTAL_ITEMS_FOUND: {count}')
    
    if count > 0:
        items = Item.query.all()
        for i in items:
            print(f'ITEM: {i.name} (Status ID: {i.status_id})')
