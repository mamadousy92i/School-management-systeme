# 📥 Installation du module PDF pour les bulletins

## ⚠️ Étape obligatoire

Pour activer le téléchargement PDF des bulletins, vous devez installer la bibliothèque `html2pdf.js`.

## 🚀 Installation

### Dans le terminal frontend :

```powershell
cd frontend
npm install html2pdf.js
```

**OU avec yarn :**

```powershell
cd frontend
yarn add html2pdf.js
```

## ✅ Vérification

Après l'installation, le package sera ajouté à `package.json` :

```json
{
  "dependencies": {
    ...
    "html2pdf.js": "^0.10.1"
  }
}
```

## 🎯 Fonctionnalités activées

Une fois installé, vous pourrez :

✅ **Télécharger les bulletins en PDF** depuis :
  - La liste des élèves (bouton "PDF")
  - La prévisualisation du bulletin (bouton "Télécharger PDF")

✅ **Format professionnel** :
  - Format A4 (210 x 297 mm)
  - Haute qualité (scale 2, quality 0.98)
  - Nom de fichier : `Bulletin_NOM_PRENOM_Trimestre_X.pdf`

✅ **Contenu complet** :
  - En-tête officiel avec bordure
  - Informations de l'élève
  - Tableau des notes par matière
  - Moyenne générale et mention
  - Appréciations
  - Espaces pour signatures
  - Pied de page avec date

## 🔧 En cas d'erreur

Si vous voyez une erreur `Cannot find module 'html2pdf.js'` :

1. Vérifiez que vous êtes dans le dossier `frontend`
2. Réexécutez `npm install html2pdf.js`
3. Redémarrez le serveur de développement :
   ```powershell
   npm run dev
   ```

## 📄 Test

1. Allez sur `/bulletins`
2. Sélectionnez une période et une classe
3. Cliquez sur **"PDF"** pour un élève
4. Le téléchargement devrait démarrer automatiquement ! 🎉

---

**Note** : Le PDF est généré côté client (navigateur) donc il n'y a pas de configuration backend nécessaire.
