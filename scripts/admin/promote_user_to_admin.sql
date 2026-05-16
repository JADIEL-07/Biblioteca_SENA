-- Script para promover usuario a ADMIN
-- Uso: psql -U admin -d biblioteca_db -f scripts/admin/promote_user_to_admin.sql

-- Buscar el role ADMIN (usualmente ID 1)
SELECT * FROM roles WHERE name = 'ADMIN';

-- Actualizar el usuario 1101755660 al rol ADMIN
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN')
WHERE id = '1101755660';

-- Verificar el resultado
SELECT id, name, email, role_id FROM users WHERE id = '1101755660';
