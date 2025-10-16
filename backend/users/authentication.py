"""
Custom JWT Authentication avec chargement automatique de l'école
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class CustomJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication personnalisé qui charge automatiquement
    la relation 'ecole' de l'utilisateur
    """
    
    def get_user(self, validated_token):
        """
        Surcharge pour charger l'utilisateur avec select_related('ecole')
        """
        try:
            user_id = validated_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]
        except KeyError:
            return None
        
        # Charger l'utilisateur avec l'école en une seule requête
        User = self.user_model
        try:
            user = User.objects.select_related('ecole').get(pk=user_id)
            return user
        except User.DoesNotExist:
            return None
