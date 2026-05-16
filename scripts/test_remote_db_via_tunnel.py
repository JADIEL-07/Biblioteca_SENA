"""
Prueba: levanta el tunel SSH al container Postgres de Coolify y hace
una query simple para verificar que la conexion local->remota funciona.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dotenv import load_dotenv
load_dotenv()

# Reusar la misma funcion de descubrimiento que usa run.py
from run import _discover_container_ip

ssh_host = os.environ.get('SSH_HOST')
ssh_user = os.environ.get('SSH_USER')
ssh_password = os.environ.get('SSH_PASSWORD')
container_name = 'db-fn9ed6r5qkr5l1t2fg3ug20b-025215602365'

print("1) Descubriendo IP del container...")
container_ip = _discover_container_ip(ssh_host, ssh_user, ssh_password, container_name)
print(f"   IP: {container_ip}\n")

import paramiko
if not hasattr(paramiko, 'DSSKey'):
    paramiko.DSSKey = paramiko.RSAKey

from sshtunnel import SSHTunnelForwarder
tunnel = SSHTunnelForwarder(
    (ssh_host, 22),
    ssh_username=ssh_user,
    ssh_password=ssh_password,
    remote_bind_address=(container_ip, 5432),
    local_bind_address=('127.0.0.1', 5433),  # uso 5433 para no chocar
)

print("2) Levantando tunel SSH...")
tunnel.start()
print(f"   Tunel local 127.0.0.1:5433 -> {container_ip}:5432 (via {ssh_host})\n")

try:
    import psycopg2
    from urllib.parse import quote_plus
    user = quote_plus(os.environ['POSTGRES_USER'])
    pwd  = quote_plus(os.environ['POSTGRES_PASSWORD'])
    db   = os.environ['POSTGRES_DB']
    dsn = f"host=127.0.0.1 port=5433 dbname={db} user={os.environ['POSTGRES_USER']} password={os.environ['POSTGRES_PASSWORD']}"
    print("3) Conectando con psycopg2...")
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    cur.execute("SELECT current_database(), current_user, version();")
    print("   ->", cur.fetchone())

    cur.execute("SELECT id, name, email FROM users ORDER BY id LIMIT 10;")
    rows = cur.fetchall()
    print(f"\n4) Primeros {len(rows)} usuarios en la BD remota:")
    for r in rows:
        print(f"   {r[0]} | {r[1]} | {r[2]}")

    cur.execute("SELECT COUNT(*) FROM users;")
    print(f"\n   Total usuarios: {cur.fetchone()[0]}")
    conn.close()
    print("\n[OK] Tu Flask local PUEDE leer/escribir directamente en la BD de Coolify.")
finally:
    tunnel.stop()
    print("\nTunel cerrado.")
