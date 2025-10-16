from django.contrib import admin
from .models import Ecole, AnneeScolaire, Classe, Matiere, Eleve, MatiereClasse


@admin.register(Ecole)
class EcoleAdmin(admin.ModelAdmin):
    list_display = ['nom', 'sigle', 'directeur', 'telephone', 'email', 'active', 'created_at']
    list_filter = ['active', 'created_at']
    search_fields = ['nom', 'sigle', 'directeur', 'adresse', 'email']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'sigle', 'active')
        }),
        ('Contact', {
            'fields': ('adresse', 'telephone', 'email')
        }),
        ('Direction', {
            'fields': ('directeur', 'devise')
        }),
        ('Visuel', {
            'fields': ('logo',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AnneeScolaire)
class AnneeScolaireAdmin(admin.ModelAdmin):
    list_display = ['libelle', 'date_debut', 'date_fin', 'active']
    list_filter = ['active', 'date_debut']
    search_fields = ['libelle']
    date_hierarchy = 'date_debut'
    fieldsets = (
        ('Informations', {
            'fields': ('libelle', 'active')
        }),
        ('Période', {
            'fields': ('date_debut', 'date_fin')
        }),
    )


@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ['nom', 'niveau', 'annee_scolaire', 'professeur_principal', 'effectif_actuel', 'effectif_max', 'created_at']
    list_filter = ['niveau', 'annee_scolaire', 'created_at']
    search_fields = ['nom']
    raw_id_fields = ['professeur_principal']
    readonly_fields = ['effectif_actuel', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'niveau', 'annee_scolaire')
        }),
        ('Encadrement', {
            'fields': ('professeur_principal',)
        }),
        ('Capacité', {
            'fields': ('effectif_max', 'effectif_actuel')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ['nom', 'code', 'coefficient', 'description']
    list_filter = ['coefficient']
    search_fields = ['nom', 'code', 'description']
    fieldsets = (
        ('Informations', {
            'fields': ('nom', 'code', 'coefficient')
        }),
        ('Description', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Eleve)
class EleveAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'nom', 'prenom', 'sexe', 'classe', 'statut', 'date_naissance', 'age']
    list_filter = ['sexe', 'statut', 'classe', 'date_inscription']
    search_fields = ['matricule', 'nom', 'prenom', 'lieu_naissance']
    raw_id_fields = ['classe']
    readonly_fields = ['age', 'date_inscription', 'nom_complet']
    date_hierarchy = 'date_inscription'
    fieldsets = (
        ('Identification', {
            'fields': ('matricule', 'nom', 'prenom', 'nom_complet', 'sexe', 'photo')
        }),
        ('Naissance', {
            'fields': ('date_naissance', 'lieu_naissance', 'age')
        }),
        ('Scolarité', {
            'fields': ('classe', 'statut', 'date_inscription')
        }),
        ('Contact', {
            'fields': ('adresse', 'telephone', 'email')
        }),
        ('Parents/Tuteurs', {
            'fields': ('nom_pere', 'telephone_pere', 'nom_mere', 'telephone_mere', 'nom_tuteur', 'telephone_tuteur'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MatiereClasse)
class MatiereClasseAdmin(admin.ModelAdmin):
    list_display = ['classe', 'matiere', 'professeur']
    list_filter = ['classe', 'matiere']
    raw_id_fields = ['classe', 'matiere', 'professeur']
