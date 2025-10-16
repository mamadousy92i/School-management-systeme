from django.db import models
from django.core.exceptions import ValidationError
from users.models import Professeur


class Ecole(models.Model):
    """
    Modèle représentant une école (Tenant pour Multi-Tenancy)
    Chaque école est isolée des autres
    """
    # Informations de base
    nom = models.CharField(max_length=200, verbose_name="Nom de l'école")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code unique")
    directrice = models.CharField(max_length=200, verbose_name="Directrice/Directeur")
    devise = models.CharField(max_length=200, default="Excellence, Discipline, Réussite")
    
    # Contact
    adresse = models.TextField(verbose_name="Adresse")
    telephone = models.CharField(max_length=20, verbose_name="Téléphone")
    email = models.EmailField(verbose_name="Email")
    
    # Branding
    logo = models.ImageField(
        upload_to='ecoles/logos/', 
        null=True, 
        blank=True,
        verbose_name="Logo"
    )
    
    # Abonnement SaaS
    abonnement_actif = models.BooleanField(
        default=True,
        verbose_name="Abonnement actif"
    )
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    date_expiration = models.DateField(
        null=True, 
        blank=True,
        verbose_name="Date d'expiration"
    )
    
    # Limites (selon le plan)
    max_eleves = models.IntegerField(
        default=500,
        verbose_name="Nombre maximum d'élèves"
    )
    max_professeurs = models.IntegerField(
        default=50,
        verbose_name="Nombre maximum d'enseignants"
    )
    
    class Meta:
        verbose_name = 'École'
        verbose_name_plural = 'Écoles'
        ordering = ['nom']
    
    def __str__(self):
        return f"{self.nom} ({self.code})"
    
    def est_abonnement_valide(self):
        """Vérifie si l'abonnement est valide"""
        if not self.abonnement_actif:
            return False
        if self.date_expiration:
            from django.utils import timezone
            return self.date_expiration >= timezone.now().date()
        return True


class AnneeScolaire(models.Model):
    """Modèle pour l'année scolaire"""
    libelle = models.CharField(max_length=20)  # Ex: "2023-2024"
    date_debut = models.DateField()
    date_fin = models.DateField()
    active = models.BooleanField(default=False)
    ecole = models.ForeignKey(
        Ecole,
        on_delete=models.CASCADE,
        related_name='annees_scolaires',
        null=True,  # Temporaire pour la migration
        blank=True,
        verbose_name="École"
    )
    
    class Meta:
        verbose_name = 'Année Scolaire'
        verbose_name_plural = 'Années Scolaires'
        ordering = ['-date_debut']
        unique_together = ['libelle', 'ecole']  # Année unique par école
    
    def __str__(self):
        return self.libelle
    
    def save(self, *args, **kwargs):
        # Si cette année est active, désactiver les autres
        if self.active:
            AnneeScolaire.objects.exclude(pk=self.pk).update(active=False)
        super().save(*args, **kwargs)


class Classe(models.Model):
    """Modèle pour les classes"""
    NIVEAU_CHOICES = [
        # Système primaire sénégalais
        ('ci', 'CI - Cours d\'Initiation'),
        ('cp', 'CP - Cours Préparatoire'),
        ('ce1', 'CE1 - Cours Élémentaire 1'),
        ('ce2', 'CE2 - Cours Élémentaire 2'),
        ('cm1', 'CM1 - Cours Moyen 1'),
        ('cm2', 'CM2 - Cours Moyen 2'),
    ]
    
    nom = models.CharField(max_length=100)  # Ex: "CM1-A" (généré automatiquement)
    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES)
    section = models.CharField(max_length=10, blank=True, null=True, help_text="Section (A, B, C, etc.) - optionnel")
    effectif_max = models.IntegerField(default=40)
    annee_scolaire = models.ForeignKey(AnneeScolaire, on_delete=models.CASCADE, related_name='classes')
    professeur_principal = models.ForeignKey(
        Professeur, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='classes_principales'
    )
    ecole = models.ForeignKey(
        Ecole,
        on_delete=models.CASCADE,
        related_name='classes',
        null=True,  # Temporaire pour la migration
        blank=True,
        verbose_name="École"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Classe'
        verbose_name_plural = 'Classes'
        ordering = ['niveau', 'section']
        unique_together = ['niveau', 'section', 'annee_scolaire', 'ecole']
    
    def save(self, *args, **kwargs):
        # Générer automatiquement le nom à partir du niveau et de la section
        niveau_display = self.get_niveau_display().split(' - ')[0]  # Ex: "CI"
        if self.section:
            self.nom = f"{niveau_display}-{self.section}"  # Ex: "CM1-A"
        else:
            self.nom = niveau_display  # Ex: "CM1"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nom} - {self.annee_scolaire.libelle}"
    
    @property
    def effectif_actuel(self):
        return self.eleves.count()


class Matiere(models.Model):
    """Modèle pour les matières"""
    nom = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
    coefficient = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    description = models.TextField(blank=True, null=True)
    ecole = models.ForeignKey(
        Ecole,
        on_delete=models.CASCADE,
        related_name='matieres',
        null=True,  # Temporaire pour la migration
        blank=True,
        verbose_name="École"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Matière'
        verbose_name_plural = 'Matières'
        ordering = ['nom']
        unique_together = ['code', 'ecole']  # Code unique par école
    
    def __str__(self):
        return f"{self.nom} (Coef: {self.coefficient})"


class Eleve(models.Model):
    """Modèle pour les élèves"""
    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    
    # Informations personnelles
    matricule = models.CharField(max_length=20)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES)
    date_naissance = models.DateField()
    lieu_naissance = models.CharField(max_length=100)
    
    # Informations de contact
    telephone_eleve = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    adresse = models.TextField()
    
    # Informations parentales
    nom_pere = models.CharField(max_length=100, blank=True, null=True)
    telephone_pere = models.CharField(max_length=15, blank=True, null=True)
    nom_mere = models.CharField(max_length=100, blank=True, null=True)
    telephone_mere = models.CharField(max_length=15, blank=True, null=True)
    tuteur = models.CharField(max_length=100, blank=True, null=True)
    telephone_tuteur = models.CharField(max_length=15, blank=True, null=True)
    
    # Informations académiques
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='eleves')
    ecole = models.ForeignKey(
        Ecole,
        on_delete=models.CASCADE,
        related_name='eleves',
        null=True,  # Temporaire pour la migration
        blank=True,
        verbose_name="École"
    )
    date_inscription = models.DateField(auto_now_add=True)
    statut = models.CharField(
        max_length=20,
        choices=[
            ('actif', 'Actif'),           # Élève inscrit et en cours d'année
            ('admis', 'Admis'),           # Élève ayant réussi son année
            ('redouble', 'Redouble'),     # Élève redoublant
            ('transfere', 'Transféré'),   # Élève transféré vers autre école
            ('abandonne', 'Abandonné'),   # Élève ayant abandonné
            ('diplome', 'Diplômé'),       # Élève ayant fini le cycle
        ],
        default='actif',
        help_text='Statut actuel de l\'élève dans le système'
    )
    
    # Photo
    photo = models.ImageField(upload_to='eleves/photos/', blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Élève'
        verbose_name_plural = 'Élèves'
        ordering = ['nom', 'prenom']
        unique_together = ['matricule', 'ecole']  # Matricule unique par école
    
    def __str__(self):
        return f"{self.nom} {self.prenom} - {self.matricule}"
    
    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_naissance.year - (
            (today.month, today.day) < (self.date_naissance.month, self.date_naissance.day)
        )
    
    @property
    def nom_complet(self):
        return f"{self.nom} {self.prenom}"


class MatiereClasse(models.Model):
    """Modèle pour lier les matières aux classes avec les professeurs"""
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='matieres_enseignees')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='classes_concernees')
    professeur = models.ForeignKey(Professeur, on_delete=models.SET_NULL, null=True, blank=True, related_name='enseignements')
    ecole = models.ForeignKey(
        Ecole,
        on_delete=models.CASCADE,
        related_name='matieres_classes',
        null=True,  # Temporaire pour la migration
        blank=True,
        verbose_name="École"
    )
    
    class Meta:
        verbose_name = 'Matière-Classe'
        verbose_name_plural = 'Matières-Classes'
        unique_together = ['classe', 'matiere', 'ecole']
    
    def __str__(self):
        prof = f" - Prof. {self.professeur.user.get_full_name()}" if self.professeur else ""
        return f"{self.matiere.nom} en {self.classe.nom}{prof}"
