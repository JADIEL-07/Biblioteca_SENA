import requests

token = "YOUR_TOKEN_HERE" # I'll need to get this from a running session if possible, 
# but I can just check the endpoint structure.

url = "http://localhost:5000/api/v1/items/"
# No token needed for GET items as per my previous check of item_routes.py

try:
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    print(f"Content Type: {response.headers.get('Content-Type')}")
    data = response.json()
    print(f"Data length: {len(data) if isinstance(data, list) else 'Not a list'}")
    if isinstance(data, list) and len(data) > 0:
        print(f"First item keys: {data[0].keys()}")
except Exception as e:
    print(f"Error: {e}")
