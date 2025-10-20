from django.core.management.base import BaseCommand
from academic.models import Classe, AnneeScolaire


class Command(BaseCommand):
    help = 'Initialise les classes de primaire (CI, CP, CE1, CE2, CM1, CM2)'

    def handle(self, *args, **options):
        # Récupérer ou créer l'année scolaire active
        annee, created = AnneeScolaire.objects.get_or_create(
            annee_debut=2024,
            annee_fin=2025,
            defaults={
                'active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Année scolaire {annee} créée'))
        else:
            self.stdout.write(f'Année scolaire {annee} existe déjà')

        # Définir les niveaux de primaire
        niveaux_primaire = [
            {'nom': 'CI', 'ordre': 1, 'description': 'Cours d\'Initiation'},
            {'nom': 'CP', 'ordre': 2, 'description': 'Cours Préparatoire'},
            {'nom': 'CE1', 'ordre': 3, 'description': 'Cours Élémentaire 1ère année'},
            {'nom': 'CE2', 'ordre': 4, 'description': 'Cours Élémentaire 2ème année'},
            {'nom': 'CM1', 'ordre': 5, 'description': 'Cours Moyen 1ère année'},
            {'nom': 'CM2', 'ordre': 6, 'description': 'Cours Moyen 2ème année'},
        ]

        classes_creees = 0
        classes_existantes = 0

        for niveau in niveaux_primaire:
            # Créer la classe de base (sans section)
            classe, created = Classe.objects.get_or_create(
                nom=niveau['nom'],
                annee_scolaire=annee,
                defaults={
                    'niveau': niveau['nom'],
                    'capacite_max': 40,
                    'description': niveau['description']
                }
            )
            
            if created:
                classes_creees += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Classe {classe.nom} créée')
                )
            else:
                classes_existantes += 1
                self.stdout.write(
                    self.style.WARNING(f'○ Classe {classe.nom} existe déjà')
                )

        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS(f'✓ {classes_creees} classes créées'))
        self.stdout.write(f'○ {classes_existantes} classes existaient déjà')
        self.stdout.write('='*50 + '\n')
        
        self.stdout.write(self.style.SUCCESS('\n💡 Pour créer des sections (A, B, C):'))
        self.stdout.write('   Utilisez le panneau d\'administration Django')
        self.stdout.write('   ou créez directement depuis l\'interface:')
        self.stdout.write('   - CM1-A (Cours Moyen 1ère année - Section A)')
        self.stdout.write('   - CM1-B (Cours Moyen 1ère année - Section B)')
        self.stdout.write('   - etc.\n')
