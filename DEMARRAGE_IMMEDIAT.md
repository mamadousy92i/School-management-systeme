# 🚀 Démarrage Immédiat - Système de Gestion Scolaire

## ⚡ Lancement en 3 Étapes

### ÉTAPE 1 : Backend Django (Terminal 1)

```powershell
# Ouvrir PowerShell dans le dossier school_management
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
.\venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer les migrations
python manage.py makemigrations users
python manage.py makemigrations academic
python manage.py migrate

# Créer un compte admin
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

✅ Backend prêt sur : **http://localhost:8000**

---

### ÉTAPE 2 : Frontend React (Terminal 2 - NOUVEAU)

```powershell
# Ouvrir un NOUVEAU PowerShell
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

✅ Frontend prêt sur : **http://localhost:5173**

---

### ÉTAPE 3 : Configuration Initiale

#### A. Créer une année scolaire

1. Allez sur : **http://localhost:8000/admin**
2. Connectez-vous avec vos identifiants admin
3. Cliquez sur **Années Scolaires** → **Ajouter**
4. Remplissez :
   - Libellé : `2024-2025`
   - Date début : `2024-09-01`
   - Date fin : `2025-06-30`
   - ✅ **Active** : Coché
5. Cliquez sur **Enregistrer**

#### B. Créer votre compte utilisateur

1. Allez sur : **http://localhost:5173**
2. Cliquez sur **S'inscrire**
3. Remplissez le formulaire :
   - **Rôle** : Administrateur
   - Prénom : Votre prénom
   - Nom : Votre nom
   - Username : admin ou votre choix
   - Email : votre@email.com
   - Mot de passe : (minimum 8 caractères)
4. Cliquez sur **S'inscrire**
5. Connectez-vous avec vos identifiants

---

## 🎯 Ce Que Vous Pouvez Faire Maintenant

### ✅ Module 1 : Authentification
- [x] Créer des comptes Admin/Professeur
- [x] Se connecter de manière sécurisée
- [x] Gérer les profils utilisateurs

### ✅ Module 2 : Gestion Académique

#### 📚 Gérer les Matières
1. Cliquez sur **Matières** dans le menu
2. Cliquez sur **Nouvelle matière**
3. Créez vos matières :
   - Mathématiques (Code: MATH, Coef: 4)
   - Français (Code: FR, Coef: 3)
   - Anglais (Code: ANG, Coef: 3)
   - SVT (Code: SVT, Coef: 2)
   - Histoire-Géo (Code: HIST, Coef: 2)
   - Physique-Chimie (Code: PC, Coef: 2)

#### 🏫 Gérer les Classes
1. Cliquez sur **Classes** dans le menu
2. Cliquez sur **Nouvelle classe**
3. Créez vos classes :
   - 6ème A (Niveau: 6ème, Effectif max: 40)
   - 6ème B (Niveau: 6ème, Effectif max: 40)
   - 5ème A (Niveau: 5ème, Effectif max: 40)
   - Etc.

#### 👥 Gérer les Élèves

**Option A : Ajout Manuel**
1. Cliquez sur **Élèves** dans le menu
2. Cliquez sur **Nouvel élève**
3. Remplissez le formulaire complet
4. Cliquez sur **Créer**

**Option B : Import CSV (Recommandé)**
1. Cliquez sur **Élèves**
2. Cliquez sur **Template CSV** pour télécharger le modèle
3. Ouvrez le fichier CSV et ajoutez vos élèves
4. Cliquez sur **Importer**
5. Sélectionnez votre classe et votre fichier
6. Cliquez sur **Importer**

---

## 📋 Format du Fichier CSV pour l'Import

```csv
matricule,nom,prenom,sexe,date_naissance,lieu_naissance,telephone_eleve,email,adresse,nom_pere,telephone_pere,nom_mere,telephone_mere,tuteur,telephone_tuteur
EL00001,DUPONT,Jean,M,2010-05-15,Yaoundé,677123456,jean@email.com,123 Rue Exemple,Pierre DUPONT,677111111,Marie DUPONT,677222222,,
EL00002,MARTIN,Sophie,F,2010-08-22,Douala,677234567,sophie@email.com,456 Avenue Test,Paul MARTIN,677333333,Anne MARTIN,677444444,,
```

**Colonnes obligatoires** :
- matricule, nom, prenom, sexe, date_naissance, lieu_naissance, adresse

**Colonnes optionnelles** :
- telephone_eleve, email, nom_pere, telephone_pere, nom_mere, telephone_mere, tuteur, telephone_tuteur

---

## 🎮 Navigation dans l'Application

### Menu Principal (Sidebar)

**Pour les Administrateurs** :
- 🏠 **Accueil** → Dashboard avec statistiques
- 👥 **Élèves** → Gestion des élèves
- 📚 **Classes** → Gestion des classes
- 📖 **Matières** → Gestion des matières
- 📝 **Notes** → (Module 3 - À venir)
- 📄 **Bulletins** → (Module 4 - À venir)
- 👨‍🏫 **Professeurs** → Gestion des professeurs
- ⚙️ **Paramètres** → Configuration

**Pour les Professeurs** :
- 🏠 **Accueil** → Dashboard
- 👥 **Élèves** → Consultation des élèves
- 📝 **Notes** → Saisie des notes (À venir)
- 📄 **Bulletins** → Consultation des bulletins (À venir)
- ⚙️ **Paramètres** → Profil personnel

---

## 🔍 Fonctionnalités Disponibles

### Sur la Page Classes
- ✅ Créer une nouvelle classe
- ✅ Modifier une classe existante
- ✅ Supprimer une classe
- ✅ Voir l'effectif actuel vs maximum
- ✅ Rechercher une classe
- ✅ Voir le professeur principal
- ✅ Voir le nombre de matières

### Sur la Page Matières
- ✅ Créer une nouvelle matière
- ✅ Modifier une matière
- ✅ Supprimer une matière
- ✅ Définir les coefficients
- ✅ Ajouter une description

### Sur la Page Élèves
- ✅ Ajouter un élève manuellement
- ✅ Modifier les informations d'un élève
- ✅ Supprimer un élève
- ✅ Rechercher un élève (nom, prénom, matricule)
- ✅ Filtrer par classe
- ✅ Filtrer par statut (actif/inactif)
- ✅ Importer des élèves via CSV/Excel
- ✅ Télécharger un template CSV
- ✅ Voir la photo de l'élève
- ✅ Voir l'âge calculé automatiquement

---

## 🎨 Interface Utilisateur

### Design
- ✅ Interface moderne avec Tailwind CSS
- ✅ Sidebar responsive (mobile-friendly)
- ✅ Thème clair professionnel
- ✅ Icônes Lucide React
- ✅ Animations fluides
- ✅ Cards et grids élégants

### Expérience Utilisateur
- ✅ Navigation intuitive
- ✅ Recherche en temps réel
- ✅ Modales pour les formulaires
- ✅ Messages d'erreur clairs
- ✅ Confirmations avant suppression
- ✅ Responsive sur tous les écrans

---

## 🔐 Sécurité

### Authentification
- ✅ Tokens JWT avec refresh automatique
- ✅ Mots de passe hashés
- ✅ Session persistante (localStorage)
- ✅ Déconnexion sécurisée

### Permissions
- ✅ Routes protégées selon le rôle
- ✅ Admin : accès total
- ✅ Professeur : accès limité
- ✅ API sécurisée avec permissions

---

## 📊 Données de Test (Optionnel)

### Créer des données de test via Django Shell

```powershell
# Dans le terminal backend (avec venv activé)
python manage.py shell
```

```python
# Dans le shell Django
from academic.models import Matiere, Classe, Eleve, AnneeScolaire
from datetime import date

# Récupérer l'année scolaire active
annee = AnneeScolaire.objects.get(active=True)

# Créer des matières
matieres = [
    Matiere.objects.create(nom="Mathématiques", code="MATH", coefficient=4),
    Matiere.objects.create(nom="Français", code="FR", coefficient=3),
    Matiere.objects.create(nom="Anglais", code="ANG", coefficient=3),
]

# Créer une classe
classe = Classe.objects.create(
    nom="6ème A",
    niveau="6eme",
    effectif_max=40,
    annee_scolaire=annee
)

# Créer un élève
eleve = Eleve.objects.create(
    matricule="EL00001",
    nom="DUPONT",
    prenom="Jean",
    sexe="M",
    date_naissance=date(2010, 5, 15),
    lieu_naissance="Yaoundé",
    adresse="123 Rue Exemple",
    classe=classe
)

print("Données de test créées avec succès !")
exit()
```

---

## 🛠️ Commandes Utiles

### Backend

```powershell
# Activer l'environnement
.\venv\Scripts\activate

# Créer des migrations après modification des models
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superuser
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver

# Shell Django
python manage.py shell

# Collecter les fichiers statiques
python manage.py collectstatic
```

### Frontend

```powershell
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
```

---

## 🐛 Résolution de Problèmes Courants

### "ModuleNotFoundError" (Backend)
```powershell
.\venv\Scripts\activate
pip install -r requirements.txt
```

### "CORS Error" (Frontend)
- Vérifiez que le backend tourne sur le port 8000
- Vérifiez les CORS settings dans `backend/core/settings.py`

### "Port already in use"
**Backend** :
```powershell
python manage.py runserver 8001
```
**Frontend** : Vite proposera automatiquement un autre port

### Les migrations ne s'appliquent pas
```powershell
python manage.py migrate --run-syncdb
```

### L'année scolaire n'apparaît pas
- Vérifiez qu'elle est marquée "Active" dans Django Admin
- Une seule année peut être active à la fois

---

## 📁 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Application React |
| Backend API | http://localhost:8000/api/ | API REST |
| Admin Django | http://localhost:8000/admin/ | Interface admin |
| API Auth | http://localhost:8000/api/auth/ | Endpoints auth |
| API Academic | http://localhost:8000/api/academic/ | Endpoints académiques |

---

## 📖 Documentation Complète

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation principale du projet |
| `QUICKSTART.md` | Guide de démarrage détaillé |
| `PROJET_STATUS.md` | État détaillé de chaque module |
| `RESUME_FINAL.md` | Résumé complet avec statistiques |
| `DEMARRAGE_IMMEDIAT.md` | Ce guide (démarrage rapide) |

---

## ✨ Prochaines Étapes

### Développement (Modules 3 & 4)
1. **Module 3** : Développer la saisie des notes
2. **Module 4** : Générer les bulletins PDF
3. Ajouter des graphiques de performance
4. Implémenter les notifications

### Déploiement
1. Migrer vers PostgreSQL
2. Configurer un serveur (Heroku, DigitalOcean, etc.)
3. Build React pour production
4. Configurer HTTPS

---

## 🎯 Checklist de Démarrage

- [ ] Backend installé et lancé
- [ ] Frontend installé et lancé
- [ ] Année scolaire créée (Admin Django)
- [ ] Compte utilisateur créé (Register)
- [ ] Au moins 3 matières créées
- [ ] Au moins 2 classes créées
- [ ] Au moins 5 élèves ajoutés (manuel ou CSV)
- [ ] Navigation testée dans toutes les pages
- [ ] Import CSV testé

---

## 🎓 Conseils d'Utilisation

### Best Practices
- Créez **l'année scolaire** avant tout
- Créez les **matières** avant les classes
- Créez les **classes** avant les élèves
- Utilisez l'**import CSV** pour les grandes listes
- **Sauvegardez** régulièrement la base de données

### Astuces
- Les matricules peuvent être auto-générés (laisser vide lors de l'import)
- Utilisez la recherche pour trouver rapidement un élève
- Les coefficients des matières sont modifiables à tout moment
- L'âge des élèves est calculé automatiquement

---

## 💾 Sauvegarde des Données

### Base de données SQLite
```powershell
# Sauvegarder
copy backend\db.sqlite3 backup\db_backup_$(Get-Date -Format "yyyyMMdd").sqlite3

# Restaurer
copy backup\db_backup_20241015.sqlite3 backend\db.sqlite3
```

---

## 🚀 Vous Êtes Prêt !

Votre système de gestion scolaire est **opérationnel** avec :
- ✅ Authentification complète
- ✅ Gestion des classes
- ✅ Gestion des matières
- ✅ Gestion des élèves avec import CSV

**Commencez dès maintenant à utiliser l'application !**

---

**Besoin d'aide ?** Consultez les autres fichiers de documentation.

**Bon travail ! 🎓**
