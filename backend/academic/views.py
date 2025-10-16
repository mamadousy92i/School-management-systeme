from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
import csv
import openpyxl
from io import TextIOWrapper
from datetime import datetime

from .models import AnneeScolaire, Classe, Matiere, Eleve, MatiereClasse
from .serializers import (
    AnneeScolaireSerializer, ClasseSerializer, MatiereSerializer,
    EleveSerializer, EleveListSerializer, EleveImportSerializer,
    MatiereClasseSerializer
)
from users.models import Professeur
from users.permissions import IsAdminUser, IsTeacherOrAdmin, IsReadOnlyOrAdmin


class AnneeScolaireViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des années scolaires - Admin uniquement pour modification"""
    queryset = AnneeScolaire.objects.all()
    serializer_class = AnneeScolaireSerializer
    permission_classes = [IsReadOnlyOrAdmin]  # Enseignants: lecture seule, Admin: tout
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return AnneeScolaire.objects.all()
        # Les professeurs peuvent voir toutes les années
        return AnneeScolaire.objects.all()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtenir l'année scolaire active"""
        annee = AnneeScolaire.objects.filter(active=True).first()
        if annee:
            serializer = self.get_serializer(annee)
            return Response(serializer.data)
        return Response(
            {'error': 'Aucune année scolaire active'},
            status=status.HTTP_404_NOT_FOUND
        )


class ClasseViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des classes - Admin: tout, Enseignant: sa classe uniquement"""
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [IsReadOnlyOrAdmin]  # Enseignants: lecture seule, Admin: CRUD complet
    
    def get_queryset(self):
        user = self.request.user
        queryset = Classe.objects.all()
        
        # Filtrer par année scolaire si spécifié
        annee_id = self.request.query_params.get('annee_scolaire')
        if annee_id:
            queryset = queryset.filter(annee_scolaire_id=annee_id)
        
        # Pour les enseignants: uniquement LEUR classe (dont ils sont titulaires)
        if user.is_professeur() and not user.is_admin():
            try:
                prof = Professeur.objects.get(user=user)
                # Un enseignant ne voit que la classe dont il est le titulaire
                queryset = queryset.filter(professeur_principal=prof)
            except Professeur.DoesNotExist:
                queryset = queryset.none()
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def eleves(self, request, pk=None):
        """Liste des élèves d'une classe"""
        classe = self.get_object()
        eleves = classe.eleves.filter(statut='actif')
        serializer = EleveListSerializer(eleves, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_matiere(self, request, pk=None):
        """Ajouter une matière à une classe"""
        if not request.user.is_admin():
            return Response(
                {'error': 'Permission refusée'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        classe = self.get_object()
        serializer = MatiereClasseSerializer(data={
            **request.data,
            'classe': classe.id
        })
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MatiereViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des matières - Admin: tout, Enseignant: lecture seule"""
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [IsReadOnlyOrAdmin]  # Enseignants peuvent lire, Admin peut modifier
    
    def get_queryset(self):
        # Tous les utilisateurs authentifiés peuvent voir les matières
        return Matiere.objects.all()


class EleveViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des élèves
    - Admin: Peut tout faire (CRUD complet)
    - Enseignant: Peut seulement voir les élèves de SA classe (lecture seule)
    """
    permission_classes = [IsTeacherOrAdmin]
    
    def get_permissions(self):
        """
        Permissions dynamiques selon l'action :
        - Lecture (list, retrieve): Enseignants et Admins
        - Écriture (create, update, delete): Admin uniquement
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'import_csv']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsTeacherOrAdmin]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Eleve.objects.all()
        
        # Filtrer par classe si spécifié
        classe_id = self.request.query_params.get('classe')
        if classe_id:
            queryset = queryset.filter(classe_id=classe_id)
        
        # Filtrer par statut
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        else:
            # Par défaut, ne montrer que les élèves actifs
            queryset = queryset.filter(statut='actif')
        
        # Recherche
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(prenom__icontains=search) |
                Q(matricule__icontains=search)
            )
        
        # Pour les enseignants: UNIQUEMENT les élèves de LEUR classe (titulaire)
        if user.is_professeur() and not user.is_admin():
            try:
                prof = Professeur.objects.get(user=user)
                # L'enseignant ne voit que les élèves de la classe dont il est titulaire
                queryset = queryset.filter(classe__professeur_principal=prof)
            except Professeur.DoesNotExist:
                queryset = queryset.none()
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EleveListSerializer
        return EleveSerializer
    
    @action(detail=False, methods=['post'])
    def import_csv(self, request):
        """Importer des élèves depuis un fichier CSV ou Excel"""
        if not request.user.is_admin():
            return Response(
                {'error': 'Seuls les administrateurs peuvent importer des élèves'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = EleveImportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        file = serializer.validated_data['file']
        classe_id = serializer.validated_data['classe_id']
        
        try:
            classe = Classe.objects.get(id=classe_id)
        except Classe.DoesNotExist:
            return Response(
                {'error': 'Classe introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        imported = 0
        errors = []
        
        try:
            if file.name.endswith('.csv'):
                # Import CSV
                decoded_file = TextIOWrapper(file.file, encoding='utf-8')
                reader = csv.DictReader(decoded_file)
                
                for row_num, row in enumerate(reader, start=2):
                    try:
                        self._create_eleve_from_row(row, classe)
                        imported += 1
                    except Exception as e:
                        errors.append(f"Ligne {row_num}: {str(e)}")
            
            elif file.name.endswith(('.xlsx', '.xls')):
                # Import Excel
                wb = openpyxl.load_workbook(file)
                ws = wb.active
                headers = [cell.value for cell in ws[1]]
                
                for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
                    try:
                        row_dict = dict(zip(headers, row))
                        self._create_eleve_from_row(row_dict, classe)
                        imported += 1
                    except Exception as e:
                        errors.append(f"Ligne {row_num}: {str(e)}")
            
            return Response({
                'success': True,
                'imported': imported,
                'errors': errors
            })
        
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'import: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _create_eleve_from_row(self, row, classe):
        """Créer un élève à partir d'une ligne de données"""
        # Parse date de naissance
        date_naissance_str = row.get('date_naissance', '')
        if isinstance(date_naissance_str, str):
            date_naissance = datetime.strptime(date_naissance_str, '%Y-%m-%d').date()
        else:
            date_naissance = date_naissance_str
        
        # Générer matricule si non fourni
        matricule = row.get('matricule')
        if not matricule:
            last_eleve = Eleve.objects.order_by('-id').first()
            next_id = (last_eleve.id + 1) if last_eleve else 1
            matricule = f"EL{next_id:05d}"
        
        eleve = Eleve.objects.create(
            matricule=matricule,
            nom=row.get('nom', '').upper(),
            prenom=row.get('prenom', '').title(),
            sexe=row.get('sexe', 'M'),
            date_naissance=date_naissance,
            lieu_naissance=row.get('lieu_naissance', ''),
            telephone_eleve=row.get('telephone_eleve', ''),
            email=row.get('email', ''),
            adresse=row.get('adresse', ''),
            nom_pere=row.get('nom_pere', ''),
            telephone_pere=row.get('telephone_pere', ''),
            nom_mere=row.get('nom_mere', ''),
            telephone_mere=row.get('telephone_mere', ''),
            tuteur=row.get('tuteur', ''),
            telephone_tuteur=row.get('telephone_tuteur', ''),
            classe=classe,
            statut='actif'
        )
        return eleve
    
    @action(detail=False, methods=['get'])
    def template_csv(self, request):
        """Télécharger un modèle CSV pour l'import"""
        response = Response(
            content_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="template_eleves.csv"'}
        )
        
        writer = csv.writer(response)
        writer.writerow([
            'matricule', 'nom', 'prenom', 'sexe', 'date_naissance', 'lieu_naissance',
            'telephone_eleve', 'email', 'adresse',
            'nom_pere', 'telephone_pere', 'nom_mere', 'telephone_mere',
            'tuteur', 'telephone_tuteur'
        ])
        writer.writerow([
            'EL00001', 'DUPONT', 'Jean', 'M', '2010-05-15', 'Yaoundé',
            '677123456', 'jean@email.com', '123 Rue Exemple',
            'Pierre DUPONT', '677111111', 'Marie DUPONT', '677222222',
            '', ''
        ])
        
        return response


class MatiereClasseViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des matières par classe"""
    queryset = MatiereClasse.objects.all()
    serializer_class = MatiereClasseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MatiereClasse.objects.all()
        
        # Filtrer par classe
        classe_id = self.request.query_params.get('classe')
        if classe_id:
            queryset = queryset.filter(classe_id=classe_id)
        
        return queryset
