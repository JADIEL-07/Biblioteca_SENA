"""
Obtiene la IP interna del container Postgres de biblioteca_db en el VPS,
para que el tunel SSH pueda apuntar a ese container especifico
(y no al puerto 5432 del host, que es otro Postgres).
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

CONTAINER_NAME = 'db-fn9ed6r5qkr5l1t2fg3ug20b-025215602365'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ssh_host, username=ssh_user, password=ssh_password,
               allow_agent=False, look_for_keys=False)

cmd = (
    f"docker inspect {CONTAINER_NAME} "
    f"--format '{{{{range $k, $v := .NetworkSettings.Networks}}}}"
    f"{{{{$k}}}}={{{{$v.IPAddress}}}}|{{{{end}}}}'"
)
stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode().strip()
err = stderr.read().decode().strip()

print("Networks del container:")
print(f"  raw -> {out!r}")
if err:
    print(f"  stderr -> {err}")

for entry in out.split('|'):
    if '=' in entry:
        net, ip = entry.split('=', 1)
        if ip:
            print(f"  {net}: {ip}")

client.close()
