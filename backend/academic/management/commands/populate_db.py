from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from academic.models import AnneeScolaire, Classe, Matiere, Eleve, MatiereClasse
from users.models import Professeur, Admin
from grades.models import Periode, TypeEvaluation
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Remplit la base de données avec des données de test'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('🚀 Démarrage du remplissage de la base de données...'))

        # Nettoyer les données existantes (optionnel)
        self.stdout.write('🗑️  Nettoyage des anciennes données...')
        Eleve.objects.all().delete()
        MatiereClasse.objects.all().delete()
        Classe.objects.all().delete()
        Matiere.objects.all().delete()
        Professeur.objects.all().delete()
        Admin.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        AnneeScolaire.objects.all().delete()

        # 1. Créer une année scolaire
        self.stdout.write('📅 Création de l\'année scolaire...')
        annee_scolaire = AnneeScolaire.objects.create(
            libelle='2024-2025',
            date_debut=date(2024, 9, 1),
            date_fin=date(2025, 6, 30),
            active=True
        )
        self.stdout.write(self.style.SUCCESS(f'   ✅ Année scolaire créée: {annee_scolaire.libelle}'))

        # 1.1 Créer les périodes (trimestres)
        self.stdout.write('📅 Création des périodes (trimestres)...')
        periodes_data = [
            {'nom': 'trimestre1', 'date_debut': date(2024, 9, 1), 'date_fin': date(2024, 12, 15)},
            {'nom': 'trimestre2', 'date_debut': date(2025, 1, 5), 'date_fin': date(2025, 3, 31)},
            {'nom': 'trimestre3', 'date_debut': date(2025, 4, 1), 'date_fin': date(2025, 6, 30)},
        ]
        
        periodes = []
        for periode_data in periodes_data:
            periode = Periode.objects.create(
                **periode_data,
                annee_scolaire=annee_scolaire,
                est_cloturee=False
            )
            periodes.append(periode)
            self.stdout.write(self.style.SUCCESS(f'   ✅ {periode.get_nom_display()} créée'))

        # 1.2 Créer les types d'évaluation
        self.stdout.write('📝 Création des types d\'évaluation...')
        types_eval_data = [
            {'nom': 'devoir', 'coefficient': 1.0, 'description': 'Évaluations quotidiennes'},
            {'nom': 'controle', 'coefficient': 2.0, 'description': 'Contrôles périodiques'},
            {'nom': 'composition', 'coefficient': 3.0, 'description': 'Examens de fin de trimestre'},
        ]
        
        for type_data in types_eval_data:
            type_eval, created = TypeEvaluation.objects.get_or_create(
                nom=type_data['nom'],
                defaults={
                    'coefficient': type_data['coefficient'],
                    'description': type_data['description']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(
                    f'   ✅ {type_eval.get_nom_display()} (Coef: {type_eval.coefficient})'
                ))

        # 2. Créer un administrateur
        self.stdout.write('👤 Création d\'un administrateur...')
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@ecole.com',
                'first_name': 'Jean',
                'last_name': 'DUPONT',
                'role': 'admin',
                'telephone': '677123456'
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
        else:
            # Si l'utilisateur existe déjà, mettre à jour son mot de passe
            admin_user.set_password('admin123')
            admin_user.role = 'admin'
            admin_user.save()
        
        # Créer ou récupérer le profil Admin
        Admin.objects.get_or_create(user=admin_user, defaults={'fonction': 'Directeur'})
        
        if created:
            self.stdout.write(self.style.SUCCESS('   ✅ Admin créé: admin / admin123'))
        else:
            self.stdout.write(self.style.SUCCESS('   ✅ Admin existant mis à jour: admin / admin123'))

        # 3. Créer des professeurs
        self.stdout.write('👨‍🏫 Création des professeurs...')
        professeurs_data = [
            {'prenom': 'Marie', 'nom': 'MARTIN', 'specialite': 'Mathématiques', 'matricule': 'PROF001'},
            {'prenom': 'Pierre', 'nom': 'BERNARD', 'specialite': 'Français', 'matricule': 'PROF002'},
            {'prenom': 'Sophie', 'nom': 'DUBOIS', 'specialite': 'Anglais', 'matricule': 'PROF003'},
            {'prenom': 'Luc', 'nom': 'THOMAS', 'specialite': 'Sciences', 'matricule': 'PROF004'},
            {'prenom': 'Anne', 'nom': 'PETIT', 'specialite': 'Histoire-Géographie', 'matricule': 'PROF005'},
        ]
        
        professeurs = []
        for prof_data in professeurs_data:
            user = User.objects.create_user(
                username=prof_data['matricule'].lower(),
                email=f"{prof_data['prenom'].lower()}.{prof_data['nom'].lower()}@ecole.com",
                password='prof123',
                first_name=prof_data['prenom'],
                last_name=prof_data['nom'],
                role='professeur',
                telephone=f'677{random.randint(100000, 999999)}'
            )
            prof = Professeur.objects.create(
                user=user,
                matricule=prof_data['matricule'],
                specialite=prof_data['specialite']
            )
            professeurs.append(prof)
            self.stdout.write(self.style.SUCCESS(f'   ✅ Prof. {prof.user.get_full_name()} - {prof.specialite}'))

        # 4. Créer des matières
        self.stdout.write('📚 Création des matières...')
        matieres_data = [
            {'nom': 'Mathématiques', 'code': 'MATH', 'coefficient': 4.0},
            {'nom': 'Français', 'code': 'FR', 'coefficient': 3.0},
            {'nom': 'Anglais', 'code': 'ANG', 'coefficient': 3.0},
            {'nom': 'Histoire-Géographie', 'code': 'HIST', 'coefficient': 2.0},
            {'nom': 'Sciences de la Vie et de la Terre', 'code': 'SVT', 'coefficient': 2.0},
            {'nom': 'Physique-Chimie', 'code': 'PC', 'coefficient': 2.0},
            {'nom': 'Éducation Physique et Sportive', 'code': 'EPS', 'coefficient': 1.0},
            {'nom': 'Arts Plastiques', 'code': 'ARTS', 'coefficient': 1.0},
        ]
        
        matieres = []
        for mat_data in matieres_data:
            matiere = Matiere.objects.create(**mat_data)
            matieres.append(matiere)
            self.stdout.write(self.style.SUCCESS(f'   ✅ {matiere.nom} (Coef: {matiere.coefficient})'))

        # 5. Créer des classes
        self.stdout.write('🏫 Création des classes...')
        classes_data = [
            {'nom': '6ème A', 'niveau': '6eme', 'effectif_max': 40},
            {'nom': '6ème B', 'niveau': '6eme', 'effectif_max': 40},
            {'nom': '5ème A', 'niveau': '5eme', 'effectif_max': 38},
            {'nom': '5ème B', 'niveau': '5eme', 'effectif_max': 38},
            {'nom': '4ème A', 'niveau': '4eme', 'effectif_max': 35},
            {'nom': '3ème A', 'niveau': '3eme', 'effectif_max': 35},
        ]
        
        classes = []
        for i, classe_data in enumerate(classes_data):
            classe = Classe.objects.create(
                **classe_data,
                annee_scolaire=annee_scolaire,
                professeur_principal=professeurs[i % len(professeurs)]
            )
            classes.append(classe)
            
            # Assigner des matières à la classe
            for matiere in matieres:
                MatiereClasse.objects.create(
                    classe=classe,
                    matiere=matiere,
                    professeur=professeurs[random.randint(0, len(professeurs)-1)]
                )
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✅ {classe.nom} - Prof. Principal: {classe.professeur_principal.user.get_full_name()}'
            ))

        # 6. Créer des élèves
        self.stdout.write('👥 Création des élèves...')
        
        prenoms_garcons = [
            'Jean', 'Pierre', 'Luc', 'Marc', 'Paul', 'Thomas', 'Nicolas', 'Alexandre',
            'Maxime', 'Lucas', 'Hugo', 'Louis', 'Gabriel', 'Arthur', 'Mathis', 'Nathan'
        ]
        
        prenoms_filles = [
            'Marie', 'Sophie', 'Anne', 'Julie', 'Camille', 'Emma', 'Léa', 'Chloé',
            'Sarah', 'Laura', 'Manon', 'Clara', 'Lucie', 'Océane', 'Jade', 'Lisa'
        ]
        
        noms = [
            'MARTIN', 'BERNARD', 'DUBOIS', 'THOMAS', 'ROBERT', 'PETIT', 'DURAND', 'LEROY',
            'MOREAU', 'SIMON', 'LAURENT', 'LEFEBVRE', 'MICHEL', 'GARCIA', 'DAVID', 'BERTRAND',
            'ROUX', 'VINCENT', 'FOURNIER', 'MOREL', 'GIRARD', 'ANDRE', 'LEFEBVRE', 'MERCIER'
        ]
        
        villes = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua', 'Ngaoundéré']
        
        total_eleves = 0
        for classe in classes:
            # Nombre d'élèves par classe (80-90% de l'effectif max)
            nb_eleves = int(classe.effectif_max * random.uniform(0.8, 0.9))
            
            for i in range(nb_eleves):
                sexe = random.choice(['M', 'F'])
                prenom = random.choice(prenoms_garcons if sexe == 'M' else prenoms_filles)
                nom = random.choice(noms)
                
                # Date de naissance en fonction du niveau
                niveau_map = {
                    '6eme': (2012, 2013),
                    '5eme': (2011, 2012),
                    '4eme': (2010, 2011),
                    '3eme': (2009, 2010),
                }
                annee_min, annee_max = niveau_map.get(classe.niveau, (2012, 2013))
                annee_naissance = random.randint(annee_min, annee_max)
                mois_naissance = random.randint(1, 12)
                jour_naissance = random.randint(1, 28)
                
                eleve = Eleve.objects.create(
                    matricule=f'EL{total_eleves + 1:05d}',
                    nom=nom,
                    prenom=prenom,
                    sexe=sexe,
                    date_naissance=date(annee_naissance, mois_naissance, jour_naissance),
                    lieu_naissance=random.choice(villes),
                    telephone_eleve=f'6{random.randint(70000000, 79999999)}' if random.random() > 0.5 else '',
                    email=f'{prenom.lower()}.{nom.lower()}@eleve.com' if random.random() > 0.6 else '',
                    adresse=f'{random.randint(1, 500)} Rue {random.choice(["des Fleurs", "de la Paix", "du Marché", "Principale"])}',
                    nom_pere=f'{random.choice(prenoms_garcons)} {nom}',
                    telephone_pere=f'6{random.randint(70000000, 79999999)}',
                    nom_mere=f'{random.choice(prenoms_filles)} {random.choice(noms)}',
                    telephone_mere=f'6{random.randint(70000000, 79999999)}',
                    classe=classe,
                    statut='actif'
                )
                total_eleves += 1
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✅ {nb_eleves} élèves ajoutés dans {classe.nom}'
            ))

        # Résumé
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('🎉 BASE DE DONNÉES REMPLIE AVEC SUCCÈS !'))
        self.stdout.write('='*60)
        self.stdout.write(f'📊 RÉSUMÉ:')
        self.stdout.write(f'   • Années scolaires: {AnneeScolaire.objects.count()}')
        self.stdout.write(f'   • Périodes (trimestres): {Periode.objects.count()}')
        self.stdout.write(f'   • Types d\'évaluation: {TypeEvaluation.objects.count()}')
        self.stdout.write(f'   • Administrateurs: {Admin.objects.count()}')
        self.stdout.write(f'   • Enseignants: {Professeur.objects.count()}')
        self.stdout.write(f'   • Matières: {Matiere.objects.count()}')
        self.stdout.write(f'   • Classes: {Classe.objects.count()}')
        self.stdout.write(f'   • Élèves: {Eleve.objects.count()}')
        self.stdout.write('\n' + '='*60)
        self.stdout.write('🔑 IDENTIFIANTS DE CONNEXION:')
        self.stdout.write('='*60)
        self.stdout.write(self.style.SUCCESS('   👤 Admin:'))
        self.stdout.write('      Username: admin')
        self.stdout.write('      Password: admin123')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('   👨‍🏫 Professeurs (tous):'))
        self.stdout.write('      Username: prof001, prof002, prof003, prof004, prof005')
        self.stdout.write('      Password: prof123')
        self.stdout.write('='*60)
