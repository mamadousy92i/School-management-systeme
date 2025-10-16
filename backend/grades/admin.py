from django.contrib import admin
from .models import Periode, TypeEvaluation, Note, MoyenneEleve


@admin.register(Periode)
class PeriodeAdmin(admin.ModelAdmin):
    list_display = ['get_nom_display', 'annee_scolaire', 'date_debut', 'date_fin', 'est_cloturee']
    list_filter = ['annee_scolaire', 'est_cloturee', 'nom']
    search_fields = ['annee_scolaire__libelle']
    date_hierarchy = 'date_debut'
    fieldsets = (
        ('Période', {
            'fields': ('nom', 'annee_scolaire')
        }),
        ('Dates', {
            'fields': ('date_debut', 'date_fin', 'est_cloturee')
        }),
    )
    
    def get_nom_display(self, obj):
        return obj.get_nom_display()
    get_nom_display.short_description = 'Période'


@admin.register(TypeEvaluation)
class TypeEvaluationAdmin(admin.ModelAdmin):
    list_display = ['nom', 'coefficient', 'description']
    list_filter = ['nom', 'coefficient']
    search_fields = ['nom', 'description']
    fieldsets = (
        ('Informations', {
            'fields': ('nom', 'coefficient')
        }),
        ('Description', {
            'fields': ('description',)
        }),
    )


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['eleve', 'matiere', 'periode', 'type_evaluation', 'valeur', 'date_evaluation', 'professeur', 'created_at']
    list_filter = ['periode', 'matiere', 'type_evaluation', 'date_evaluation']
    search_fields = ['eleve__nom', 'eleve__prenom', 'eleve__matricule', 'matiere__nom']
    raw_id_fields = ['eleve', 'matiere', 'periode', 'type_evaluation', 'professeur']
    date_hierarchy = 'date_evaluation'
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Élève et Matière', {
            'fields': ('eleve', 'matiere')
        }),
        ('Évaluation', {
            'fields': ('periode', 'type_evaluation', 'valeur', 'date_evaluation')
        }),
        ('Enseignant', {
            'fields': ('professeur',)
        }),
        ('Observations', {
            'fields': ('appreciation',),
            'classes': ('collapse',)
        }),
        ('Historique', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MoyenneEleve)
class MoyenneEleveAdmin(admin.ModelAdmin):
    list_display = ['eleve', 'matiere', 'periode', 'moyenne', 'nombre_notes', 'total_points', 'calculated_at']
    list_filter = ['periode', 'matiere', 'calculated_at']
    search_fields = ['eleve__nom', 'eleve__prenom', 'eleve__matricule']
    raw_id_fields = ['eleve', 'matiere', 'periode']
    readonly_fields = ['moyenne', 'nombre_notes', 'total_points', 'calculated_at']
    date_hierarchy = 'calculated_at'
    fieldsets = (
        ('Élève et Matière', {
            'fields': ('eleve', 'matiere', 'periode')
        }),
        ('Résultats', {
            'fields': ('moyenne', 'nombre_notes', 'total_points')
        }),
        ('Calcul', {
            'fields': ('calculated_at',)
        }),
    )
