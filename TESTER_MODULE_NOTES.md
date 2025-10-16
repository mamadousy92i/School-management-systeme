# 🧪 Guide de Test - Module Notes

## 📋 Prérequis

Assurez-vous d'avoir :
- ✅ Base de données créée et migrée
- ✅ Données de base (élèves, classes, matières) via `populate_db`
- ✅ Périodes et types d'évaluation créés
- ✅ Backend Django en cours d'exécution
- ✅ Frontend React en cours d'exécution

---

## 🚀 Méthode 1 : Génération Automatique de Notes

### Étape 1 : Générer des notes aléatoires

```powershell
# Dans le dossier backend/
cd backend

# Générer des notes pour la première période (trimestre)
python manage.py generate_notes

# OU générer pour toutes les périodes
python manage.py generate_notes --all

# OU générer pour une période spécifique (ID 1 par exemple)
python manage.py generate_notes --periode 1
```

### Ce qui est généré :
- ✅ **Notes variées** : Entre 5 et 20 (distribution réaliste)
- ✅ **Pour tous les élèves** : Chaque élève actif reçoit des notes
- ✅ **Toutes les matières** : Mathématiques, Français, Anglais, Histoire, etc.
- ✅ **Tous les types** : Devoir, Contrôle, Composition
- ✅ **Moyennes calculées** : Automatiquement après génération
- ✅ **Commentaires** : Aléatoires ("Très bien", "Peut mieux faire", etc.)

### Résultat attendu :
```
🎲 Génération de notes de test...
============================================================

📅 Trimestre 1...
   📚 Mathématiques
      ✅ Devoir: 45 notes créées
      ✅ Contrôle: 45 notes créées
      ✅ Composition: 45 notes créées
   📚 Français
      ✅ Devoir: 45 notes créées
      ...

   🧮 Calcul des moyennes pour Trimestre 1...
   ✅ 180 moyennes calculées

============================================================
✨ GÉNÉRATION TERMINÉE !
============================================================
📊 STATISTIQUES:
   • Notes créées: 540
   • Périodes traitées: 1
   • Matières: 4
   • Élèves: 45
   • Types d'évaluation: 3
============================================================
```

---

## 📥 Méthode 2 : Import via CSV

### Étape 1 : Utiliser le fichier d'exemple

Un fichier CSV d'exemple est fourni : `backend/exemple_import_notes.csv`

### Étape 2 : Frontend - Importer le CSV

1. **Connectez-vous** au frontend
2. **Allez sur** `/notes`
3. **Sélectionnez** :
   - Période : Trimestre 1
   - Classe : Votre classe
4. **Cliquez** sur le bouton vert **"Importer CSV"**
5. **Téléchargez** le template (optionnel)
6. **Sélectionnez** le fichier `exemple_import_notes.csv`
7. **Cliquez** sur **"Importer"**

### Format du CSV :

```csv
matricule,matiere,type_evaluation,note,date_evaluation,commentaire
EL00001,Mathématiques,Devoir,15.5,2024-10-15,Très bon travail
EL00002,Français,Contrôle,14,2024-10-16,Bien
EL00003,Anglais,Composition,18,2024-10-17,Excellent
```

### Colonnes obligatoires :
- **matricule** : Le matricule de l'élève (ex: EL00001)
- **matiere** : Nom ou code de la matière
- **type_evaluation** : Devoir, Contrôle ou Composition
- **note** : Note sur 20 (accepte les décimales avec .)
- **date_evaluation** : Format AAAA-MM-JJ
- **commentaire** : Optionnel

---

## ✅ Vérification des Données

### Option 1 : Via le Frontend

1. **Page principale des notes** (`/notes`)
   - Vérifiez la liste des élèves
   - Regardez les moyennes calculées
   - Utilisez les filtres (Avec notes / Sans notes)
   - Testez les deux modes d'affichage (Liste / Grille)

2. **Page détail d'un élève** (`/notes/eleve/:id`)
   - Cliquez sur "Détails" pour un élève
   - Vérifiez toutes ses notes
   - Testez l'ajout d'une nouvelle note
   - Testez la modification d'une note
   - Vérifiez la moyenne affichée

3. **Page bulletins** (`/bulletins`)
   - Sélectionnez un élève et une période
   - Vérifiez la moyenne générale
   - Regardez les moyennes par matière
   - Vérifiez les mentions

### Option 2 : Via Django Admin

```powershell
# Accédez à l'admin Django
http://localhost:8000/admin/

# Connectez-vous avec :
# Username: admin
# Password: admin123
```

Vérifiez :
- ✅ **Notes** : `/admin/grades/note/`
- ✅ **Moyennes** : `/admin/grades/moyenneeleve/`
- ✅ **Périodes** : `/admin/grades/periode/`
- ✅ **Types d'évaluation** : `/admin/grades/typeevaluation/`

### Option 3 : Via l'API directement

```powershell
# Obtenir toutes les notes d'un élève
curl http://localhost:8000/api/grades/notes/?eleve=1

# Obtenir les moyennes d'une classe
curl http://localhost:8000/api/grades/moyennes/?classe=1

# Obtenir la moyenne générale d'un élève
curl http://localhost:8000/api/grades/moyennes/moyenne_generale/?eleve=1&periode=1
```

---

## 🎯 Scénarios de Test

### Scénario 1 : Enseignant saisit des notes

1. Connectez-vous en tant qu'enseignant (`prof001` / `prof123`)
2. Allez sur `/notes`
3. Vérifiez que vous ne voyez que VOTRE classe
4. Cliquez sur "Détails" pour un élève
5. Ajoutez une nouvelle note
6. Vérifiez que la moyenne se met à jour

### Scénario 2 : Admin consulte toutes les notes

1. Connectez-vous en tant qu'admin (`admin` / `admin123`)
2. Allez sur `/notes`
3. Changez de classe dans le filtre
4. Vérifiez que vous voyez TOUTES les classes
5. Utilisez le filtre "Avec notes" / "Sans notes"
6. Testez les deux modes d'affichage

### Scénario 3 : Import massif de notes

1. Préparez un fichier CSV avec 50+ notes
2. Importez-le via l'interface
3. Vérifiez le résultat de l'import
4. Actualisez la page
5. Vérifiez que les moyennes sont calculées

### Scénario 4 : Consultation des bulletins

1. Allez sur `/bulletins`
2. Sélectionnez un élève ayant des notes
3. Vérifiez la moyenne générale
4. Vérifiez les moyennes par matière
5. Vérifiez que la mention est correcte

---

## 📊 Données de Test Fournies

### Après `populate_db` :
- ✅ 3 Périodes (Trimestre 1, 2, 3)
- ✅ 3 Types d'évaluation (Devoir coef 1, Contrôle coef 2, Composition coef 3)
- ✅ ~45 élèves (répartis dans 5 classes)
- ✅ 4-6 matières selon le niveau
- ✅ 5 enseignants

### Après `generate_notes` :
- ✅ ~540 notes (pour 1 trimestre)
- ✅ ~180 moyennes calculées
- ✅ Distribution réaliste des notes (10-16 majoritairement)

### Fichier CSV d'exemple :
- ✅ 28 notes d'exemple
- ✅ 7 élèves
- ✅ 4 matières
- ✅ 3 types d'évaluation

---

## 🐛 Dépannage

### Problème : "Aucune période trouvée"
**Solution** : Exécutez d'abord `python manage.py populate_db`

### Problème : "Aucun élève trouvé"
**Solution** : Assurez-vous d'avoir des élèves avec `statut='actif'`

### Problème : "Import CSV échoue"
**Vérifications** :
- Les matricules existent dans la base
- Les noms de matières correspondent
- Le format de date est AAAA-MM-JJ
- Le fichier est bien en UTF-8

### Problème : "Moyennes ne s'affichent pas"
**Solution** : Les moyennes sont calculées automatiquement. Si elles n'apparaissent pas, exécutez :
```python
from grades.models import MoyenneEleve
from academic.models import Eleve
from grades.models import Periode, Matiere

# Recalculer pour un élève
eleve = Eleve.objects.first()
periode = Periode.objects.first()
for matiere in Matiere.objects.all():
    MoyenneEleve.calculer_moyenne(eleve, matiere, periode)
```

---

## 📝 Commandes Utiles

```powershell
# Générer les données de base
python manage.py populate_db

# Générer des notes pour la 1ère période
python manage.py generate_notes

# Générer pour toutes les périodes
python manage.py generate_notes --all

# Lancer le serveur backend
python manage.py runserver

# Lancer le serveur frontend (dans frontend/)
npm run dev

# Voir les migrations
python manage.py showmigrations grades

# Créer un superuser (si nécessaire)
python manage.py createsuperuser
```

---

## ✨ Fonctionnalités à Tester

### Page Notes (`/notes`) :
- ✅ Filtrage par période
- ✅ Filtrage par classe (admin uniquement)
- ✅ Filtrage par statut (Tous / Avec notes / Sans notes)
- ✅ Recherche par nom/prénom/matricule
- ✅ Affichage liste vs grille
- ✅ Navigation vers détail élève
- ✅ Import CSV
- ✅ Affichage des moyennes et mentions

### Page Détail Élève (`/notes/eleve/:id`) :
- ✅ Liste toutes les notes
- ✅ Ajout d'une nouvelle note
- ✅ Modification d'une note
- ✅ Suppression d'une note
- ✅ Affichage de la moyenne générale
- ✅ Filtrage par période

### Page Bulletins (`/bulletins`) :
- ✅ Sélection élève + période
- ✅ Moyenne générale calculée
- ✅ Moyennes par matière
- ✅ Mentions automatiques
- ✅ Nombre de notes par matière

---

**Bon test ! 🎓✨**
