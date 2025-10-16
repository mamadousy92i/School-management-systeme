from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permission pour les administrateurs uniquement.
    Utilisé pour les fonctionnalités réservées à l'administration.
    """
    message = "Seuls les administrateurs ont accès à cette fonctionnalité."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin()


class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Permission pour les enseignants ET les administrateurs.
    Utilisé pour les fonctionnalités accessibles aux deux rôles.
    """
    message = "Vous devez être enseignant ou administrateur pour accéder à cette fonctionnalité."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class CanManageOwnClassOnly(permissions.BasePermission):
    """
    Permission pour gérer uniquement sa propre classe.
    L'enseignant ne peut accéder qu'aux données de SA classe.
    L'admin a accès à tout.
    """
    message = "Vous ne pouvez accéder qu'aux données de votre propre classe."
    
    def has_object_permission(self, request, view, obj):
        # Les admins ont accès à tout
        if request.user.is_admin():
            return True
        
        # Les enseignants ne peuvent accéder qu'à leur classe
        if request.user.is_professeur():
            try:
                enseignant = request.user.professeur_profile
                # Vérifie si l'enseignant est le titulaire de la classe de l'élève
                if hasattr(obj, 'classe'):
                    return obj.classe.professeur_principal == enseignant
                # Si l'objet est une classe elle-même
                elif hasattr(obj, 'professeur_principal'):
                    return obj.professeur_principal == enseignant
            except:
                return False
        
        return False


class IsReadOnlyOrAdmin(permissions.BasePermission):
    """
    Permission en lecture seule pour les enseignants,
    lecture/écriture pour les admins.
    """
    message = "Vous n'avez que les droits de lecture."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les admins peuvent tout faire
        if request.user.is_admin():
            return True
        
        # Les enseignants peuvent uniquement lire (GET, HEAD, OPTIONS)
        if request.user.is_professeur():
            return request.method in permissions.SAFE_METHODS
        
        return False


class CanManageOwnProfile(permissions.BasePermission):
    """
    Permission pour gérer son propre profil.
    Chaque utilisateur peut modifier son propre profil.
    """
    message = "Vous ne pouvez modifier que votre propre profil."
    
    def has_object_permission(self, request, view, obj):
        # Les admins peuvent modifier n'importe quel profil
        if request.user.is_admin():
            return True
        
        # Les utilisateurs peuvent modifier leur propre profil
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return obj == request.user
