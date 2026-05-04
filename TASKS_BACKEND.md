# 📝 Roadmap de Implementación Backend (Para IA / Desarrollador)

Este documento detalla las tareas pendientes para completar el backend del sistema de Biblioteca & Almacén SENA siguiendo la arquitectura definida en `ARCHITECTURE.md`.

---

## 📅 1. Modelado de Datos (app/models/)
Actualmente existen stubs. Es necesario implementar las clases completas usando SQLAlchemy:

- [ ] **Reserva (`reserva.py`):** Implementar campos `id`, `usuario_id`, `elemento_id`, `fecha_reserva`, `fecha_expiracion`, `estado`.
- [ ] **Mantenimiento (`mantenimiento.py`):** Campos para descripción de daño, técnico asignado y fechas.
- [ ] **Auditoría (`auditoria.py`):** Implementar la tabla de logs para trazabilidad total.
- [ ] **Tickets (`ticket.py`):** Sistema de soporte básico.

---

## 🔐 2. Seguridad y Autenticación (Módulo COMPLETADO ✅)
- [x] **Auth Service:** Registro, Login, Refresh Token y Recuperación.
- [x] **Security:** Hash con bcrypt y JWT (Access + Refresh).
- [x] **Audit:** Registro de logins y cambios de password.
- [x] **Email:** Servicio de envío de recuperación integrado (mocked).

---

## 📦 3. Lógica de Negocio (app/services/)
Esta es la capa más importante. Se deben crear/completar los siguientes servicios:

- [ ] **LoanService:** 
    - Lógica para validar que un elemento no esté prestado antes de asignar.
    - Lógica para registrar el movimiento en auditoría al prestar/devolver.
- [ ] **ReservationService:**
    - Lógica de expiración automática de reservas.
    - Conversión de Reserva a Préstamo.
- [ ] **InventoryService:**
    - Generación de códigos QR (puede ser un string único por ahora).
    - Gestión de estados del elemento.

---

## 🌐 4. Rutas y Controladores (app/routes/)
Registrar los nuevos Blueprints en `app/__init__.py`:

- [ ] **prestamos_bp:** Endpoints para solicitar y devolver elementos.
- [ ] **reservas_bp:** Endpoints para crear, cancelar y ver reservas.
- [ ] **mantenimiento_bp:** Registro de entrada y salida de taller.
- [ ] **tickets_bp:** Creación y seguimiento de soporte.

---

## 🤖 5. Tareas Automatizadas (app/tasks/)
- [ ] **Cron de Reservas:** Script que se ejecute cada hora para limpiar reservas expiradas.
- [ ] **Notificador de Vencimientos:** Script diario que envíe correos a usuarios con préstamos por vencer.

---

## 🧪 6. Pruebas (tests/)
- [ ] **Unit Tests:** Para los servicios de lógica de negocio.
- [ ] **Integration Tests:** Para los flujos completos (Reserva -> Préstamo -> Devolución).

---
---

## 🚨 REGLAS CRÍTICAS DE DESARROLLO
- **Separación de Capas:** Prohibido acceder a la BD desde `routes/`. Toda la lógica va en `services/`.
- **Concurrencia:** Usar transacciones y `with_for_update()` para evitar duplicidad de préstamos/reservas.
- **Auditoría:** Cada cambio de estado en un elemento DEBE generar un registro en `audit_logs`.

---

## 🔥 Instrucción para la IA Ejecutora:
> *"Comienza implementando el modelo de `Reserva` en `app/models/reserva.py` siguiendo la estructura de `elemento.py`. Luego, crea el `ReservationService` en `app/services/reservation_service.py` para manejar la validación de disponibilidad."*
