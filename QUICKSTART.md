# Guide de Démarrage Rapide

Ce guide vous aidera à lancer rapidement l'application de gestion scolaire.

## 🚀 Démarrage en 5 minutes

### Étape 1 : Backend Django

Ouvrez un terminal PowerShell dans le dossier `backend` :

```powershell
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel (Windows)
.\venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer les tables de la base de données
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur (admin)
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: (votre choix - au moins 8 caractères)

# Lancer le serveur Django
python manage.py runserver
```

✅ Le backend est maintenant accessible sur : http://localhost:8000

### Étape 2 : Frontend React

Ouvrez un **nouveau** terminal PowerShell dans le dossier `frontend` :

```powershell
cd frontend

# Installer les dépendances Node.js
npm install

# Lancer le serveur de développement Vite
npm run dev
```

✅ Le frontend est maintenant accessible sur : http://localhost:5173

### Étape 3 : Première Connexion

1. Ouvrez votre navigateur sur http://localhost:5173
2. Cliquez sur **S'inscrire**
3. Remplissez le formulaire :
   - Rôle : **Administrateur**
   - Prénom/Nom : (votre choix)
   - Username : (votre choix)
   - Email : (votre email)
   - Mot de passe : (au moins 8 caractères)
4. Cliquez sur **S'inscrire**
5. Vous serez redirigé vers la page de connexion
6. Connectez-vous avec vos identifiants

## 📊 Configuration Initiale

### 1. Créer une année scolaire (via Django Admin)

1. Allez sur http://localhost:8000/admin
2. Connectez-vous avec le superutilisateur créé
3. Cliquez sur **Années Scolaires** → **Ajouter**
4. Remplissez :
   - Libellé : `2024-2025`
   - Date début : `2024-09-01`
   - Date fin : `2025-06-30`
   - Active : ✅ Coché
5. Cliquez sur **Enregistrer**

### 2. Créer des matières

1. Dans l'application React, allez sur **Matières**
2. Cliquez sur **Nouvelle matière**
3. Créez quelques matières :
   - Mathématiques (Code: MATH, Coef: 4)
   - Français (Code: FR, Coef: 3)
   - Anglais (Code: ANG, Coef: 3)
   - SVT (Code: SVT, Coef: 2)
   - Histoire-Géo (Code: HIST, Coef: 2)

### 3. Créer des classes

1. Allez sur **Classes**
2. Cliquez sur **Nouvelle classe**
3. Créez quelques classes :
   - 6ème A (Niveau: 6ème, Effectif max: 40)
   - 5ème A (Niveau: 5ème, Effectif max: 40)
   - 4ème A (Niveau: 4ème, Effectif max: 40)

### 4. Ajouter des élèves

**Option A : Ajout manuel**
1. Allez sur **Élèves**
2. Cliquez sur **Nouvel élève**
3. Remplissez le formulaire

**Option B : Import CSV (Recommandé pour plusieurs élèves)**
1. Téléchargez le template CSV
2. Remplissez avec vos données
3. Importez le fichier

## 🎯 Fonctionnalités Disponibles

### ✅ Module 1 : Authentification (Complété)
- Inscription Admin/Professeur
- Connexion sécurisée avec JWT
- Gestion de session
- Dashboard personnalisé

### ✅ Module 2 : Gestion Académique (Complété)
- **Classes** : Création, modification, suppression
- **Matières** : Gestion complète avec coefficients
- **Élèves** : CRUD + Import CSV/Excel

### ⏳ Module 3 : Notes (À venir)
- Saisie des notes
- Calcul automatique des moyennes
- Visualisation des performances

### ⏳ Module 4 : Bulletins (À venir)
- Génération de bulletins PDF
- Gestion du cycle scolaire
- Passage en classe supérieure

## 🔧 Commandes Utiles

### Backend

```powershell
# Créer une nouvelle migration après modification des modèles
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver

# Shell Django (pour tester des requêtes)
python manage.py shell
```

### Frontend

```powershell
# Installer les dépendances
npm install

# Lancer le serveur de dev
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

## 🐛 Résolution de Problèmes

### Erreur : "ModuleNotFoundError" (Backend)
**Solution** : Vérifiez que l'environnement virtuel est activé
```powershell
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Erreur : CORS (Frontend ne peut pas contacter le backend)
**Solution** : Vérifiez que le backend tourne sur http://localhost:8000

### Erreur : "Cannot find module" (Frontend)
**Solution** : Réinstallez les dépendances
```powershell
rm -rf node_modules
npm install
```

### Erreur : "Port already in use"
**Backend** : Changez le port
```powershell
python manage.py runserver 8001
```

**Frontend** : Vite vous proposera automatiquement un autre port

## 📱 Accès aux Interfaces

- **Application React** : http://localhost:5173
- **API Backend** : http://localhost:8000/api/
- **Admin Django** : http://localhost:8000/admin/
- **API Documentation** : http://localhost:8000/api/ (navigation browser)

## 🎓 Rôles et Permissions

### Administrateur
- Accès complet à toutes les fonctionnalités
- Gestion des classes, matières, élèves
- Gestion des professeurs
- Configuration du système

### Professeur
- Consultation des élèves de ses classes
- Saisie des notes (Module 3)
- Consultation des bulletins
- Modification de son profil

## 📚 Prochaines Étapes

1. **Module 3** : Développer la saisie des notes et le calcul des moyennes
2. **Module 4** : Implémenter la génération de bulletins PDF
3. **Améliorations** : Ajouter des graphiques, statistiques, notifications

## 💡 Conseils

- Utilisez l'interface Django Admin pour des opérations rapides
- Testez l'import CSV avec quelques lignes d'abord
- Créez une année scolaire avant de créer des classes
- Sauvegardez régulièrement votre base de données

## 🆘 Besoin d'Aide ?

- Consultez la documentation dans `README.md`
- Vérifiez les logs du backend dans le terminal
- Ouvrez la console développeur du navigateur (F12)

---

**Bon développement ! 🚀**
