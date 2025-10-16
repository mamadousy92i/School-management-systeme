from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Admin, Professeur


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle User"""
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'telephone', 'photo', 'date_naissance', 'adresse',
                  'password', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class AdminSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Admin"""
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='user', 
        write_only=True
    )
    
    class Meta:
        model = Admin
        fields = ['id', 'user', 'user_id', 'fonction']


class ProfesseurSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Professeur"""
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='user', 
        write_only=True
    )
    
    class Meta:
        model = Professeur
        fields = ['id', 'user', 'user_id', 'matricule', 'specialite', 
                  'diplome', 'date_embauche']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Champs supplémentaires pour professeur
    matricule = serializers.CharField(required=False, allow_blank=True)
    specialite = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 
                  'last_name', 'role', 'telephone', 'date_naissance', 'adresse',
                  'matricule', 'specialite']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs
    
    def create(self, validated_data):
        # Extraire les champs supplémentaires
        matricule = validated_data.pop('matricule', None)
        specialite = validated_data.pop('specialite', None)
        validated_data.pop('password2')
        
        # Créer l'utilisateur
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'professeur'),
            telephone=validated_data.get('telephone', ''),
            date_naissance=validated_data.get('date_naissance', None),
            adresse=validated_data.get('adresse', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Créer le profil correspondant
        if user.role == 'admin':
            Admin.objects.create(user=user)
        elif user.role == 'professeur':
            Professeur.objects.create(
                user=user,
                matricule=matricule or f'PROF{user.id:04d}',
                specialite=specialite or ''
            )
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
