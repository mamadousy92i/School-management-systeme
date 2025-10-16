from django.db import models
from users.models import Professeur


class Ecole(models.Model):
    """Modèle pour l'école"""
    nom = models.CharField(max_length=200, unique=True, help_text="Nom complet de l'école")
    sigle = models.CharField(max_length=20, blank=True, help_text="Sigle ou abréviation")
    adresse = models.TextField(help_text="Adresse complète de l'école")
    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    logo = models.ImageField(upload_to='ecoles/logos/', blank=True, null=True)
    devise = models.CharField(max_length=200, blank=True, help_text="Devise de l'école")
    directeur = models.CharField(max_length=100, blank=True, help_text="Nom du directeur")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'École'
        verbose_name_plural = 'Écoles'
        ordering = ['nom']
    
    def __str__(self):
        return self.nom


class AnneeScolaire(models.Model):
    """Modèle pour l'année scolaire"""
    libelle = models.CharField(max_length=20, unique=True)  # Ex: "2023-2024"
    date_debut = models.DateField()
    date_fin = models.DateField()
    active = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Année Scolaire'
        verbose_name_plural = 'Années Scolaires'
        ordering = ['-date_debut']
    
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
    
    nom = models.CharField(max_length=100)  # Ex: "6ème A"
    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES)
    effectif_max = models.IntegerField(default=40)
    annee_scolaire = models.ForeignKey(AnneeScolaire, on_delete=models.CASCADE, related_name='classes')
    professeur_principal = models.ForeignKey(
        Professeur, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='classes_principales'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Classe'
        verbose_name_plural = 'Classes'
        ordering = ['niveau', 'nom']
        unique_together = ['nom', 'annee_scolaire']
    
    def __str__(self):
        return f"{self.nom} - {self.annee_scolaire.libelle}"
    
    @property
    def effectif_actuel(self):
        return self.eleves.count()


class Matiere(models.Model):
    """Modèle pour les matières"""
    nom = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    coefficient = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Matière'
        verbose_name_plural = 'Matières'
        ordering = ['nom']
    
    def __str__(self):
        return f"{self.nom} (Coef: {self.coefficient})"


class Eleve(models.Model):
    """Modèle pour les élèves"""
    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    
    # Informations personnelles
    matricule = models.CharField(max_length=20, unique=True)
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
    date_inscription = models.DateField(auto_now_add=True)
    statut = models.CharField(
        max_length=20,
        choices=[
            ('actif', 'Actif'),
            ('inactif', 'Inactif'),
            ('abandonne', 'Abandonné'),
        ],
        default='actif'
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
    
    class Meta:
        verbose_name = 'Matière-Classe'
        verbose_name_plural = 'Matières-Classes'
        unique_together = ['classe', 'matiere']
    
    def __str__(self):
        prof = f" - Prof. {self.professeur.user.get_full_name()}" if self.professeur else ""
        return f"{self.matiere.nom} en {self.classe.nom}{prof}"
