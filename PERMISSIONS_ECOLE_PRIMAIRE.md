# 🔐 Système de Permissions - École Primaire

## 📚 Contexte : École Primaire

Dans une école primaire, contrairement au collège ou lycée :
- **Enseignants généralistes** : Un enseignant enseigne la majorité des matières à sa classe
- **Pas de spécialisation par matière** : L'enseignant n'est pas "prof de maths" ou "prof de français"
- **Classe unique** : Chaque enseignant a généralement UNE classe dont il est responsable
- **Polyvalence** : L'enseignant gère toutes les matières pour ses élèves

---

## 👤 Rôles et Permissions

### 🔴 ADMINISTRATEUR (Directeur/Direction)

#### Gestion des Élèves
- ✅ **Ajouter** un élève (inscription)
- ✅ **Modifier** les informations d'un élève
- ✅ **Supprimer** un élève (désinscription)
- ✅ **Visualiser** tous les élèves de toutes les classes
- ✅ **Importer** des élèves en masse (CSV/Excel)
- ✅ **Exporter** les listes d'élèves

#### Gestion des Enseignants
- ✅ **Ajouter** un enseignant
- ✅ **Modifier** les informations d'un enseignant
- ✅ **Supprimer** un enseignant
- ✅ **Visualiser** tous les enseignants
- ✅ **Assigner** un enseignant à une classe

#### Gestion des Classes
- ✅ **Créer** une nouvelle classe
- ✅ **Modifier** une classe (nom, niveau, effectif max)
- ✅ **Supprimer** une classe
- ✅ **Visualiser** toutes les classes
- ✅ **Assigner** l'enseignant titulaire

#### Gestion des Matières
- ✅ **Créer** une nouvelle matière
- ✅ **Modifier** une matière (nom, coefficient)
- ✅ **Supprimer** une matière
- ✅ **Visualiser** toutes les matières
- ✅ **Définir** les coefficients

#### Gestion des Notes (Module 3)
- ✅ **Visualiser** toutes les notes de toutes les classes
- ✅ **Modifier** n'importe quelle note si nécessaire
- ✅ **Valider** les notes avant génération des bulletins
- ✅ **Consulter** les statistiques globales

#### Gestion des Bulletins (Module 4)
- ✅ **Générer** les bulletins pour n'importe quelle classe
- ✅ **Visualiser** tous les bulletins
- ✅ **Exporter** en masse (PDF, Excel)
- ✅ **Imprimer** les bulletins individuels ou par classe
- ✅ **Valider** les bulletins avant diffusion

#### Configuration Système
- ✅ **Créer/Modifier** les années scolaires
- ✅ **Gérer** les périodes (trimestres)
- ✅ **Configurer** les paramètres généraux
- ✅ **Consulter** tous les logs et statistiques

---

### 🟢 ENSEIGNANT (Titulaire de Classe)

#### Contexte
L'enseignant est **titulaire** d'UNE classe et enseigne **toutes les matières** à ses élèves.

#### Gestion des Élèves
- ✅ **Visualiser** UNIQUEMENT les élèves de SA classe
- ❌ **Ajouter/Modifier/Supprimer** des élèves (réservé à l'admin)
- ✅ **Consulter** les informations complètes de ses élèves
- ✅ **Voir** les contacts des parents

#### Gestion des Notes (Module 3)
- ✅ **Saisir** les notes de ses élèves pour TOUTES les matières
- ✅ **Modifier** ses propres notes (avant validation)
- ✅ **Consulter** les moyennes de ses élèves
- ✅ **Visualiser** les statistiques de sa classe
- ❌ **Modifier** les notes des autres classes
- ❌ **Supprimer** des notes validées

#### Gestion des Bulletins (Module 4)
- ✅ **Visualiser** les bulletins de SES élèves uniquement
- ✅ **Générer** les bulletins de SA classe
- ✅ **Exporter** les bulletins de sa classe (PDF individuel ou par classe)
- ✅ **Imprimer** les bulletins de ses élèves
- ❌ **Accéder** aux bulletins des autres classes
- ❌ **Modifier** un bulletin après validation

#### Accès Limité
- ❌ **Créer/Modifier** des classes
- ❌ **Créer/Modifier** des matières
- ❌ **Gérer** les autres enseignants
- ❌ **Modifier** les paramètres système
- ✅ **Modifier** son propre profil

---

## 🎯 Cas d'Usage Typiques

### Scénario 1 : Début d'Année
**Administrateur** :
1. Crée l'année scolaire 2024-2025
2. Crée les classes (CP A, CP B, CE1 A, CE2 A, etc.)
3. Inscrit les élèves (import CSV ou saisie manuelle)
4. Assigne chaque enseignant à sa classe

**Enseignant** :
1. Se connecte et voit SA classe assignée
2. Consulte la liste de ses élèves
3. Prend connaissance des informations

### Scénario 2 : Saisie des Notes (Trimestre)
**Enseignant** :
1. Va dans "Notes"
2. Sélectionne sa classe (automatiquement la sienne)
3. Sélectionne la matière (Math, Français, etc.)
4. Saisit les notes pour tous ses élèves
5. Répète pour toutes les matières
6. Consulte les moyennes calculées

**Administrateur** :
1. Peut consulter toutes les notes
2. Vérifie que tous les enseignants ont saisi
3. Valide les notes si nécessaire

### Scénario 3 : Génération des Bulletins
**Enseignant** :
1. Va dans "Bulletins"
2. Sélectionne le trimestre
3. Génère les bulletins de SA classe
4. Les exporte en PDF
5. Les imprime pour distribution

**Administrateur** :
1. Peut générer TOUS les bulletins de TOUTES les classes
2. Export en masse possible
3. Vérification globale avant impression

### Scénario 4 : Consultation d'un Élève
**Enseignant** :
1. Va dans "Élèves"
2. Ne voit QUE les élèves de sa classe
3. Peut consulter toutes les infos (parents, adresse, etc.)
4. Ne peut pas modifier

**Administrateur** :
1. Voit TOUS les élèves de TOUTES les classes
2. Peut modifier n'importe quelle information
3. Peut changer un élève de classe

---

## 🔒 Matrice de Permissions Détaillée

| Fonctionnalité | Admin | Enseignant |
|----------------|-------|------------|
| **ÉLÈVES** |
| Voir tous les élèves | ✅ | ❌ (sa classe uniquement) |
| Voir sa classe | ✅ | ✅ |
| Ajouter un élève | ✅ | ❌ |
| Modifier un élève | ✅ | ❌ |
| Supprimer un élève | ✅ | ❌ |
| Importer CSV | ✅ | ❌ |
| **CLASSES** |
| Voir toutes les classes | ✅ | ❌ (sa classe uniquement) |
| Créer une classe | ✅ | ❌ |
| Modifier une classe | ✅ | ❌ |
| Supprimer une classe | ✅ | ❌ |
| **MATIÈRES** |
| Voir les matières | ✅ | ✅ (lecture seule) |
| Créer une matière | ✅ | ❌ |
| Modifier une matière | ✅ | ❌ |
| Supprimer une matière | ✅ | ❌ |
| **ENSEIGNANTS** |
| Voir tous les enseignants | ✅ | ❌ |
| Ajouter un enseignant | ✅ | ❌ |
| Modifier un enseignant | ✅ | ❌ (sauf son profil) |
| Supprimer un enseignant | ✅ | ❌ |
| **NOTES** (Module 3) |
| Saisir notes sa classe | ✅ | ✅ |
| Modifier notes sa classe | ✅ | ✅ (avant validation) |
| Voir notes autres classes | ✅ | ❌ |
| Modifier notes autres classes | ✅ | ❌ |
| Valider les notes | ✅ | ❌ |
| Statistiques globales | ✅ | ❌ (sa classe uniquement) |
| **BULLETINS** (Module 4) |
| Générer bulletins sa classe | ✅ | ✅ |
| Générer bulletins autres classes | ✅ | ❌ |
| Export PDF sa classe | ✅ | ✅ |
| Export PDF toutes classes | ✅ | ❌ |
| Valider les bulletins | ✅ | ❌ |
| **CONFIGURATION** |
| Année scolaire | ✅ | ❌ |
| Périodes/Trimestres | ✅ | ❌ |
| Paramètres système | ✅ | ❌ |

---

## 🛡️ Implémentation Backend (Django)

### Permissions Personnalisées

```python
# users/permissions.py
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Seuls les administrateurs ont accès"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin()


class IsTeacherOrAdmin(permissions.BasePermission):
    """Enseignants et admins ont accès"""
    def has_permission(self, request, view):
        return request.user.is_authenticated


class CanManageOwnClassOnly(permissions.BasePermission):
    """L'enseignant ne peut gérer que sa propre classe"""
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin():
            return True
        
        # Pour un enseignant, vérifier qu'il est titulaire de la classe
        try:
            enseignant = request.user.professeur_profile
            return obj.classe.professeur_principal == enseignant
        except:
            return False
```

### Filtrage Automatique

```python
# academic/views.py
class EleveViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        
        if user.is_admin():
            # Admin voit tout
            return Eleve.objects.all()
        
        # Enseignant ne voit que sa classe
        try:
            enseignant = user.professeur_profile
            return Eleve.objects.filter(
                classe__professeur_principal=enseignant
            )
        except:
            return Eleve.objects.none()
```

---

## 🎨 Implémentation Frontend (React)

### Routes Protégées

```jsx
// App.jsx - Routes avec permissions
<Route
  path="/eleves"
  element={
    <ProtectedRoute>
      <Eleves />
    </ProtectedRoute>
  }
/>

<Route
  path="/classes"
  element={
    <ProtectedRoute adminOnly={true}>
      <Classes />
    </ProtectedRoute>
  }
/>
```

### Affichage Conditionnel

```jsx
// Dans un composant
const { isAdmin } = useAuth();

{isAdmin() && (
  <button onClick={handleDelete}>Supprimer</button>
)}

{!isAdmin() && (
  <p className="text-gray-500">Consultation uniquement</p>
)}
```

---

## 📝 Messages Utilisateur

### Pour l'Enseignant
- "Vous consultez les élèves de votre classe"
- "Saisissez les notes pour votre classe"
- "Générez les bulletins de vos élèves"

### Pour l'Administrateur
- "Gérez tous les élèves de l'établissement"
- "Administrez toutes les classes"
- "Consultez les statistiques globales"

---

## ✅ Checklist d'Implémentation

### Backend
- [ ] Créer les permissions personnalisées
- [ ] Filtrer les querysets selon le rôle
- [ ] Bloquer les actions non autorisées
- [ ] Tester avec les deux types de comptes

### Frontend
- [ ] Masquer les boutons selon les permissions
- [ ] Afficher des messages appropriés
- [ ] Rediriger si accès non autorisé
- [ ] Adapter les formulaires

### Tests
- [ ] Tester en tant qu'admin
- [ ] Tester en tant qu'enseignant
- [ ] Vérifier les restrictions
- [ ] Tester les cas limites

---

## 🔄 Évolution Future

### Possibles Améliorations
- **Enseignants spécialistes** : Pour arts, EPS, anglais
- **Co-enseignement** : Plusieurs enseignants pour une classe
- **Suppléants** : Gestion des remplacements
- **Parents d'élèves** : Accès consultation uniquement

---

**Ce système de permissions est adapté au contexte de l'école primaire avec des enseignants généralistes responsables de leur classe.**
