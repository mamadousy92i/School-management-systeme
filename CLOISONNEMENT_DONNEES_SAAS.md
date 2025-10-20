# 🏢 Cloisonnement des Données pour SaaS Multi-Tenant

## 📋 Table des Matières
1. [Situation Actuelle](#situation-actuelle)
2. [Problèmes Identifiés](#problèmes-identifiés)
3. [Architecture Multi-Tenant](#architecture-multi-tenant)
4. [Solutions Recommandées](#solutions-recommandées)
5. [Plan de Migration](#plan-de-migration)

---

## 🔍 Situation Actuelle

### **État du Cloisonnement**
❌ **NON IMPLÉMENTÉ** - Votre système actuel est conçu pour **UNE SEULE ÉCOLE**

### **Architecture Actuelle**
```
[Base de Données]
    ├── Élèves (tous mélangés)
    ├── Classes (toutes mélangées)
    ├── Professeurs (tous mélangés)
    ├── Notes (toutes mélangées)
    └── ... (pas de séparation par école)
```

### **Problèmes Majeurs**
1. ✗ **Pas de notion d'école/tenant**
2. ✗ **Toutes les données sont partagées**
3. ✗ **Un utilisateur peut voir les données d'autres écoles**
4. ✗ **Impossible d'héberger plusieurs écoles**

---

## ⚠️ Problèmes Identifiés

### **1. Absence de Modèle "École"**
```python
# ❌ ACTUELLEMENT
class Eleve(models.Model):
    nom = models.CharField(max_length=100)
    classe = models.ForeignKey(Classe)
    # Pas de lien vers une école !

# ✅ CE QU'IL FAUDRAIT
class Eleve(models.Model):
    nom = models.CharField(max_length=100)
    classe = models.ForeignKey(Classe)
    ecole = models.ForeignKey(Ecole)  # ← CLOISONNEMENT
```

### **2. Requêtes Non Filtrées**
```python
# ❌ ACTUELLEMENT
eleves = Eleve.objects.all()  
# Renvoie TOUS les élèves de TOUTES les écoles !

# ✅ CE QU'IL FAUDRAIT
ecole_id = request.user.ecole_id
eleves = Eleve.objects.filter(ecole_id=ecole_id)
# Renvoie uniquement les élèves de l'école de l'utilisateur
```

### **3. Authentification Non Isolée**
```python
# ❌ ACTUELLEMENT
- Un prof peut voir tous les élèves
- Pas de vérification d'appartenance à l'école

# ✅ CE QU'IL FAUDRAIT
- Chaque user appartient à UNE école
- Ne peut accéder qu'aux données de SON école
```

---

## 🏗️ Architecture Multi-Tenant Recommandée

### **Option 1 : Multi-Tenant avec Clé École (RECOMMANDÉ)**

#### **Avantages**
✅ Une seule base de données  
✅ Facile à mettre en place  
✅ Bon pour 10-100 écoles  
✅ Coût d'infrastructure réduit  

#### **Inconvénients**
⚠️ Risque de fuite de données si mal implémenté  
⚠️ Performance dégradée avec beaucoup d'écoles  

#### **Structure**
```
[Base de Données Unique]
    └── Toutes les tables avec une colonne `ecole_id`
        ├── Écoles (table principale)
        │   ├── École A
        │   ├── École B
        │   └── École C
        │
        ├── Utilisateurs
        │   ├── User 1 (ecole_id=A)
        │   ├── User 2 (ecole_id=A)
        │   └── User 3 (ecole_id=B)
        │
        ├── Élèves
        │   ├── Élève 1 (ecole_id=A)
        │   ├── Élève 2 (ecole_id=A)
        │   └── Élève 3 (ecole_id=B)
        │
        └── ... (toutes les tables avec ecole_id)
```

---

### **Option 2 : Base par École (Pour Grandes Écoles)**

#### **Avantages**
✅ Isolation totale  
✅ Performance maximale  
✅ Personnalisation par école  
✅ Sécurité maximale  

#### **Inconvénients**
⚠️ Complexe à gérer  
⚠️ Coût élevé (une DB par école)  
⚠️ Mises à jour compliquées  

---

## 🛠️ Solutions Recommandées

### **PHASE 1 : Ajout du Modèle École**

```python
# backend/academic/models.py

class Ecole(models.Model):
    """Modèle représentant une école (Tenant)"""
    nom = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)  # Ex: "ECOLE001"
    directrice = models.CharField(max_length=200)
    adresse = models.TextField()
    telephone = models.CharField(max_length=20)
    email = models.EmailField()
    logo = models.ImageField(upload_to='ecoles/logos/', null=True, blank=True)
    
    # Abonnement SaaS
    abonnement_actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_expiration = models.DateField(null=True, blank=True)
    
    # Limites
    max_eleves = models.IntegerField(default=500)
    max_professeurs = models.IntegerField(default=50)
    
    class Meta:
        verbose_name = 'École'
        verbose_name_plural = 'Écoles'
    
    def __str__(self):
        return self.nom
```

### **PHASE 2 : Modification du Modèle User**

```python
# backend/users/models.py

class User(AbstractUser):
    role = models.CharField(...)
    
    # ✅ AJOUT : Lien vers l'école
    ecole = models.ForeignKey(
        'academic.Ecole', 
        on_delete=models.CASCADE,
        related_name='users',
        null=True  # Temporaire pour migration
    )
    
    def get_ecole(self):
        """Récupère l'école de l'utilisateur"""
        return self.ecole
```

### **PHASE 3 : Ajout du Cloisonnement sur Tous les Modèles**

```python
# backend/academic/models.py

class AnneeScolaire(models.Model):
    nom = models.CharField(max_length=50)
    # ✅ AJOUT
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)

class Classe(models.Model):
    nom = models.CharField(max_length=100)
    # ✅ AJOUT
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)

class Matiere(models.Model):
    nom = models.CharField(max_length=100)
    # ✅ AJOUT
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)

class Eleve(models.Model):
    nom = models.CharField(max_length=100)
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE)
    # ✅ AJOUT
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE)

# ... Répéter pour TOUS les modèles
```

### **PHASE 4 : Middleware de Cloisonnement**

```python
# backend/core/middleware.py

class TenantMiddleware:
    """
    Middleware qui injecte automatiquement l'école de l'utilisateur
    dans toutes les requêtes
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.user.is_authenticated:
            # Stocker l'école de l'utilisateur dans le thread local
            request.ecole = request.user.ecole
        
        response = self.get_response(request)
        return response
```

### **PHASE 5 : Filtrage Automatique dans les ViewSets**

```python
# backend/academic/views.py

class BaseEcoleViewSet(viewsets.ModelViewSet):
    """ViewSet de base qui filtre automatiquement par école"""
    
    def get_queryset(self):
        # ✅ Filtrage automatique par école
        if not self.request.user.ecole:
            return self.queryset.none()
        
        return self.queryset.filter(ecole=self.request.user.ecole)
    
    def perform_create(self, serializer):
        # ✅ Injection automatique de l'école lors de la création
        serializer.save(ecole=self.request.user.ecole)


class EleveViewSet(BaseEcoleViewSet):
    """ViewSet pour les élèves avec cloisonnement automatique"""
    queryset = Eleve.objects.all()
    serializer_class = EleveSerializer
    permission_classes = [IsAuthenticated]
    
    # Le filtrage par école est automatique via BaseEcoleViewSet !
```

---

## 📊 Plan de Migration Complet

### **Étape 1 : Préparation (1-2 jours)**
```bash
# 1. Créer une branche dédiée
git checkout -b feature/multi-tenant

# 2. Sauvegarder la base de données
python manage.py dumpdata > backup.json

# 3. Créer le modèle École
# (voir code ci-dessus)
```

### **Étape 2 : Migration des Modèles (2-3 jours)**
```python
# 1. Ajouter le champ ecole à TOUS les modèles
class Migration:
    operations = [
        migrations.AddField(
            model_name='eleve',
            name='ecole',
            field=models.ForeignKey(
                'Ecole', 
                on_delete=models.CASCADE,
                null=True  # Temporaire !
            ),
        ),
        # ... Répéter pour tous les modèles
    ]
```

### **Étape 3 : Migration des Données (1 jour)**
```python
# Script de migration
from academic.models import Ecole, Eleve, Classe

# 1. Créer l'école par défaut
ecole = Ecole.objects.create(
    nom="École Primaire Sénégalaise",
    code="ECOLE001",
    directrice="Mme Fatou SARR"
)

# 2. Assigner tous les objets existants à cette école
Eleve.objects.update(ecole=ecole)
Classe.objects.update(ecole=ecole)
# ... Pour tous les modèles

# 3. Rendre le champ obligatoire
# Nouvelle migration avec null=False
```

### **Étape 4 : Sécurisation (2-3 jours)**
```python
# 1. Ajouter les middlewares
# 2. Modifier tous les ViewSets
# 3. Tester l'isolation
# 4. Vérifier qu'aucune donnée ne fuite
```

### **Étape 5 : Interface Multi-Tenant (3-5 jours)**
```python
# 1. Page d'inscription d'école
# 2. Sélection d'école au login (si super admin)
# 3. Dashboard d'administration SaaS
# 4. Gestion des abonnements
```

---

## 🔐 Tests de Sécurité Essentiels

### **Test 1 : Isolation des Données**
```python
# Créer 2 écoles
ecole_a = Ecole.objects.create(nom="École A")
ecole_b = Ecole.objects.create(nom="École B")

# Créer des élèves
eleve_a = Eleve.objects.create(nom="Jean", ecole=ecole_a)
eleve_b = Eleve.objects.create(nom="Pierre", ecole=ecole_b)

# Test : Un user de l'école A ne doit voir que ses élèves
user_a.ecole = ecole_a
eleves = Eleve.objects.filter(ecole=user_a.ecole)
assert eleve_b not in eleves  # ✅ DOIT PASSER
```

### **Test 2 : Injection de Données**
```python
# Un utilisateur ne doit PAS pouvoir créer un objet
# pour une autre école
user_a.ecole = ecole_a

try:
    # Tentative de créer un élève pour école B
    Eleve.objects.create(nom="Hacker", ecole=ecole_b)
    assert False  # ❌ NE DOIT PAS ARRIVER ICI
except PermissionDenied:
    pass  # ✅ CORRECT
```

---

## 📈 Évolution vers SaaS

### **Fonctionnalités à Ajouter**

1. **Inscription d'École**
   - Formulaire d'inscription
   - Validation d'email
   - Choix du plan (Basic, Pro, Enterprise)

2. **Gestion des Abonnements**
   - Intégration paiement (Stripe, PayPal)
   - Renouvellement automatique
   - Suspension si impayé

3. **Dashboard Super Admin**
   - Vue de toutes les écoles
   - Statistiques globales
   - Gestion des abonnements

4. **Limites par Plan**
   - Plan Basic: 100 élèves, 10 profs
   - Plan Pro: 500 élèves, 50 profs
   - Plan Enterprise: illimité

5. **Personnalisation**
   - Logo de l'école
   - Couleurs personnalisées
   - Domaine personnalisé (ecole.votresaas.com)

---

## ⚡ Résumé : Ce qu'il Faut Faire

### **Priorité HAUTE (Immédiat)**
1. ✅ Créer le modèle `Ecole`
2. ✅ Ajouter `ecole_id` à tous les modèles
3. ✅ Créer le middleware de cloisonnement
4. ✅ Modifier tous les ViewSets pour filtrer par école

### **Priorité MOYENNE (Court terme)**
5. ✅ Tests de sécurité
6. ✅ Migration des données existantes
7. ✅ Interface d'inscription d'école

### **Priorité BASSE (Long terme)**
8. ⏳ Système de paiement
9. ⏳ Dashboard super admin
10. ⏳ Personnalisation avancée

---

## 🚨 ATTENTION : Risques Actuels

### **Sans Cloisonnement**
❌ École A peut voir les données de l'École B  
❌ Fuite de données personnelles  
❌ Non conforme RGPD  
❌ Impossible de commercialiser  

### **Avec Cloisonnement**
✅ Chaque école voit UNIQUEMENT ses données  
✅ Sécurité renforcée  
✅ Conforme RGPD  
✅ Prêt pour commercialisation SaaS  

---

## 💡 Recommandation Finale

**VOTRE SYSTÈME ACTUEL : École Unique (Mono-Tenant)**
- ✅ Fonctionne bien pour UNE école
- ❌ Ne peut PAS gérer plusieurs écoles
- ❌ Données NON cloisonnées

**POUR UN SAAS : Multi-Tenant Obligatoire**
- Implémentez l'**Option 1** (Clé École)
- Budget: 1-2 semaines de développement
- ROI: Permet de vendre à des centaines d'écoles

---

**🎯 Conclusion : Le cloisonnement des données est ESSENTIEL pour un SaaS. Actuellement, il n'est PAS implémenté et doit être ajouté avant toute commercialisation !**
