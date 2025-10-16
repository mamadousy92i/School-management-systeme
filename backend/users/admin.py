from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Admin, Professeur


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'ecole', 'is_active']
    list_filter = ['role', 'ecole', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Rattachement', {
            'fields': ('ecole',)
        }),
        ('Informations supplémentaires', {
            'fields': ('role', 'telephone', 'photo', 'date_naissance', 'adresse')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Rattachement', {
            'fields': ('ecole',)
        }),
        ('Informations supplémentaires', {
            'fields': ('role', 'telephone', 'email', 'first_name', 'last_name')
        }),
    )


@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_user_email', 'fonction']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'fonction']
    raw_id_fields = ['user']
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user',)
        }),
        ('Fonction', {
            'fields': ('fonction',)
        }),
    )
    
    def get_user_email(self, obj):
        return obj.user.email
    get_user_email.short_description = 'Email'


@admin.register(Professeur)
class ProfesseurAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_user_email', 'get_user_ecole', 'matricule', 'specialite', 'date_embauche']
    list_filter = ['specialite', 'date_embauche', 'user__ecole']
    search_fields = ['user__username', 'user__email', 'matricule', 'specialite', 'user__first_name', 'user__last_name']
    raw_id_fields = ['user']
    date_hierarchy = 'date_embauche'
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user',)
        }),
        ('Identification', {
            'fields': ('matricule', 'specialite')
        }),
        ('Formation', {
            'fields': ('diplome',)
        }),
        ('Embauche', {
            'fields': ('date_embauche',)
        }),
    )
    
    def get_user_email(self, obj):
        return obj.user.email
    get_user_email.short_description = 'Email'
    
    def get_user_ecole(self, obj):
        return obj.user.ecole.nom if obj.user.ecole else '-'
    get_user_ecole.short_description = 'École'
