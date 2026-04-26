# Scripts del Backend

Esta carpeta contiene scripts auxiliares del backend, organizados por propósito.

> **Importante:** todos estos scripts hacen `from app import create_app, db` y deben
> ejecutarse desde la carpeta `backend/`, no desde la raíz del repositorio.

## Estructura

- **`migrations/`** — Scripts de migración manual de base de datos (parches únicos para
  añadir columnas, actualizar esquemas, etc.). NO confundir con migraciones de Flask-Migrate.
- **`seeds/`** — Scripts que insertan datos iniciales (roles base, usuario admin maestro,
  préstamos de prueba, programas de formación).
- **`admin/`** — Utilidades de administración del sistema (promover usuarios, listar,
  arreglar admin, verificar roles).
- **`debug/`** — Scripts de diagnóstico (verificar BD, debuggear admin, auditar sistema).

## Cómo ejecutarlos

Desde la carpeta `backend/`:

```bash
python scripts/seeds/seed.py
python scripts/admin/list_users.py
python scripts/debug/verify_db.py
```

## Origen

Estos scripts estaban antes dispersos:
- 13 sueltos directamente en `backend/`
- 8 sueltos en la raíz del repositorio (donde no funcionaban porque no encontraban el módulo `app`)

Fueron consolidados aquí durante la migración de estructura.
