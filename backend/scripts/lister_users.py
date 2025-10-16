"""
Script pour lister tous les utilisateurs avec leurs mots de passe
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Professeur

print("=" * 70)
print("LISTE DES UTILISATEURS")
print("=" * 70)

users = User.objects.all()
print(f"\nTotal : {users.count()} utilisateur(s)\n")

for user in users:
    print(f"Username : {user.username}")
    print(f"   Nom complet : {user.get_full_name()}")
    print(f"   Email : {user.email}")
    print(f"   Role : {user.role}")
    print(f"   École : {user.ecole.nom if user.ecole else '❌ Pas d\'école'}")
    print(f"   Actif : {'Oui' if user.is_active else 'Non'}")
    
    if hasattr(user, 'professeur_profile'):
        prof = user.professeur_profile
        print(f"   Professeur : Oui (Matricule: {prof.matricule})")
    
    print()

print("=" * 70)
print("POUR SE CONNECTER :")
print("=" * 70)
print("\n   Professeurs (password: password123) :")
print("      - marie.martin")
print("      - jean.dupont")
print("      - fatou.diop")
print("      - mamadou.fall")
print("      - awa.ndiaye")
print("\n   Admin (password: celui que vous avez créé) :")
print("      - admin")
print("\n⚠️  Si vous avez oublié le mot de passe admin, réinitialisez-le :")
print("      python manage.py changepassword admin")
print("=" * 70)
