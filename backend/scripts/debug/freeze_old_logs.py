from app import create_app
from app.extensions import db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.item import Item

app = create_app()
with app.app_context():
    logs = AuditLog.query.filter(AuditLog.entity_name == None).all()
    print(f"Congelando {len(logs)} registros antiguos...")
    for log in logs:
        name = "Sistema"
        try:
            if log.entity == 'users' and log.entity_id:
                u = User.query.get(str(log.entity_id))
                name = u.name if u else f"Usuario {log.entity_id}"
            elif log.entity == 'items' and log.entity_id:
                i = Item.query.get(int(log.entity_id))
                name = i.name if i else f"Elemento {log.entity_id}"
            elif log.entity == 'loans':
                name = f"Préstamo #{log.entity_id}"
            
            log.entity_name = name
        except:
            log.entity_name = "Desconocido/Eliminado"
    
    db.session.commit()
    print("Registros antiguos congelados exitosamente.")
