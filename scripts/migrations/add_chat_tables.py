"""
Crea las tablas de chat: ticket_messages y staff_messages.
Idempotente: si las tablas ya existen, no falla.
"""
from app import create_app, db
from app.models.chat_message import TicketMessage, StaffMessage

app = create_app()
with app.app_context():
    try:
        TicketMessage.__table__.create(db.engine, checkfirst=True)
        print("Tabla 'ticket_messages' lista.")
    except Exception as e:
        print(f"Error creando ticket_messages: {e}")

    try:
        StaffMessage.__table__.create(db.engine, checkfirst=True)
        print("Tabla 'staff_messages' lista.")
    except Exception as e:
        print(f"Error creando staff_messages: {e}")

    print("Migración de chat completada.")
