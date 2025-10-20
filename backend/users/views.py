from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Admin, Professeur
from django.contrib.auth.password_validation import validate_password
from .serializers import (
    UserSerializer, AdminSerializer, ProfesseurSerializer,
    LoginSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Vue pour la connexion"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': user_data
            })
        else:
            return Response(
                {'error': 'Identifiants invalides'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Vue pour la déconnexion"""
    # Rendre la déconnexion idempotente: même sans refresh_token, répondre OK
    refresh_token = request.data.get("refresh_token")
    if not refresh_token:
        return Response({"message": "Déconnexion effectuée"}, status=status.HTTP_205_RESET_CONTENT)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Déconnexion réussie"}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        # Si le token est invalide/expiré, considérer la session terminée
        return Response({"message": "Déconnexion effectuée"}, status=status.HTTP_205_RESET_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Changer le mot de passe de l'utilisateur connecté de manière sécurisée.
    Corps attendu: {"old_password": str, "new_password": str}
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response({"detail": "old_password et new_password sont requis"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old_password):
        return Response({"detail": "Ancien mot de passe incorrect"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password, user)
    except Exception as e:
        # e peut être une liste/erreurs; normaliser la réponse
        errors = getattr(e, 'messages', [str(e)])
        return Response({"detail": errors}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({"detail": "Mot de passe modifié avec succès"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Vue pour obtenir le profil de l'utilisateur connecté"""
    user = request.user
    serializer = UserSerializer(user)
    
    profile_data = None
    if user.is_admin():
        try:
            profile = Admin.objects.get(user=user)
            profile_data = AdminSerializer(profile).data
        except Admin.DoesNotExist:
            pass
    elif user.is_professeur():
        try:
            profile = Professeur.objects.get(user=user)
            profile_data = ProfesseurSerializer(profile).data
        except Professeur.DoesNotExist:
            pass
    
    return Response({
        'user': serializer.data,
        'profile': profile_data
    })


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des utilisateurs (admin uniquement)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    def update(self, request, *args, **kwargs):
        if 'password' in request.data:
            return Response({'detail': 'Utilisez /api/auth/change_password/ pour changer le mot de passe.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if 'password' in request.data:
            return Response({'detail': 'Utilisez /api/auth/change_password/ pour changer le mot de passe.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtenir les infos de l'utilisateur connecté"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class AdminViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des administrateurs"""
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Admin.objects.all()
        return Admin.objects.filter(user=user)


class ProfesseurViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des professeurs"""
    queryset = Professeur.objects.all()
    serializer_class = ProfesseurSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Professeur.objects.all()
        return Professeur.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def profil_complet(self, request):
        """Obtenir le profil complet du professeur avec ses classes et matières"""
        try:
            professeur = Professeur.objects.get(user=request.user)
        except Professeur.DoesNotExist:
            return Response(
                {'error': 'Profil professeur introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Importer ici pour éviter les imports circulaires
        from academic.models import Classe, MatiereClasse
        from academic.serializers import ClasseSerializer, MatiereClasseSerializer
        
        # Classes où le professeur est principal
        classes_principales = Classe.objects.filter(professeur_principal=professeur)
        
        # Matières enseignées par le professeur
        matieres_enseignees = MatiereClasse.objects.filter(
            professeur=professeur
        ).select_related('classe', 'matiere')
        
        # Toutes les classes où le professeur enseigne
        classes_ids = matieres_enseignees.values_list('classe', flat=True).distinct()
        toutes_classes = Classe.objects.filter(id__in=classes_ids)
        
        data = {
            'professeur': ProfesseurSerializer(professeur).data,
            'user': UserSerializer(request.user).data,
            'classes_principales': ClasseSerializer(classes_principales, many=True).data,
            'matieres_enseignees': MatiereClasseSerializer(matieres_enseignees, many=True).data,
            'toutes_classes': ClasseSerializer(toutes_classes, many=True).data,
            'statistiques': {
                'nombre_classes_principales': classes_principales.count(),
                'nombre_classes_enseignees': toutes_classes.count(),
                'nombre_matieres': matieres_enseignees.count()
            }
        }
        
        return Response(data)
