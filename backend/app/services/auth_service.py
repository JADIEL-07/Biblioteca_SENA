import bcrypt
from datetime import datetime, timedelta
from flask import request
from sqlalchemy import or_
from ..extensions import db
from ..models.user import User
from ..models.audit_log import AuditLog
from ..models.token import PasswordResetToken
from .token_service import TokenService
from .email_service import EmailService

class AuthService:
    @staticmethod
    def register_user(name, email, password, document_number, document_type, phone=None, role_id=None, formation_ficha=None):
        """Registers a new user with document as ID."""
        if User.query.filter(or_(User.email == email, User.id == document_number)).first():
            return {"error": "El email o número de documento ya está registrado"}, 400
            
        if len(password) < 8:
            return {"error": "La contraseña debe tener al menos 8 caracteres"}, 400
            
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Asignar rol APRENDIZ por defecto si no se provee uno
        if not role_id:
            role = Role.query.filter_by(name='APRENDIZ').first()
            role_id = role.id if role else 3 # 3 suele ser Aprendiz según el seed

        # Ensure formation_ficha is None if empty string
        final_ficha = formation_ficha if formation_ficha and formation_ficha.strip() != "" else None
        
        new_user = User(
            id=document_number,
            document_type=document_type,
            name=name,
            email=email,
            phone=phone,
            password=hashed_pw,
            role_id=role_id,
            formation_ficha=final_ficha
        )
        db.session.add(new_user)
        db.session.commit()
        
        return {"success": True, "message": "Usuario registrado exitosamente"}, 201

    @staticmethod
    def login(identifier, password):
        """Authenticates a user with email or document number."""
        user = User.query.filter(
            User.id == identifier,
            User.is_deleted == False
        ).first()
        
        if not user:
            return {"error": "Credenciales inválidas"}, 401

        if not user.is_active:
            return {"error": "Esta cuenta está inactiva. Contacte al administrador."}, 401

        # Check brute force block
        if user.is_blocked:
            AuthService._log_audit(user.id, "LOGIN_BLOCKED_PERMANENT", ip=request.remote_addr)
            return {"error": "Cuenta bloqueada por seguridad. Contacte al administrador."}, 403
            
        if user.failed_attempts >= 5:
            user.is_blocked = True
            db.session.commit()
            AuthService._log_audit(user.id, "USER_BLOCKED_AUTO", ip=request.remote_addr)
            return {"error": "Cuenta bloqueada por demasiados intentos fallidos."}, 403

        # Validate password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            user.failed_attempts += 1
            user.last_failed_login = datetime.utcnow()
            db.session.commit()
            AuthService._log_audit(user.id, "LOGIN_FAILED", ip=request.remote_addr)
            return {"error": "Invalid credentials"}, 401

        # Success: reset attempts
        user.failed_attempts = 0
        user.last_failed_login = None
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens
        access, refresh = TokenService.generate_auth_tokens(user)
        print(f"LOGIN EXITOSO: Usuario {user.name}, Rol: {user.role.name if user.role else 'None'}")
        
        # Log success
        AuthService._log_audit(user.id, "LOGIN_SUCCESS", ip=request.remote_addr)
        
        return {
            "access_token": access,
            "refresh_token": refresh,
            "user": {
                "id": user.id,
                "name": user.name,
                "role": { "name": user.role.name } if user.role else { "name": "APRENDIZ" }
            }
        }, 200

    @staticmethod
    def forgot_password(email):
        """Starts password recovery process."""
        user = User.query.filter_by(email=email, is_deleted=False).first()
        AuthService._log_audit(user.id if user else None, "PASSWORD_RESET_REQUEST", ip=request.remote_addr)
        if user:
            token = TokenService.create_password_reset_token(user)
            EmailService.send_recovery_email(email, token)
        return {"success": True, "message": "Instructions sent if the email exists"}, 200

    @staticmethod
    def reset_password(token, new_password):
        """Resets password and revokes all active sessions."""
        if len(new_password) < 8:
            return {"error": "Minimum 8 characters"}, 400
        reset_token = PasswordResetToken.query.filter_by(token_hash=token, is_used=False).first()
        if not reset_token or reset_token.expires_at < datetime.utcnow():
            return {"error": "Invalid or expired token"}, 400
        user = reset_token.user
        user.password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        reset_token.is_used = True
        TokenService.revoke_all_user_tokens(user.id)
        db.session.commit()
        AuthService._log_audit(user.id, "PASSWORD_RESET_SUCCESS", ip=request.remote_addr)
        return {"success": True, "message": "Password updated successfully"}, 200

    @staticmethod
    def _log_audit(user_id, action, ip=None):
        """Professional audit logging."""
        log = AuditLog(
            user_id=user_id,
            action=action,
            ip=ip,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(log)
        db.session.commit()
