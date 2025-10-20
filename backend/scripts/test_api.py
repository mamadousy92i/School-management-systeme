"""
Script pour tester l'API directement et vérifier l'authentification
"""
import os
import sys
import django
import requests

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

print("=" * 70)
print("TEST DE L'API AVEC AUTHENTIFICATION")
print("=" * 70)

# URL de base
BASE_URL = "http://localhost:8000/api"

# 1. LOGIN
print("\n1. TEST DE LOGIN...")
print("-" * 70)

login_data = {
    "username": "marie.martin",
    "password": "password123"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        access_token = data.get('access')
        user_data = data.get('user')
        
        print(f"   ✅ Login réussi !")
        print(f"   Token: {access_token[:50]}...")
        print(f"   User: {user_data.get('username')} ({user_data.get('role')})")
        print(f"   École: {user_data.get('ecole_nom', 'N/A')}")
        
        # 2. TEST GET ELEVES
        print("\n2. TEST GET ÉLÈVES...")
        print("-" * 70)
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        # Sans paramètres
        response = requests.get(f"{BASE_URL}/academic/eleves/", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Requête réussie !")
            print(f"   Type de réponse: {type(data)}")
            
            if isinstance(data, dict):
                print(f"   Keys: {data.keys()}")
                results = data.get('results', data)
            else:
                results = data
            
            print(f"   Nombre d'élèves: {len(results) if isinstance(results, list) else 'N/A'}")
            
            if isinstance(results, list) and len(results) > 0:
                print(f"   Premier élève: {results[0].get('prenom')} {results[0].get('nom')}")
            elif isinstance(results, list):
                print(f"   ⚠️  LISTE VIDE !")
            else:
                print(f"   ⚠️  Format inattendu: {results}")
        else:
            print(f"   ❌ Erreur: {response.status_code}")
            print(f"   {response.text}")
        
        # Avec paramètre statut=tous
        print("\n3. TEST GET ÉLÈVES (statut=tous)...")
        print("-" * 70)
        
        response = requests.get(f"{BASE_URL}/academic/eleves/?statut=tous", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', data) if isinstance(data, dict) else data
            print(f"   Nombre d'élèves: {len(results) if isinstance(results, list) else 'N/A'}")
        
        # 4. TEST GET CLASSES
        print("\n4. TEST GET CLASSES...")
        print("-" * 70)
        
        response = requests.get(f"{BASE_URL}/academic/classes/", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', data) if isinstance(data, dict) else data
            print(f"   Nombre de classes: {len(results) if isinstance(results, list) else 'N/A'}")
            
            if isinstance(results, list) and len(results) > 0:
                for classe in results:
                    print(f"      - {classe.get('nom')}")
        
        # 5. VÉRIFIER L'UTILISATEUR DANS LA DB
        print("\n5. VÉRIFICATION DANS LA BASE DE DONNÉES...")
        print("-" * 70)
        
        user = User.objects.get(username="marie.martin")
        print(f"   User: {user.get_full_name()}")
        print(f"   École: {user.ecole.nom if user.ecole else '❌ PAS D\'ÉCOLE'}")
        print(f"   Role: {user.role}")
        
        if hasattr(user, 'professeur_profile'):
            prof = user.professeur_profile
            print(f"   Profil professeur: Oui")
            print(f"   École professeur: {prof.ecole.nom if prof.ecole else '❌ PAS D\'ÉCOLE'}")
        
    else:
        print(f"   ❌ Login échoué: {response.status_code}")
        print(f"   {response.text}")

except requests.exceptions.ConnectionError:
    print("\n❌ ERREUR: Impossible de se connecter au serveur !")
    print("   Vérifiez que le serveur Django tourne sur http://localhost:8000")
    
except Exception as e:
    print(f"\n❌ ERREUR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("✅ TEST TERMINÉ")
print("=" * 70)
