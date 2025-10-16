from rest_framework import serializers
from .models import Ecole, AnneeScolaire, Classe, Matiere, Eleve, MatiereClasse
from users.models import Professeur
from users.serializers import ProfesseurSerializer


class EcoleSerializer(serializers.ModelSerializer):
    """Serializer pour Ecole"""
    nombre_utilisateurs = serializers.SerializerMethodField()
    
    class Meta:
        model = Ecole
        fields = [
            'id', 'nom', 'sigle', 'adresse', 'telephone', 'email',
            'logo', 'devise', 'directeur', 'active',
            'nombre_utilisateurs', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_nombre_utilisateurs(self, obj):
        return obj.utilisateurs.count()


class AnneeScolaireSerializer(serializers.ModelSerializer):
    """Serializer pour AnneeScolaire"""
    nombre_classes = serializers.SerializerMethodField()
    
    class Meta:
        model = AnneeScolaire
        fields = ['id', 'libelle', 'date_debut', 'date_fin', 'active', 'nombre_classes']
    
    def get_nombre_classes(self, obj):
        return obj.classes.count()


class MatiereSerializer(serializers.ModelSerializer):
    """Serializer pour Matiere"""
    
    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'code', 'coefficient', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class MatiereClasseSerializer(serializers.ModelSerializer):
    """Serializer pour MatiereClasse"""
    matiere = MatiereSerializer(read_only=True)
    matiere_id = serializers.PrimaryKeyRelatedField(
        queryset=Matiere.objects.all(),
        source='matiere',
        write_only=True
    )
    professeur = ProfesseurSerializer(read_only=True)
    professeur_id = serializers.PrimaryKeyRelatedField(
        queryset=Professeur.objects.all(),
        source='professeur',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = MatiereClasse
        fields = ['id', 'classe', 'matiere', 'matiere_id', 'professeur', 'professeur_id']


class ClasseSerializer(serializers.ModelSerializer):
    """Serializer pour Classe"""
    professeur_principal = ProfesseurSerializer(read_only=True)
    professeur_principal_id = serializers.PrimaryKeyRelatedField(
        queryset=Professeur.objects.all(),
        source='professeur_principal',
        write_only=True,
        required=False,
        allow_null=True
    )
    annee_scolaire = AnneeScolaireSerializer(read_only=True)
    annee_scolaire_id = serializers.PrimaryKeyRelatedField(
        queryset=AnneeScolaire.objects.all(),
        source='annee_scolaire',
        write_only=True
    )
    effectif_actuel = serializers.ReadOnlyField()
    matieres_enseignees = MatiereClasseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Classe
        fields = [
            'id', 'nom', 'niveau', 'effectif_max', 'effectif_actuel',
            'annee_scolaire', 'annee_scolaire_id',
            'professeur_principal', 'professeur_principal_id',
            'matieres_enseignees', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'effectif_actuel']


class EleveSerializer(serializers.ModelSerializer):
    """Serializer pour Eleve"""
    classe_info = ClasseSerializer(source='classe', read_only=True)
    classe_id = serializers.PrimaryKeyRelatedField(
        queryset=Classe.objects.all(),
        source='classe',
        write_only=True
    )
    age = serializers.ReadOnlyField()
    nom_complet = serializers.ReadOnlyField()
    
    class Meta:
        model = Eleve
        fields = [
            'id', 'matricule', 'nom', 'prenom', 'nom_complet', 'sexe',
            'date_naissance', 'age', 'lieu_naissance',
            'telephone_eleve', 'email', 'adresse',
            'nom_pere', 'telephone_pere',
            'nom_mere', 'telephone_mere',
            'tuteur', 'telephone_tuteur',
            'classe', 'classe_id', 'classe_info',
            'date_inscription', 'statut', 'photo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'date_inscription', 'age', 'nom_complet']


class EleveListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des élèves"""
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Eleve
        fields = [
            'id', 'matricule', 'nom', 'prenom', 'sexe', 'age',
            'classe', 'classe_nom', 'statut', 'photo'
        ]


class EleveImportSerializer(serializers.Serializer):
    """Serializer pour l'import CSV d'élèves"""
    file = serializers.FileField()
    classe_id = serializers.IntegerField()
    
    def validate_file(self, value):
        if not value.name.endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError(
                "Le fichier doit être au format CSV ou Excel (.xlsx, .xls)"
            )
        return value
