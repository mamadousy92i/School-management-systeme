# 🔧 Modifications des Modèles pour Multi-Tenant

## ✅ Modèles Déjà Modifiés

- **User** (`users/models.py`) : ✅ Champ `ecole` déjà présent (ligne 12)
- **Professeur** (`users/models.py`) : ✅ Champ `ecole` ajouté
- **Ecole** (`academic/models.py`) : ✅ Modèle créé

---

## 📝 Modèles à Modifier

### 1. AnneeScolaire (`academic/models.py`)

**Ajouter après la ligne 78 :**

```python
ecole = models.ForeignKey(
    Ecole,
    on_delete=models.CASCADE,
    related_name='annees_scolaires',
    null=True,  # Temporaire pour la migration
    blank=True,
    verbose_name="École"
)
```

**Modifier unique_together dans Meta :**
```python
unique_together = ['libelle', 'ecole']  # Une année unique par école
```

---

### 2. Classe (`academic/models.py`)

**Ajouter après la ligne 111 (après annee_scolaire) :**

```python
ecole = models.ForeignKey(
    Ecole,
    on_delete=models.CASCADE,
    related_name='classes',
    null=True,  # Temporaire pour la migration
    blank=True,
    verbose_name="École"
)
```

**Modifier unique_together dans Meta (ligne 126) :**
```python
unique_together = ['niveau', 'section', 'annee_scolaire', 'ecole']
```

---

### 3. Matiere (`academic/models.py`)

**Ajouter après la ligne 150 (après description) :**

```python
ecole = models.ForeignKey(
    Ecole,
    on_delete=models.CASCADE,
    related_name='matieres',
    null=True,  # Temporaire pour la migration
    blank=True,
    verbose_name="École"
)
```

**Supprimer les contraintes unique sur nom et code, ajouter unique_together :**
```python
# AVANT :
nom = models.CharField(max_length=100, unique=True)  # À modifier
code = models.CharField(max_length=10, unique=True)  # À modifier

# APRÈS :
nom = models.CharField(max_length=100)
code = models.CharField(max_length=10)

# Dans Meta, ajouter :
unique_together = ['code', 'ecole']  # Code unique par école
```

---

### 4. Eleve (`academic/models.py`)

**Ajouter après la ligne 192 (après classe) :**

```python
ecole = models.ForeignKey(
    Ecole,
    on_delete=models.CASCADE,
    related_name='eleves',
    null=True,  # Temporaire pour la migration
    blank=True,
    verbose_name="École"
)
```

**Modifier unique sur matricule :**
```python
# AVANT :
matricule = models.CharField(max_length=20, unique=True)  # À modifier

# APRÈS :
matricule = models.CharField(max_length=20)

# Dans Meta, ajouter :
unique_together = ['matricule', 'ecole']  # Matricule unique par école
```

---

### 5. MatiereClasse (`academic/models.py`)

**Ajouter après la définition des ForeignKeys :**

```python
ecole = models.ForeignKey(
    Ecole,
    on_delete=models.CASCADE,
    related_name='matieres_classes',
    null=True,  # Temporaire pour la migration
    blank=True,
    verbose_name="École"
)
```

---

## 📋 Modèles dans grades/models.py à Modifier

### 6. Periode (si existe)

```python
ecole = models.ForeignKey(
    'academic.Ecole',
    on_delete=models.CASCADE,
    related_name='periodes',
    null=True,
    blank=True,
    verbose_name="École"
)
```

### 7. Note (si existe)

```python
ecole = models.ForeignKey(
    'academic.Ecole',
    on_delete=models.CASCADE,
    related_name='notes',
    null=True,
    blank=True,
    verbose_name="École"
)
```

### 8. Moyenne (si existe)

```python
ecole = models.ForeignKey(
    'academic.Ecole',
    on_delete=models.CASCADE,
    related_name='moyennes',
    null=True,
    blank=True,
    verbose_name="École"
)
```

---

## 🔄 Ordre des Opérations

### Étape 1 : Modifications de Code ✅ EN COURS
- [x] Modèle Ecole créé
- [x] User.ecole déjà présent
- [x] Professeur.ecole ajouté
- [ ] AnneeScolaire.ecole à ajouter
- [ ] Classe.ecole à ajouter
- [ ] Matiere.ecole à ajouter
- [ ] Eleve.ecole à ajouter
- [ ] MatiereClasse.ecole à ajouter
- [ ] Periode.ecole à ajouter (grades)
- [ ] Note.ecole à ajouter (grades)
- [ ] Moyenne.ecole à ajouter (grades)

### Étape 2 : Migrations
```bash
python manage.py makemigrations academic
python manage.py makemigrations users
python manage.py makemigrations grades
python manage.py migrate
```

### Étape 3 : Scripts de Migration des Données
```bash
python scripts/create_default_ecole.py
python scripts/assign_ecole_to_users.py
python scripts/assign_ecole_to_academic.py
python scripts/assign_ecole_to_grades.py
```

### Étape 4 : Rendre les Champs Obligatoires
- Retirer `null=True, blank=True` de tous les champs ecole
- Nouvelle migration
- Appliquer

### Étape 5 : Middleware et ViewSets
- Créer TenantMiddleware
- Créer BaseEcoleViewSet
- Modifier tous les ViewSets

---

## ⚠️ Points d'Attention

1. **Contraintes unique** : Ne plus avoir `unique=True` sur les champs qui doivent être uniques PAR ÉCOLE, utiliser `unique_together` à la place

2. **Relations ForeignKey** : Toujours ajouter `related_name` explicite

3. **null=True temporaire** : Permet la migration initiale, à retirer ensuite

4. **Ordre de migration** : 
   - D'abord academic (Ecole)
   - Puis users (User, Professeur)
   - Puis academic (autres modèles)
   - Enfin grades

---

## 📊 Impact sur la Base de Données

- **Tables à modifier** : ~10 tables
- **Nouvelles colonnes** : ~10 colonnes `ecole_id`
- **Nouvelles contraintes** : ~5 `unique_together`
- **Données existantes** : Toutes assignées à ECOLE001

---

## 🎯 Résultat Final

Après ces modifications, chaque objet sera lié à une école spécifique :
- User → Ecole
- Professeur → Ecole
- AnneeScolaire → Ecole
- Classe → Ecole
- Matiere → Ecole
- Eleve → Ecole
- Note → Ecole
- Etc.

**Isolation complète des données garantie ! 🔒**
