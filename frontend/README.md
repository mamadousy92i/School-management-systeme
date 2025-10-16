# Frontend - Système de Gestion Scolaire

Application React pour le système de gestion scolaire.

## Installation

```bash
npm install
```

## Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Build de production

```bash
npm run build
```

## Structure du projet

```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   │   └── ProtectedRoute.jsx
│   ├── context/         # Contextes React
│   │   └── AuthContext.jsx
│   ├── pages/          # Pages de l'application
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── services/       # Services API
│   │   └── api.js
│   ├── App.jsx         # Composant principal
│   ├── main.jsx        # Point d'entrée
│   └── index.css       # Styles globaux
├── package.json
└── vite.config.js
```

## Fonctionnalités actuelles

### Module 1 : Authentification ✅
- **Page de connexion** avec formulaire sécurisé
- **Page d'inscription** pour Admin et Professeur
- **Gestion des tokens JWT** avec refresh automatique
- **Routes protégées** selon le rôle
- **Dashboard** avec sidebar et statistiques

## Technologies

- **React 19** - Framework JavaScript
- **React Router 7** - Routage
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes modernes
- **Vite** - Build tool

## Modules à venir

### Module 2 : Gestion des données
- Pages Classes, Matières, Élèves
- Formulaires CRUD
- Import de fichiers CSV/Excel

### Module 3 : Notes
- Interface de saisie de notes
- Calcul automatique des moyennes
- Visualisation des performances

### Module 4 : Bulletins
- Génération de bulletins PDF
- Gestion du cycle scolaire
- Passage en classe supérieure
