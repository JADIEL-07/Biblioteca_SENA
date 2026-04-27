import subprocess
import os
import sys
import signal
import time

def run_servers():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, 'backend')
    frontend_dir = os.path.join(root_dir, 'frontend')

    print("Iniciando Sistema Integral Biblioteca SENA...")

    # 1. Iniciar Backend
    print("Iniciando Backend (Flask)...")
    # NOTA: Antes ejecutaba 'python -m app.main'. Tras la migración de estructura,
    # el entrypoint oficial es 'backend/run.py'. La forma anterior sigue funcionando
    # porque app/main.py se conserva (deprecated), pero usamos run.py por convención.
    backend_proc = subprocess.Popen(
        ['python', 'run.py'],
        cwd=backend_dir,
        shell=True
    )

    # 2. Iniciar Frontend
    print("Iniciando Frontend (Vite)...")
    frontend_proc = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=frontend_dir,
        shell=True
    )

    print("\n" + "="*50)
    print("SISTEMA INTEGRAL BIBLIOTECA - DASHBOARD ACTIVO")
    print("="*50)
    print(f"DASHBOARD ACTUALIZADO: http://localhost:5173")
    print(f"ACCESO LOCAL:         http://localhost:5173")
    print("-"*50)
    print("NOTA: El puerto 5000 es SOLO para la API interna.")
    print("No lo uses para ver el dashboard, ya que estará desactualizado.")
    print("="*50 + "\n")
    print("\n[Presiona Ctrl+C para detener ambos servidores]\n")

    try:
        while True:
            time.sleep(1)
            # Verificar si algún proceso murió
            if backend_proc.poll() is not None:
                print("Error: El proceso del Backend se detuvo.")
                break
            if frontend_proc.poll() is not None:
                print("Error: El proceso del Frontend se detuvo.")
                break
    except KeyboardInterrupt:
        print("\nDeteniendo servidores...")
        # Matar procesos hijos en Windows
        if sys.platform == "win32":
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(backend_proc.pid)], capture_output=True)
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(frontend_proc.pid)], capture_output=True)
        else:
            backend_proc.terminate()
            frontend_proc.terminate()
        print("Sistema cerrado correctamente.")

if __name__ == "__main__":
    run_servers()
