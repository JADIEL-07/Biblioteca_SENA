import requests
from app import create_app
from app.services.token_service import TokenService
from app.models.user import User

app = create_app()
with app.app_context():
    user = User.query.get('1101755661')
    if not user:
        print("User not found!")
    else:
        access_token, _ = TokenService.generate_auth_tokens(user)
        
        headers = {'Authorization': f'Bearer {access_token}'}
        
        print("--- APP STATS ---")
        res = requests.get('http://127.0.0.1:5000/api/v1/dashboard/aprendiz/stats', headers=headers)
        print(res.status_code)
        print(res.json())
        
        print("--- ADMIN STATS ---")
        res2 = requests.get('http://127.0.0.1:5000/api/v1/dashboard/stats', headers=headers)
        print(res2.status_code)
        print(res2.json())
