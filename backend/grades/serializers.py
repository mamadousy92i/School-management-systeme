from rest_framework import serializers
from .models import Periode, TypeEvaluation, Note, MoyenneEleve
from academic.serializers import EleveListSerializer, MatiereSerializer
from academic.models import Eleve, Matiere


class PeriodeSerializer(serializers.ModelSerializer):
    """Serializer pour les périodes"""
    nom_display = serializers.CharField(source='get_nom_display', read_only=True)
    annee_scolaire_libelle = serializers.CharField(source='annee_scolaire.libelle', read_only=True)
    
    class Meta:
        model = Periode
        fields = [
            'id', 'nom', 'nom_display', 'annee_scolaire', 'annee_scolaire_libelle',
            'date_debut', 'date_fin', 'est_cloturee'
        ]
        read_only_fields = ['est_cloturee']


class TypeEvaluationSerializer(serializers.ModelSerializer):
    """Serializer pour les types d'évaluation"""
    nom_display = serializers.CharField(source='get_nom_display', read_only=True)
    
    class Meta:
        model = TypeEvaluation
        fields = ['id', 'nom', 'nom_display', 'coefficient', 'description']


class NoteSerializer(serializers.ModelSerializer):
    """Serializer complet pour les notes"""
    eleve_info = EleveListSerializer(source='eleve', read_only=True)
    eleve_id = serializers.PrimaryKeyRelatedField(
        queryset=Eleve.objects.all(),
        source='eleve',
        write_only=True
    )
    
    matiere_info = MatiereSerializer(source='matiere', read_only=True)
    matiere_id = serializers.PrimaryKeyRelatedField(
        queryset=Matiere.objects.all(),
        source='matiere',
        write_only=True
    )
    
    periode_info = PeriodeSerializer(source='periode', read_only=True)
    periode_id = serializers.PrimaryKeyRelatedField(
        queryset=Periode.objects.all(),
        source='periode',
        write_only=True
    )
    
    type_evaluation_info = TypeEvaluationSerializer(source='type_evaluation', read_only=True)
    type_evaluation_id = serializers.PrimaryKeyRelatedField(
        queryset=TypeEvaluation.objects.all(),
        source='type_evaluation',
        write_only=True
    )
    
    professeur_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = [
            'id', 'eleve', 'eleve_id', 'eleve_info',
            'matiere', 'matiere_id', 'matiere_info',
            'periode', 'periode_id', 'periode_info',
            'type_evaluation', 'type_evaluation_id', 'type_evaluation_info',
            'valeur', 'date_evaluation', 'professeur', 'professeur_nom',
            'commentaire', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'professeur']
    
    def get_professeur_nom(self, obj):
        if obj.professeur:
            return obj.professeur.user.get_full_name()
        return None
    
    def validate(self, data):
        """Validation personnalisée"""
        # Vérifier que la période n'est pas clôturée
        periode = data.get('periode')
        if periode and periode.est_cloturee:
            raise serializers.ValidationError({
                'periode': 'Cette période est clôturée. Les notes ne peuvent plus être saisies.'
            })
        
        return data
    
    def create(self, validated_data):
        # Ajouter automatiquement le professeur connecté
        request = self.context.get('request')
        if request and hasattr(request.user, 'professeur_profile'):
            validated_data['professeur'] = request.user.professeur_profile
        
        note = Note.objects.create(**validated_data)
        
        # Recalculer la moyenne après création
        MoyenneEleve.calculer_moyenne(
            eleve=note.eleve,
            matiere=note.matiere,
            periode=note.periode
        )
        
        return note
    
    def update(self, instance, validated_data):
        # Empêcher la modification si la période est clôturée
        if instance.periode.est_cloturee:
            raise serializers.ValidationError({
                'periode': 'Cette période est clôturée. Les notes ne peuvent plus être modifiées.'
            })
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Recalculer la moyenne après modification
        MoyenneEleve.calculer_moyenne(
            eleve=instance.eleve,
            matiere=instance.matiere,
            periode=instance.periode
        )
        
        return instance


class NoteSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour l'affichage rapide"""
    eleve_nom = serializers.CharField(source='eleve.nom_complet', read_only=True)
    matiere_nom = serializers.CharField(source='matiere.nom', read_only=True)
    type_nom = serializers.CharField(source='type_evaluation.get_nom_display', read_only=True)
    
    class Meta:
        model = Note
        fields = [
            'id', 'eleve_nom', 'matiere_nom', 'type_nom',
            'valeur', 'date_evaluation'
        ]


class NoteSaisieRapideSerializer(serializers.Serializer):
    """Serializer pour la saisie rapide de notes multiples"""
    eleve_id = serializers.IntegerField()
    valeur = serializers.DecimalField(max_digits=4, decimal_places=2, min_value=0, max_value=10)
    commentaire = serializers.CharField(required=False, allow_blank=True)


class NoteBulkCreateSerializer(serializers.Serializer):
    """Serializer pour créer plusieurs notes en une fois"""
    matiere_id = serializers.IntegerField()
    periode_id = serializers.IntegerField()
    type_evaluation_id = serializers.IntegerField()
    date_evaluation = serializers.DateField()
    notes = NoteSaisieRapideSerializer(many=True)
    
    def validate(self, data):
        # Vérifier que la matière existe
        try:
            Matiere.objects.get(id=data['matiere_id'])
        except Matiere.DoesNotExist:
            raise serializers.ValidationError({'matiere_id': 'Matière introuvable'})
        
        # Vérifier que la période existe et n'est pas clôturée
        try:
            periode = Periode.objects.get(id=data['periode_id'])
            if periode.est_cloturee:
                raise serializers.ValidationError({'periode_id': 'Cette période est clôturée'})
        except Periode.DoesNotExist:
            raise serializers.ValidationError({'periode_id': 'Période introuvable'})
        
        # Vérifier que le type d'évaluation existe
        try:
            TypeEvaluation.objects.get(id=data['type_evaluation_id'])
        except TypeEvaluation.DoesNotExist:
            raise serializers.ValidationError({'type_evaluation_id': 'Type d\'évaluation introuvable'})
        
        return data


class MoyenneEleveSerializer(serializers.ModelSerializer):
    """Serializer pour les moyennes"""
    eleve_info = EleveListSerializer(source='eleve', read_only=True)
    matiere_info = MatiereSerializer(source='matiere', read_only=True)
    periode_info = PeriodeSerializer(source='periode', read_only=True)
    
    class Meta:
        model = MoyenneEleve
        fields = [
            'id', 'eleve', 'eleve_info', 'matiere', 'matiere_info',
            'periode', 'periode_info', 'moyenne', 'nombre_notes',
            'total_points', 'calculated_at'
        ]
        read_only_fields = ['moyenne', 'nombre_notes', 'total_points', 'calculated_at']


class MoyenneGeneraleSerializer(serializers.Serializer):
    """Serializer pour la moyenne générale d'un élève"""
    eleve_id = serializers.IntegerField()
    eleve_nom = serializers.CharField()
    periode_id = serializers.IntegerField()
    periode_nom = serializers.CharField()
    moyenne_generale = serializers.DecimalField(max_digits=5, decimal_places=2)
    nombre_matieres = serializers.IntegerField()
    moyennes_par_matiere = MoyenneEleveSerializer(many=True)
