# 🏗️ Arquitectura Funcional Detallada - BIBLIOTECA & ALMACÉN SENA

Este documento es la **guía definitiva** para la implementación del backend. No se debe improvisar lógica fuera de estas reglas.

---

## 🧱 1. ESTRUCTURA DEL PROYECTO (FLASK MODULAR)
```text
backend/
 └── app/
     ├── routes/       # Capa de Controladores (Solo comunicación HTTP)
     ├── services/     # Capa de Servicios (Toda la lógica de negocio)
     ├── models/       # Capa de Modelos (Entidades de BD)
     ├── schemas/      # Validación y Serialización (Marshmallow)
     ├── utils/        # Decoradores, Helpers y Enums
     ├── config.py     # Configuración de entornos
     └── extensions.py # Inicialización de DB, JWT, Mail
```

---

## 🔐 2. SEGURIDAD Y JWT (ACCESS + REFRESH)
El sistema debe manejar dos tipos de tokens para máxima seguridad:
- **Access Token:** Corta duración (15–30 min). Se usa para cada petición.
- **Refresh Token:** Larga duración (7 días). Se usa solo para obtener un nuevo Access Token.
- **Endpoint `/refresh-token`:** Requerido para renovar la sesión sin pedir credenciales.
- **Regla:** Si el Refresh Token expira o es inválido, el usuario debe hacer Login nuevamente.

---

## 📊 3. POLÍTICA DE "SOFT DELETE"
**Queda prohibido el borrado físico (DELETE) de registros críticos.** 
Se debe usar un campo `is_deleted` (booleano) o `deleted_at` (timestamp) en las siguientes tablas:
- Usuarios
- Elementos (Inventario)
- Reservas
- Préstamos

**Objetivo:** Mantener integridad referencial y un historial completo para auditoría.

---

## 🔔 4. SISTEMA DE ESTADOS NORMALIZADO (ENUMS)
Para evitar errores de escritura y bugs silenciosos, usar Enums estrictos:

| Entidad | Estados Permitidos |
| :--- | :--- |
| **PRÉSTAMOS** | `ACTIVE`, `RETURNED`, `OVERDUE` |
| **RESERVAS** | `ACTIVE`, `EXPIRED`, `CANCELLED`, `COMPLETED` |
| **ELEMENTOS** | `AVAILABLE`, `LOANED`, `MAINTENANCE`, `LOST`, `DAMAGED` |

---

## 🧠 5. CASOS LÍMITE Y VALIDACIONES CRÍTICAS
1. **Concurrencia:** Bloqueo de fila (`with_for_update`) para evitar dobles préstamos del mismo ítem.
2. **Reserva Caducada:** Impedir la conversión a préstamo si han pasado >24h.
3. **Usuarios Morosos:** Bloquear nuevas reservas/préstamos si el usuario tiene estados `OVERDUE`.
4. **Token de Recuperación:** 15 min de vida, un solo uso y marcado inmediato como usado.

---

## 🚀 6. PLAN DE IMPLEMENTACIÓN (FASE 2)
Se debe implementar módulo por módulo en este **orden exacto**:

1.  **Auth (JWT + Refresh + Recovery)**
2.  **Usuarios + Roles (Soft Delete)**
3.  **Inventario (Estados Normalizados)**
4.  **Préstamos (Lógica de Concurrencia)**
5.  **Reservas (Flujo de Expiración)**
6.  **Mantenimiento (Bloqueos de estado)**
7.  **Auditoría (Registro transversal)**
8.  **Dashboard (Estadísticas finales)**

---

## 🧪 7. ESTRATEGIA DE VALIDACIÓN
**IMPORTANTE:** Antes de pasar al siguiente módulo, se deben realizar las pruebas correspondientes. 
*Ejemplo para Auth: Probar Login -> Obtener Tokens -> Refrescar Token -> Recuperar Contraseña.*

---

## 🔥 PROMPT PERFECTO PARA LA IA (MÓDULO AUTH)
> *"Implementa el módulo de autenticación en Flask con arquitectura por capas (routes, services, models).
>
> **Requisitos:**
> - Login con JWT (access + refresh).
> - Hash de contraseñas con bcrypt.
> - Modelo de usuario con roles y soporte para soft delete.
> - Endpoint de login, registro y refresh token.
> - Recuperación de contraseña (token de 15 min, envío por correo, un solo uso).
>
> **Reglas:**
> - No acceder a BD desde routes; toda la lógica en services.
> - Usar SQLAlchemy y Blueprints.
> - Validar credenciales correctamente y manejar errores con respuestas claras (JSON).
> - Registrar auditoría en cada login exitoso."*
