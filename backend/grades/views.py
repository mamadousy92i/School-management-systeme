from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg
from datetime import date

from .models import Periode, TypeEvaluation, Note, MoyenneEleve
from .serializers import (
    PeriodeSerializer, TypeEvaluationSerializer, NoteSerializer,
    NoteSimpleSerializer, NoteBulkCreateSerializer, MoyenneEleveSerializer,
    MoyenneGeneraleSerializer
)
from academic.models import Eleve, Classe, Matiere
from users.models import Professeur
from users.permissions import IsAdminUser, IsTeacherOrAdmin, IsReadOnlyOrAdmin


class PeriodeViewSet(viewsets.ModelViewSet):
    """ViewSet pour les périodes - Admin peut créer/modifier, Enseignants peuvent lire"""
    queryset = Periode.objects.all()
    serializer_class = PeriodeSerializer
    permission_classes = [IsReadOnlyOrAdmin]
    
    def get_queryset(self):
        queryset = Periode.objects.all()
        
        # Filtrer par année scolaire si spécifié
        annee_id = self.request.query_params.get('annee_scolaire')
        if annee_id:
            queryset = queryset.filter(annee_scolaire_id=annee_id)
        
        # Filtrer les périodes non clôturées
        non_cloturees = self.request.query_params.get('non_cloturees')
        if non_cloturees == 'true':
            queryset = queryset.filter(est_cloturee=False)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def cloturer(self, request, pk=None):
        """Clôturer une période (Admin uniquement)"""
        periode = self.get_object()
        periode.est_cloturee = True
        periode.save()
        return Response({
            'message': f'{periode.get_nom_display()} clôturée avec succès',
            'periode': PeriodeSerializer(periode).data
        })


class TypeEvaluationViewSet(viewsets.ModelViewSet):
    """ViewSet pour les types d'évaluation - Admin uniquement pour modification"""
    queryset = TypeEvaluation.objects.all()
    serializer_class = TypeEvaluationSerializer
    permission_classes = [IsReadOnlyOrAdmin]


class NoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les notes
    - Enseignant : Peut saisir/modifier/supprimer des notes pour SES élèves uniquement
    - Admin : Peut UNIQUEMENT CONSULTER les notes (lecture seule)
    """
    serializer_class = NoteSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_permissions(self):
        """Permissions dynamiques selon l'action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'saisie_rapide']:
            # SEULS les professeurs peuvent créer/modifier/supprimer des notes
            from users.permissions import IsTeacherOnly
            permission_classes = [IsTeacherOnly]
        else:
            # Liste et détails : enseignants et admins
            permission_classes = [IsTeacherOrAdmin]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Note.objects.all()
        
        # Filtres communs
        eleve_id = self.request.query_params.get('eleve')
        if eleve_id:
            queryset = queryset.filter(eleve_id=eleve_id)
        
        classe_id = self.request.query_params.get('classe')
        if classe_id:
            queryset = queryset.filter(eleve__classe_id=classe_id)
        
        matiere_id = self.request.query_params.get('matiere')
        if matiere_id:
            queryset = queryset.filter(matiere_id=matiere_id)
        
        periode_id = self.request.query_params.get('periode')
        if periode_id:
            queryset = queryset.filter(periode_id=periode_id)
        
        # Pour les enseignants : uniquement les notes de LEUR classe
        if user.is_professeur() and not user.is_admin():
            try:
                prof = Professeur.objects.get(user=user)
                # L'enseignant ne voit que les notes des élèves de sa classe (titulaire)
                queryset = queryset.filter(eleve__classe__professeur_principal=prof)
            except Professeur.DoesNotExist:
                queryset = queryset.none()
        
        return queryset.select_related(
            'eleve', 'matiere', 'periode', 'type_evaluation', 'professeur'
        )
    
    def perform_create(self, serializer):
        """Ajouter automatiquement le professeur lors de la création"""
        user = self.request.user
        
        # Seul un professeur peut créer une note (déjà vérifié par IsTeacherOnly)
        eleve = serializer.validated_data.get('eleve')
        try:
            prof = Professeur.objects.get(user=user)
            if eleve.classe.professeur_principal != prof:
                raise serializers.ValidationError(
                    "Vous ne pouvez saisir des notes que pour les élèves de votre classe"
                )
            serializer.save(professeur=prof)
        except Professeur.DoesNotExist:
            raise serializers.ValidationError("Profil enseignant introuvable")
    
    def perform_update(self, serializer):
        """Vérifier les permissions avant mise à jour"""
        user = self.request.user
        instance = self.get_object()
        
        # Seul un professeur peut modifier (déjà vérifié par IsTeacherOnly)
        try:
            prof = Professeur.objects.get(user=user)
            if instance.eleve.classe.professeur_principal != prof:
                raise serializers.ValidationError(
                    "Vous ne pouvez modifier que les notes de votre classe"
                )
            serializer.save()
        except Professeur.DoesNotExist:
            raise serializers.ValidationError("Profil enseignant introuvable")
    
    @action(detail=False, methods=['post'])
    def saisie_rapide(self, request):
        """Saisir plusieurs notes en une fois pour une classe"""
        serializer = NoteBulkCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        user = request.user
        
        # Récupérer les objets
        matiere = Matiere.objects.get(id=data['matiere_id'])
        periode = Periode.objects.get(id=data['periode_id'])
        type_eval = TypeEvaluation.objects.get(id=data['type_evaluation_id'])
        date_eval = data['date_evaluation']
        
        # Récupérer le profil professeur (seuls les profs peuvent utiliser cette action)
        prof = Professeur.objects.get(user=user)
        
        created_notes = []
        errors = []
        
        for note_data in data['notes']:
            try:
                eleve = Eleve.objects.get(id=note_data['eleve_id'])
                
                # Vérifier que l'enseignant a le droit
                if eleve.classe.professeur_principal != prof:
                    errors.append(f"Élève {eleve.nom_complet}: pas autorisé")
                    continue
                
                # Créer ou mettre à jour la note
                note, created = Note.objects.update_or_create(
                    eleve=eleve,
                    matiere=matiere,
                    periode=periode,
                    type_evaluation=type_eval,
                    defaults={
                        'valeur': note_data['valeur'],
                        'date_evaluation': date_eval,
                        'professeur': prof,
                        'commentaire': note_data.get('commentaire', '')
                    }
                )
                
                created_notes.append(note)
                
                # Recalculer la moyenne
                MoyenneEleve.calculer_moyenne(eleve, matiere, periode)
                
            except Eleve.DoesNotExist:
                errors.append(f"Élève ID {note_data['eleve_id']}: introuvable")
            except Exception as e:
                errors.append(f"Élève ID {note_data['eleve_id']}: {str(e)}")
        
        return Response({
            'success': True,
            'created_count': len(created_notes),
            'notes': NoteSimpleSerializer(created_notes, many=True).data,
            'errors': errors
        })
    
    @action(detail=False, methods=['get'])
    def liste_simple(self, request):
        """Liste simplifiée des notes"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = NoteSimpleSerializer(queryset, many=True)
        return Response(serializer.data)


class MoyenneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour consulter les moyennes
    - Enseignant : Moyennes de ses élèves uniquement
    - Admin : Toutes les moyennes
    """
    serializer_class = MoyenneEleveSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        queryset = MoyenneEleve.objects.all()
        
        # Filtres
        eleve_id = self.request.query_params.get('eleve')
        if eleve_id:
            queryset = queryset.filter(eleve_id=eleve_id)
        
        periode_id = self.request.query_params.get('periode')
        if periode_id:
            queryset = queryset.filter(periode_id=periode_id)
        
        classe_id = self.request.query_params.get('classe')
        if classe_id:
            queryset = queryset.filter(eleve__classe_id=classe_id)
        
        # Pour les enseignants : uniquement leur classe
        if user.is_professeur() and not user.is_admin():
            try:
                prof = Professeur.objects.get(user=user)
                queryset = queryset.filter(eleve__classe__professeur_principal=prof)
            except Professeur.DoesNotExist:
                queryset = queryset.none()
        
        return queryset.select_related('eleve', 'matiere', 'periode')
    
    @action(detail=False, methods=['get'])
    def moyenne_generale(self, request):
        """Obtenir la moyenne générale d'un élève pour une période"""
        eleve_id = request.query_params.get('eleve')
        periode_id = request.query_params.get('periode')
        
        if not eleve_id or not periode_id:
            return Response(
                {'error': 'Paramètres eleve et periode requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            eleve = Eleve.objects.get(id=eleve_id)
            periode = Periode.objects.get(id=periode_id)
        except (Eleve.DoesNotExist, Periode.DoesNotExist):
            return Response(
                {'error': 'Élève ou période introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier les permissions
        user = request.user
        if user.is_professeur() and not user.is_admin():
            prof = Professeur.objects.get(user=user)
            if eleve.classe.professeur_principal != prof:
                return Response(
                    {'error': 'Non autorisé'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Calculer la moyenne générale
        moyenne_gen = MoyenneEleve.calculer_moyenne_generale(eleve, periode)
        moyennes = MoyenneEleve.objects.filter(eleve=eleve, periode=periode)
        
        if moyenne_gen is None:
            return Response(
                {'message': 'Aucune note disponible pour cet élève'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculer le rang et la moyenne de classe
        eleves_classe = Eleve.objects.filter(
            classe=eleve.classe, 
            statut='actif'
        ).exclude(id=eleve.id)
        
        # Calculer les moyennes générales de tous les élèves de la classe
        moyennes_classe = []
        for e in eleves_classe:
            moy_e = MoyenneEleve.calculer_moyenne_generale(e, periode)
            if moy_e is not None:
                moyennes_classe.append(moy_e)
        
        # Ajouter la moyenne de l'élève actuel
        moyennes_classe.append(moyenne_gen)
        
        # Calculer le rang (combien d'élèves ont une meilleure moyenne)
        rang = 1 + sum(1 for m in moyennes_classe if m > moyenne_gen)
        total_eleves = len(moyennes_classe)
        
        # Calculer la moyenne de classe
        moyenne_classe = round(sum(moyennes_classe) / len(moyennes_classe), 2) if moyennes_classe else None
        
        # Récupérer les informations de l'école via l'utilisateur
        ecole_info = None
        if request.user.ecole:
            ecole_info = {
                'nom': request.user.ecole.nom,
                'sigle': request.user.ecole.sigle,
                'adresse': request.user.ecole.adresse,
                'telephone': request.user.ecole.telephone,
                'email': request.user.ecole.email,
                'devise': request.user.ecole.devise,
                'directeur': request.user.ecole.directeur
            }
        
        data = {
            'eleve_id': eleve.id,
            'eleve_nom': eleve.nom_complet,
            'periode_id': periode.id,
            'periode_nom': periode.get_nom_display(),
            'annee_scolaire': periode.annee_scolaire.libelle,
            'moyenne_generale': moyenne_gen,
            'nombre_matieres': moyennes.count(),
            'moyennes_par_matiere': MoyenneEleveSerializer(moyennes, many=True).data,
            'rang': rang,
            'total_eleves': total_eleves,
            'moyenne_classe': moyenne_classe,
            'ecole': ecole_info
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def classe_moyennes(self, request):
        """Obtenir les moyennes de tous les élèves d'une classe pour une période"""
        classe_id = request.query_params.get('classe')
        periode_id = request.query_params.get('periode')
        
        if not classe_id or not periode_id:
            return Response(
                {'error': 'Paramètres classe et periode requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from academic.models import Classe
            classe = Classe.objects.get(id=classe_id)
            periode = Periode.objects.get(id=periode_id)
        except (Classe.DoesNotExist, Periode.DoesNotExist):
            return Response(
                {'error': 'Classe ou période introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier les permissions
        user = request.user
        if user.is_professeur() and not user.is_admin():
            prof = Professeur.objects.get(user=user)
            if classe.professeur_principal != prof:
                return Response(
                    {'error': 'Non autorisé'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Récupérer tous les élèves de la classe
        eleves = Eleve.objects.filter(classe=classe, statut='actif')
        
        # Calculer les moyennes pour chaque élève
        resultats = []
        for eleve in eleves:
            # Compter les notes
            notes_count = Note.objects.filter(
                eleve=eleve,
                periode=periode
            ).count()
            
            # Calculer la moyenne générale
            moyenne_gen = MoyenneEleve.calculer_moyenne_generale(eleve, periode)
            
            # Récupérer les moyennes par matière
            moyennes = MoyenneEleve.objects.filter(eleve=eleve, periode=periode)
            
            resultats.append({
                'eleve_id': eleve.id,
                'matricule': eleve.matricule,
                'nom': eleve.nom,
                'prenom': eleve.prenom,
                'nom_complet': eleve.nom_complet,
                'notes_count': notes_count,
                'moyenne_generale': moyenne_gen,
                'nombre_matieres': moyennes.count(),
                'has_notes': notes_count > 0
            })
        
        return Response({
            'classe_id': classe.id,
            'classe_nom': classe.nom,
            'periode_id': periode.id,
            'periode_nom': periode.get_nom_display(),
            'eleves': resultats
        })
    
    @action(detail=False, methods=['post'])
    def recalculer(self, request):
        """Recalculer toutes les moyennes (Admin uniquement)"""
        if not request.user.is_admin():
            return Response(
                {'error': 'Action réservée aux administrateurs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        periode_id = request.data.get('periode_id')
        if not periode_id:
            return Response(
                {'error': 'periode_id requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            periode = Periode.objects.get(id=periode_id)
        except Periode.DoesNotExist:
            return Response(
                {'error': 'Période introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Recalculer toutes les moyennes pour cette période
        notes = Note.objects.filter(periode=periode).values('eleve', 'matiere').distinct()
        
        count = 0
        for note_info in notes:
            eleve = Eleve.objects.get(id=note_info['eleve'])
            matiere = Matiere.objects.get(id=note_info['matiere'])
            MoyenneEleve.calculer_moyenne(eleve, matiere, periode)
            count += 1
        
        return Response({
            'success': True,
            'message': f'{count} moyennes recalculées pour {periode.get_nom_display()}'
        })
