"""
Middleware pour le Multi-Tenancy
Injecte automatiquement l'école de l'utilisateur dans chaque requête
"""
from django.utils.deprecation import MiddlewareMixin
from academic.models import Ecole


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware qui injecte automatiquement l'école de l'utilisateur connecté
    dans l'objet request pour un accès facile dans les views et ViewSets
    """
    
    def process_request(self, request):
        """
        Appelé pour chaque requête avant que la vue soit exécutée
        L'école est maintenant chargée automatiquement par CustomJWTAuthentication
        """
        # Initialiser request.ecole à None par défaut
        request.ecole = None
        request.ecole_id = None
        
        # Si l'utilisateur est authentifié
        if request.user.is_authenticated:
            # L'école est déjà chargée par CustomJWTAuthentication
            if hasattr(request.user, 'ecole') and request.user.ecole:
                request.ecole = request.user.ecole
                request.ecole_id = request.user.ecole.id
                
                # Vérifier que l'abonnement est valide
                if not request.ecole.est_abonnement_valide():
                    request.abonnement_expire = True
                else:
                    request.abonnement_expire = False
            else:
                # L'utilisateur n'a pas d'école assignée
                request.no_ecole = True
        
        return None
    
    def process_response(self, request, response):
        """
        Appelé après que la vue ait été exécutée
        On peut ajouter des headers personnalisés si besoin
        """
        # Ajouter un header personnalisé pour le debugging
        if hasattr(request, 'ecole') and request.ecole:
            response['X-Tenant-School'] = request.ecole.code
        
        return response


class TenantSecurityMiddleware(MiddlewareMixin):
    """
    Middleware de sécurité supplémentaire pour s'assurer
    qu'aucune donnée d'une autre école ne fuite
    """
    
    def process_request(self, request):
        """
        Vérifie que l'utilisateur a bien une école assignée
        pour les endpoints critiques
        """
        # Liste des endpoints qui nécessitent une école
        critical_paths = [
            '/api/academic/eleves/',
            '/api/academic/classes/',
            '/api/professeurs/',
            '/api/academic/matieres/',
            '/api/grades/notes/',
            '/api/grades/bulletins/',
        ]
        
        # Vérifier si on est sur un endpoint critique
        if any(request.path.startswith(path) for path in critical_paths):
            if request.user.is_authenticated:
                if not hasattr(request.user, 'ecole') or not request.user.ecole:
                    # L'utilisateur n'a pas d'école
                    from django.http import JsonResponse
                    return JsonResponse(
                        {
                            'error': 'Vous devez être assigné à une école pour accéder à cette ressource',
                            'code': 'NO_SCHOOL_ASSIGNED'
                        },
                        status=403
                    )
        
        return None
