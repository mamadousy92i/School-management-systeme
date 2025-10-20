from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User


class GradesEndpointsTests(APITestCase):
    def setUp(self):
        # Create admin user and login
        self.admin = User.objects.create_user(username='admin', password='StrongPass123!', role='admin')
        login = self.client.post(reverse('login'), {"username": "admin", "password": "StrongPass123!"}, format='json')
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_list_endpoints(self):
        # Lists should return 200/204 even if empty
        urls = [
            reverse('periode-list'),
            reverse('type-evaluation-list'),
            reverse('note-list'),
            reverse('moyenne-list'),
        ]
        for url in urls:
            resp = self.client.get(url)
            self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT))

    def test_custom_actions_require_params(self):
        # moyenne_generale without params -> 400
        url_mg = reverse('moyenne-moyenne-generale')
        r1 = self.client.get(url_mg)
        self.assertEqual(r1.status_code, status.HTTP_400_BAD_REQUEST)

        # classe_moyennes without params -> 400
        url_cm = reverse('moyenne-classe-moyennes')
        r2 = self.client.get(url_cm)
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)

        # bulletins_classe without params -> 400
        url_bc = reverse('moyenne-bulletins-classe')
        r3 = self.client.get(url_bc)
        self.assertEqual(r3.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recalculer_requires_periode(self):
        url_recalc = reverse('moyenne-recalculer')
        r = self.client.post(url_recalc, {})
        # Should be 400 because periode_id is required (auth as admin already)
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
