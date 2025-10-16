"""
Script pour assigner l'école par défaut à tous les utilisateurs et professeurs
À exécuter après create_default_ecole.py et les migrations users
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Ecole
from users.models import User, Professeur

def main():
    print("=" * 60)
    print("ASSIGNATION DE L'ÉCOLE AUX UTILISATEURS")
    print("=" * 60)
    
    # 1. Récupérer l'école par défaut
    print("\n1. Récupération de l'école par défaut...")
    try:
        ecole = Ecole.objects.get(code='ECOLE001')
        print(f"   ✅ École trouvée : {ecole.nom}")
    except Ecole.DoesNotExist:
        print("   ❌ ERREUR : École ECOLE001 introuvable !")
        print("   Exécutez d'abord : python scripts/create_default_ecole.py")
        return
    
    # 2. Assigner aux utilisateurs sans école
    print("\n2. Assignation aux utilisateurs...")
    users_sans_ecole = User.objects.filter(ecole__isnull=True)
    count_users = users_sans_ecole.count()
    
    if count_users > 0:
        users_sans_ecole.update(ecole=ecole)
        print(f"   ✅ {count_users} utilisateur(s) assigné(s) à {ecole.nom}")
    else:
        print(f"   ℹ️  Aucun utilisateur sans école")
    
    # 3. Assigner aux professeurs sans école
    print("\n3. Assignation aux professeurs...")
    profs_sans_ecole = Professeur.objects.filter(ecole__isnull=True)
    count_profs = profs_sans_ecole.count()
    
    if count_profs > 0:
        profs_sans_ecole.update(ecole=ecole)
        print(f"   ✅ {count_profs} professeur(s) assigné(s) à {ecole.nom}")
    else:
        print(f"   ℹ️  Aucun professeur sans école")
    
    # 4. Statistiques finales
    print("\n4. Statistiques finales :")
    total_users = User.objects.filter(ecole=ecole).count()
    total_profs = Professeur.objects.filter(ecole=ecole).count()
    print(f"   - Utilisateurs dans {ecole.nom} : {total_users}")
    print(f"   - Professeurs dans {ecole.nom} : {total_profs}")
    
    print("\n" + "=" * 60)
    print("✅ TERMINÉ !")
    print("=" * 60)
    print("\nProchaine étape :")
    print("   python scripts/add_ecole_to_academic.py")
    print("=" * 60)

if __name__ == '__main__':
    main()
