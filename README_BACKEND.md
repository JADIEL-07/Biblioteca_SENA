# 🛠️ Backend - Sistema de Gestión de Biblioteca & Almacén SENA

Bienvenido al núcleo del sistema. Este backend está construido en **Flask** siguiendo una arquitectura modular por capas para garantizar escalabilidad y facilidad de mantenimiento.

---

## 📂 Documentación Crítica
Para entender cómo funciona el sistema o continuar con su desarrollo, consulta los siguientes archivos:

1. [**ARCHITECTURE.md**](./ARCHITECTURE.md): Describe la arquitectura funcional, modelos de datos, sistema de roles y reglas de negocio. **LEER PRIMERO.**
2. [**TASKS_BACKEND.md**](./TASKS_BACKEND.md): Roadmap detallado con las tareas pendientes de implementación. Ideal para guiar a la próxima IA o desarrollador.

---

## 🚀 Inicio Rápido

### Requisitos:
- Python 3.10+
- PostgreSQL

### Instalación:
1. Crea un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Linux/Mac
   venv\Scripts\activate     # En Windows
   ```
2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Configura el archivo `.env` basado en `.env.example`.

### Ejecución:
```bash
python run.py
```

> **Nota sobre el entrypoint:** `run.py` es el punto de entrada oficial del backend.
> Anteriormente el entrypoint era `app/main.py` (invocado con `python -m app.main`).
> Ese archivo se conserva por compatibilidad pero está marcado como deprecated.
> Ambas formas funcionan, pero usa `run.py` por convención.

---

## 🏗️ Estructura de Carpetas

```
backend/
├── run.py                  ← Entrypoint principal (arranca Flask)
├── requirements.txt        ← Dependencias Python
├── ARCHITECTURE.md         ← Documentación arquitectónica
├── TASKS_BACKEND.md        ← Roadmap de tareas
├── README.md               ← Este archivo
│
├── app/                    ← Código de la aplicación
│   ├── __init__.py         ← Application factory
│   ├── config.py           ← Configuración por entorno
│   ├── extensions.py       ← Inicialización de extensiones Flask
│   ├── main.py             ← ⚠️ DEPRECATED (usar run.py)
│   ├── models/             ← Entidades de base de datos
│   ├── routes/             ← Controladores (API endpoints)
│   ├── schemas/            ← Validación y serialización Marshmallow
│   ├── services/           ← Lógica de negocio
│   ├── middlewares/        ← Middlewares (auth, roles)
│   └── utils/              ← Utilidades (email, qr, tokens, audit)
│
├── tests/                  ← Pruebas unitarias e integrales
│
├── instance/               ← Archivos locales (BD SQLite, config local)
│
└── scripts/                ← Scripts auxiliares (no son parte de la app)
    ├── migrations/         ← Parches manuales de BD
    ├── seeds/              ← Datos iniciales (roles, admin, etc.)
    ├── admin/              ← Utilidades de administración
    └── debug/              ← Scripts de diagnóstico
```

### Resumen rápido por capa:
- `app/routes/`: Controladores (API Endpoints).
- `app/services/`: Lógica de negocio (Capa de servicios).
- `app/models/`: Entidades de base de datos.
- `app/schemas/`: Validación y serialización Marshmallow.
- `tests/`: Pruebas unitarias e integrales.
- `scripts/`: Scripts auxiliares — ver [`scripts/README.md`](./scripts/README.md).
- `instance/`: Archivos específicos de la instancia local — ver [`instance/README.md`](./instance/README.md).

---

## 🤖 Nota para la IA de Desarrollo
Este proyecto está diseñado para ser autodescriptivo. Antes de realizar cualquier cambio, analiza `ARCHITECTURE.md` para asegurar que las nuevas funcionalidades respeten la lógica de auditoría y los flujos de negocio establecidos.
