# 🚀 Guide d'Implémentation Multi-Tenant - Étape par Étape

## ✅ PHASE 1 : Modèle École (TERMINÉ)

Le modèle `Ecole` a été créé dans `backend/academic/models.py` avec :
- ✅ Informations de base (nom, code, directrice)
- ✅ Contact (adresse, téléphone, email)  
- ✅ Branding (logo, devise)
- ✅ Gestion d'abonnement SaaS
- ✅ Limites par école

---

## 📋 PHASE 2 : Ajout du Lien École → User

### Étape 2.1 : Modifier le Modèle User

**Fichier** : `backend/users/models.py`

```python
# Ajouter ce champ dans la classe User
ecole = models.ForeignKey(
    'academic.Ecole',
    on_delete=models.CASCADE,
    related_name='users',
    null=True,  # Temporaire pour la migration
    blank=True,
    verbose_name="École"
)

def get_ecole(self):
    """Récupère l'école de l'utilisateur"""
    return self.ecole
```

---

## 📋 PHASE 3 : Créer les Migrations

### Étape 3.1 : Créer les Migrations Initiales

```bash
cd backend
python manage.py makemigrations academic
python manage.py makemigrations users
```

### Étape 3.2 : Appliquer les Migrations

```bash
python manage.py migrate
```

---

## 📋 PHASE 4 : Créer l'École par Défaut

### Étape 4.1 : Créer un Script de Migration des Données

**Fichier** : `backend/create_default_ecole.py`

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Ecole
from users.models import User

# 1. Créer l'école par défaut
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
    print(f"✅ École créée : {ecole}")
else:
    print(f"ℹ️  École existante : {ecole}")

# 2. Assigner tous les utilisateurs existants à cette école
users_updated = User.objects.filter(ecole__isnull=True).update(ecole=ecole)
print(f"✅ {users_updated} utilisateurs assignés à l'école")

print("\n🎉 Migration terminée !")
```

### Étape 4.2 : Exécuter le Script

```bash
python backend/create_default_ecole.py
```

---

## 📋 PHASE 5 : Ajouter ecole_id à TOUS les Modèles

### Modèles à Modifier

**Fichier** : `backend/academic/models.py`

```python
# AnneeScolaire
class AnneeScolaire(models.Model):
    libelle = models.CharField(max_length=20)
    # AJOUTER :
    ecole = models.ForeignKey(
        Ecole, 
        on_delete=models.CASCADE,
        related_name='annees_scolaires',
        null=True  # Temporaire
    )

# Classe
class Classe(models.Model):
    nom = models.CharField(max_length=100)
    # AJOUTER :
    ecole = models.ForeignKey(
        Ecole,
        on_delete=models.CASCADE,
        related_name='classes',
        null=True  # Temporaire
    )

# Matiere
class Matiere(models.Model):
    nom = models.CharField(max_length=100)
    # AJOUTER :
    ecole = models.ForeignKey(
        Ecole,
        on_delete=models.CASCADE,
        related_name='matieres',
        null=True  # Temporaire
    )

# Eleve
class Eleve(models.Model):
    nom = models.CharField(max_length=100)
    # AJOUTER :
    ecole = models.ForeignKey(
        Ecole,
        on_delete=models.CASCADE,
        related_name='eleves',
        null=True  # Temporaire
    )
```

**Fichier** : `backend/users/models.py`

```python
# Professeur
class Professeur(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # AJOUTER :
    ecole = models.ForeignKey(
        'academic.Ecole',
        on_delete=models.CASCADE,
        related_name='professeurs',
        null=True  # Temporaire
    )
```

**Fichier** : `backend/grades/models.py`

```python
# Periode
class Periode(models.Model):
    nom = models.CharField(max_length=50)
    # AJOUTER :
    ecole = models.ForeignKey(
        'academic.Ecole',
        on_delete=models.CASCADE,
        related_name='periodes',
        null=True  # Temporaire
    )

# TypeEvaluation (si applicable)
# Note, Moyenne, etc.
```

---

## 📋 PHASE 6 : Migrations après Ajout des Champs

### Étape 6.1 : Créer les Migrations

```bash
python manage.py makemigrations
```

### Étape 6.2 : Assigner l'École par Défaut

**Fichier** : `backend/assign_ecole_to_all.py`

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Ecole, AnneeScolaire, Classe, Matiere, Eleve
from users.models import Professeur
from grades.models import Periode

# Récupérer l'école par défaut
ecole = Ecole.objects.get(code='ECOLE001')

# Assigner à tous les objets existants
AnneeScolaire.objects.filter(ecole__isnull=True).update(ecole=ecole)
Classe.objects.filter(ecole__isnull=True).update(ecole=ecole)
Matiere.objects.filter(ecole__isnull=True).update(ecole=ecole)
Eleve.objects.filter(ecole__isnull=True).update(ecole=ecole)
Professeur.objects.filter(ecole__isnull=True).update(ecole=ecole)
Periode.objects.filter(ecole__isnull=True).update(ecole=ecole)

print("✅ Toutes les données assignées à l'école par défaut")
```

### Étape 6.3 : Exécuter le Script

```bash
python backend/assign_ecole_to_all.py
```

### Étape 6.4 : Rendre les Champs Obligatoires

Modifier TOUS les modèles pour retirer `null=True` :

```python
ecole = models.ForeignKey(
    Ecole,
    on_delete=models.CASCADE,
    related_name='classes'
    # Plus de null=True !
)
```

### Étape 6.5 : Nouvelle Migration

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 📋 PHASE 7 : Middleware de Cloisonnement

**Fichier** : `backend/core/middleware.py` (CRÉER)

```python
class TenantMiddleware:
    """
    Middleware qui injecte automatiquement l'école de l'utilisateur
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.user.is_authenticated and hasattr(request.user, 'ecole'):
            request.ecole = request.user.ecole
        else:
            request.ecole = None
        
        response = self.get_response(request)
        return response
```

**Fichier** : `backend/core/settings.py`

```python
MIDDLEWARE = [
    # ... autres middlewares
    'core.middleware.TenantMiddleware',  # AJOUTER ICI
]
```

---

## 📋 PHASE 8 : Filtrage Automatique dans les ViewSets

**Fichier** : `backend/academic/views.py`

```python
from rest_framework import viewsets
from django.db.models import Q

class BaseEcoleViewSet(viewsets.ModelViewSet):
    """ViewSet de base avec filtrage automatique par école"""
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrer par école si l'utilisateur est authentifié
        if self.request.user.is_authenticated:
            if hasattr(self.request.user, 'ecole') and self.request.user.ecole:
                return queryset.filter(ecole=self.request.user.ecole)
        
        # Si pas d'école, renvoyer vide
        return queryset.none()
    
    def perform_create(self, serializer):
        # Injecter automatiquement l'école
        if hasattr(self.request.user, 'ecole') and self.request.user.ecole:
            serializer.save(ecole=self.request.user.ecole)
        else:
            raise ValidationError("Vous devez être assigné à une école")


# Modifier TOUS les ViewSets existants
class EleveViewSet(BaseEcoleViewSet):  # Hériter de BaseEcoleViewSet
    queryset = Eleve.objects.all()
    serializer_class = EleveSerializer
    # Le reste reste identique !

class ClasseViewSet(BaseEcoleViewSet):  # Hériter de BaseEcoleViewSet
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer

# ... Répéter pour TOUS les ViewSets
```

---

## 📋 PHASE 9 : Tests de Sécurité

### Test 1 : Isolation des Données

```python
# backend/test_isolation.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Ecole, Eleve
from users.models import User

# Créer 2 écoles
ecole_a = Ecole.objects.create(
    code='TEST_A',
    nom='École A',
    directrice='Directrice A',
    adresse='Adresse A',
    telephone='111',
    email='a@test.sn'
)

ecole_b = Ecole.objects.create(
    code='TEST_B',
    nom='École B',
    directrice='Directrice B',
    adresse='Adresse B',
    telephone='222',
    email='b@test.sn'
)

# Créer des élèves
eleve_a = Eleve.objects.create(nom='Jean', prenom='A', ecole=ecole_a)
eleve_b = Eleve.objects.create(nom='Pierre', prenom='B', ecole=ecole_b)

# Test : Filtrage
eleves_ecole_a = Eleve.objects.filter(ecole=ecole_a)
assert eleve_b not in eleves_ecole_a, "❌ ÉCHEC : Fuite de données !"
print("✅ Test d'isolation réussi")

# Nettoyage
ecole_a.delete()
ecole_b.delete()
```

### Exécuter le Test

```bash
python backend/test_isolation.py
```

---

## 📋 PHASE 10 : Admin Django

**Fichier** : `backend/academic/admin.py`

```python
from django.contrib import admin
from .models import Ecole

@admin.register(Ecole)
class EcoleAdmin(admin.ModelAdmin):
    list_display = ['nom', 'code', 'directrice', 'abonnement_actif', 'date_creation']
    list_filter = ['abonnement_actif', 'date_creation']
    search_fields = ['nom', 'code', 'directrice']
    readonly_fields = ['date_creation']
```

---

## ✅ Checklist Complète

### Backend
- [ ] Modèle Ecole créé ✅
- [ ] Champ ecole ajouté au User
- [ ] Champ ecole ajouté à AnneeScolaire
- [ ] Champ ecole ajouté à Classe
- [ ] Champ ecole ajouté à Matiere
- [ ] Champ ecole ajouté à Eleve
- [ ] Champ ecole ajouté à Professeur
- [ ] Champ ecole ajouté à Periode
- [ ] Migrations créées et appliquées
- [ ] École par défaut créée
- [ ] Données existantes assignées
- [ ] Middleware créé et activé
- [ ] BaseEcoleViewSet créé
- [ ] Tous les ViewSets modifiés
- [ ] Tests de sécurité passés
- [ ] Admin Django configuré

### Frontend
- [ ] Mise à jour de l'API (automatique)
- [ ] Page d'administration des écoles (optionnel)
- [ ] Dashboard super admin (optionnel)

---

## 🚨 ATTENTION

### Points Critiques
1. ⚠️ **Sauvegarder la DB avant** : `python manage.py dumpdata > backup.json`
2. ⚠️ **Tester en dev** avant de déployer en production
3. ⚠️ **Vérifier l'isolation** avec les tests
4. ⚠️ **Ne jamais supprimer** le champ ecole une fois en production

### Rollback en Cas de Problème
```bash
python manage.py migrate academic zero
python manage.py migrate users zero
python manage.py loaddata backup.json
```

---

## 🎯 Résultat Final

Après ces étapes, vous aurez :
- ✅ Une école par défaut avec toutes vos données actuelles
- ✅ Isolation complète des données par école
- ✅ Système prêt pour le multi-tenant
- ✅ Base solide pour un SaaS

---

## 📞 Prochaines Étapes (Après Cloisonnement)

1. **Inscription d'école** : Interface pour créer de nouvelles écoles
2. **Sélection d'école** : Au login si super admin
3. **Dashboard SaaS** : Vue globale de toutes les écoles
4. **Système de paiement** : Stripe/PayPal
5. **Plans tarifaires** : Basic, Pro, Enterprise

---

**🎉 Bonne chance avec l'implémentation !**
