"""
Script pour vérifier et corriger l'assignation des écoles
Détecte les problèmes et les corrige automatiquement
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Professeur
from academic.models import Ecole, Eleve, Classe, Matiere, AnneeScolaire, MatiereClasse

def verifier_et_corriger():
    print("=" * 70)
    print("VÉRIFICATION ET CORRECTION DES DONNÉES")
    print("=" * 70)
    
    # Récupérer l'école par défaut
    try:
        ecole = Ecole.objects.get(code='ECOLE001')
        print(f"\n✅ École par défaut trouvée : {ecole.nom}")
    except Ecole.DoesNotExist:
        print("\n❌ École par défaut introuvable !")
        print("Exécutez d'abord : python scripts/create_default_ecole.py")
        return
    
    # 1. Vérifier les utilisateurs
    print("\n" + "=" * 70)
    print("1. VÉRIFICATION DES UTILISATEURS")
    print("=" * 70)
    
    users_sans_ecole = User.objects.filter(ecole__isnull=True)
    count_users = users_sans_ecole.count()
    
    if count_users > 0:
        print(f"   ⚠️  {count_users} utilisateur(s) sans école :")
        for user in users_sans_ecole:
            print(f"      - {user.username} ({user.get_full_name()})")
        
        response = input("\n   Corriger ? (o/n): ")
        if response.lower() == 'o':
            users_sans_ecole.update(ecole=ecole)
            print(f"   ✅ {count_users} utilisateur(s) corrigé(s)")
    else:
        print(f"   ✅ Tous les utilisateurs ont une école")
    
    # 2. Vérifier les professeurs
    print("\n" + "=" * 70)
    print("2. VÉRIFICATION DES PROFESSEURS")
    print("=" * 70)
    
    profs_sans_ecole = Professeur.objects.filter(ecole__isnull=True)
    count_profs = profs_sans_ecole.count()
    
    if count_profs > 0:
        print(f"   ⚠️  {count_profs} professeur(s) sans école :")
        for prof in profs_sans_ecole:
            print(f"      - {prof.user.username} ({prof.matricule})")
        
        response = input("\n   Corriger ? (o/n): ")
        if response.lower() == 'o':
            profs_sans_ecole.update(ecole=ecole)
            print(f"   ✅ {count_profs} professeur(s) corrigé(s)")
    else:
        print(f"   ✅ Tous les professeurs ont une école")
    
    # 3. Vérifier les années scolaires
    print("\n" + "=" * 70)
    print("3. VÉRIFICATION DES ANNÉES SCOLAIRES")
    print("=" * 70)
    
    annees_sans_ecole = AnneeScolaire.objects.filter(ecole__isnull=True)
    count_annees = annees_sans_ecole.count()
    
    if count_annees > 0:
        print(f"   ⚠️  {count_annees} année(s) sans école")
        response = input("\n   Corriger ? (o/n): ")
        if response.lower() == 'o':
            annees_sans_ecole.update(ecole=ecole)
            print(f"   ✅ {count_annees} année(s) corrigée(s)")
    else:
        print(f"   ✅ Toutes les années scolaires ont une école")
    
    # 4. Vérifier les classes
    print("\n" + "=" * 70)
    print("4. VÉRIFICATION DES CLASSES")
    print("=" * 70)
    
    classes_sans_ecole = Classe.objects.filter(ecole__isnull=True)
    count_classes = classes_sans_ecole.count()
    
    if count_classes > 0:
        print(f"   ⚠️  {count_classes} classe(s) sans école")
        response = input("\n   Corriger ? (o/n): ")
        if response.lower() == 'o':
            classes_sans_ecole.update(ecole=ecole)
            print(f"   ✅ {count_classes} classe(s) corrigée(s)")
    else:
        print(f"   ✅ Toutes les classes ont une école")
    
    # 5. Vérifier les matières
    print("\n" + "=" * 70)
    print("5. VÉRIFICATION DES MATIÈRES")
    print("=" * 70)
    
    matieres_sans_ecole = Matiere.objects.filter(ecole__isnull=True)
    count_matieres = matieres_sans_ecole.count()
    
    if count_matieres > 0:
        print(f"   ⚠️  {count_matieres} matière(s) sans école")
        response = input("\n   Corriger ? (o/n): ")
        if response.lower() == 'o':
            matieres_sans_ecole.update(ecole=ecole)
            print(f"   ✅ {count_matieres} matière(s) corrigée(s)")
    else:
        print(f"   ✅ Toutes les matières ont une école")
    
    # 6. Vérifier les élèves
    print("\n" + "=" * 70)
    print("6. VÉRIFICATION DES ÉLÈVES")
    print("=" * 70)
    
    eleves_sans_ecole = Eleve.objects.filter(ecole__isnull=True)
    count_eleves = eleves_sans_ecole.count()
    
    if count_eleves > 0:
        print(f"   ⚠️  {count_eleves} élève(s) sans école")
        response = input("\n   Corriger ? (o/n): ")
        if response.lower() == 'o':
            eleves_sans_ecole.update(ecole=ecole)
            print(f"   ✅ {count_eleves} élève(s) corrigé(s)")
    else:
        print(f"   ✅ Tous les élèves ont une école")
    
    # 7. Vérifier les matière-classes
    print("\n" + "=" * 70)
    print("7. VÉRIFICATION DES MATIÈRE-CLASSES")
    print("=" * 70)
    
    mat_classes_sans_ecole = MatiereClasse.objects.filter(ecole__isnull=True)
    count_mat_classes = mat_classes_sans_ecole.count()
    
    if count_mat_classes > 0:
        print(f"   ⚠️  {count_mat_classes} liaison(s) sans école")
        response = input("\n   Corriger ? (o/n): ")
        if response.lower() == 'o':
            mat_classes_sans_ecole.update(ecole=ecole)
            print(f"   ✅ {count_mat_classes} liaison(s) corrigée(s)")
    else:
        print(f"   ✅ Toutes les liaisons ont une école")
    
    # 8. RAPPORT FINAL
    print("\n" + "=" * 70)
    print("8. RAPPORT FINAL POUR L'ÉCOLE :", ecole.nom)
    print("=" * 70)
    
    print(f"\n   - Utilisateurs : {User.objects.filter(ecole=ecole).count()}")
    print(f"   - Professeurs : {Professeur.objects.filter(ecole=ecole).count()}")
    print(f"   - Années scolaires : {AnneeScolaire.objects.filter(ecole=ecole).count()}")
    print(f"   - Classes : {Classe.objects.filter(ecole=ecole).count()}")
    print(f"   - Matières : {Matiere.objects.filter(ecole=ecole).count()}")
    print(f"   - Élèves : {Eleve.objects.filter(ecole=ecole).count()}")
    print(f"   - Liaisons matière-classe : {MatiereClasse.objects.filter(ecole=ecole).count()}")
    
    # 9. Vérifier un utilisateur spécifique
    print("\n" + "=" * 70)
    print("9. VÉRIFICATION D'UN UTILISATEUR SPÉCIFIQUE")
    print("=" * 70)
    
    response = input("\nVoulez-vous vérifier un utilisateur spécifique ? (o/n): ")
    if response.lower() == 'o':
        username = input("Username : ").strip()
        try:
            user = User.objects.get(username=username)
            print(f"\n   Utilisateur : {user.get_full_name()}")
            print(f"   - École User : {user.ecole.nom if user.ecole else '❌ PAS D\'ÉCOLE'}")
            
            if hasattr(user, 'professeur_profile'):
                prof = user.professeur_profile
                print(f"   - École Professeur : {prof.ecole.nom if prof.ecole else '❌ PAS D\'ÉCOLE'}")
                print(f"   - Matricule : {prof.matricule}")
        except User.DoesNotExist:
            print(f"   ❌ Utilisateur '{username}' introuvable")
    
    print("\n" + "=" * 70)
    print("✅ VÉRIFICATION TERMINÉE")
    print("=" * 70)
    print("\nSi vous avez corrigé des données :")
    print("   1. Redémarrez le serveur Django (Ctrl+C puis python manage.py runserver)")
    print("   2. Rechargez le frontend (F5)")
    print("=" * 70)

if __name__ == '__main__':
    verifier_et_corriger()
