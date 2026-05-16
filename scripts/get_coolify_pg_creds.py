"""
Busca todos los containers Postgres en el VPS (gestionados por Coolify u otros)
y extrae sus credenciales (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
y puerto expuesto al host.
"""
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dotenv import load_dotenv
load_dotenv()

import paramiko

ssh_host = os.environ.get('SSH_HOST')
ssh_user = os.environ.get('SSH_USER')
ssh_password = os.environ.get('SSH_PASSWORD')

if not (ssh_host and ssh_user and ssh_password):
    print("Faltan SSH_HOST, SSH_USER o SSH_PASSWORD en .env")
    sys.exit(1)


def run(client, cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err


print(f"Conectando a {ssh_user}@{ssh_host}...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ssh_host, username=ssh_user, password=ssh_password, allow_agent=False, look_for_keys=False)
print("Conexion SSH OK.\n")

# Listar todos los containers con imagen postgres
print("=" * 70)
print("Containers Postgres detectados:")
print("=" * 70)
out, err = run(client, "docker ps --format '{{.ID}}|{{.Names}}|{{.Image}}|{{.Ports}}' | grep -i postgres")
if not out:
    print("No se encontraron containers Postgres corriendo.")
    print("Probando sin filtro grep (puede que la imagen no contenga 'postgres')...\n")
    out, err = run(client, "docker ps --format '{{.ID}}|{{.Names}}|{{.Image}}|{{.Ports}}'")

if not out:
    print("(sin containers)")
    client.close()
    sys.exit(0)

containers = []
for line in out.splitlines():
    parts = line.split('|')
    if len(parts) >= 4:
        cid, name, image, ports = parts[0], parts[1], parts[2], parts[3]
        containers.append((cid, name, image, ports))
        print(f"  {name}  ({image})  -> {ports}")

print()
print("=" * 70)
print("Credenciales por container:")
print("=" * 70)

for cid, name, image, ports in containers:
    print(f"\n>> Container: {name}")
    print(f"   Imagen: {image}")
    print(f"   Ports:  {ports}")

    # Sacar las env vars relevantes
    out, err = run(client, f"docker inspect {cid} --format '{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}'")
    relevant = []
    for ln in out.splitlines():
        if any(k in ln for k in ['POSTGRES_', 'PG_', 'DB_', 'DATABASE']):
            # Ocultar parcialmente solo si no es PASSWORD (para mostrar pw completa la quieres ver)
            relevant.append(ln)

    if relevant:
        print("   Env vars:")
        for v in relevant:
            print(f"     {v}")
    else:
        print("   (sin env vars POSTGRES_*/PG_*/DB_*)")

    # Network info
    out, err = run(client, f"docker inspect {cid} --format '{{{{range $k, $v := .NetworkSettings.Networks}}}}{{{{$k}}}}={{{{$v.IPAddress}}}} {{{{end}}}}'")
    if out:
        print(f"   Networks: {out}")

print()
print("=" * 70)
print("Listo. Copia POSTGRES_PASSWORD a tu .env real.")
print("=" * 70)
client.close()
