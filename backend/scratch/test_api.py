import requests

BASE_URL = "http://localhost:5000/api/v1"

# Intentar obtener el token (asumiendo que hay un usuario admin para pruebas)
# En un entorno real, necesitaríamos credenciales.
# Pero como estamos depurando, podemos intentar ver si el endpoint responde 401 o 404.

def test_endpoint(path, method='GET', data=None):
    url = f"{BASE_URL}{path}"
    print(f"Testing {method} {url}...")
    try:
        if method == 'GET':
            res = requests.get(url)
        elif method == 'POST':
            res = requests.post(url, json=data)
        elif method == 'PUT':
            res = requests.put(url, json=data)
        
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test sin token para ver si al menos el 401 llega (significa que el endpoint existe)
    test_endpoint("/items/categories", method="POST", data={"name": "Test Category"})
    test_endpoint("/items/locations", method="POST", data={"name": "Test Location"})
