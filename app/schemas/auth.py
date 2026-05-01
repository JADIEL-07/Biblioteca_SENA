from .. import ma
from ..models.usuario import Usuario, Rol

class RolSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Rol
        load_instance = True

class UsuarioSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Usuario
        load_instance = True
        exclude = ("password",)
    
    rol = ma.Nested(RolSchema)

class LoginSchema(ma.Schema):
    correo = ma.Email(required=True)
    password = ma.Str(required=True)

class RegisterSchema(ma.Schema):
    nombre = ma.Str(required=True)
    correo = ma.Email(required=True)
    password = ma.Str(required=True)
    rol_id = ma.Int(required=True)
