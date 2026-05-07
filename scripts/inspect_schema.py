import sqlite3
import os

db_path = os.path.join('instance', 'biblioteca.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get column names for users
cursor.execute("PRAGMA table_info(users)")
print("Users columns:", [col[1] for col in cursor.fetchall()])

# Get column names for loans
cursor.execute("PRAGMA table_info(loans)")
print("Loans columns:", [col[1] for col in cursor.fetchall()])

# Get column names for items
cursor.execute("PRAGMA table_info(items)")
print("Items columns:", [col[1] for col in cursor.fetchall()])

conn.close()
