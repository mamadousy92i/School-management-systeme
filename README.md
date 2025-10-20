# Système de Gestion Scolaire

Système complet de gestion scolaire développé avec **Django REST Framework** (backend) et **React** (frontend).

## 📋 Vue d'ensemble

Ce projet permet de gérer :
- 👥 **Utilisateurs** : Administrateurs et Professeurs
- 🎓 **Élèves** : Gestion des informations et inscriptions
- 📚 **Classes et Matières** : Organisation pédagogique
- 📝 **Notes** : Saisie et calcul des moyennes
- 📄 **Bulletins** : Génération automatique de bulletins PDF
- 🔄 **Cycle scolaire** : Gestion du passage en classe supérieure

## 🏗️ Architecture modulaire

Le projet est divisé en 4 modules indépendants :

### ✅ Module 1 : Authentification et Utilisateurs (Complété)
**Backend** :
- Modèles User, Admin, Professeur
- API REST avec JWT authentication
- Permissions basées sur les rôles

**Frontend** :
- Pages Login et Register avec UI moderne
- Context d'authentification React
- Routes protégées
- Dashboard avec sidebar responsive

### 🔄 Module 2 : Gestion des Classes, Matières et Élèves (En cours)
- CRUD complet pour Classes, Matières, Élèves
- Import de données via CSV/Excel
- Interfaces d'administration

### ⏳ Module 3 : Saisie et Calcul des Notes (À venir)
- Interface de saisie de notes par classe/matière
- Calcul automatique des moyennes
- Visualisation des performances

### ⏳ Module 4 : Bulletins et Cycle Scolaire (À venir)
- Génération de bulletins PDF
- Gestion de fin d'année scolaire
- Passage automatique en classe supérieure

## 🚀 Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- pip
- npm

### Backend (Django)

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
.\venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer la base de données
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

Le backend sera accessible sur `http://localhost:8000`

### Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/logout/` - Déconnexion
- `GET /api/auth/profile/` - Profil utilisateur

### Utilisateurs
- `GET /api/users/` - Liste des utilisateurs
- `GET /api/users/{id}/` - Détails
- `PUT /api/users/{id}/` - Modification
- `DELETE /api/users/{id}/` - Suppression

### Professeurs
- `GET /api/professeurs/` - Liste des professeurs
- `POST /api/professeurs/` - Création
- `GET /api/professeurs/{id}/` - Détails
- `PUT /api/professeurs/{id}/` - Modification

## 🛠️ Technologies

### Backend
- Django 5.2.7
- Django REST Framework 3.15.2
- Simple JWT (authentification)
- django-cors-headers
- SQLite (développement) / PostgreSQL (production)

### Frontend
- React 19
- React Router 7
- Axios (client HTTP)
- Tailwind CSS
- Lucide React (icônes)
- Vite (build tool)

## 📂 Structure du projet

```
school_management/
├── backend/
│   ├── core/              # Configuration Django
│   ├── users/             # App utilisateurs
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── context/       # Contextes React
│   │   ├── pages/         # Pages
│   │   ├── services/      # Services API
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 👥 Rôles et Permissions

### Administrateur
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs, classes, matières, élèves
- Génération des bulletins
- Gestion du cycle scolaire

### Professeur
- Consultation des élèves de ses classes
- Saisie des notes pour ses matières
- Consultation des bulletins
- Modification de son profil

## 🔐 Sécurité

- Authentification JWT avec refresh tokens
- Tokens expirés automatiquement renouvelés
- Permissions basées sur les rôles
- Mots de passe hashés avec Django
- CORS configuré pour le développement

## 📝 Notes de développement

- Le projet utilise une approche modulaire pour faciliter le développement incrémentiel
- Chaque module est indépendant et peut être testé séparément
- Les migrations Django doivent être exécutées après chaque modification de modèle
- Le frontend utilise Tailwind CSS pour un design moderne et responsive

## 🤝 Contribution

Ce projet est développé de manière modulaire. Chaque module doit être complété et testé avant de passer au suivant.

## 📄 Licence

© 2024 Système de Gestion Scolaire. Tous droits réservés.

## 🧩 Configuration et environnements

- **Backend (`backend/core/settings.py`)**
  - `DEBUG`: `True` en dev. Mettre à `False` en prod.
  - `ALLOWED_HOSTS`: renseigner vos domaines en prod.
  - `CORS_ALLOWED_ORIGINS`: inclure l’URL du frontend.
  - `AUTH_USER_MODEL`: `users.User`.
  - `REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES`: `users.authentication.CustomJWTAuthentication`.
  - `MEDIA_URL`/`MEDIA_ROOT`: fichiers uploadés.

- **Frontend (`frontend/src/services/api.js`)**
  - Base API: `http://localhost:8000/api`.
  - Les tokens JWT sont stockés dans `localStorage` (`access_token`, `refresh_token`).

Astuce (optionnel): externaliser les configs en variables d’environnement.
- Frontend: définir `VITE_API_URL` et lire via `import.meta.env.VITE_API_URL`.
- Backend: utiliser `python-decouple` (déjà dans `requirements.txt`) pour `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.

## 🧪 Données et migrations

- Exécuter à chaque changement de modèles dans `backend/`:
  - `python manage.py makemigrations`
  - `python manage.py migrate`
- Création d’un superutilisateur:
  - `python manage.py createsuperuser`
- Import d’élèves CSV/Excel via endpoints `eleves/import_csv/` et templates `template_csv`/`template_excel`.

## 🔐 Multi-tenant et sécurité

- `core.middleware.TenantMiddleware`: expose `request.ecole` et `X-Tenant-School`.
- `core.middleware.TenantSecurityMiddleware`: bloque l’accès aux endpoints critiques sans école assignée (`403 NO_SCHOOL_ASSIGNED`).
- `users.authentication.CustomJWTAuthentication`: charge `user.ecole` automatiquement.

## 🧰 Commandes utiles

- **Backend**
  - Lancer le serveur: `python manage.py runserver`
  - Créer migrations: `python manage.py makemigrations`
  - Appliquer migrations: `python manage.py migrate`
  - Créer superuser: `python manage.py createsuperuser`

- **Frontend**
  - Dev: `npm run dev`
  - Lint: `npm run lint`
  - Build: `npm run build`
  - Preview: `npm run preview`

## 🧯 Dépannage

- **CORS**: vérifier `CORS_ALLOWED_ORIGINS` dans `settings.py` correspond à l’URL du frontend.
- **401/expired token**: le refresh se fait via `/auth/token/refresh/`. En cas d’échec, l’appli redirige vers `/login`.
- **403 NO_SCHOOL_ASSIGNED**: assigner l’utilisateur à une école dans l’admin ou via API.
- **Pagination**: DRF est configuré avec `PAGE_SIZE=1000`. Les services front gèrent `results` si paginé.

## 🧾 Fichiers d'environnement (.env)

- **Backend**: copier `backend/.env.example` vers `backend/.env` et ajuster `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.
- **Frontend**: copier `frontend/.env.example` vers `frontend/.env` et ajuster `VITE_API_URL`.
- Après modification de `backend/requirements.txt`, réinstaller:
  - `pip install -r backend/requirements.txt`

## 📘 Documentation API (Swagger)

- Lancer le backend (`python manage.py runserver`).
- Accéder à l'UI Swagger: `http://localhost:8000/api/docs/`.
- Schéma OpenAPI (JSON): `http://localhost:8000/api/schema/`.
- Documentation Redoc: `http://localhost:8000/api/redoc/`.

## 📚 Documentation complémentaire

- `QUICKSTART.md` — Démarrage rapide
- `DEMARRAGE_IMMEDIAT.md` — Lancer immédiatement le projet
- `GUIDE_IMPLEMENTATION_MULTI_TENANT.md` — Implémentation multi-tenant
- `GUIDE_TEST_MULTI_TENANT.md` — Tests multi-tenant
- `CLOISONNEMENT_DONNEES_SAAS.md` — Cloisonnement des données
- `RESUME_FINAL.md` — Résumé final
- `PROJET_STATUS.md` — État d’avancement
- `POPULATE_DB.md` — Aide au peuplement des données
