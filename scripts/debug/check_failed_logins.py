import sqlite3
import os

# Ruta dinámica relativa al archivo
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.abspath(os.path.join(current_dir, "../../instance/biblioteca.db"))

def check_failed_attempts(identifier=None):
    if not os.path.exists(db_path):
        print(f"ERROR: No se encuentra la base de datos en {db_path}")
        return

    print(f"--- Diagnóstico de Seguridad ---")
    print(f"Base de datos: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        query = "SELECT id, name, failed_attempts, is_blocked FROM users"
        params = []
        if identifier:
            query += " WHERE id = ? OR name LIKE ?"
            params = [identifier, f"%{identifier}%"]
        
        cursor.execute(query, params)
        users = cursor.fetchall()
        
        if not users:
            print("No se encontraron usuarios.")
            return

        for user in users:
            u_id, u_name, u_failed, u_blocked = user
            print(f"\nUsuario: {u_name} (ID: {u_id})")
            print(f"Intentos fallidos: {u_failed}")
            print(f"Estado: {'BLOQUEADO' if u_blocked else 'Activo'}")
            
            # Logs
            cursor.execute("SELECT created_at, action FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5", (u_id,))
            logs = cursor.fetchall()
            if logs:
                print("Últimos logs:")
                for log in logs:
                    print(f"  - {log[0]}: {log[1]}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else None
    check_failed_attempts(target)
