from app import create_app
from app.models.item import Status

app = create_app()
with app.app_context():
    statuses = Status.query.all()
    print("STATUS_LIST:")
    for s in statuses:
        print(f"ID: {s.id} | Name: '{s.name}'")
