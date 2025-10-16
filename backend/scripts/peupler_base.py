"""
Script de peuplement automatique de la base de données
Crée des données de test complètes pour l'école par défaut
"""
import os
import sys
import django
from datetime import date, timedelta
import random

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Ecole, AnneeScolaire, Classe, Matiere, Eleve, MatiereClasse
from users.models import User, Professeur
from grades.models import Note, Periode, TypeEvaluation

def peupler():
    print("=" * 70)
    print("PEUPLEMENT AUTOMATIQUE DE LA BASE DE DONNÉES")
    print("=" * 70)
    
    # Récupérer l'école par défaut
    try:
        ecole = Ecole.objects.get(code='ECOLE001')
        print(f"\n✅ École trouvée : {ecole.nom}")
    except Ecole.DoesNotExist:
        print("\n❌ École ECOLE001 introuvable !")
        return
    
    # 1. CRÉER ANNÉE SCOLAIRE
    print("\n" + "=" * 70)
    print("1. CRÉATION DE L'ANNÉE SCOLAIRE")
    print("=" * 70)
    
    annee, created = AnneeScolaire.objects.get_or_create(
        libelle='2024-2025',
        ecole=ecole,
        defaults={
            'date_debut': date(2024, 9, 1),
            'date_fin': date(2025, 6, 30),
            'active': True
        }
    )
    print(f"   {'✅ Créée' if created else 'ℹ️  Existante'}: {annee.libelle}")
    
    # 2. CRÉER PROFESSEURS
    print("\n" + "=" * 70)
    print("2. CRÉATION DES PROFESSEURS")
    print("=" * 70)
    
    professeurs_data = [
        {'username': 'marie.martin', 'first_name': 'Marie', 'last_name': 'MARTIN', 'matricule': 'PROF001', 'specialite': 'Français'},
        {'username': 'jean.dupont', 'first_name': 'Jean', 'last_name': 'DUPONT', 'matricule': 'PROF002', 'specialite': 'Mathématiques'},
        {'username': 'fatou.diop', 'first_name': 'Fatou', 'last_name': 'DIOP', 'matricule': 'PROF003', 'specialite': 'Sciences'},
        {'username': 'mamadou.fall', 'first_name': 'Mamadou', 'last_name': 'FALL', 'matricule': 'PROF004', 'specialite': 'Histoire-Géo'},
        {'username': 'awa.ndiaye', 'first_name': 'Awa', 'last_name': 'NDIAYE', 'matricule': 'PROF005', 'specialite': 'Anglais'},
    ]
    
    professeurs = []
    for prof_data in professeurs_data:
        user, created = User.objects.get_or_create(
            username=prof_data['username'],
            defaults={
                'first_name': prof_data['first_name'],
                'last_name': prof_data['last_name'],
                'email': f"{prof_data['username']}@ecole.sn",
                'role': 'professeur',
                'ecole': ecole
            }
        )
        if created:
            user.set_password('password123')
            user.save()
        
        prof, created = Professeur.objects.get_or_create(
            user=user,
            defaults={
                'matricule': prof_data['matricule'],
                'specialite': prof_data['specialite'],
                'ecole': ecole,
                'date_embauche': date(2020, 9, 1)
            }
        )
        professeurs.append(prof)
        print(f"   {'✅ Créé' if created else 'ℹ️  Existant'}: {user.get_full_name()} ({prof.matricule})")
    
    # 3. CRÉER MATIÈRES
    print("\n" + "=" * 70)
    print("3. CRÉATION DES MATIÈRES")
    print("=" * 70)
    
    matieres_data = [
        {'nom': 'Français', 'code': 'FRA', 'coefficient': 3.0},
        {'nom': 'Mathématiques', 'code': 'MAT', 'coefficient': 3.0},
        {'nom': 'Sciences', 'code': 'SCI', 'coefficient': 2.0},
        {'nom': 'Histoire-Géographie', 'code': 'HIS', 'coefficient': 2.0},
        {'nom': 'Anglais', 'code': 'ANG', 'coefficient': 2.0},
        {'nom': 'Éducation Physique', 'code': 'EPS', 'coefficient': 1.0},
    ]
    
    matieres = []
    for mat_data in matieres_data:
        matiere, created = Matiere.objects.get_or_create(
            code=mat_data['code'],
            ecole=ecole,
            defaults={
                'nom': mat_data['nom'],
                'coefficient': mat_data['coefficient']
            }
        )
        matieres.append(matiere)
        print(f"   {'✅ Créée' if created else 'ℹ️  Existante'}: {matiere.nom} (Coef: {matiere.coefficient})")
    
    # 4. CRÉER CLASSES
    print("\n" + "=" * 70)
    print("4. CRÉATION DES CLASSES")
    print("=" * 70)
    
    classes_data = [
        {'niveau': 'ci', 'section': 'A', 'prof_idx': 0},
        {'niveau': 'cp', 'section': 'A', 'prof_idx': 1},
        {'niveau': 'ce1', 'section': 'A', 'prof_idx': 2},
        {'niveau': 'ce2', 'section': 'A', 'prof_idx': 3},
        {'niveau': 'cm1', 'section': 'A', 'prof_idx': 4},
        {'niveau': 'cm2', 'section': 'A', 'prof_idx': 0},
    ]
    
    classes = []
    for classe_data in classes_data:
        classe, created = Classe.objects.get_or_create(
            niveau=classe_data['niveau'],
            section=classe_data['section'],
            annee_scolaire=annee,
            ecole=ecole,
            defaults={
                'effectif_max': 40,
                'professeur_principal': professeurs[classe_data['prof_idx']]
            }
        )
        classes.append(classe)
        print(f"   {'✅ Créée' if created else 'ℹ️  Existante'}: {classe.nom} (Prof: {classe.professeur_principal.user.get_full_name()})")
    
    # 5. ASSIGNER MATIÈRES AUX CLASSES
    print("\n" + "=" * 70)
    print("5. ASSIGNATION DES MATIÈRES AUX CLASSES")
    print("=" * 70)
    
    count_liaisons = 0
    for classe in classes:
        for i, matiere in enumerate(matieres):
            prof = professeurs[i % len(professeurs)]
            _, created = MatiereClasse.objects.get_or_create(
                classe=classe,
                matiere=matiere,
                ecole=ecole,
                defaults={'professeur': prof}
            )
            if created:
                count_liaisons += 1
    
    print(f"   ✅ {count_liaisons} liaison(s) créée(s)")
    
    # 6. CRÉER ÉLÈVES
    print("\n" + "=" * 70)
    print("6. CRÉATION DES ÉLÈVES")
    print("=" * 70)
    
    prenoms_garcons = ['Mamadou', 'Amadou', 'Ibrahima', 'Moussa', 'Ousmane', 'Cheikh', 'Omar', 'Abdou']
    prenoms_filles = ['Fatou', 'Awa', 'Aminata', 'Maimouna', 'Khady', 'Astou', 'Mariama', 'Aissatou']
    noms = ['DIOP', 'FALL', 'NDIAYE', 'SARR', 'SECK', 'BA', 'THIAM', 'GUEYE', 'SY', 'KANE']
    
    eleves_crees = 0
    for classe in classes:
        # Créer 30-35 élèves par classe
        nb_eleves = random.randint(30, 35)
        
        for i in range(nb_eleves):
            sexe = random.choice(['M', 'F'])
            prenom = random.choice(prenoms_garcons if sexe == 'M' else prenoms_filles)
            nom = random.choice(noms)
            
            # Générer matricule unique
            matricule = f"{classe.niveau.upper()}{classe.section}{i+1:03d}"
            
            # Âge approprié pour le niveau
            annee_naissance = 2024 - (6 + classes.index(classe))
            date_naissance = date(annee_naissance, random.randint(1, 12), random.randint(1, 28))
            
            eleve, created = Eleve.objects.get_or_create(
                matricule=matricule,
                ecole=ecole,
                defaults={
                    'nom': nom,
                    'prenom': prenom,
                    'sexe': sexe,
                    'date_naissance': date_naissance,
                    'lieu_naissance': 'Dakar',
                    'adresse': f"{random.randint(1, 100)} Avenue {random.choice(['Bourguiba', 'Lamine', 'Blaise Diagne'])}",
                    'telephone_pere': f'+221 77 {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}',
                    'nom_pere': f"{random.choice(['Moussa', 'Ibrahima', 'Cheikh'])} {nom}",
                    'telephone_mere': f'+221 76 {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}',
                    'nom_mere': f"{random.choice(['Fatou', 'Awa', 'Aminata'])} {nom}",
                    'classe': classe,
                    'statut': 'actif'
                }
            )
            if created:
                eleves_crees += 1
    
    print(f"   ✅ {eleves_crees} élève(s) créé(s)")
    
    # 7. CRÉER PÉRIODES ET TYPES D'ÉVALUATION
    print("\n" + "=" * 70)
    print("7. CRÉATION DES PÉRIODES ET TYPES D'ÉVALUATION")
    print("=" * 70)
    
    # Créer Trimestre 1
    periode1, created = Periode.objects.get_or_create(
        nom='trimestre1',
        annee_scolaire=annee,
        defaults={
            'date_debut': date(2024, 9, 1),
            'date_fin': date(2024, 12, 20),
            'est_cloturee': False
        }
    )
    print(f"   {'✅ Créée' if created else 'ℹ️  Existante'}: {periode1.get_nom_display()}")
    
    # Créer types d'évaluation
    type_devoir, _ = TypeEvaluation.objects.get_or_create(
        nom='devoir',
        defaults={'coefficient': 1.0}
    )
    type_compo, _ = TypeEvaluation.objects.get_or_create(
        nom='composition',
        defaults={'coefficient': 2.0}
    )
    print(f"   ✅ Types d'évaluation créés")
    
    # 8. CRÉER NOTES
    print("\n" + "=" * 70)
    print("8. CRÉATION DES NOTES (Trimestre 1)")
    print("=" * 70)
    
    notes_creees = 0
    for classe in classes:
        eleves_classe = Eleve.objects.filter(classe=classe, ecole=ecole)
        matieres_classe = MatiereClasse.objects.filter(classe=classe, ecole=ecole)
        
        for eleve in eleves_classe:
            for mat_classe in matieres_classe:
                # Générer 2 notes par matière
                for type_eval in [type_devoir, type_compo]:
                    note_valeur = round(random.uniform(4, 10), 2)  # Note sur 10
                    
                    _, created = Note.objects.get_or_create(
                        eleve=eleve,
                        matiere=mat_classe.matiere,
                        periode=periode1,
                        type_evaluation=type_eval,
                        defaults={
                            'valeur': note_valeur,
                            'date_evaluation': date(2024, random.randint(9, 11), random.randint(1, 28)),
                            'professeur': mat_classe.professeur,
                            'commentaire': 'Bien' if note_valeur >= 7 else 'Assez bien' if note_valeur >= 6 else 'Passable'
                        }
                    )
                    if created:
                        notes_creees += 1
    
    print(f"   ✅ {notes_creees} note(s) créée(s)")
    
    # 9. ASSIGNER ADMIN À L'ÉCOLE
    print("\n" + "=" * 70)
    print("9. ASSIGNATION DE L'ADMIN À L'ÉCOLE")
    print("=" * 70)
    
    try:
        admin = User.objects.get(username='admin')
        admin.ecole = ecole
        admin.role = 'admin'
        admin.save()
        print(f"   ✅ Admin assigné à {ecole.nom}")
    except User.DoesNotExist:
        print("   ⚠️  Admin non trouvé")
    
    # 10. RAPPORT FINAL
    print("\n" + "=" * 70)
    print("10. RAPPORT FINAL")
    print("=" * 70)
    
    print(f"\n   École : {ecole.nom} ({ecole.code})")
    print(f"   - Année scolaire : {AnneeScolaire.objects.filter(ecole=ecole).count()}")
    print(f"   - Professeurs : {Professeur.objects.filter(ecole=ecole).count()}")
    print(f"   - Matières : {Matiere.objects.filter(ecole=ecole).count()}")
    print(f"   - Classes : {Classe.objects.filter(ecole=ecole).count()}")
    print(f"   - Élèves : {Eleve.objects.filter(ecole=ecole).count()}")
    print(f"   - Notes : {Note.objects.filter(eleve__ecole=ecole).count()}")
    
    print("\n" + "=" * 70)
    print("✅ PEUPLEMENT TERMINÉ !")
    print("=" * 70)
    print("\n📝 INFORMATIONS DE CONNEXION :")
    print("\n   Admin :")
    print("      Username: admin")
    print("      Password: admin (ou celui que vous avez créé)")
    print("\n   Professeurs (tous avec password: password123) :")
    print("      - marie.martin")
    print("      - jean.dupont")
    print("      - fatou.diop")
    print("      - mamadou.fall")
    print("      - awa.ndiaye")
    print("\n🚀 Vous pouvez maintenant :")
    print("   1. Lancer le serveur : python manage.py runserver")
    print("   2. Vous connecter avec marie.martin / password123")
    print("   3. Voir les élèves, notes, bulletins, etc.")
    print("=" * 70)

if __name__ == '__main__':
    peupler()
