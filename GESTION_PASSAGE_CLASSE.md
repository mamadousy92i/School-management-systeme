# 📚 Guide : Gestion du Statut et Passage de Classe

## 🎯 1. UTILITÉ DU STATUT

Le champ **statut** permet de suivre le cycle de vie d'un élève dans votre école.

### **Statuts Disponibles** :

| Statut | Utilisation | Exemple |
|--------|-------------|---------|
| **Actif** | Élève inscrit et en cours d'année | Élève suivant normalement ses cours |
| **Admis** | Élève ayant réussi son année | Élève qui passe en classe supérieure |
| **Redouble** | Élève qui redouble | Élève restant dans la même classe |
| **Transféré** | Élève parti dans une autre école | Élève changeant d'établissement |
| **Abandonné** | Élève ayant quitté l'école | Déscolarisation |
| **Diplômé** | Élève ayant fini le cycle | Élève de CM2 ayant son CEPE |

---

## 📊 2. CYCLE DE VIE D'UN ÉLÈVE

```
┌─────────────┐
│ INSCRIPTION │ → Statut: Actif
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ ANNÉE       │ → Statut: Actif (pendant l'année)
│ SCOLAIRE    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ FIN D'ANNÉE │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
   Réussit           Échoue
       │                  │
       ▼                  ▼
┌──────────┐      ┌─────────────┐
│ Admis    │      │ Redouble    │
│ → Classe │      │ → Même      │
│ Supérieure│     │   Classe    │
└──────────┘      └─────────────┘
```

---

## 🔄 3. PASSAGE DE CLASSE - PROCÉDURE

### **🎯 Rôles et Permissions**

#### **👨‍🏫 ENSEIGNANT (Professeur Principal)**
- ✅ Peut **proposer** le statut : Admis / Redouble
- ✅ Peut marquer ses élèves en fin d'année
- ❌ **NE PEUT PAS** changer la classe (juste recommander)

**Endpoint** : `PATCH /api/academic/eleves/{id}/proposer_passage/`
```json
{
  "statut": "admis"  // ou "redouble"
}
```

#### **👨‍💼 ADMINISTRATEUR (Directeur)**
- ✅ Peut **valider** les propositions
- ✅ Peut **effectuer** le passage de classe officiel
- ✅ Peut faire des **passages en masse**

**Endpoint** : `POST /api/academic/eleves/passage_classe/`

**Payload** :
```json
{
  "eleves": [1, 2, 3, 4],
  "nouvelle_classe": 5,
  "statut": "actif"
}
```

**Exemple cURL** :
```bash
curl -X POST http://localhost:8000/api/academic/eleves/passage_classe/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eleves": [1, 2, 3],
    "nouvelle_classe": 5,
    "statut": "actif"
  }'
```

---

## 📋 4. SCÉNARIOS PRATIQUES

### **Scénario 1 : Fin d'année - Passage automatique**

**Élèves de 3ème A → 4ème A**

1. Sélectionner tous les élèves admis de 3ème A
2. Les passer en 4ème A avec statut "actif"
3. Les élèves redoublants restent en 3ème A avec statut "redouble"

### **Scénario 2 : Élève qui abandonne**

1. Modifier l'élève
2. Changer statut → "Abandonné"
3. L'élève reste visible mais n'apparaît plus dans les listes actives

### **Scénario 3 : Élève transféré**

1. Modifier l'élève
2. Changer statut → "Transféré"
3. Possibilité d'archiver pour statistiques

### **Scénario 4 : Élève diplômé (CM2)**

1. Élève termine le CM2
2. Statut → "Diplômé"
3. Conservé pour historique et certificat

---

## 🔍 5. FILTRAGE PAR STATUT

**Dans l'interface** :
- Vue par défaut : Seulement élèves **Actifs**
- Filtre optionnel : Tous / Actifs / Admis / Redoublants / etc.

**Dans l'API** :
```
GET /api/academic/eleves/?statut=actif
GET /api/academic/eleves/?statut=redouble
```

---

## ⚙️ 6. MIGRATION BASE DE DONNÉES

Pour appliquer les nouveaux statuts :

```bash
# Dans le dossier backend
python manage.py makemigrations
python manage.py migrate
```

---

## 💡 7. RECOMMANDATIONS

### **En Début d'Année** :
- ✅ Tous les élèves nouvellement inscrits : **Actif**
- ✅ Élèves redoublants : **Actif** (dans leur classe)

### **En Cours d'Année** :
- ✅ Maintenir **Actif** pour tous les élèves présents
- ✅ Marquer **Transféré** ou **Abandonné** si nécessaire

### **En Fin d'Année** :
1. Calculer les moyennes annuelles
2. Décider qui est **Admis** / **Redouble**
3. Effectuer le passage de classe
4. Remettre tous les élèves admis en **Actif** dans leur nouvelle classe

### **Archivage** :
- ✅ Conserver les élèves diplômés pour statistiques
- ✅ Possibilité d'exporter avant suppression
- ✅ Les données restent liées aux notes historiques

---

## 📊 8. STATISTIQUES UTILES

Avec les statuts, vous pouvez générer :
- Taux de réussite par classe
- Taux de redoublement
- Taux d'abandon
- Effectifs par statut
- Historique des passages

---

## 🚀 9. PROCHAINES ÉTAPES

Pour une gestion complète, vous pourriez ajouter :
- Interface UI pour passage en masse
- Workflow de validation (directeur)
- Historique des changements de classe
- Export des listes par statut
- Notifications automatiques

---

## ❓ QUESTIONS FRÉQUENTES

**Q : Que faire des élèves de l'année dernière ?**
R : Marquer comme "Admis" puis changer de classe, ou "Redouble" et garder la classe.

**Q : Peut-on supprimer un élève ?**
R : Oui, mais préférez changer le statut (abandonné, transféré) pour garder l'historique.

**Q : Comment gérer une nouvelle année scolaire ?**
R : Créer une nouvelle année scolaire, de nouvelles classes, puis faire le passage de classe.

**Q : Les notes sont-elles conservées ?**
R : Oui ! Les notes restent liées à l'élève même après changement de classe.

---

**🎓 Avec ce système, vous avez un suivi complet du parcours de chaque élève !**
