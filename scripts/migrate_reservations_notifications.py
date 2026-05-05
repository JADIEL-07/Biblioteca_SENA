"""One-shot migration: rebuild notifications + reservations tables to match
the new schema (FIFO queue + in-app notifications).

Run once:  python scripts/migrate_reservations_notifications.py
"""
import os
import sys
import sqlite3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, 'instance', 'biblioteca.db')

if not os.path.exists(DB_PATH):
    print(f"DB no encontrada en {DB_PATH}")
    sys.exit(1)

con = sqlite3.connect(DB_PATH)
cur = con.cursor()

print("Reconstruyendo tabla 'notifications'...")
cur.execute("DROP TABLE IF EXISTS notifications")
cur.execute("""
    CREATE TABLE notifications (
        id INTEGER PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        title VARCHAR(150),
        message TEXT NOT NULL,
        type VARCHAR(50),
        related_type VARCHAR(50),
        related_id INTEGER,
        is_read BOOLEAN DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
""")
cur.execute("CREATE INDEX ix_notifications_user_id ON notifications(user_id)")
cur.execute("CREATE INDEX ix_notifications_type ON notifications(type)")
cur.execute("CREATE INDEX ix_notifications_is_read ON notifications(is_read)")
cur.execute("CREATE INDEX ix_notifications_date ON notifications(date)")

print("Migrando 'reservations' (añadir columnas y normalizar estados)...")
existing = {r[1] for r in cur.execute("PRAGMA table_info(reservations)").fetchall()}

def add(col, ddl):
    if col not in existing:
        cur.execute(f"ALTER TABLE reservations ADD COLUMN {ddl}")
        print(f"  + columna {col}")

add('ready_at',           'ready_at DATETIME')
add('last_reminder_sent', 'last_reminder_sent DATETIME')
add('converted_loan_id',  'converted_loan_id INTEGER REFERENCES loans(id)')

# Normalizar estados antiguos al nuevo vocabulario
cur.execute("UPDATE reservations SET status='QUEUED'    WHERE status='PENDING'")
cur.execute("UPDATE reservations SET status='READY'     WHERE status='ACTIVE'")
cur.execute("UPDATE reservations SET status='CLAIMED'   WHERE status='COMPLETED'")
# EXPIRED y CANCELLED se quedan igual.

# Para reservas READY existentes que no tengan ready_at, asumir reservation_date
cur.execute("""
    UPDATE reservations
       SET ready_at = reservation_date
     WHERE status='READY' AND ready_at IS NULL
""")

# Index por status para acelerar el scheduler
cur.execute("CREATE INDEX IF NOT EXISTS ix_reservations_status ON reservations(status)")

con.commit()
con.close()
print("OK. Migración completada.")
