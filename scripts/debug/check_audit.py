from app import create_app
from app.extensions import db
from app.models.audit_log import AuditLog

app = create_app()
with app.app_context():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(10).all()
    print(f"\n--- REVISIÓN DE AUDITORÍA (Últimos 10) ---")
    print(f"Total de registros en DB: {AuditLog.query.count()}")
    print("-" * 50)
    for l in logs:
        print(f"ID: {l.id} | Acción: {l.action} | Usuario: {l.user_id} | Fecha: {l.created_at}")
    print("-" * 50 + "\n")
