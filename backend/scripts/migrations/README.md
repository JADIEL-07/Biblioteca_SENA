# Migrations

Scripts de migración manual de base de datos. Cada uno aplica un parche puntual al esquema
(añadir columnas, actualizar tipos, etc.).

> **No confundir con Flask-Migrate.** Estos son scripts ad-hoc escritos manualmente.

## Scripts disponibles

- `add_column.py`
- `update_items_db.py`
- `update_loans_db.py`
- `update_reservations_db.py`
- `update_tickets_db.py`
- `update_users_security_db.py`
- `upgrade_maintenance_db.py`
- `update_inventory_db.py`

## Ejecución

Desde `backend/`:

```bash
python scripts/migrations/<nombre_script>.py
```

> Hacer backup de la BD antes de ejecutar cualquiera de estos.
