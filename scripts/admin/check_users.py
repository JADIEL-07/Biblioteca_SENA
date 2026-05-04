from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    count = User.query.count()
    print(f"Total Users: {count}")
    for user in User.query.all():
        print(f"ID: {user.id}, Name: {user.name}, Email: {user.email}, Deleted: {user.is_deleted}")
