"""
Script de debug pour comprendre pourquoi le professeur ne voit pas ses classes
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Professeur
from academic.models import Classe, MatiereClasse, Eleve, Ecole
from django.db.models import Q

print("=" * 70)
print("DEBUG PROFESSEUR")
print("=" * 70)

# Chercher Marie MARTIN
username = "marie.martin"

try:
    user = User.objects.get(username=username)
    print(f"\n✅ Utilisateur trouvé : {user.get_full_name()}")
    print(f"   - Username : {user.username}")
    print(f"   - Role : {user.role}")
    print(f"   - École : {user.ecole.nom if user.ecole else '❌ Pas d\'école'}")
    print(f"   - Actif : {user.is_active}")
    
    # Vérifier le profil professeur
    print("\n" + "=" * 70)
    print("PROFIL PROFESSEUR")
    print("=" * 70)
    
    if hasattr(user, 'professeur_profile'):
        prof = user.professeur_profile
        print(f"   ✅ Profil trouvé")
        print(f"   - Matricule : {prof.matricule}")
        print(f"   - Spécialité : {prof.specialite}")
        print(f"   - École : {prof.ecole.nom if prof.ecole else '❌ Pas d\'école'}")
    else:
        print("   ❌ PAS DE PROFIL PROFESSEUR !")
        print("   → C'est le problème ! Un professeur doit avoir un profil.")
        sys.exit(1)
    
    # Vérifier les classes dont il est professeur principal
    print("\n" + "=" * 70)
    print("CLASSES COMME PROFESSEUR PRINCIPAL")
    print("=" * 70)
    
    classes_principal = Classe.objects.filter(professeur_principal=prof)
    print(f"   Total : {classes_principal.count()}")
    for classe in classes_principal:
        print(f"   - {classe.nom} (Élèves: {classe.eleves.count()})")
    
    # Vérifier les matières qu'il enseigne
    print("\n" + "=" * 70)
    print("MATIÈRES ENSEIGNÉES")
    print("=" * 70)
    
    matieres_enseignees = MatiereClasse.objects.filter(professeur=prof)
    print(f"   Total : {matieres_enseignees.count()}")
    for mat_classe in matieres_enseignees:
        print(f"   - {mat_classe.matiere.nom} dans {mat_classe.classe.nom}")
    
    # Vérifier les classes via matières enseignées
    print("\n" + "=" * 70)
    print("CLASSES VIA MATIÈRES ENSEIGNÉES")
    print("=" * 70)
    
    classes_via_matieres = Classe.objects.filter(
        matieres_enseignees__professeur=prof
    ).distinct()
    print(f"   Total : {classes_via_matieres.count()}")
    for classe in classes_via_matieres:
        print(f"   - {classe.nom}")
    
    # SIMULER LE GET_QUERYSET
    print("\n" + "=" * 70)
    print("SIMULATION DU GET_QUERYSET (ce que voit le prof)")
    print("=" * 70)
    
    # Filtrer par école d'abord
    ecole = user.ecole
    if ecole:
        queryset = Classe.objects.filter(ecole=ecole)
        print(f"   1. Classes dans son école : {queryset.count()}")
        
        # Filtrer par professeur
        queryset_prof = queryset.filter(
            Q(professeur_principal=prof) |
            Q(matieres_enseignees__professeur=prof)
        ).distinct()
        print(f"   2. Classes après filtrage professeur : {queryset_prof.count()}")
        
        for classe in queryset_prof:
            nb_eleves = Eleve.objects.filter(classe=classe, ecole=ecole).count()
            print(f"      - {classe.nom} : {nb_eleves} élève(s)")
    else:
        print("   ❌ PAS D'ÉCOLE !")
    
    # Vérifier les élèves
    print("\n" + "=" * 70)
    print("ÉLÈVES DANS L'ÉCOLE")
    print("=" * 70)
    
    if ecole:
        total_eleves = Eleve.objects.filter(ecole=ecole).count()
        print(f"   Total élèves dans l'école : {total_eleves}")
        
        # Par classe
        for classe in Classe.objects.filter(ecole=ecole):
            nb = Eleve.objects.filter(classe=classe, ecole=ecole).count()
            print(f"   - {classe.nom} : {nb} élève(s)")
    
    print("\n" + "=" * 70)
    print("✅ DEBUG TERMINÉ")
    print("=" * 70)
    
except User.DoesNotExist:
    print(f"\n❌ Utilisateur '{username}' introuvable !")
    print("\nUtilisateurs disponibles :")
    for user in User.objects.all():
        print(f"   - {user.username}")
