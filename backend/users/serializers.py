from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Admin, Professeur
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle User"""
    password = serializers.CharField(write_only=True, required=False)
    ecole_nom = serializers.CharField(source='ecole.nom', read_only=True)
    ecole_code = serializers.CharField(source='ecole.code', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'telephone', 'photo', 'date_naissance', 'adresse',
                  'password', 'is_active', 'created_at', 'updated_at',
                  'ecole', 'ecole_nom', 'ecole_code']
        read_only_fields = ['id', 'created_at', 'updated_at', 'ecole_nom', 'ecole_code']
    
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
            # Validate new password strength
            validate_password(password, instance)
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


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
