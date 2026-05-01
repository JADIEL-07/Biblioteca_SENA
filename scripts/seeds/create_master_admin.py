from app import create_app, db
from app.models.user import User, Role
import bcrypt

app = create_app()
with app.app_context():
    # Asegurar que el rol ADMIN existe (id: 1)
    admin_role = Role.query.get(1)
    if not admin_role:
        admin_role = Role(id=1, name='ADMIN')
        db.session.add(admin_role)
        db.session.commit()
        print("Rol ADMIN creado.")

    admin_name = "Admin"
    admin_email = "admin@sena.edu.co"
    admin_pass = "root1234"
    admin_id = "00000000"
    
    # Buscar por ID o por Email
    user_by_id = User.query.filter_by(id=admin_id).first()
    user_by_email = User.query.filter_by(email=admin_email).first()
    
    user = user_by_id or user_by_email
    
    hashed_pw = bcrypt.hashpw(admin_pass.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    if not user:
        new_admin = User(
            id=admin_id,
            name=admin_name,
            email=admin_email,
            password=hashed_pw,
            role_id=1,
            document_type="Cédula de Ciudadanía",
            is_active=True
        )
        db.session.add(new_admin)
        print(f"Creando nuevo usuario: {admin_name}")
    else:
        user.name = admin_name
        user.email = admin_email
        user.password = hashed_pw
        user.role_id = 1
        user.is_active = True
        print(f"Actualizando usuario existente: {user.name} (ID: {user.id})")
        
    db.session.commit()
    print("Operación completada con éxito.")
