from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodeViewSet, TypeEvaluationViewSet, NoteViewSet, MoyenneViewSet

router = DefaultRouter()
router.register(r'periodes', PeriodeViewSet, basename='periode')
router.register(r'types-evaluation', TypeEvaluationViewSet, basename='type-evaluation')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'moyennes', MoyenneViewSet, basename='moyenne')

urlpatterns = [
    path('', include(router.urls)),
]
