"""
Script pour initialiser les données de base pour une école primaire du Sénégal
"""
from django.core.management.base import BaseCommand
from academic.models import Matiere, Ecole
from django.db import transaction


class Command(BaseCommand):
    help = 'Initialise les matières pour le système primaire sénégalais'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🇸🇳 Initialisation système primaire Sénégal...'))
        
        with transaction.atomic():
            # Matières du primaire sénégalais
            matieres_data = [
                # Disciplines fondamentales
                {
                    'nom': 'Français',
                    'code': 'FR',
                    'coefficient': 4,
                    'description': 'Lecture, écriture, expression orale et écrite, grammaire, conjugaison, orthographe'
                },
                {
                    'nom': 'Mathématiques',
                    'code': 'MATH',
                    'coefficient': 4,
                    'description': 'Numération, opérations, géométrie, mesures, problèmes'
                },
                
                # Disciplines d'éveil
                {
                    'nom': 'Sciences d\'Observation',
                    'code': 'SO',
                    'coefficient': 2,
                    'description': 'Observation de la nature, corps humain, hygiène, environnement'
                },
                {
                    'nom': 'Histoire-Géographie',
                    'code': 'HG',
                    'coefficient': 2,
                    'description': 'Histoire du Sénégal, géographie locale et nationale, cartes'
                },
                {
                    'nom': 'Education Civique et Morale',
                    'code': 'ECM',
                    'coefficient': 1,
                    'description': 'Valeurs citoyennes, droits et devoirs, vie en société'
                },
                
                # Disciplines artistiques et sportives
                {
                    'nom': 'Education Physique et Sportive',
                    'code': 'EPS',
                    'coefficient': 1,
                    'description': 'Sport, jeux, éducation corporelle, santé'
                },
                {
                    'nom': 'Education Artistique',
                    'code': 'EA',
                    'coefficient': 1,
                    'description': 'Dessin, chant, arts plastiques, expression artistique'
                },
                
                # Langue nationale (optionnel)
                {
                    'nom': 'Langue Nationale',
                    'code': 'LN',
                    'coefficient': 1,
                    'description': 'Wolof, Serer, Pulaar ou autre langue nationale'
                },
            ]
            
            created_count = 0
            updated_count = 0
            
            for matiere_data in matieres_data:
                matiere, created = Matiere.objects.update_or_create(
                    code=matiere_data['code'],
                    defaults={
                        'nom': matiere_data['nom'],
                        'coefficient': matiere_data['coefficient'],
                        'description': matiere_data['description']
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Créé: {matiere.nom} (coef {matiere.coefficient})')
                    )
                else:
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'⚠️  Mis à jour: {matiere.nom}')
                    )
            
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS('=' * 60))
            self.stdout.write(self.style.SUCCESS(f'📚 {created_count} matières créées'))
            self.stdout.write(self.style.SUCCESS(f'🔄 {updated_count} matières mises à jour'))
            self.stdout.write(self.style.SUCCESS(f'📊 Total des coefficients: {sum(m["coefficient"] for m in matieres_data)}'))
            self.stdout.write(self.style.SUCCESS('=' * 60))
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS('🎓 Système primaire sénégalais initialisé avec succès!'))
            self.stdout.write('')
            self.stdout.write('Prochaines étapes:')
            self.stdout.write('1. Créer les classes (CI, CP, CE1, CE2, CM1, CM2)')
            self.stdout.write('2. Affecter les matières aux classes')
            self.stdout.write('3. Assigner les professeurs')
