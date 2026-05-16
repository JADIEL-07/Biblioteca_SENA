import os
import sys
import subprocess
from dotenv import load_dotenv

load_dotenv()

from app import create_app, db
from app.models.user import User, Role, FormationProgram
from app.models.item import Item, Category, Location, Status, Supplier
from app.models.loan import Loan, LoanDetail
from app.models.reservation import Reservation
from app.models.maintenance import Maintenance
from app.models.movement import Movement, Notification
from app.models.item_output import ItemOutput

app = create_app()

@app.cli.command("init-db")
def init_db():
    """Inicializa la base de datos y crea los roles básicos."""
    db.create_all()
    seed_basic_roles()
    print("Base de datos inicializada correctamente.")

def seed_basic_roles():
    if not Role.query.first():
        roles = [
            'ADMIN',
            'BIBLIOTECARIO',
            'ALMACENISTA',
            'SOPORTE_TECNICO',
            'EMPRESA',
            'APRENDIZ',
            'USUARIO'
        ]
        for r_name in roles:
            db.session.add(Role(name=r_name))
        db.session.commit()
        print("Roles básicos creados.")

    if not FormationProgram.query.first():
        db.session.add(FormationProgram(id='2672153', name='ADSO'))
        db.session.commit()
        print("Programa de formación por defecto creado.")

def _discover_container_ip(ssh_host, ssh_user, ssh_password, container_name):
    """Conecta SSH al VPS y obtiene la IP interna del container Postgres
    en la red Docker (el container NO expone puerto al host, asi que hay
    que reenviar el tunel a su IP interna)."""
    # paramiko 3+ removio DSSKey pero sshtunnel aun lo referencia
    import paramiko
    if not hasattr(paramiko, 'DSSKey'):
        paramiko.DSSKey = paramiko.RSAKey

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ssh_host, username=ssh_user, password=ssh_password,
                   allow_agent=False, look_for_keys=False, timeout=10)

    cmd = (
        f"docker inspect {container_name} "
        f"--format '{{{{range $k, $v := .NetworkSettings.Networks}}}}"
        f"{{{{$k}}}}={{{{$v.IPAddress}}}}|{{{{end}}}}'"
    )
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode().strip()
    client.close()

    # Preferir red 'coolify' (mas estable); caer a la primera IP no vacia
    networks = {}
    for entry in out.split('|'):
        if '=' in entry:
            net, ip = entry.split('=', 1)
            if ip:
                networks[net] = ip
    if not networks:
        return None
    return networks.get('coolify') or next(iter(networks.values()))


def start_ssh_tunnel():
    """Levanta tunel SSH si hay credenciales SSH_* configuradas en .env.
    Apunta dinamicamente a la IP del container Postgres en Docker."""
    ssh_host = os.environ.get('SSH_HOST')
    ssh_user = os.environ.get('SSH_USER')
    ssh_password = os.environ.get('SSH_PASSWORD')
    container_name = os.environ.get(
        'REMOTE_DB_CONTAINER',
        'db-fn9ed6r5qkr5l1t2fg3ug20b-025215602365'
    )

    if not all([ssh_host, ssh_user, ssh_password]):
        return None

    print(f"  Descubriendo IP del container {container_name}...")
    container_ip = _discover_container_ip(ssh_host, ssh_user, ssh_password, container_name)
    if not container_ip:
        print(f"  [WARN] No se pudo obtener IP del container; tunel no levantado")
        return None
    print(f"  IP del container: {container_ip}")

    # paramiko 3+ removio DSSKey pero sshtunnel aun lo referencia
    import paramiko
    if not hasattr(paramiko, 'DSSKey'):
        paramiko.DSSKey = paramiko.RSAKey

    from sshtunnel import SSHTunnelForwarder
    tunnel = SSHTunnelForwarder(
        (ssh_host, 22),
        ssh_username=ssh_user,
        ssh_password=ssh_password,
        remote_bind_address=(container_ip, 5432),
        local_bind_address=('127.0.0.1', 5432),
    )
    tunnel.start()
    print(f"  Tunel SSH activo: localhost:5432 -> {container_ip}:5432 (via {ssh_host})")
    return tunnel


if __name__ == "__main__":
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'static')

    tunnel = start_ssh_tunnel()

    print("Iniciando Frontend (Vite)...")
    frontend_proc = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=static_dir,
        shell=True
    )

    print("\n" + "=" * 50)
    print("  SISTEMA INTEGRAL BIBLIOTECA SENA")
    print("=" * 50)
    print(f"  Frontend:  http://localhost:5173")
    print(f"  API:       http://localhost:5000/api/v1")
    print("-" * 50)
    print("  Presiona Ctrl+C para detener todo")
    print("=" * 50 + "\n")

    try:
        # Si el tunel SSH esta activo, estamos hablando con la BD remota:
        # NO ejecutar create_all/seed para no tocar el esquema de produccion.
        if tunnel is None:
            with app.app_context():
                db.create_all()
                seed_basic_roles()
        else:
            print("  BD remota detectada (tunel activo): se omite create_all/seed.")

        is_dev = os.environ.get('FLASK_ENV', 'development') == 'development'
        app.run(host="0.0.0.0", port=5000, debug=is_dev)
    finally:
        print("\nDeteniendo Frontend...")
        if sys.platform == "win32":
            subprocess.run(
                ['taskkill', '/F', '/T', '/PID', str(frontend_proc.pid)],
                capture_output=True
            )
        else:
            frontend_proc.terminate()
        if tunnel:
            tunnel.stop()
            print("Túnel SSH cerrado.")
        print("Sistema cerrado correctamente.")
