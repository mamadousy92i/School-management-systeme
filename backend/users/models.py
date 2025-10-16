from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Modèle utilisateur de base étendu"""
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('professeur', 'Professeur'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='professeur')
    ecole = models.ForeignKey('academic.Ecole', on_delete=models.CASCADE, related_name='utilisateurs', null=True, blank=True, help_text="École de rattachement")
    telephone = models.CharField(max_length=15, blank=True, null=True)
    photo = models.ImageField(upload_to='users/photos/', blank=True, null=True)
    date_naissance = models.DateField(blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_professeur(self):
        return self.role == 'professeur'


class Admin(models.Model):
    """Modèle pour les administrateurs avec informations supplémentaires"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    fonction = models.CharField(max_length=100, default='Administrateur')
    
    class Meta:
        verbose_name = 'Administrateur'
        verbose_name_plural = 'Administrateurs'
    
    def __str__(self):
        return f"Admin: {self.user.get_full_name()}"


class Professeur(models.Model):
    """Modèle pour les professeurs"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='professeur_profile')
    matricule = models.CharField(max_length=20, unique=True)
    specialite = models.CharField(max_length=100, blank=True, null=True)
    diplome = models.CharField(max_length=200, blank=True, null=True)
    date_embauche = models.DateField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Professeur'
        verbose_name_plural = 'Professeurs'
    
    def __str__(self):
        return f"Prof. {self.user.get_full_name()} - {self.matricule}"
