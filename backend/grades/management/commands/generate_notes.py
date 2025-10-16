from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from grades.models import Periode, TypeEvaluation, Note, MoyenneEleve
from academic.models import Eleve, Matiere
from users.models import Professeur
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Génère des notes de test pour tous les élèves'

    def add_arguments(self, parser):
        parser.add_argument(
            '--periode',
            type=int,
            help='ID de la période (trimestre)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Générer des notes pour toutes les périodes',
        )

    def handle(self, *args, **kwargs):
        periode_id = kwargs.get('periode')
        generate_all = kwargs.get('all')

        self.stdout.write(self.style.SUCCESS('🎲 Génération de notes de test...'))
        self.stdout.write('='*60)

        # Récupérer les types d'évaluation
        types_eval = list(TypeEvaluation.objects.all())
        if not types_eval:
            self.stdout.write(self.style.ERROR('❌ Aucun type d\'évaluation trouvé'))
            self.stdout.write('   Exécutez d\'abord: python manage.py populate_db')
            return

        # Déterminer les périodes à traiter
        if periode_id:
            periodes = Periode.objects.filter(id=periode_id)
        elif generate_all:
            periodes = Periode.objects.all()
        else:
            # Par défaut, utiliser la première période
            periodes = Periode.objects.all()[:1]

        if not periodes.exists():
            self.stdout.write(self.style.ERROR('❌ Aucune période trouvée'))
            return

        # Récupérer toutes les matières
        matieres = list(Matiere.objects.all())
        if not matieres:
            self.stdout.write(self.style.ERROR('❌ Aucune matière trouvée'))
            return

        # Récupérer tous les élèves
        eleves = list(Eleve.objects.filter(statut='actif'))
        if not eleves:
            self.stdout.write(self.style.ERROR('❌ Aucun élève actif trouvé'))
            return

        total_notes = 0

        for periode in periodes:
            self.stdout.write(f'\n📅 {periode.get_nom_display()}...')
            
            # Date de base pour les évaluations
            date_debut = periode.date_debut
            date_fin = periode.date_fin
            
            # Pour chaque matière
            for matiere in matieres:
                self.stdout.write(f'   📚 {matiere.nom}')
                
                # Obtenir le professeur de la classe (pour les notes)
                # On va utiliser le premier professeur disponible
                try:
                    prof = Professeur.objects.first()
                except:
                    prof = None
                
                # Pour chaque type d'évaluation
                for type_eval in types_eval:
                    # Générer une date d'évaluation dans la période
                    delta_days = (date_fin - date_debut).days
                    if delta_days > 0:
                        random_days = random.randint(0, delta_days)
                        date_evaluation = date_debut + timedelta(days=random_days)
                    else:
                        date_evaluation = date_debut
                    
                    # Pour chaque élève
                    notes_created = 0
                    for eleve in eleves:
                        # Vérifier si la note n'existe pas déjà
                        exists = Note.objects.filter(
                            eleve=eleve,
                            matiere=matiere,
                            periode=periode,
                            type_evaluation=type_eval
                        ).exists()
                        
                        if not exists:
                            # Générer une note aléatoire sur 10 (école primaire)
                            # Distribution réaliste : plus de notes entre 5 et 8
                            rand = random.random()
                            if rand < 0.05:  # 5% de très mauvaises notes
                                note = round(random.uniform(2.5, 4.5), 2)
                            elif rand < 0.15:  # 10% de notes faibles
                                note = round(random.uniform(4.5, 6), 2)
                            elif rand < 0.70:  # 55% de notes moyennes/bonnes
                                note = round(random.uniform(6, 8), 2)
                            elif rand < 0.90:  # 20% de bonnes notes
                                note = round(random.uniform(8, 9), 2)
                            else:  # 10% d'excellentes notes
                                note = round(random.uniform(9, 10), 2)
                            
                            # Commentaires aléatoires
                            commentaires = [
                                '', '', '',  # 60% sans commentaire
                                'Très bien',
                                'Bien',
                                'Peut mieux faire',
                                'Bon travail',
                                'Excellent',
                                'À améliorer',
                                'Satisfaisant',
                                'Efforts à fournir',
                            ]
                            
                            Note.objects.create(
                                eleve=eleve,
                                matiere=matiere,
                                periode=periode,
                                type_evaluation=type_eval,
                                valeur=note,
                                date_evaluation=date_evaluation,
                                professeur=prof,
                                commentaire=random.choice(commentaires)
                            )
                            notes_created += 1
                            total_notes += 1
                    
                    if notes_created > 0:
                        self.stdout.write(
                            f'      ✅ {type_eval.get_nom_display()}: {notes_created} notes créées'
                        )
            
            # Calculer les moyennes pour cette période
            self.stdout.write(f'\n   🧮 Calcul des moyennes pour {periode.get_nom_display()}...')
            moyennes_count = 0
            
            for eleve in eleves:
                for matiere in matieres:
                    moyenne = MoyenneEleve.calculer_moyenne(eleve, matiere, periode)
                    if moyenne:
                        moyennes_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(f'   ✅ {moyennes_count} moyennes calculées')
            )

        # Résumé
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('✨ GÉNÉRATION TERMINÉE !'))
        self.stdout.write('='*60)
        self.stdout.write(f'📊 STATISTIQUES:')
        self.stdout.write(f'   • Notes créées: {total_notes}')
        self.stdout.write(f'   • Périodes traitées: {periodes.count()}')
        self.stdout.write(f'   • Matières: {len(matieres)}')
        self.stdout.write(f'   • Élèves: {len(eleves)}')
        self.stdout.write(f'   • Types d\'évaluation: {len(types_eval)}')
        self.stdout.write('='*60)
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('💡 Pour voir les notes:'))
        self.stdout.write('   • Frontend: http://localhost:5173/notes')
        self.stdout.write('   • Admin Django: http://localhost:8000/admin/grades/note/')
        self.stdout.write('='*60)
