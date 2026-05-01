# Admin

Utilidades de administración del sistema. Tareas de gestión que normalmente se hacen
manualmente cuando hace falta intervenir cuentas o roles.

## Scripts disponibles

- `list_users.py` — Lista todos los usuarios del sistema
- `check_users.py` — Verifica el estado de los usuarios
- `check_roles.py` — Verifica los roles configurados
- `promote_user.py` — Promueve un usuario por ID
- `promote_by_name.py` — Promueve un usuario por nombre
- `fix_admin_user.py` — Corrige el usuario administrador

## Ejecución

Desde `backend/`:

```bash
python scripts/admin/list_users.py
python scripts/admin/promote_user.py
```
