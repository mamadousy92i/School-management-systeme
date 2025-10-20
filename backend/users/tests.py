from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import User


class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.profile_url = reverse('user_profile')
        self.change_password_url = reverse('change_password')

    def create_user(self, username='john', password='StrongPass123!'):
        return User.objects.create_user(username=username, password=password, role='admin')

    def authenticate(self, username='john', password='StrongPass123!'):
        resp = self.client.post(self.login_url, {"username": username, "password": password}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return resp

    def test_register_and_login_and_profile(self):
        # register
        data = {
            "username": "john",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "role": "admin"
        }
        r = self.client.post(self.register_url, data, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        # login
        l = self.client.post(self.login_url, {"username": "john", "password": "StrongPass123!"}, format='json')
        self.assertEqual(l.status_code, status.HTTP_200_OK)
        self.assertIn('access', l.data)

        # profile
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {l.data['access']}")
        p = self.client.get(self.profile_url)
        self.assertEqual(p.status_code, status.HTTP_200_OK)
        self.assertIn('user', p.data)

    def test_change_password_flow(self):
        user = self.create_user()
        self.authenticate('john', 'StrongPass123!')

        # wrong old password
        r1 = self.client.post(self.change_password_url, {"old_password": "bad", "new_password": "NewStrong123!"}, format='json')
        self.assertEqual(r1.status_code, status.HTTP_400_BAD_REQUEST)

        # weak new password rejected by validator
        r2 = self.client.post(self.change_password_url, {"old_password": "StrongPass123!", "new_password": "123"}, format='json')
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)

        # success
        r3 = self.client.post(self.change_password_url, {"old_password": "StrongPass123!", "new_password": "EvenStronger123!"}, format='json')
        self.assertEqual(r3.status_code, status.HTTP_200_OK)

        # can login with new password
        self.client.credentials()
        l = self.client.post(self.login_url, {"username": "john", "password": "EvenStronger123!"}, format='json')
        self.assertEqual(l.status_code, status.HTTP_200_OK)

    def test_cannot_update_password_via_user_viewset(self):
        user = self.create_user()
        auth = self.authenticate('john', 'StrongPass123!')
        # get own user id
        me_url = reverse('user-me')
        me = self.client.get(me_url)
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        user_id = me.data['id']

        # try to patch password via users/<id>/ should be blocked
        resp = self.client.patch(reverse('user-detail', args=[user_id]), {"password": "BlockMe123!"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
