# Backend - Système de Gestion Scolaire

## Installation

1. **Créer et activer l'environnement virtuel**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   ```

2. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurer la base de données**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Créer un superutilisateur**
   ```bash
   python manage.py createsuperuser
   ```

5. **Lancer le serveur de développement**
   ```bash
   python manage.py runserver
   ```

## Endpoints API

### Authentification
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/logout/` - Déconnexion
- `POST /api/auth/token/refresh/` - Rafraîchir le token
- `GET /api/auth/profile/` - Profil utilisateur

### Utilisateurs
- `GET /api/users/` - Liste des utilisateurs
- `POST /api/users/` - Créer un utilisateur
- `GET /api/users/{id}/` - Détails d'un utilisateur
- `PUT /api/users/{id}/` - Modifier un utilisateur
- `DELETE /api/users/{id}/` - Supprimer un utilisateur
- `GET /api/users/me/` - Utilisateur connecté

### Administrateurs
- `GET /api/admins/` - Liste des administrateurs
- `POST /api/admins/` - Créer un administrateur
- `GET /api/admins/{id}/` - Détails d'un administrateur
- `PUT /api/admins/{id}/` - Modifier un administrateur
- `DELETE /api/admins/{id}/` - Supprimer un administrateur

### Professeurs
- `GET /api/professeurs/` - Liste des professeurs
- `POST /api/professeurs/` - Créer un professeur
- `GET /api/professeurs/{id}/` - Détails d'un professeur
- `PUT /api/professeurs/{id}/` - Modifier un professeur
- `DELETE /api/professeurs/{id}/` - Supprimer un professeur

## Structure du projet

```
backend/
├── core/               # Configuration principale
│   ├── settings.py    # Paramètres Django
│   ├── urls.py        # URLs principales
│   └── wsgi.py
├── users/             # Application utilisateurs
│   ├── models.py      # Modèles User, Admin, Professeur
│   ├── serializers.py # Serializers REST
│   ├── views.py       # Vues API
│   ├── urls.py        # URLs de l'app
│   └── admin.py       # Configuration admin
├── manage.py
└── requirements.txt
```

## Permissions

- **AllowAny**: Inscription et connexion
- **IsAuthenticated**: Toutes les autres routes
- **Admin uniquement**: Accès complet à tous les utilisateurs

## Technologies

- Django 5.2.7
- Django REST Framework 3.15.2
- Simple JWT pour l'authentification
- django-cors-headers pour CORS
