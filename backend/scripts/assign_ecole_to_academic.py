"""
Script pour assigner l'école par défaut à tous les objets academic
À exécuter après assign_ecole_to_users.py
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Ecole, AnneeScolaire, Classe, Matiere, Eleve, MatiereClasse

def main():
    print("=" * 70)
    print("ASSIGNATION DE L'ÉCOLE AUX OBJETS ACADEMIC")
    print("=" * 70)
    
    # 1. Récupérer l'école par défaut
    print("\n1. Récupération de l'école par défaut...")
    try:
        ecole = Ecole.objects.get(code='ECOLE001')
        print(f"   ✅ École trouvée : {ecole.nom}")
    except Ecole.DoesNotExist:
        print("   ❌ ERREUR : École ECOLE001 introuvable !")
        print("   Exécutez d'abord : python scripts/create_default_ecole.py")
        return
    
    # 2. Assigner aux années scolaires sans école
    print("\n2. Assignation aux années scolaires...")
    annees_sans_ecole = AnneeScolaire.objects.filter(ecole__isnull=True)
    count_annees = annees_sans_ecole.count()
    
    if count_annees > 0:
        annees_sans_ecole.update(ecole=ecole)
        print(f"   ✅ {count_annees} année(s) scolaire(s) assignée(s)")
    else:
        print(f"   ℹ️  Aucune année scolaire sans école")
    
    # 3. Assigner aux classes sans école
    print("\n3. Assignation aux classes...")
    classes_sans_ecole = Classe.objects.filter(ecole__isnull=True)
    count_classes = classes_sans_ecole.count()
    
    if count_classes > 0:
        classes_sans_ecole.update(ecole=ecole)
        print(f"   ✅ {count_classes} classe(s) assignée(s)")
    else:
        print(f"   ℹ️  Aucune classe sans école")
    
    # 4. Assigner aux matières sans école
    print("\n4. Assignation aux matières...")
    matieres_sans_ecole = Matiere.objects.filter(ecole__isnull=True)
    count_matieres = matieres_sans_ecole.count()
    
    if count_matieres > 0:
        matieres_sans_ecole.update(ecole=ecole)
        print(f"   ✅ {count_matieres} matière(s) assignée(s)")
    else:
        print(f"   ℹ️  Aucune matière sans école")
    
    # 5. Assigner aux élèves sans école
    print("\n5. Assignation aux élèves...")
    eleves_sans_ecole = Eleve.objects.filter(ecole__isnull=True)
    count_eleves = eleves_sans_ecole.count()
    
    if count_eleves > 0:
        eleves_sans_ecole.update(ecole=ecole)
        print(f"   ✅ {count_eleves} élève(s) assigné(s)")
    else:
        print(f"   ℹ️  Aucun élève sans école")
    
    # 6. Assigner aux liaisons matière-classe sans école
    print("\n6. Assignation aux liaisons matière-classe...")
    mat_classes_sans_ecole = MatiereClasse.objects.filter(ecole__isnull=True)
    count_mat_classes = mat_classes_sans_ecole.count()
    
    if count_mat_classes > 0:
        mat_classes_sans_ecole.update(ecole=ecole)
        print(f"   ✅ {count_mat_classes} liaison(s) assignée(s)")
    else:
        print(f"   ℹ️  Aucune liaison sans école")
    
    # 7. Statistiques finales
    print("\n7. Statistiques finales pour", ecole.nom, ":")
    total_annees = AnneeScolaire.objects.filter(ecole=ecole).count()
    total_classes = Classe.objects.filter(ecole=ecole).count()
    total_matieres = Matiere.objects.filter(ecole=ecole).count()
    total_eleves = Eleve.objects.filter(ecole=ecole).count()
    total_mat_classes = MatiereClasse.objects.filter(ecole=ecole).count()
    
    print(f"   - Années scolaires : {total_annees}")
    print(f"   - Classes : {total_classes}")
    print(f"   - Matières : {total_matieres}")
    print(f"   - Élèves : {total_eleves}")
    print(f"   - Liaisons matière-classe : {total_mat_classes}")
    
    print("\n" + "=" * 70)
    print("✅ TERMINÉ !")
    print("=" * 70)
    print("\nVérification :")
    print("   1. Allez sur http://localhost:8000/admin")
    print("   2. Vérifiez que les objets ont bien une école assignée")
    print("   3. Testez l'API frontend")
    print("\nProchaine étape :")
    print("   Créer et tester le middleware de cloisonnement")
    print("=" * 70)

if __name__ == '__main__':
    main()
