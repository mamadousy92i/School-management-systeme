# 🎲 Script de Remplissage de la Base de Données

Ce script remplit automatiquement votre base de données avec des données de test réalistes.

## 📋 Contenu Généré

Le script crée automatiquement :

- ✅ **1 année scolaire** : 2024-2025 (active)
- ✅ **1 administrateur** : compte admin complet
- ✅ **5 professeurs** : avec spécialités différentes
- ✅ **8 matières** : avec coefficients
- ✅ **6 classes** : de la 6ème à la 3ème
- ✅ **~200 élèves** : répartis dans les classes

## 🚀 Utilisation

### Dans votre terminal backend (avec venv activé) :

```powershell
python manage.py populate_db
```

C'est tout ! Le script va :
1. Nettoyer les anciennes données de test
2. Créer toutes les nouvelles données
3. Afficher un résumé complet

## 🔑 Identifiants de Connexion

### Administrateur
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: admin@ecole.com

### Professeurs
Tous les professeurs ont le même mot de passe :
- **Username**: `prof001`, `prof002`, `prof003`, `prof004`, `prof005`
- **Password**: `prof123`

**Liste des professeurs** :
- prof001 : Marie MARTIN (Mathématiques)
- prof002 : Pierre BERNARD (Français)
- prof003 : Sophie DUBOIS (Anglais)
- prof004 : Luc THOMAS (Sciences)
- prof005 : Anne PETIT (Histoire-Géographie)

## 📊 Données Créées

### Matières (8)
1. Mathématiques (MATH) - Coef 4.0
2. Français (FR) - Coef 3.0
3. Anglais (ANG) - Coef 3.0
4. Histoire-Géographie (HIST) - Coef 2.0
5. Sciences de la Vie et de la Terre (SVT) - Coef 2.0
6. Physique-Chimie (PC) - Coef 2.0
7. Éducation Physique et Sportive (EPS) - Coef 1.0
8. Arts Plastiques (ARTS) - Coef 1.0

### Classes (6)
1. **6ème A** - 40 places (32-36 élèves)
2. **6ème B** - 40 places (32-36 élèves)
3. **5ème A** - 38 places (30-34 élèves)
4. **5ème B** - 38 places (30-34 élèves)
5. **4ème A** - 35 places (28-31 élèves)
6. **3ème A** - 35 places (28-31 élèves)

Chaque classe a :
- Un professeur principal assigné
- Toutes les matières assignées avec des professeurs
- Des élèves avec des données complètes

### Élèves (~200)
Chaque élève a :
- ✅ Matricule unique (EL00001, EL00002, etc.)
- ✅ Nom et prénom réalistes
- ✅ Sexe (M/F)
- ✅ Date de naissance cohérente avec le niveau
- ✅ Lieu de naissance (villes camerounaises)
- ✅ Adresse complète
- ✅ Informations des parents (noms et téléphones)
- ✅ Statut actif
- ✅ Assigné à une classe

## ⚠️ Important

### Le script nettoie les données existantes !

Le script supprime automatiquement :
- Tous les élèves
- Toutes les classes
- Toutes les matières
- Tous les professeurs (sauf superusers)
- Toutes les années scolaires

**Il garde uniquement** :
- Les superutilisateurs créés avec `createsuperuser`

### Quand utiliser ce script ?

✅ **Bon moment** :
- Première installation du projet
- Après avoir testé et vouloir recommencer
- Pour faire des démos
- Pour tester de nouvelles fonctionnalités

❌ **Mauvais moment** :
- En production avec de vraies données
- Quand vous avez déjà saisi des données importantes

## 🔄 Relancer le Script

Vous pouvez relancer le script autant de fois que vous voulez :

```powershell
python manage.py populate_db
```

Chaque exécution :
1. Supprime les anciennes données de test
2. Crée de nouvelles données fraîches
3. Les élèves auront des noms différents (aléatoires)

## 📝 Exemple d'Utilisation

```powershell
# 1. Activer l'environnement virtuel
.\venv\Scripts\activate

# 2. Remplir la base de données
python manage.py populate_db

# 3. Lancer le serveur
python manage.py runserver

# 4. Se connecter sur http://localhost:8000/admin
#    avec admin / admin123
```

## 🎯 Test Rapide

Après avoir exécuté le script :

1. **Backend Django Admin** (http://localhost:8000/admin)
   - Connectez-vous avec `admin` / `admin123`
   - Vérifiez les données créées

2. **Frontend React** (http://localhost:5173)
   - Connectez-vous avec `admin` / `admin123`
   - Naviguez dans Classes, Matières, Élèves
   - Tout doit être déjà rempli !

## 💡 Astuces

### Créer plus d'élèves
Modifiez la ligne dans `populate_db.py` :
```python
nb_eleves = int(classe.effectif_max * 0.9)  # 90% de l'effectif
```

### Ajouter plus de classes
Ajoutez des entrées dans `classes_data` :
```python
{'nom': '2nde A', 'niveau': '2nde', 'effectif_max': 35},
```

### Personnaliser les données
Le fichier est entièrement modifiable :
- `backend/academic/management/commands/populate_db.py`

## 🐛 Résolution de Problèmes

### Erreur "Command not found"
Vérifiez que vous êtes dans le dossier `backend` :
```powershell
cd backend
python manage.py populate_db
```

### Erreur d'import
Assurez-vous que les migrations sont appliquées :
```powershell
python manage.py migrate
```

### Le script ne fait rien
Vérifiez les erreurs dans le terminal. Le script affiche tout ce qu'il fait.

## 📚 Code Source

Le code complet est dans :
```
backend/academic/management/commands/populate_db.py
```

Vous pouvez le modifier selon vos besoins !

---

**Prêt à tester votre application avec des données réalistes ! 🎉**
