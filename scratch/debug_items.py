from app import create_app
from app.models.item import Item, Status

app = create_app()
with app.app_context():
    print("--- ITEMS ---")
    items = Item.query.all()
    for i in items:
        status_name = i.status_obj.name if i.status_obj else "SIN ESTADO"
        print(f"ID: {i.id} | Nombre: {i.name} | StatusID: {i.status_id} | Status: {status_name}")
    
    print("\n--- STATUSES IN DB ---")
    statuses = Status.query.all()
    for s in statuses:
        print(f"ID: {s.id} | Nombre: {s.name}")
