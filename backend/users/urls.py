from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, login_view, logout_view, user_profile_view,
    change_password_view,
    UserViewSet, AdminViewSet, ProfesseurViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'admins', AdminViewSet, basename='admin')
router.register(r'professeurs', ProfesseurViewSet, basename='professeur')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', user_profile_view, name='user_profile'),
    path('auth/change_password/', change_password_view, name='change_password'),
    
    # Router URLs
    path('', include(router.urls)),
]
