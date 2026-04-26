import bcrypt
from app import create_app, db
from app.models.user import User, Role

app = create_app()
with app.app_context():
    cc = "1.098.765.432"
    user = db.session.get(User, cc)
    admin_role = Role.query.filter_by(name='ADMIN').first()
    if not admin_role:
        admin_role = Role(name='ADMIN')
        db.session.add(admin_role)
        db.session.flush()
    
    hashed_pw = bcrypt.hashpw("root1234".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    if user:
        user.password = hashed_pw
        user.role_id = admin_role.id
        user.is_active = True
        user.is_blocked = False
        print(f"Usuario {cc} actualizado como ADMIN con clave root1234")
    else:
        new_user = User(
            id=cc,
            document_type="C.C",
            name="Admin Especial",
            email="admin_especial@sena.edu.co",
            password=hashed_pw,
            role_id=admin_role.id,
            is_active=True
        )
        db.session.add(new_user)
        print(f"Usuario {cc} creado como ADMIN con clave root1234")
    
    db.session.commit()
