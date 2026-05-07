import sqlite3
import os

db_path = os.path.join('instance', 'biblioteca.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get list of tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cursor.fetchall()]
print('=== Database Tables ===')
for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"- {table}: {count} rows")

print('\n=== Dependencies ===')
cursor.execute("SELECT id, name FROM dependencies")
for r in cursor.fetchall():
    print(f"  ID: {r[0]}, Name: {r[1]}")

print('\n=== Users with Roles and Dependencies ===')
cursor.execute("""
    SELECT u.id, u.email, u.name, r.name, d.name 
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN dependencies d ON u.dependency_id = d.id
""")
for r in cursor.fetchall():
    print(f"  User: {r[2]} ({r[1]}), Role: {r[3]}, Dep: {r[4]}")

print('\n=== Sample Items joined with Location Dependency ===')
cursor.execute("""
    SELECT i.id, i.name, c.name, s.name, l.name, d.name 
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN statuses s ON i.status_id = s.id
    LEFT JOIN locations l ON i.location_id = l.id
    LEFT JOIN dependencies d ON l.dependency_id = d.id
    LIMIT 20
""")
for r in cursor.fetchall():
    print(f"  Item ID: {r[0]}, Name: {r[1]}, Category: {r[2]}, Status: {r[3]}, Location: {r[4]}, Dep: {r[5]}")

print('\n=== Loans ===')
cursor.execute("""
    SELECT l.id, u.name, l.status, l.due_date 
    FROM loans l
    LEFT JOIN users u ON l.user_id = u.id
""")
for r in cursor.fetchall():
    print(f"  Loan ID: {r[0]}, User: {r[1]}, Status: {r[2]}, Due Date: {r[3]}")

print('\n=== Reservations ===')
cursor.execute("""
    SELECT r.id, u.name, i.name, r.status, r.expiration_date 
    FROM reservations r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN items i ON r.item_id = i.id
""")
for r in cursor.fetchall():
    print(f"  Res ID: {r[0]}, User: {r[1]}, Item: {r[2]}, Status: {r[3]}, Exp Date: {r[4]}")

conn.close()
