# Promover Usuario a ADMIN

## Opción 1: Script Python (requiere app corriendo)

```bash
python scripts/admin/promote_user_by_id.py 1101755660
```

## Opción 2: Script SQL (ejecutar en PostgreSQL)

```bash
# Dentro del contenedor PostgreSQL:
psql -U admin -d biblioteca_db -f scripts/admin/promote_user_to_admin.sql

# O manualmente:
psql -U admin -d biblioteca_db
```

Luego ejecutar:
```sql
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
WHERE id = '1101755660';

-- Verificar
SELECT id, name, email, role_id FROM users WHERE id = '1101755660';
```

## Opción 3: Endpoint API (si está disponible)

POST `/api/v1/users/1101755660/change-role`
```json
{
  "role": "ADMIN"
}
```

## Verificar Roles Disponibles

```sql
SELECT id, name FROM roles;
```

Salida esperada:
- ID 1: ADMIN
- ID 2: BIBLIOTECARIO
- ID 3: APRENDIZ
- etc.
