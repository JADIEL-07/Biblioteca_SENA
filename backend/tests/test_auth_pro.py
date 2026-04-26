import pytest
from datetime import datetime, timedelta
from app import create_app, db
from app.models.usuario import Usuario, Rol
from app.models.token import RefreshToken
from app.services.auth_service import AuthService
from app.services.token_service import TokenService

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret"
    })
    with app.app_context():
        db.create_all()
        # Crear Rol Admin
        rol = Rol(nombre="ADMIN")
        db.session.add(rol)
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_brute_force_protection(app):
    """Prueba que el login se bloquee tras 5 intentos fallidos."""
    with app.app_context():
        # Crear usuario
        AuthService.register_user("Test", "test@sena.edu.co", "password123")
        
        # 5 Intentos fallidos
        for _ in range(5):
            AuthService.login("test@sena.edu.co", "wrong-password")
            
        user = Usuario.query.filter_by(correo="test@sena.edu.co").first()
        assert user.failed_attempts == 5
        
        # El 6to intento debe devolver error de bloqueo (403)
        # Necesitamos simular el request context para request.remote_addr
        with app.test_request_context():
            result, status = AuthService.login("test@sena.edu.co", "password123")
            assert status == 403
            assert "bloqueada temporalmente" in result["error"]

def test_refresh_token_rotation(app):
    """Prueba que el refresh token se invalide tras usarlo."""
    with app.app_context():
        AuthService.register_user("Test", "test@sena.edu.co", "password123")
        res, _ = AuthService.login("test@sena.edu.co", "password123")
        
        refresh_token = res["refresh_token"]
        user_id = res["user"]["id"]
        
        # Decodificar el JTI del token (esto es lo que haría el middleware en la ruta)
        from flask_jwt_extended import decode_token
        jti = decode_token(refresh_token)["jti"]
        
        # Primer refresco -> Éxito
        access1, refresh1 = TokenService.validate_and_rotate_refresh_token(user_id, jti)
        assert access1 is not None
        assert refresh1 != refresh_token
        
        # El token original debe estar revocado
        old_token_record = RefreshToken.query.filter_by(usuario_id=user_id, is_revoked=True).first()
        assert old_token_record is not None
        
        # Segundo intento con el MISMO token -> Error (ya está revocado)
        access2, _ = TokenService.validate_and_rotate_refresh_token(user_id, jti)
        assert access2 is None

def test_reset_password_invalidates_sessions(app):
    """Prueba que cambiar la contraseña cierre todas las sesiones."""
    with app.app_context():
        AuthService.register_user("Test", "test@sena.edu.co", "password123")
        res, _ = AuthService.login("test@sena.edu.co", "password123")
        
        user_id = res["user"]["id"]
        token = TokenService.create_password_reset_token(Usuario.query.get(user_id))
        
        # Reset Password
        with app.test_request_context():
            AuthService.reset_password(token, "new-password-456")
            
        # Verificar que no hay tokens activos
        active_tokens = RefreshToken.query.filter_by(usuario_id=user_id, is_revoked=False).all()
        assert len(active_tokens) == 0
