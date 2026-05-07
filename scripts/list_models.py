import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
res = requests.get(url).json()

print([m['name'] for m in res.get('models', [])])
