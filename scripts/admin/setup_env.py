"""
setup_env.py — Genera el archivo .env del backend automáticamente.

Lee `backend/.env.example`, genera claves seguras para SECRET_KEY y JWT_SECRET_KEY,
ajusta FLASK_APP a run.py (post-migración) y escribe `backend/.env` listo para usar.

USO:
    Desde la carpeta backend/:
        python scripts/admin/setup_env.py

COMPORTAMIENTO:
    - Si .env NO existe → lo crea con claves aleatorias seguras
    - Si .env YA existe → pide confirmación antes de sobrescribir
    - Si .env.example NO existe → error y sale

VARIABLES QUE EL SCRIPT RELLENA AUTOMÁTICAMENTE:
    - SECRET_KEY        (clave aleatoria de 64 caracteres hex)
    - JWT_SECRET_KEY    (clave aleatoria de 64 caracteres hex)
    - FLASK_APP=run.py  (ajustado para apuntar al nuevo entrypoint post-migración)

VARIABLES QUE TÚ DEBES AJUSTAR DESPUÉS A MANO (si las usas):
    - MAIL_USERNAME, MAIL_PASSWORD, MAIL_DEFAULT_SENDER
      (solo si quieres que el sistema envíe correos reales)
"""

import secrets
import sys
from pathlib import Path


def main() -> int:
    # ── Localizar archivos ──────────────────────────────────────────────
    # El script vive en backend/scripts/admin/setup_env.py
    # backend/ está dos niveles arriba.
    backend_dir = Path(__file__).resolve().parent.parent.parent
    env_example_path = backend_dir / ".env.example"
    env_path = backend_dir / ".env"

    print(f"📁 Carpeta backend detectada: {backend_dir}")
    print()

    # ── Verificar que .env.example exista ───────────────────────────────
    if not env_example_path.exists():
        print(f"❌ ERROR: No se encontró {env_example_path}")
        print("   Este script necesita .env.example como plantilla.")
        return 1

    # ── Verificar si .env ya existe ─────────────────────────────────────
    if env_path.exists():
        print(f"⚠️  Ya existe un archivo .env en {env_path}")
        print("   Si lo sobrescribes, perderás las claves actuales y todos los")
        print("   usuarios tendrán que volver a iniciar sesión.")
        print()
        respuesta = input("¿Sobrescribir? (escribe 'si' para confirmar): ").strip().lower()
        if respuesta != "si":
            print("✋ Operación cancelada. No se modificó nada.")
            return 0
        print()

    # ── Leer plantilla ──────────────────────────────────────────────────
    print("📖 Leyendo .env.example...")
    contenido = env_example_path.read_text(encoding="utf-8")

    # ── Generar claves seguras ──────────────────────────────────────────
    print("🔑 Generando claves seguras...")
    secret_key = secrets.token_hex(32)
    jwt_secret_key = secrets.token_hex(32)

    # ── Sustituir valores ───────────────────────────────────────────────
    # Reemplazos exactos de los placeholders del .env.example
    reemplazos = [
        ("SECRET_KEY=your-secret-key-here", f"SECRET_KEY={secret_key}"),
        ("JWT_SECRET_KEY=your-jwt-secret-key-here", f"JWT_SECRET_KEY={jwt_secret_key}"),
        # Ajuste post-migración: el entrypoint ahora es run.py, no main.py
        ("FLASK_APP=main.py", "FLASK_APP=run.py"),
    ]

    cambios_realizados = 0
    for buscar, reemplazar in reemplazos:
        if buscar in contenido:
            contenido = contenido.replace(buscar, reemplazar)
            cambios_realizados += 1
        else:
            print(f"   ⚠️  No se encontró el placeholder: {buscar!r}")
            print(f"      (puede que el .env.example haya cambiado)")

    # ── Escribir el .env ────────────────────────────────────────────────
    print(f"💾 Escribiendo {env_path}...")
    env_path.write_text(contenido, encoding="utf-8")

    # ── Resumen ─────────────────────────────────────────────────────────
    print()
    print("✅ Archivo .env creado correctamente.")
    print(f"   Reemplazos aplicados: {cambios_realizados}")
    print()
    print("📝 Próximos pasos:")
    print("   1. Reinicia el backend (Ctrl+C y python run.py de nuevo)")
    print("   2. Si quieres habilitar envío real de correos, edita MAIL_USERNAME,")
    print("      MAIL_PASSWORD y MAIL_DEFAULT_SENDER manualmente en el .env")
    print()
    print("⚠️  IMPORTANTE: el archivo .env contiene secretos. NO lo subas a Git.")
    print("    Verifica que .gitignore lo incluya.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
