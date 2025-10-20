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

## Fonctionnalités

### Module 1 : Authentification ✅
- **Page de connexion** avec formulaire sécurisé
- **Gestion des tokens JWT** avec refresh automatique
- **Routes protégées** selon le rôle
- **Dashboard** avec sidebar et statistiques

### Module 2 : Gestion des données ✅
- Pages Classes, Matières, Élèves (liste, détails, filtres, recherche)
- CRUD pour Classes, Matières, Élèves (selon rôle)
- Import d'élèves via CSV/Excel + téléchargement de templates
- Ajout de matières à une classe

### Module 3 : Notes ✅
- Saisie des notes par les enseignants pour leur classe
- Saisie rapide en masse
- Calcul et visualisation des moyennes

### Module 4 : Bulletins et Passage ✅
- Données de bulletins par classe/période avec rangs et ex-aequo
- Génération PDF des bulletins (html2pdf.js)
- Passage de classe en masse et proposition de statut

## Technologies

- **React 19** - Framework JavaScript
- **React Router 7** - Routage
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes modernes
- **Vite** - Build tool

## Configuration

- Base API configurable via `.env` Vite: définir `VITE_API_URL` (par défaut `http://localhost:8000/api`).
