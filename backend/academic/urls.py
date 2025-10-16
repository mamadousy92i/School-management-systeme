from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AnneeScolaireViewSet, ClasseViewSet, MatiereViewSet,
    EleveViewSet, MatiereClasseViewSet
)

router = DefaultRouter()
router.register(r'annees-scolaires', AnneeScolaireViewSet, basename='annee-scolaire')
router.register(r'classes', ClasseViewSet, basename='classe')
router.register(r'matieres', MatiereViewSet, basename='matiere')
router.register(r'eleves', EleveViewSet, basename='eleve')
router.register(r'matieres-classes', MatiereClasseViewSet, basename='matiere-classe')

urlpatterns = [
    path('', include(router.urls)),
]
