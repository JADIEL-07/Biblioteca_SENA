#!/usr/bin/env python
import sys
from app import create_app, db
from app.models.user import User, Role

app = create_app()
with app.app_context():
    # Obtener el ID del usuario desde argumentos o usar el proporcionado
    user_id = sys.argv[1] if len(sys.argv) > 1 else '1101755660'
    
    # Buscar el usuario por ID
    user = User.query.get(user_id)
    if user:
        # Buscar el rol ADMIN
        admin_role = Role.query.filter_by(name='ADMIN').first()
        if admin_role:
            user.role_id = admin_role.id
            db.session.commit()
            print(f"✓ Usuario {user.name} (ID: {user.id}) promovido a rol ADMIN (ID: {admin_role.id})")
        else:
            print("✗ El rol ADMIN no existe en la base de datos")
    else:
        print(f"✗ Usuario con ID {user_id} no encontrado")
