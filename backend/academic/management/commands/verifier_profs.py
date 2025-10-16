from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Professeur
from academic.models import Classe

User = get_user_model()


class Command(BaseCommand):
    help = 'Vérifie et affiche les professeurs principaux des classes'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('📚 VÉRIFICATION DES PROFESSEURS PRINCIPAUX'))
        self.stdout.write('='*70)
        
        # Lister toutes les classes
        classes = Classe.objects.all()
        
        if not classes.exists():
            self.stdout.write(self.style.ERROR('❌ Aucune classe trouvée'))
            self.stdout.write('   Exécutez: python manage.py populate_db')
            return
        
        self.stdout.write(f'\n📊 {classes.count()} classe(s) trouvée(s)\n')
        
        sans_prof = []
        
        for classe in classes:
            if classe.professeur_principal:
                prof = classe.professeur_principal
                user = prof.user
                self.stdout.write(
                    f'✅ {classe.nom:15s} → Prof. Principal: {user.get_full_name():30s} (User: {user.username})'
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  {classe.nom:15s} → Aucun professeur principal')
                )
                sans_prof.append(classe)
        
        # Si des classes sans prof principal
        if sans_prof:
            self.stdout.write('\n' + '='*70)
            self.stdout.write(self.style.WARNING(f'⚠️  {len(sans_prof)} classe(s) sans professeur principal'))
            
            # Proposer d'assigner automatiquement
            profs = list(Professeur.objects.all())
            if profs:
                self.stdout.write(f'\n💡 Assignation automatique...\n')
                for i, classe in enumerate(sans_prof):
                    prof = profs[i % len(profs)]
                    classe.professeur_principal = prof
                    classe.save()
                    self.stdout.write(
                        f'   ✅ {classe.nom} → {prof.user.get_full_name()}'
                    )
                self.stdout.write(self.style.SUCCESS('\n✅ Assignation terminée !'))
        
        # Lister tous les professeurs et leurs classes
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('👨‍🏫 PROFESSEURS ET LEURS CLASSES'))
        self.stdout.write('='*70 + '\n')
        
        professeurs = Professeur.objects.all()
        
        for prof in professeurs:
            user = prof.user
            mes_classes = Classe.objects.filter(professeur_principal=prof)
            
            if mes_classes.exists():
                classes_noms = ', '.join([c.nom for c in mes_classes])
                self.stdout.write(
                    f'✅ {user.get_full_name():30s} (Login: {user.username:15s}) → {classes_noms}'
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  {user.get_full_name():30s} (Login: {user.username:15s}) → Aucune classe')
                )
        
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('✨ Vérification terminée !'))
        self.stdout.write('='*70)
