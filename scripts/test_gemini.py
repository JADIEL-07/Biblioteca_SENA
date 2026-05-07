import os
import requests
import json
from dotenv import load_dotenv

# Script temporal para diagnosticar errores de cuota o bloqueos en la API de Gemini
load_dotenv()

api_key = os.environ.get('GEMINI_API_KEY')
print(f"Probando API KEY: {api_key[:5]}...{api_key[-5:] if api_key else ''}")

# Intentando llamar al modelo principal
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

payload = {
    "system_instruction": {
        "parts": [{"text": "Responde solo con la palabra 'Test Exitoso'."}]
    },
    "contents": [
        {
            "role": "user",
            "parts": [{"text": "Realiza una prueba de conexión."}]
        }
    ]
}

response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
print("STATUS CODE:", response.status_code)
print("RESPONSE DETALLADA:")
print(json.dumps(response.json(), indent=2))
