from app import create_app
from app.extensions import db
from app.models.item import Category, Location

app = create_app()
with app.app_context():
    print("--- CATEGORIES ---")
    try:
        cats = Category.query.all()
        for c in cats:
            print(f"ID: {c.id}, Name: {c.name}")
    except Exception as e:
        print(f"Error reading categories: {e}")

    print("\n--- LOCATIONS ---")
    try:
        locs = Location.query.all()
        for l in locs:
            print(f"ID: {l.id}, Name: {l.name}")
    except Exception as e:
        print(f"Error reading locations: {e}")
