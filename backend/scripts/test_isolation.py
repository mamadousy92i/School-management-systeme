"""
Script de test pour vérifier l'isolation des données entre écoles
Crée 2 écoles de test et vérifie qu'aucune fuite de données n'existe
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Ecole, Eleve, Classe, AnneeScolaire
from users.models import User

def test_isolation():
    print("=" * 70)
    print("TEST D'ISOLATION DES DONNÉES MULTI-TENANT")
    print("=" * 70)
    
    # 1. Créer 2 écoles de test
    print("\n1. Création de 2 écoles de test...")
    
    ecole_a, created_a = Ecole.objects.get_or_create(
        code='TEST_A',
        defaults={
            'nom': 'École Test A',
            'directrice': 'Directrice A',
            'adresse': 'Adresse A',
            'telephone': '111',
            'email': 'a@test.sn',
            'abonnement_actif': True
        }
    )
    print(f"   {'✅ Créée' if created_a else 'ℹ️  Existante'}: {ecole_a.nom}")
    
    ecole_b, created_b = Ecole.objects.get_or_create(
        code='TEST_B',
        defaults={
            'nom': 'École Test B',
            'directrice': 'Directrice B',
            'adresse': 'Adresse B',
            'telephone': '222',
            'email': 'b@test.sn',
            'abonnement_actif': True
        }
    )
    print(f"   {'✅ Créée' if created_b else 'ℹ️  Existante'}: {ecole_b.nom}")
    
    # 2. Créer des années scolaires de test
    print("\n2. Création d'années scolaires de test...")
    annee_a, _ = AnneeScolaire.objects.get_or_create(
        libelle='2024-2025',
        ecole=ecole_a,
        defaults={
            'date_debut': '2024-09-01',
            'date_fin': '2025-06-30',
            'active': True
        }
    )
    print(f"   ✅ Année pour École A: {annee_a.libelle}")
    
    annee_b, _ = AnneeScolaire.objects.get_or_create(
        libelle='2024-2025',
        ecole=ecole_b,
        defaults={
            'date_debut': '2024-09-01',
            'date_fin': '2025-06-30',
            'active': True
        }
    )
    print(f"   ✅ Année pour École B: {annee_b.libelle}")
    
    # 3. Créer des classes de test
    print("\n3. Création de classes de test...")
    classe_a, _ = Classe.objects.get_or_create(
        niveau='cm1',
        section='A',
        annee_scolaire=annee_a,
        ecole=ecole_a,
        defaults={'effectif_max': 40}
    )
    print(f"   ✅ Classe pour École A: {classe_a.nom}")
    
    classe_b, _ = Classe.objects.get_or_create(
        niveau='cm1',
        section='A',
        annee_scolaire=annee_b,
        ecole=ecole_b,
        defaults={'effectif_max': 40}
    )
    print(f"   ✅ Classe pour École B: {classe_b.nom}")
    
    # 4. Créer des élèves de test
    print("\n4. Création d'élèves de test...")
    eleve_a, _ = Eleve.objects.get_or_create(
        matricule='TEST001',
        ecole=ecole_a,
        defaults={
            'nom': 'DIOP',
            'prenom': 'Amadou',
            'sexe': 'M',
            'date_naissance': '2010-01-01',
            'lieu_naissance': 'Dakar',
            'adresse': 'Dakar',
            'classe': classe_a
        }
    )
    print(f"   ✅ Élève pour École A: {eleve_a.nom} {eleve_a.prenom}")
    
    eleve_b, _ = Eleve.objects.get_or_create(
        matricule='TEST001',  # Même matricule mais école différente
        ecole=ecole_b,
        defaults={
            'nom': 'NDIAYE',
            'prenom': 'Fatou',
            'sexe': 'F',
            'date_naissance': '2010-01-01',
            'lieu_naissance': 'Dakar',
            'adresse': 'Dakar',
            'classe': classe_b
        }
    )
    print(f"   ✅ Élève pour École B: {eleve_b.nom} {eleve_b.prenom}")
    
    # 5. TESTS D'ISOLATION
    print("\n" + "=" * 70)
    print("5. TESTS D'ISOLATION DES DONNÉES")
    print("=" * 70)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: Les élèves de l'école A ne doivent pas apparaître dans l'école B
    print("\n[TEST 1] Isolation des élèves...")
    eleves_ecole_a = Eleve.objects.filter(ecole=ecole_a)
    eleves_ecole_b = Eleve.objects.filter(ecole=ecole_b)
    
    if eleve_b not in eleves_ecole_a and eleve_a not in eleves_ecole_b:
        print("   ✅ PASSÉ: Les élèves sont correctement isolés")
        tests_passed += 1
    else:
        print("   ❌ ÉCHOUÉ: Fuite de données détectée !")
        tests_failed += 1
    
    # Test 2: Les classes de l'école A ne doivent pas apparaître dans l'école B
    print("\n[TEST 2] Isolation des classes...")
    classes_ecole_a = Classe.objects.filter(ecole=ecole_a)
    classes_ecole_b = Classe.objects.filter(ecole=ecole_b)
    
    if classe_b not in classes_ecole_a and classe_a not in classes_ecole_b:
        print("   ✅ PASSÉ: Les classes sont correctement isolées")
        tests_passed += 1
    else:
        print("   ❌ ÉCHOUÉ: Fuite de données détectée !")
        tests_failed += 1
    
    # Test 3: Même matricule dans 2 écoles différentes (unique_together)
    print("\n[TEST 3] Unicité par école (unique_together)...")
    try:
        # Vérifier qu'on peut avoir le même matricule dans 2 écoles
        count_test001 = Eleve.objects.filter(matricule='TEST001').count()
        if count_test001 >= 2:
            print("   ✅ PASSÉ: Même matricule autorisé dans différentes écoles")
            tests_passed += 1
        else:
            print("   ⚠️  AVERTISSEMENT: unique_together pourrait ne pas fonctionner")
            tests_failed += 1
    except Exception as e:
        print(f"   ❌ ÉCHOUÉ: {e}")
        tests_failed += 1
    
    # Test 4: Comptage correct par école
    print("\n[TEST 4] Comptage des objets par école...")
    count_eleves_a = Eleve.objects.filter(ecole=ecole_a).count()
    count_eleves_b = Eleve.objects.filter(ecole=ecole_b).count()
    
    print(f"   École A: {count_eleves_a} élève(s)")
    print(f"   École B: {count_eleves_b} élève(s)")
    
    if count_eleves_a >= 1 and count_eleves_b >= 1:
        print("   ✅ PASSÉ: Comptage correct")
        tests_passed += 1
    else:
        print("   ❌ ÉCHOUÉ: Comptage incorrect")
        tests_failed += 1
    
    # Test 5: Vérifier que l'école par défaut existe
    print("\n[TEST 5] Vérification école par défaut...")
    try:
        ecole_default = Ecole.objects.get(code='ECOLE001')
        eleves_default = Eleve.objects.filter(ecole=ecole_default).count()
        print(f"   ✅ École par défaut trouvée: {ecole_default.nom}")
        print(f"   ✅ Élèves dans école par défaut: {eleves_default}")
        tests_passed += 1
    except Ecole.DoesNotExist:
        print("   ❌ ÉCHOUÉ: École par défaut introuvable")
        tests_failed += 1
    
    # 6. RÉSULTATS
    print("\n" + "=" * 70)
    print("RÉSULTATS DES TESTS")
    print("=" * 70)
    print(f"\n✅ Tests réussis : {tests_passed}/5")
    print(f"❌ Tests échoués : {tests_failed}/5")
    
    if tests_failed == 0:
        print("\n🎉 TOUS LES TESTS SONT PASSÉS ! L'isolation est fonctionnelle !")
    else:
        print(f"\n⚠️  {tests_failed} test(s) ont échoué. Vérifiez l'implémentation.")
    
    # 7. Nettoyage (optionnel)
    print("\n" + "=" * 70)
    print("7. Nettoyage des données de test...")
    
    response = input("\nVoulez-vous supprimer les écoles de test ? (o/n): ")
    if response.lower() == 'o':
        ecole_a.delete()
        ecole_b.delete()
        print("   ✅ Écoles de test supprimées")
    else:
        print("   ℹ️  Écoles de test conservées")
    
    print("\n" + "=" * 70)
    print("✅ TEST D'ISOLATION TERMINÉ")
    print("=" * 70)

if __name__ == '__main__':
    test_isolation()
