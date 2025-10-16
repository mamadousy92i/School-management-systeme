# 🏫 Migration et Configuration de l'École

## ⚠️ Étapes obligatoires

Le système a été mis à jour pour inclure la gestion des écoles. Vous devez exécuter les migrations et créer votre école.

## 🔧 Étape 1 : Créer et appliquer les migrations

```powershell
cd backend
python manage.py makemigrations
python manage.py migrate
```

## 🏫 Étape 2 : Créer votre école

### Option A : Via l'interface admin Django

1. Démarrez le serveur backend :
   ```powershell
   python manage.py runserver
   ```

2. Accédez à l'admin Django : `http://localhost:8000/admin`

3. Allez dans **Academic → Écoles → Ajouter une école**

4. Remplissez les informations :
   - **Nom** : Ex: "École Primaire Saint-Joseph"
   - **Sigle** : Ex: "EPSJ"
   - **Adresse** : Adresse complète de l'école
   - **Téléphone** : Numéro de contact
   - **Email** : Email officiel
   - **Devise** : Ex: "Excellence et Discipline"
   - **Directeur** : Nom du directeur
   - **Active** : ✅ Coché

5. Sauvegardez

### Option B : Via le shell Django

```powershell
python manage.py shell
```

```python
from academic.models import Ecole

# Créer l'école
ecole = Ecole.objects.create(
    nom="École Primaire Saint-Joseph",
    sigle="EPSJ",
    adresse="123 Avenue de l'Éducation, Yaoundé, Cameroun",
    telephone="+237 6 XX XX XX XX",
    email="contact@epsj.cm",
    devise="Excellence et Discipline",
    directeur="M. Jean KAMDEM",
    active=True
)

print(f"École créée : {ecole.nom}")
exit()
```

## 👥 Étape 3 : Rattacher les utilisateurs à l'école

### Via l'interface admin

1. Allez dans **Users → Utilisateurs**
2. Pour chaque utilisateur (admin et professeurs) :
   - Cliquez sur l'utilisateur
   - Sélectionnez l'**École** dans le menu déroulant
   - Sauvegardez

### Via le shell Django

```powershell
python manage.py shell
```

```python
from users.models import User
from academic.models import Ecole

# Récupérer l'école
ecole = Ecole.objects.first()

# Rattacher TOUS les utilisateurs à cette école
User.objects.all().update(ecole=ecole)

print(f"Tous les utilisateurs rattachés à {ecole.nom}")
exit()
```

## ✅ Vérification

### 1. Vérifier que l'école est créée :

```powershell
python manage.py shell
```

```python
from academic.models import Ecole
ecoles = Ecole.objects.all()
for e in ecoles:
    print(f"- {e.nom} ({e.sigle})")
exit()
```

### 2. Vérifier que les utilisateurs sont rattachés :

```powershell
python manage.py shell
```

```python
from users.models import User
users_sans_ecole = User.objects.filter(ecole__isnull=True).count()
if users_sans_ecole == 0:
    print("✅ Tous les utilisateurs sont rattachés à une école")
else:
    print(f"⚠️ {users_sans_ecole} utilisateur(s) sans école")
exit()
```

## 📄 Impact sur les bulletins

Une fois l'école configurée, les bulletins afficheront automatiquement :

```
╔═══════════════════════════════════════════╗
║    ÉCOLE PRIMAIRE SAINT-JOSEPH            ║
║        "Excellence et Discipline"          ║
║       Année Scolaire 2024-2025            ║
║                                           ║
║        BULLETIN DE NOTES                  ║
║           Trimestre 1                     ║
╚═══════════════════════════════════════════╝
```

## 🎯 Données affichées automatiquement

- ✅ **Nom de l'école** (au lieu de "ÉCOLE PRIMAIRE")
- ✅ **Devise** (si renseignée)
- ✅ **Année scolaire** réelle (depuis la base de données)
- ✅ Nom du directeur (dans le champ signatures si configuré)

## 🔄 Si vous avez plusieurs écoles

Si vous gérez plusieurs écoles :

1. Créez chaque école dans l'admin
2. Rattachez chaque utilisateur à SON école
3. Les bulletins afficheront automatiquement le nom de l'école de l'utilisateur connecté

## 📝 Modèle École - Champs disponibles

- **nom** : Nom complet de l'école
- **sigle** : Abréviation (ex: EPSJ)
- **adresse** : Adresse complète
- **telephone** : Numéro de téléphone
- **email** : Email officiel
- **logo** : Logo de l'école (optionnel)
- **devise** : Devise ou slogan
- **directeur** : Nom du directeur
- **active** : École active ou non

---

**Note** : Après avoir créé votre école et rattaché les utilisateurs, rafraîchissez le frontend pour voir les changements dans les bulletins !
