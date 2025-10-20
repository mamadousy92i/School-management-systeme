from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from academic.models import Eleve, Matiere, AnneeScolaire
from users.models import Professeur


class Periode(models.Model):
    """Modèle pour les périodes d'évaluation (Trimestres)"""
    PERIODE_CHOICES = [
        ('trimestre1', 'Trimestre 1'),
        ('trimestre2', 'Trimestre 2'),
        ('trimestre3', 'Trimestre 3'),
    ]
    
    nom = models.CharField(max_length=20, choices=PERIODE_CHOICES)
    annee_scolaire = models.ForeignKey(AnneeScolaire, on_delete=models.CASCADE, related_name='periodes')
    date_debut = models.DateField()
    date_fin = models.DateField()
    est_cloturee = models.BooleanField(default=False)  # Une fois clôturée, les notes ne peuvent plus être modifiées
    
    class Meta:
        verbose_name = 'Période'
        verbose_name_plural = 'Périodes'
        ordering = ['annee_scolaire', 'date_debut']
        unique_together = ['nom', 'annee_scolaire']
    
    def __str__(self):
        return f"{self.get_nom_display()} - {self.annee_scolaire.libelle}"


class TypeEvaluation(models.Model):
    """Types d'évaluation (Devoir, Contrôle, Composition)"""
    TYPE_CHOICES = [
        ('devoir', 'Devoir'),
        ('controle', 'Contrôle'),
        ('composition', 'Composition'),
    ]
    
    nom = models.CharField(max_length=20, choices=TYPE_CHOICES, unique=True)
    coefficient = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=1.0,
        help_text="Coefficient pour le calcul de la moyenne"
    )
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Type d\'Évaluation'
        verbose_name_plural = 'Types d\'Évaluation'
        ordering = ['coefficient']
    
    def __str__(self):
        return f"{self.get_nom_display()} (Coef: {self.coefficient})"


class Note(models.Model):
    """Modèle pour les notes des élèves"""
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='notes')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='notes')
    periode = models.ForeignKey(Periode, on_delete=models.CASCADE, related_name='notes')
    type_evaluation = models.ForeignKey(TypeEvaluation, on_delete=models.CASCADE, related_name='notes')
    
    valeur = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('10'))],
        help_text="Note sur 10 (école primaire)"
    )
    
    # Métadonnées
    date_evaluation = models.DateField()
    professeur = models.ForeignKey(
        Professeur, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='notes_saisies',
        help_text="Enseignant ayant saisi la note"
    )
    commentaire = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Note'
        verbose_name_plural = 'Notes'
        ordering = ['-date_evaluation']
        # Un élève ne peut avoir qu'une seule note d'un type donné pour une matière et période
        unique_together = ['eleve', 'matiere', 'periode', 'type_evaluation']
    
    def __str__(self):
        return f"{self.eleve.nom_complet} - {self.matiere.nom} : {self.valeur}/20"
    
    def clean(self):
        """Validation personnalisée"""
        from django.core.exceptions import ValidationError
        
        # Vérifier que la date d'évaluation est dans la période
        if self.date_evaluation < self.periode.date_debut or self.date_evaluation > self.periode.date_fin:
            raise ValidationError("La date d'évaluation doit être dans la période sélectionnée")
        
        # Empêcher la modification si la période est clôturée
        if self.periode.est_cloturee and self.pk:  # Si c'est une modification
            raise ValidationError("Cette période est clôturée. Les notes ne peuvent plus être modifiées.")


class MoyenneEleve(models.Model):
    """Modèle pour stocker les moyennes calculées (optimisation)"""
    eleve = models.ForeignKey(Eleve, on_delete=models.CASCADE, related_name='moyennes')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='moyennes')
    periode = models.ForeignKey(Periode, on_delete=models.CASCADE, related_name='moyennes')
    
    # Moyennes calculées
    moyenne = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(20)],
        help_text="Moyenne de la matière pour la période"
    )
    
    # Détails du calcul
    nombre_notes = models.IntegerField(default=0)
    total_points = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    
    # Timestamps
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Moyenne Élève'
        verbose_name_plural = 'Moyennes Élèves'
        ordering = ['eleve', 'periode', 'matiere']
        unique_together = ['eleve', 'matiere', 'periode']
    
    def __str__(self):
        return f"{self.eleve.nom_complet} - {self.matiere.nom} : {self.moyenne}/20"
    
    @classmethod
    def calculer_moyenne(cls, eleve, matiere, periode):
        """Calcule et enregistre la moyenne d'un élève pour une matière et période"""
        from django.db.models import Avg, Sum, Count
        
        # Récupérer toutes les notes avec leurs coefficients
        notes = Note.objects.filter(
            eleve=eleve,
            matiere=matiere,
            periode=periode
        ).select_related('type_evaluation')
        
        if not notes.exists():
            return None
        
        # Calcul de la moyenne pondérée
        total_points = 0
        total_coefficients = 0
        
        for note in notes:
            coef_type = note.type_evaluation.coefficient
            total_points += float(note.valeur) * float(coef_type)
            total_coefficients += float(coef_type)
        
        if total_coefficients == 0:
            return None
        
        moyenne_calculee = total_points / total_coefficients
        
        # Créer ou mettre à jour la moyenne
        moyenne_obj, created = cls.objects.update_or_create(
            eleve=eleve,
            matiere=matiere,
            periode=periode,
            defaults={
                'moyenne': round(moyenne_calculee, 2),
                'nombre_notes': notes.count(),
                'total_points': total_points,
            }
        )
        
        return moyenne_obj
    
    @classmethod
    def calculer_moyenne_generale(cls, eleve, periode):
        """Calcule la moyenne générale d'un élève pour une période"""
        moyennes = cls.objects.filter(
            eleve=eleve,
            periode=periode
        ).select_related('matiere')
        
        if not moyennes.exists():
            return None
        
        # Moyenne générale pondérée par les coefficients des matières
        total_points = 0
        total_coefficients = 0
        
        for moyenne in moyennes:
            coef_matiere = float(moyenne.matiere.coefficient)
            total_points += float(moyenne.moyenne) * coef_matiere
            total_coefficients += coef_matiere
        
        if total_coefficients == 0:
            return None
        
        return round(total_points / total_coefficients, 2)


# Signal pour recalculer automatiquement les moyennes
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=Note)
def recalculer_moyenne_apres_note(sender, instance, **kwargs):
    """Recalcule automatiquement la moyenne après ajout/modification d'une note"""
    MoyenneEleve.calculer_moyenne(
        instance.eleve,
        instance.matiere,
        instance.periode
    )

@receiver(post_delete, sender=Note)
def recalculer_moyenne_apres_suppression(sender, instance, **kwargs):
    """Recalcule la moyenne après suppression d'une note"""
    MoyenneEleve.calculer_moyenne(
        instance.eleve,
        instance.matiere,
        instance.periode
    )
