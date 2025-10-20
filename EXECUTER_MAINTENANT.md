# 🚀 À EXÉCUTER MAINTENANT - Multi-Tenant

**Ce qu'il faut faire dans l'ordre** ⬇️

---

## ✅ CE QUI EST DÉJÀ FAIT

Vous avez déjà :
- ✅ Créé le modèle `Ecole`
- ✅ Modifié tous les modèles (ajouté champ `ecole`)
- ✅ Créé les scripts d'assignation
- ✅ Créé toute la documentation

**Bravo ! La partie la plus difficile est terminée ! 🎉**

---

## 🎯 ÉTAPE 1 : Créer les Migrations

Ouvrez votre terminal dans le dossier `backend` et exécutez :

```bash
cd backend

# Créer les migrations pour academic
python manage.py makemigrations academic

# Créer les migrations pour users
python manage.py makemigrations users
```

**Résultat attendu** :
```
Migrations for 'academic':
  academic\migrations\000X_add_ecole.py
    - Add field ecole to anneescolaire
    - Add field ecole to classe
    - Add field ecole to matiere
    - Add field ecole to eleve
    - Add field ecole to matiereclass
    - Alter unique_together for ...
    
Migrations for 'users':
  users\migrations\000X_add_ecole_professeur.py
    - Add field ecole to professeur
```

---

## 🎯 ÉTAPE 2 : Appliquer les Migrations

```bash
# Appliquer les migrations academic
python manage.py migrate academic

# Appliquer les migrations users
python manage.py migrate users
```

**Résultat attendu** :
```
Running migrations:
  Applying academic.000X_add_ecole... OK
  Applying users.000X_add_ecole_professeur... OK
```

---

## 🎯 ÉTAPE 3 : Créer l'École par Défaut

```bash
python scripts/create_default_ecole.py
```

**Résultat attendu** :
```
============================================================
CRÉATION DE L'ÉCOLE PAR DÉFAUT
============================================================

1. Création de l'école...
   ✅ École créée : École Primaire Sénégalaise (ECOLE001)

2. Informations de l'école :
   - Nom : École Primaire Sénégalaise
   - Code : ECOLE001
   - Directrice : Mme Fatou SARR
   - Adresse : Dakar, Sénégal
   - Téléphone : +221 33 XXX XX XX
   - Email : contact@ecole.sn
   - Abonnement actif : ✅ Oui
   - Max élèves : 1000
   - Max professeurs : 100

3. Statistiques actuelles :
   - Utilisateurs totaux : X

============================================================
✅ TERMINÉ !
============================================================
```

---

## 🎯 ÉTAPE 4 : Assigner l'École aux Users

```bash
python scripts/assign_ecole_to_users.py
```

**Résultat attendu** :
```
============================================================
ASSIGNATION DE L'ÉCOLE AUX UTILISATEURS
============================================================

1. Récupération de l'école par défaut...
   ✅ École trouvée : École Primaire Sénégalaise

2. Assignation aux utilisateurs...
   ✅ X utilisateur(s) assigné(s) à École Primaire Sénégalaise

3. Assignation aux professeurs...
   ✅ X professeur(s) assigné(s) à École Primaire Sénégalaise

4. Statistiques finales :
   - Utilisateurs dans École Primaire Sénégalaise : X
   - Professeurs dans École Primaire Sénégalaise : X

============================================================
✅ TERMINÉ !
============================================================
```

---

## 🎯 ÉTAPE 5 : Assigner l'École aux Objets Academic

```bash
python scripts/assign_ecole_to_academic.py
```

**Résultat attendu** :
```
======================================================================
ASSIGNATION DE L'ÉCOLE AUX OBJETS ACADEMIC
======================================================================

1. Récupération de l'école par défaut...
   ✅ École trouvée : École Primaire Sénégalaise

2. Assignation aux années scolaires...
   ✅ X année(s) scolaire(s) assignée(s)

3. Assignation aux classes...
   ✅ X classe(s) assignée(s)

4. Assignation aux matières...
   ✅ X matière(s) assignée(s)

5. Assignation aux élèves...
   ✅ X élève(s) assigné(s)

6. Assignation aux liaisons matière-classe...
   ✅ X liaison(s) assignée(s)

7. Statistiques finales pour École Primaire Sénégalaise :
   - Années scolaires : X
   - Classes : X
   - Matières : X
   - Élèves : X
   - Liaisons matière-classe : X

======================================================================
✅ TERMINÉ !
======================================================================
```

---

## 🎯 ÉTAPE 6 : Vérification dans l'Admin

1. Démarrez le serveur si ce n'est pas déjà fait :
   ```bash
   python manage.py runserver
   ```

2. Allez sur http://localhost:8000/admin

3. Vérifiez :
   - ✅ Une école "École Primaire Sénégalaise" existe
   - ✅ Les élèves ont un champ "École" rempli
   - ✅ Les classes ont un champ "École" rempli
   - ✅ etc.

---

## 🎯 ÉTAPE 7 : Test du Frontend

1. Allez sur http://localhost:5173 (ou votre port Vite)

2. Connectez-vous

3. Vérifiez que :
   - ✅ La liste des élèves s'affiche normalement
   - ✅ Les classes fonctionnent
   - ✅ Les bulletins se génèrent
   - ✅ Tout fonctionne comme avant !

---

## ⚠️ EN CAS DE PROBLÈME

### Problème : Migrations échouent

```bash
# Revenir en arrière
python manage.py migrate academic zero
python manage.py migrate users zero

# Supprimer les fichiers de migration créés
# Recommencer depuis l'étape 1
```

### Problème : École non créée

```bash
# Créer manuellement via l'admin Django
# Ou relancer le script
python scripts/create_default_ecole.py
```

### Problème : Erreur "ecole cannot be null"

```bash
# C'est normal si vous n'avez pas encore exécuté les scripts d'assignation
# Exécutez les étapes 4 et 5
```

---

## ✅ APRÈS CES ÉTAPES

Vous aurez :
- ✅ Une base de données avec cloisonnement partiel
- ✅ Toutes vos données assignées à une école
- ✅ Un système qui fonctionne normalement
- ✅ Une base solide pour le multi-tenant

**Les données ne sont PAS encore cloisonnées automatiquement**  
Il faudra ensuite :
1. Créer le middleware
2. Modifier les ViewSets
3. Tester l'isolation

Mais votre système continuera de fonctionner normalement ! 🎉

---

## 📞 RÉSUMÉ DES COMMANDES

```bash
# 1. Migrations
cd backend
python manage.py makemigrations academic
python manage.py makemigrations users
python manage.py migrate

# 2. Scripts
python scripts/create_default_ecole.py
python scripts/assign_ecole_to_users.py
python scripts/assign_ecole_to_academic.py

# 3. Vérification
python manage.py runserver
# Aller sur http://localhost:8000/admin
```

---

## 🎉 VOUS ÊTES PRÊT !

**Exécutez ces commandes dans l'ordre et tout ira bien ! 🚀**

**Temps estimé** : 5-10 minutes

**Niveau de difficulté** : ⭐⭐ (Facile - juste suivre les étapes)

---

💡 **Astuce** : Faites une sauvegarde de votre base avant de commencer :
```bash
python manage.py dumpdata > backup_avant_migrations.json
```
