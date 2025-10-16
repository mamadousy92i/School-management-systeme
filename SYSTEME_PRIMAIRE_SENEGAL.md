# 🇸🇳 Système Éducatif Primaire Sénégalais

Configuration complète pour gérer une école primaire au Sénégal.

---

## 📚 Structure du Primaire

### **Cycles et Niveaux**

```
┌─────────────────────────────────────────┐
│ CYCLE 1 - Cours d'Initiation           │
│ └── CI (Cours d'Initiation) - 6 ans    │
├─────────────────────────────────────────┤
│ CYCLE 2 - Préparatoire et Élémentaire  │
│ ├── CP (Cours Préparatoire) - 7 ans    │
│ ├── CE1 (Cours Élémentaire 1) - 8 ans  │
│ └── CE2 (Cours Élémentaire 2) - 9 ans  │
├─────────────────────────────────────────┤
│ CYCLE 3 - Cours Moyen                   │
│ ├── CM1 (Cours Moyen 1) - 10 ans       │
│ └── CM2 (Cours Moyen 2) - 11 ans       │
│     ↓                                   │
│  [CFEE/Entrée en 6ème]                  │
└─────────────────────────────────────────┘
```

---

## 📖 Matières et Coefficients

### **Total : 16 coefficients**

| Matière | Code | Coefficient | % |
|---------|------|-------------|---|
| **Disciplines Fondamentales** | | | |
| Français | FR | 4 | 25% |
| Mathématiques | MATH | 4 | 25% |
| **Disciplines d'Éveil** | | | |
| Sciences d'Observation | SO | 2 | 12,5% |
| Histoire-Géographie | HG | 2 | 12,5% |
| Education Civique et Morale | ECM | 1 | 6,25% |
| **Disciplines Artistiques** | | | |
| Education Physique et Sportive | EPS | 1 | 6,25% |
| Education Artistique | EA | 1 | 6,25% |
| **Optionnel** | | | |
| Langue Nationale | LN | 1 | 6,25% |

### **Descriptions détaillées**

#### 📝 **Français** (Coefficient 4)
- Lecture et compréhension
- Expression orale et écrite
- Grammaire et conjugaison
- Orthographe
- Vocabulaire
- Rédaction

#### 🔢 **Mathématiques** (Coefficient 4)
- Numération (entiers, décimaux)
- Opérations (addition, soustraction, multiplication, division)
- Géométrie (figures planes, solides)
- Mesures (longueur, masse, capacité, temps)
- Problèmes et situations de vie courante

#### 🔬 **Sciences d'Observation** (Coefficient 2)
- Observation de la nature
- Le corps humain et l'hygiène
- L'environnement
- Les êtres vivants
- La santé

#### 🌍 **Histoire-Géographie** (Coefficient 2)
- Histoire du Sénégal
- Géographie locale et nationale
- Lecture de cartes
- Les grandes dates
- Les régions du Sénégal

#### 🤝 **Education Civique et Morale** (Coefficient 1)
- Valeurs citoyennes
- Droits et devoirs de l'enfant
- Vie en société
- Respect et tolérance

#### ⚽ **Education Physique et Sportive** (Coefficient 1)
- Jeux collectifs
- Athlétisme
- Expression corporelle
- Hygiène de vie

#### 🎨 **Education Artistique** (Coefficient 1)
- Dessin
- Chant et musique
- Arts plastiques
- Expression créative

#### 🗣️ **Langue Nationale** (Coefficient 1) *Optionnel*
- Wolof, Serer, Pulaar, Diola, Mandingue, Soninké
- Selon la région et disponibilité

---

## 📊 Système de Notation

### **Échelle de notation**
- Notes sur **10**
- Moyenne générale sur **10**
- Calcul pondéré par coefficients

### **Mentions**

| Moyenne | Mention | Appréciation |
|---------|---------|--------------|
| ≥ 9,00 | Excellent | Très bon élève |
| ≥ 8,00 | Très Bien | Bon travail |
| ≥ 7,00 | Bien | Travail satisfaisant |
| ≥ 6,00 | Assez Bien | Peut mieux faire |
| ≥ 5,00 | Passable | Doit fournir plus d'efforts |
| < 5,00 | Insuffisant | Travail insuffisant |

### **Périodes d'évaluation**

```
Année Scolaire (Octobre → Juin)
├── Trimestre 1 : Octobre - Décembre
├── Trimestre 2 : Janvier - Mars
└── Trimestre 3 : Avril - Juin
```

---

## 🚀 Installation et Configuration

### **Étape 1 : Créer les migrations**

```powershell
cd backend
python manage.py makemigrations
python manage.py migrate
```

### **Étape 2 : Initialiser les matières**

```powershell
python manage.py init_primaire_senegal
```

Résultat attendu :
```
🇸🇳 Initialisation système primaire Sénégal...
✅ Créé: Français (coef 4)
✅ Créé: Mathématiques (coef 4)
✅ Créé: Sciences d'Observation (coef 2)
✅ Créé: Histoire-Géographie (coef 2)
✅ Créé: Education Civique et Morale (coef 1)
✅ Créé: Education Physique et Sportive (coef 1)
✅ Créé: Education Artistique (coef 1)
✅ Créé: Langue Nationale (coef 1)

============================================================
📚 8 matières créées
📊 Total des coefficients: 16
============================================================

🎓 Système primaire sénégalais initialisé avec succès!
```

### **Étape 3 : Créer votre école**

Via l'admin Django (`http://localhost:8000/admin`):

1. **Academic → Écoles → Ajouter**
   ```
   Nom: École Primaire [Nom de votre école]
   Sigle: EP[XXX]
   Adresse: [Adresse complète]
   Téléphone: +221 XX XXX XX XX
   Email: contact@votre-ecole.sn
   Directeur: [Nom du directeur]
   Devise: [Ex: "Travail - Discipline - Excellence"]
   ```

### **Étape 4 : Créer l'année scolaire**

1. **Academic → Années Scolaires → Ajouter**
   ```
   Libellé: 2024-2025
   Date début: 01/10/2024
   Date fin: 30/06/2025
   Active: ✓ Oui
   ```

### **Étape 5 : Créer les classes**

Pour chaque niveau, créez les classes nécessaires:

**Exemple pour une école avec 2 classes par niveau:**

| Nom | Niveau | Effectif Max |
|-----|--------|--------------|
| CI A | CI | 30 |
| CI B | CI | 30 |
| CP A | CP | 35 |
| CP B | CP | 35 |
| CE1 A | CE1 | 35 |
| CE1 B | CE1 | 35 |
| CE2 A | CE2 | 40 |
| CE2 B | CE2 | 40 |
| CM1 A | CM1 | 40 |
| CM1 B | CM1 | 40 |
| CM2 A | CM2 | 40 |
| CM2 B | CM2 | 40 |

**Via Admin** : `Academic → Classes → Ajouter`

### **Étape 6 : Affecter les matières aux classes**

Pour chaque classe, lier les matières :

1. **Academic → Matières-Classes → Ajouter**
2. Sélectionner :
   - Classe (ex: CP A)
   - Matière (ex: Français)
   - Professeur (titulaire de la classe ou spécialiste)

**Astuce** : Les classes de primaire ont généralement un enseignant polyvalent qui enseigne toutes les matières, sauf parfois EPS et EA.

---

## 👨‍🏫 Gestion des Enseignants

### **Types d'enseignants**

1. **Enseignant Polyvalent** (Professeur Principal)
   - Enseigne toutes les matières fondamentales
   - Responsable de sa classe
   - 1 par classe

2. **Enseignants Spécialisés** (Optionnel)
   - EPS : Professeur d'éducation physique
   - EA : Professeur d'arts
   - LN : Professeur de langue nationale

### **Affectation recommandée**

**Exemple pour CE2 A** :
```
Classe: CE2 A
Professeur Principal: M. DIOP Amadou

Matières enseignées par M. DIOP:
├── Français (coef 4)
├── Mathématiques (coef 4)
├── Sciences d'Observation (coef 2)
├── Histoire-Géographie (coef 2)
└── Education Civique et Morale (coef 1)

Matières spécialisées:
├── EPS → Prof. NDIAYE (intervenant)
├── EA → Prof. FALL (intervenant)
└── LN → Prof. SOW (intervenant)
```

---

## 📝 Workflow de Saisie des Notes

### **1. Par période (Trimestre)**

```
Trimestre 1
├── Semaine 1-4 : Évaluations continues
├── Semaine 5-8 : Évaluations continues
├── Semaine 9-11 : Évaluations continues
└── Semaine 12 : Compositions + Bulletins
```

### **2. Types d'évaluations**

Via Admin : `Grades → Types d'Évaluation`

| Type | Coefficient | Utilisation |
|------|-------------|-------------|
| Interrogation | 1 | Évaluations courtes |
| Devoir | 2 | Devoirs écrits |
| Composition | 3 | Examen de fin de trimestre |

### **3. Calcul de la moyenne**

```
Exemple pour Mathématiques:
Interrogation 1: 7/10 (coef 1) → 7 points
Interrogation 2: 8/10 (coef 1) → 8 points
Devoir 1: 6/10 (coef 2) → 12 points
Composition: 9/10 (coef 3) → 27 points

Total: 54 points / 7 = 7,71/10
```

---

## 📄 Bulletins

### **Informations sur le bulletin**

✅ En-tête : Nom de l'école + devise  
✅ Élève : Nom, prénom, matricule, classe  
✅ Période : Trimestre X - Année 2024-2025  
✅ Notes par matière avec coefficients  
✅ Moyenne générale  
✅ **Rang** : Position dans la classe  
✅ **Moyenne de classe**  
✅ Mention  
✅ Appréciations du conseil  
✅ Signatures : Directeur, Enseignant, Parent  

---

## 📋 Checklist Complète

### Configuration initiale
- [ ] Migrations appliquées
- [ ] Matières initialisées (script init_primaire_senegal)
- [ ] École créée
- [ ] Année scolaire créée et active
- [ ] Utilisateurs rattachés à l'école

### Configuration classes
- [ ] Classes créées (CI, CP, CE1, CE2, CM1, CM2)
- [ ] Professeurs principaux assignés
- [ ] Matières affectées aux classes
- [ ] Enseignants spécialisés affectés (si applicable)

### Gestion courante
- [ ] Élèves inscrits dans les classes
- [ ] Périodes (trimestres) créées
- [ ] Types d'évaluation configurés
- [ ] Notes saisies régulièrement
- [ ] Bulletins générés en fin de trimestre

---

## 🎯 Recommandations

### **Pour le Directeur**
- Vérifier les bulletins avant impression
- Valider les moyennes de classe
- Suivre le taux de réussite par niveau

### **Pour les Enseignants**
- Saisir les notes régulièrement
- Varier les types d'évaluations
- Rédiger des appréciations constructives

### **Pour l'Administration**
- Sauvegarder la base de données régulièrement
- Archiver les bulletins
- Préparer les statistiques de fin d'année

---

## 📞 Support

Pour toute question sur la configuration :
1. Consultez `DEMARRAGE_IMMEDIAT.md`
2. Vérifiez `MIGRATION_ECOLE.md`
3. Testez avec des données fictives avant la production

---

**🇸🇳 Système configuré pour les écoles primaires du Sénégal ! 🎓**
