from flask_mail import Message
from flask import current_app
from ..extensions import mail

class EmailService:
    @staticmethod
    def send_recovery_email(email, token):
        """Envía un correo de recuperación de contraseña."""
        # En un entorno real, esto enviaría un link a la app frontend
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        
        msg = Message(
            "Recuperación de Contraseña - Biblioteca SENA",
            recipients=[email]
        )
        msg.body = f"Hola, has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace: {reset_link}\nEste enlace expira en 15 minutos."
        
        try:
            # Solo enviar si está configurado el servidor de correo
            if current_app.config.get('MAIL_SERVER'):
                mail.send(msg)
            else:
                print(f"DEBUG: Correo de recuperación para {email} con token {token}")
            return True
        except Exception as e:
            print(f"Error enviando correo: {e}")
            return False
