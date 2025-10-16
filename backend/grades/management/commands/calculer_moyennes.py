from django.core.management.base import BaseCommand
from grades.models import MoyenneEleve, Periode, Note
from academic.models import Eleve
from grades.models import Matiere


class Command(BaseCommand):
    help = 'Calcule ou recalcule toutes les moyennes pour tous les élèves'

    def add_arguments(self, parser):
        parser.add_argument(
            '--periode',
            type=int,
            help='ID de la période à traiter (sinon toutes)'
        )
        parser.add_argument(
            '--eleve',
            type=int,
            help='ID de l\'élève à traiter (sinon tous)'
        )

    def handle(self, *args, **options):
        periode_id = options.get('periode')
        eleve_id = options.get('eleve')

        self.stdout.write(self.style.SUCCESS('🧮 CALCUL DES MOYENNES'))
        self.stdout.write('=' * 60)

        # Filtrer les périodes
        if periode_id:
            periodes = Periode.objects.filter(id=periode_id)
        else:
            periodes = Periode.objects.all()

        if not periodes.exists():
            self.stdout.write(self.style.ERROR('❌ Aucune période trouvée'))
            return

        # Filtrer les élèves
        if eleve_id:
            eleves = Eleve.objects.filter(id=eleve_id, statut='actif')
        else:
            eleves = Eleve.objects.filter(statut='actif')

        if not eleves.exists():
            self.stdout.write(self.style.ERROR('❌ Aucun élève trouvé'))
            return

        total_moyennes = 0

        for periode in periodes:
            self.stdout.write(f'\n📅 {periode.get_nom_display()}')
            self.stdout.write('-' * 60)

            periode_moyennes = 0

            for eleve in eleves:
                # Trouver les matières pour lesquelles l'élève a des notes
                matieres_avec_notes = Matiere.objects.filter(
                    notes__eleve=eleve,
                    notes__periode=periode
                ).distinct()

                if not matieres_avec_notes.exists():
                    continue

                self.stdout.write(f'\n👤 {eleve.nom} {eleve.prenom} ({eleve.classe.nom})')

                for matiere in matieres_avec_notes:
                    # Calculer la moyenne
                    moyenne = MoyenneEleve.calculer_moyenne(eleve, matiere, periode)

                    if moyenne:
                        periode_moyennes += 1
                        total_moyennes += 1
                        self.stdout.write(
                            f'   ✅ {matiere.nom}: {moyenne.moyenne}/10'
                        )

            self.stdout.write(
                self.style.SUCCESS(f'\n   📊 {periode_moyennes} moyenne(s) calculée(s) pour cette période')
            )

        # Résumé final
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('✨ CALCUL TERMINÉ !'))
        self.stdout.write('=' * 60)
        self.stdout.write(f'📊 RÉSUMÉ:')
        self.stdout.write(f'   • Périodes traitées: {periodes.count()}')
        self.stdout.write(f'   • Élèves traités: {eleves.count()}')
        self.stdout.write(f'   • Moyennes calculées: {total_moyennes}')
        self.stdout.write('=' * 60)
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('💡 Conseil:'))
        self.stdout.write('   Actualisez la page frontend pour voir les moyennes !')
        self.stdout.write('=' * 60)
