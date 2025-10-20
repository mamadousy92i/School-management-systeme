"""
Script pour tester directement sans API (Django uniquement)
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Professeur
from academic.models import Eleve, Classe, Ecole
from django.test import RequestFactory
from academic.views import EleveViewSet, ClasseViewSet

print("=" * 70)
print("TEST DIRECT DES VIEWSETS")
print("=" * 70)

# Créer une fausse requête
factory = RequestFactory()

# 1. Récupérer l'utilisateur
print("\n1. VÉRIFICATION UTILISATEUR...")
print("-" * 70)

try:
    user = User.objects.get(username='marie.martin')
    print(f"   ✅ User trouvé: {user.get_full_name()}")
    print(f"   - Email: {user.email}")
    print(f"   - Role: {user.role}")
    print(f"   - École: {user.ecole.nom if user.ecole else '❌ PAS D\'ÉCOLE'}")
    print(f"   - Actif: {user.is_active}")
    
    if not user.ecole:
        print("\n   ⚠️  PROBLÈME: L'utilisateur n'a pas d'école !")
        print("   → Assignation automatique à ECOLE001...")
        
        ecole = Ecole.objects.get(code='ECOLE001')
        user.ecole = ecole
        user.save()
        print(f"   ✅ École assignée: {ecole.nom}")
    
    # Vérifier le profil professeur
    if hasattr(user, 'professeur_profile'):
        prof = user.professeur_profile
        print(f"   ✅ Profil professeur: Oui")
        print(f"   - Matricule: {prof.matricule}")
        print(f"   - École prof: {prof.ecole.nom if prof.ecole else '❌ PAS D\'ÉCOLE'}")
        
        if not prof.ecole:
            print("\n   ⚠️  PROBLÈME: Le professeur n'a pas d'école !")
            prof.ecole = user.ecole
            prof.save()
            print(f"   ✅ École prof assignée")
    
except User.DoesNotExist:
    print("   ❌ Utilisateur marie.martin introuvable !")
    sys.exit(1)

# 2. Test du QuerySet Élèves
print("\n2. TEST QUERYSET ÉLÈVES...")
print("-" * 70)

# Créer une fausse requête HTTP
request = factory.get('/api/academic/eleves/')
request.user = user

# Simuler le middleware
request.ecole = user.ecole
request.ecole_id = user.ecole.id if user.ecole else None

print(f"   Request.user: {request.user.username}")
print(f"   Request.ecole: {request.ecole}")
print(f"   Request.ecole_id: {request.ecole_id}")

# Créer le ViewSet
viewset = EleveViewSet()
viewset.request = request
viewset.format_kwarg = None

# Récupérer le queryset
try:
    queryset = viewset.get_queryset()
    print(f"   ✅ Queryset récupéré")
    print(f"   Nombre d'élèves: {queryset.count()}")
    
    if queryset.count() > 0:
        for i, eleve in enumerate(queryset[:5]):
            print(f"      {i+1}. {eleve.prenom} {eleve.nom} ({eleve.classe.nom if eleve.classe else 'Sans classe'})")
    else:
        print("   ⚠️  QUERYSET VIDE !")
        
        # Vérifier si des élèves existent dans l'école
        total_eleves = Eleve.objects.filter(ecole=user.ecole).count()
        print(f"   Total élèves dans l'école: {total_eleves}")
        
        if total_eleves == 0:
            print("   ❌ Aucun élève dans cette école !")
            print("   → Exécutez: python scripts/peupler_base.py")
        
except Exception as e:
    print(f"   ❌ ERREUR: {e}")
    import traceback
    traceback.print_exc()

# 3. Test du QuerySet Classes
print("\n3. TEST QUERYSET CLASSES...")
print("-" * 70)

viewset_classes = ClasseViewSet()
viewset_classes.request = request
viewset_classes.format_kwarg = None

try:
    queryset_classes = viewset_classes.get_queryset()
    print(f"   Nombre de classes: {queryset_classes.count()}")
    
    if queryset_classes.count() > 0:
        for classe in queryset_classes:
            nb_eleves = Eleve.objects.filter(classe=classe, ecole=user.ecole).count()
            print(f"      - {classe.nom}: {nb_eleves} élève(s)")
    else:
        print("   ⚠️  QUERYSET VIDE !")
        
        total_classes = Classe.objects.filter(ecole=user.ecole).count()
        print(f"   Total classes dans l'école: {total_classes}")

except Exception as e:
    print(f"   ❌ ERREUR: {e}")
    import traceback
    traceback.print_exc()

# 4. Vérification globale
print("\n4. VÉRIFICATION GLOBALE...")
print("-" * 70)

ecole = user.ecole
if ecole:
    print(f"   École: {ecole.nom}")
    print(f"   - Élèves: {Eleve.objects.filter(ecole=ecole).count()}")
    print(f"   - Classes: {Classe.objects.filter(ecole=ecole).count()}")
    print(f"   - Professeurs: {Professeur.objects.filter(ecole=ecole).count()}")
    print(f"   - Users: {User.objects.filter(ecole=ecole).count()}")

print("\n" + "=" * 70)
print("✅ TEST TERMINÉ")
print("=" * 70)

print("\nSi tout est à 0, exécutez:")
print("   python scripts/peupler_base.py")
