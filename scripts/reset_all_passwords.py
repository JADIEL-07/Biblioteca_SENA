import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import bcrypt
from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print("=== Resetting Passwords to 'root1234' ===")
    hashed_pw = bcrypt.hashpw("root1234".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    for u in users:
        u.password = hashed_pw
        u.failed_attempts = 0
        u.is_blocked = False
        u.is_active = True
        print(f"User: {u.name} | Email: {u.email} | Document/ID: {u.id} -> Password reset to 'root1234', unblocked, and activated.")
        
    db.session.commit()
    print("\nDatabase commit successful! All accounts are now unblocked and have password 'root1234'.")
