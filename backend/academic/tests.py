from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User


class AcademicEndpointsTests(APITestCase):
    def setUp(self):
        # Create an admin user and authenticate
        self.user = User.objects.create_user(username='admin', password='StrongPass123!', role='admin')
        login = self.client.post(reverse('login'), {"username": "admin", "password": "StrongPass123!"}, format='json')
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_list_endpoints(self):
        # GET lists should be accessible with auth
        urls = [
            reverse('annee-scolaire-list'),
            reverse('classe-list'),
            reverse('matiere-list'),
            reverse('eleve-list'),
            reverse('matiere-classe-list'),
        ]
        for url in urls:
            resp = self.client.get(url)
            self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT))

    def test_classes_endpoint_filters(self):
        # Basic GET with params shouldn't error
        url = reverse('classe-list')
        resp = self.client.get(url, {"search": "A"})
        self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT))
