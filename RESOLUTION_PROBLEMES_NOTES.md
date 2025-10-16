# 🔧 Résolution des Problèmes - Module Notes

## ❌ Problème : Moyennes et mentions vides

### Symptôme
Dans la page `/notes`, les colonnes **Nombre de notes**, **Moyenne générale** et **Mention** sont vides ou affichent `-`.

### Causes possibles

#### 1. Les moyennes ne sont pas calculées

**Vérification** :
```powershell
cd backend
python manage.py shell
```

```python
from grades.models import MoyenneEleve, Note
from academic.models import Eleve

# Vérifier combien de notes existent
print(f"Notes: {Note.objects.count()}")

# Vérifier combien de moyennes existent
print(f"Moyennes: {MoyenneEleve.objects.count()}")

# Si notes > 0 mais moyennes = 0, il faut les calculer
```

**Solution** : Recalculer les moyennes
```powershell
python manage.py shell
```

```python
from grades.models import MoyenneEleve, Periode, Matiere
from academic.models import Eleve

# Recalculer pour tous les élèves
periode = Periode.objects.first()  # Ou sélectionner une période spécifique
eleves = Eleve.objects.filter(statut='actif')

for eleve in eleves:
    for matiere in Matiere.objects.all():
        MoyenneEleve.calculer_moyenne(eleve, matiere, periode)

print(f"✅ Moyennes recalculées pour {eleves.count()} élèves")
```

#### 2. Les notes n'existent pas encore

**Vérification** :
```powershell
cd backend
python manage.py shell
```

```python
from grades.models import Note
print(Note.objects.count())
```

**Solution** : Générer des notes de test
```powershell
python manage.py generate_notes
```

#### 3. Les données ne se chargent pas correctement (Frontend)

**Vérification** :
1. Ouvrez la console du navigateur (F12)
2. Allez sur `/notes`
3. Regardez les logs dans la console

Vous devriez voir :
```
Chargement des notes pour classe: X période: Y
Notes chargées: Z
Moyennes chargées: W
Élèves enrichis: V
```

**Si vous voyez des erreurs** :
- `404` ou `500` : Problème API backend
- `Notes chargées: 0` : Pas de notes en base
- `Moyennes chargées: 0` : Moyennes non calculées

#### 4. Problème de filtrage (Backend)

**Vérification** : Tester l'API directement
```powershell
# Notes pour une classe et période
curl "http://localhost:8000/api/grades/notes/?classe=1&periode=1"

# Moyennes pour une classe et période
curl "http://localhost:8000/api/grades/moyennes/?classe=1&periode=1"
```

Si les réponses sont vides, le problème vient du backend.

---

## ✅ Checklist de vérification complète

### 1. Backend : Données de base

```powershell
cd backend
python manage.py shell
```

```python
from academic.models import Classe, Eleve
from grades.models import Periode, Matiere, TypeEvaluation, Note, MoyenneEleve

print("=" * 50)
print("VÉRIFICATION DES DONNÉES")
print("=" * 50)

# Vérifier les données de base
print(f"\n📚 Classes: {Classe.objects.count()}")
print(f"👨‍🎓 Élèves: {Eleve.objects.filter(statut='actif').count()}")
print(f"📅 Périodes: {Periode.objects.count()}")
print(f"📖 Matières: {Matiere.objects.count()}")
print(f"📝 Types évaluation: {TypeEvaluation.objects.count()}")
print(f"\n✏️ Notes: {Note.objects.count()}")
print(f"📊 Moyennes: {MoyenneEleve.objects.count()}")

# Vérifier une classe spécifique
classe = Classe.objects.first()
if classe:
    print(f"\n🎯 Test pour la classe: {classe.nom}")
    eleves = Eleve.objects.filter(classe=classe, statut='actif')
    print(f"   Élèves: {eleves.count()}")
    
    periode = Periode.objects.first()
    if periode:
        print(f"   Période: {periode.nom_display}")
        notes = Note.objects.filter(eleve__classe=classe, periode=periode)
        print(f"   Notes: {notes.count()}")
        moyennes = MoyenneEleve.objects.filter(eleve__classe=classe, periode=periode)
        print(f"   Moyennes: {moyennes.count()}")

print("=" * 50)
```

### 2. Si tout est vide, initialiser

```powershell
# Supprimer toutes les données (ATTENTION !)
python manage.py flush --no-input

# Réinitialiser
python manage.py migrate
python manage.py populate_db
python manage.py generate_notes
```

### 3. Frontend : Vérifier les appels API

Dans la console du navigateur (F12 > Network), vérifiez que ces appels retournent des données :

- `GET /api/academic/classes/` → Liste des classes
- `GET /api/grades/periodes/` → Liste des périodes
- `GET /api/academic/eleves/?classe=X` → Élèves de la classe
- `GET /api/grades/notes/?classe=X&periode=Y` → Notes
- `GET /api/grades/moyennes/?classe=X&periode=Y` → Moyennes

---

## 🔄 Recalcul automatique des moyennes

Si vous voulez que les moyennes se recalculent automatiquement, ajoutez ce signal dans `grades/models.py` :

```python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Note)
def recalculer_moyenne_apres_note(sender, instance, **kwargs):
    """Recalcule automatiquement la moyenne après ajout/modification d'une note"""
    MoyenneEleve.calculer_moyenne(
        instance.eleve,
        instance.matiere,
        instance.periode
    )
```

---

## 🐛 Problèmes fréquents

### Erreur : "Période ou classe non sélectionnée"

**Cause** : Les filtres ne sont pas remplis  
**Solution** : Sélectionnez une période ET une classe dans les filtres

### Erreur : "Cannot read property 'coefficient' of undefined"

**Cause** : Les moyennes n'ont pas les informations de matière  
**Solution** : Le code a été corrigé pour gérer ce cas avec `m.matiere_info?.coefficient || 1`

### Les données ne se mettent pas à jour quand je change de période/classe

**Cause** : Les `useEffect` ne se déclenchent pas  
**Solution** : Le code a été corrigé pour réagir aux changements de `selectedPeriode` et `selectedClasse`

### Les élèves de la mauvaise classe s'affichent

**Cause** : Le filtre classe n'est pas appliqué correctement  
**Solution** : Vérifiez que le backend filtre bien par classe dans `ClasseViewSet`

---

## 📞 Commandes utiles

```powershell
# Voir les notes d'un élève
python manage.py shell
>>> from academic.models import Eleve
>>> eleve = Eleve.objects.first()
>>> notes = eleve.notes.all()
>>> for note in notes:
...     print(f"{note.matiere.nom}: {note.valeur}/10")

# Voir les moyennes d'un élève
>>> moyennes = eleve.moyennes.all()
>>> for moy in moyennes:
...     print(f"{moy.matiere.nom}: {moy.moyenne}/10")

# Supprimer toutes les notes (pour recommencer)
>>> from grades.models import Note, MoyenneEleve
>>> Note.objects.all().delete()
>>> MoyenneEleve.objects.all().delete()

# Régénérer
>>> exit()
python manage.py generate_notes
```

---

## ✨ Pour forcer le rechargement des données

Dans le navigateur, sur la page `/notes` :

1. Ouvrez la console (F12)
2. Tapez :
```javascript
window.location.reload(true);
```

Ou utilisez **Ctrl+Shift+R** (Windows) / **Cmd+Shift+R** (Mac)

---

**Si le problème persiste, vérifiez les logs dans la console du navigateur et la console Django !**
