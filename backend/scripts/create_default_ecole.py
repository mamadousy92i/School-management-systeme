"""
Script pour créer l'école par défaut et assigner tous les utilisateurs existants
À exécuter après la migration du modèle Ecole
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Ecole
from users.models import User

def main():
    print("=" * 60)
    print("CRÉATION DE L'ÉCOLE PAR DÉFAUT")
    print("=" * 60)
    
    # 1. Créer l'école par défaut
    print("\n1. Création de l'école...")
    ecole, created = Ecole.objects.get_or_create(
        code='ECOLE001',
        defaults={
            'nom': 'École Primaire Sénégalaise',
            'directrice': 'Mme Fatou SARR',
            'devise': 'Excellence, Discipline, Réussite',
            'adresse': 'Dakar, Sénégal',
            'telephone': '+221 33 XXX XX XX',
            'email': 'contact@ecole.sn',
            'abonnement_actif': True,
            'max_eleves': 1000,
            'max_professeurs': 100,
        }
    )
    
    if created:
        print(f"   ✅ École créée : {ecole.nom} ({ecole.code})")
    else:
        print(f"   ℹ️  École existante : {ecole.nom} ({ecole.code})")
    
    # 2. Afficher les informations de l'école
    print("\n2. Informations de l'école :")
    print(f"   - Nom : {ecole.nom}")
    print(f"   - Code : {ecole.code}")
    print(f"   - Directrice : {ecole.directrice}")
    print(f"   - Adresse : {ecole.adresse}")
    print(f"   - Téléphone : {ecole.telephone}")
    print(f"   - Email : {ecole.email}")
    print(f"   - Abonnement actif : {'✅ Oui' if ecole.abonnement_actif else '❌ Non'}")
    print(f"   - Max élèves : {ecole.max_eleves}")
    print(f"   - Max professeurs : {ecole.max_professeurs}")
    
    # 3. Statistiques
    print("\n3. Statistiques actuelles :")
    total_users = User.objects.count()
    print(f"   - Utilisateurs totaux : {total_users}")
    
    print("\n" + "=" * 60)
    print("✅ TERMINÉ !")
    print("=" * 60)
    print("\nProchaine étape :")
    print("   python scripts/add_ecole_to_user.py")
    print("=" * 60)

if __name__ == '__main__':
    main()
