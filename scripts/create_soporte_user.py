import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models.user import User, Role
import bcrypt

app = create_app()
with app.app_context():
    # 1. Asegurar que existe el rol de Soporte Técnico
    role_names = ['SOPORTE TÉCNICO', 'SOPORTE TECNICO', 'SOPORTE']
    soporte_role = None
    
    for r_name in role_names:
        soporte_role = Role.query.filter(Role.name.ilike(r_name)).first()
        if soporte_role:
            break
            
    if not soporte_role:
        soporte_role = Role(name='SOPORTE TÉCNICO')
        db.session.add(soporte_role)
        db.session.commit()
        print("Rol SOPORTE TÉCNICO creado.")
    else:
        print(f"Rol de soporte existente encontrado: {soporte_role.name}")

    # 2. Datos del usuario
    user_id = "1101755664"
    user_email = "soporte.sena@sena.edu.co"
    user_name = "Soporte Técnico"
    user_pass = "root1234"
    
    hashed_pw = bcrypt.hashpw(user_pass.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user = User.query.filter_by(id=user_id).first()
    if not user:
        user = User.query.filter_by(email=user_email).first()
        
    if not user:
        new_user = User(
            id=user_id,
            name=user_name,
            email=user_email,
            password=hashed_pw,
            role_id=soporte_role.id,
            document_type="Cédula de Ciudadanía",
            is_active=True
        )
        db.session.add(new_user)
        print(f"Creando nuevo usuario soporte técnico con ID {user_id}")
    else:
        user.name = user_name
        user.email = user_email
        user.password = hashed_pw
        user.role_id = soporte_role.id
        user.is_active = True
        print(f"Actualizando usuario existente con ID {user.id} a rol Soporte Técnico")
        
    db.session.commit()
    print("Operación completada exitosamente.")
