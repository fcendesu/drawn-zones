from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from unittest.mock import patch
from datetime import timedelta
import uuid

from authentication.models import MagicLink
from authentication.services import MagicLinkEmailService

User = get_user_model()


class MagicLinkModelTests(TestCase):
    """Test cases for MagicLink model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
    
    def test_magic_link_creation(self):
        """Test magic link is created correctly"""
        magic_link = MagicLink.objects.create(user=self.user)
        
        self.assertIsNotNone(magic_link.token)
        self.assertIsInstance(magic_link.token, uuid.UUID)
        self.assertIsNotNone(magic_link.expires_at)
        self.assertFalse(magic_link.is_used)
        self.assertIsNone(magic_link.used_at)
    
    def test_magic_link_expiration(self):
        """Test magic link expiration logic"""
        # Create expired magic link
        magic_link = MagicLink.objects.create(user=self.user)
        magic_link.expires_at = timezone.now() - timedelta(minutes=1)
        magic_link.save()
        
        self.assertTrue(magic_link.is_expired())
        self.assertFalse(magic_link.is_valid())
    
    def test_magic_link_used_status(self):
        """Test magic link used status"""
        magic_link = MagicLink.objects.create(user=self.user)
        
        # Initially valid
        self.assertTrue(magic_link.is_valid())
        
        # Mark as used
        magic_link.mark_as_used(ip_address='127.0.0.1', user_agent='test-agent')
        
        self.assertTrue(magic_link.is_used)
        self.assertIsNotNone(magic_link.used_at)
        self.assertEqual(magic_link.ip_address, '127.0.0.1')
        self.assertEqual(magic_link.user_agent, 'test-agent')
        self.assertFalse(magic_link.is_valid())
    
    def test_magic_link_auto_expiration_setting(self):
        """Test that expiration is automatically set to 15 minutes"""
        before_creation = timezone.now()
        magic_link = MagicLink.objects.create(user=self.user)
        after_creation = timezone.now()
        
        expected_min = before_creation + timedelta(minutes=15)
        expected_max = after_creation + timedelta(minutes=15)
        
        self.assertGreaterEqual(magic_link.expires_at, expected_min)
        self.assertLessEqual(magic_link.expires_at, expected_max)


class UserModelTests(TestCase):
    """Test cases for custom User model"""
    
    def test_user_creation_with_email(self):
        """Test user creation with email as username field"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'testuser')
        self.assertFalse(user.is_email_verified)
        self.assertTrue(user.is_active)
    
    def test_user_string_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        
        self.assertEqual(str(user), 'test@example.com')


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_URL='http://testserver'
)
class MagicLinkEmailServiceTests(TestCase):
    """Test cases for email service"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        self.magic_link = MagicLink.objects.create(user=self.user)
    
    def test_send_magic_link_email(self):
        """Test sending magic link email"""
        result = MagicLinkEmailService.send_magic_link(self.user, self.magic_link)
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        
        email = mail.outbox[0]
        self.assertEqual(email.to, ['test@example.com'])
        self.assertIn('Sign in to DrawnZones', email.subject)
        self.assertIn(str(self.magic_link.token), email.body)
        self.assertIn('http://testserver/auth/verify', email.body)
    
    def test_send_welcome_email(self):
        """Test sending welcome email"""
        result = MagicLinkEmailService.send_welcome_email(self.user)
        
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        
        email = mail.outbox[0]
        self.assertEqual(email.to, ['test@example.com'])
        self.assertIn('Welcome to DrawnZones', email.subject)
        self.assertIn('successfully created', email.body)


class MagicLinkAPITests(APITestCase):
    """Test cases for magic link API endpoints"""
    
    def setUp(self):
        self.send_url = reverse('authentication:send_magic_link')
        self.verify_url = reverse('authentication:verify_magic_link')
        self.profile_url = reverse('authentication:user_profile')
        self.logout_url = reverse('authentication:logout')
        self.status_url = reverse('authentication:auth_status')
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_magic_link_new_user(self):
        """Test sending magic link to new user"""
        data = {'email': 'newuser@example.com'}
        response = self.client.post(self.send_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['email'], 'newuser@example.com')
        self.assertTrue(response.data['new_user'])
        
        # Check user was created
        user = User.objects.get(email='newuser@example.com')
        self.assertEqual(user.username, 'newuser@example.com')
        
        # Check magic link was created
        magic_link = MagicLink.objects.get(user=user)
        self.assertIsNotNone(magic_link)
        
        # Check email was sent
        self.assertEqual(len(mail.outbox), 2)  # Welcome + magic link emails
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_send_magic_link_existing_user(self):
        """Test sending magic link to existing user"""
        user = User.objects.create_user(
            username='existing',
            email='existing@example.com'
        )
        
        data = {'email': 'existing@example.com'}
        response = self.client.post(self.send_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['new_user'])
        
        # Check only magic link email was sent (no welcome email)
        self.assertEqual(len(mail.outbox), 1)
    
    def test_send_magic_link_invalid_email(self):
        """Test sending magic link with invalid email"""
        data = {'email': 'invalid-email'}
        response = self.client.post(self.send_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
    
    def test_send_magic_link_empty_email(self):
        """Test sending magic link with empty email"""
        data = {'email': ''}
        response = self.client.post(self.send_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_send_magic_link_invalidates_previous_links(self):
        """Test that sending new magic link invalidates previous ones"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        
        # Create first magic link
        first_link = MagicLink.objects.create(user=user)
        self.assertTrue(first_link.is_valid())
        
        # Send new magic link
        data = {'email': 'test@example.com'}
        with override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response = self.client.post(self.send_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check first link is invalidated
        first_link.refresh_from_db()
        self.assertTrue(first_link.is_used)
        
        # Check new link exists and is valid
        new_link = MagicLink.objects.filter(user=user, is_used=False).first()
        self.assertIsNotNone(new_link)
        self.assertTrue(new_link.is_valid())
    
    def test_verify_magic_link_valid_token(self):
        """Test verifying valid magic link token"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        magic_link = MagicLink.objects.create(user=user)
        
        data = {'token': str(magic_link.token)}
        response = self.client.post(self.verify_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)
        
        # Check user is verified
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)
        
        # Check magic link is used
        magic_link.refresh_from_db()
        self.assertTrue(magic_link.is_used)
        
        # Check token was created
        self.assertTrue(Token.objects.filter(user=user).exists())
    
    def test_verify_magic_link_invalid_token(self):
        """Test verifying invalid magic link token"""
        data = {'token': str(uuid.uuid4())}
        response = self.client.post(self.verify_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
    
    def test_verify_magic_link_expired_token(self):
        """Test verifying expired magic link token"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        magic_link = MagicLink.objects.create(user=user)
        magic_link.expires_at = timezone.now() - timedelta(minutes=1)
        magic_link.save()
        
        data = {'token': str(magic_link.token)}
        response = self.client.post(self.verify_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', response.data['errors']['token'][0])
    
    def test_verify_magic_link_used_token(self):
        """Test verifying already used magic link token"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        magic_link = MagicLink.objects.create(user=user)
        magic_link.mark_as_used()
        
        data = {'token': str(magic_link.token)}
        response = self.client.post(self.verify_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already been used', response.data['errors']['token'][0])
    
    def test_user_profile_authenticated(self):
        """Test getting user profile when authenticated"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        token = Token.objects.create(user=user)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
    
    def test_user_profile_unauthenticated(self):
        """Test getting user profile when not authenticated"""
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_user_profile(self):
        """Test updating user profile"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        token = Token.objects.create(user=user)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'username': 'updateduser'
        }
        response = self.client.put(self.profile_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        user.refresh_from_db()
        self.assertEqual(user.first_name, 'Updated')
        self.assertEqual(user.last_name, 'Name')
        self.assertEqual(user.username, 'updateduser')
    
    def test_logout(self):
        """Test user logout"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        token = Token.objects.create(user=user)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post(self.logout_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Check token is deleted
        self.assertFalse(Token.objects.filter(user=user).exists())
    
    def test_auth_status(self):
        """Test authentication status endpoint"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        token = Token.objects.create(user=user)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get(self.status_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['authenticated'])
        self.assertIn('user', response.data)
    
    def test_auth_status_unauthenticated(self):
        """Test authentication status when not authenticated"""
        response = self.client.get(self.status_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MagicLinkIntegrationTests(APITestCase):
    """Integration tests for complete magic link flow"""
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_complete_magic_link_flow(self):
        """Test complete magic link authentication flow"""
        email = 'integration@example.com'
        
        # Step 1: Send magic link
        send_data = {'email': email}
        send_response = self.client.post(
            reverse('authentication:send_magic_link'),
            send_data,
            format='json'
        )
        
        self.assertEqual(send_response.status_code, status.HTTP_200_OK)
        
        # Step 2: Get the magic link token from database
        user = User.objects.get(email=email)
        magic_link = MagicLink.objects.get(user=user, is_used=False)
        
        # Step 3: Verify magic link
        verify_data = {'token': str(magic_link.token)}
        verify_response = self.client.post(
            reverse('authentication:verify_magic_link'),
            verify_data,
            format='json'
        )
        
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        auth_token = verify_response.data['token']
        
        # Step 4: Use token to access protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {auth_token}')
        profile_response = self.client.get(reverse('authentication:user_profile'))
        
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['email'], email)
        
        # Step 5: Logout
        logout_response = self.client.post(reverse('authentication:logout'))
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        
        # Step 6: Verify token is invalidated
        profile_response_after_logout = self.client.get(reverse('authentication:user_profile'))
        self.assertEqual(profile_response_after_logout.status_code, status.HTTP_401_UNAUTHORIZED)


class MagicLinkSecurityTests(APITestCase):
    """Security-focused test cases"""
    
    def test_token_uniqueness(self):
        """Test that magic link tokens are unique"""
        user1 = User.objects.create_user(username='user1', email='user1@example.com')
        user2 = User.objects.create_user(username='user2', email='user2@example.com')
        
        link1 = MagicLink.objects.create(user=user1)
        link2 = MagicLink.objects.create(user=user2)
        
        self.assertNotEqual(link1.token, link2.token)
    
    def test_multiple_verification_attempts(self):
        """Test that token can't be used multiple times"""
        user = User.objects.create_user(username='testuser', email='test@example.com')
        magic_link = MagicLink.objects.create(user=user)
        
        # First verification - should succeed
        data = {'token': str(magic_link.token)}
        response1 = self.client.post(
            reverse('authentication:verify_magic_link'),
            data,
            format='json'
        )
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # Second verification - should fail
        response2 = self.client.post(
            reverse('authentication:verify_magic_link'),
            data,
            format='json'
        )
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_email_case_insensitive(self):
        """Test that email is case insensitive"""
        # Create user with lowercase email
        with override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response1 = self.client.post(
                reverse('authentication:send_magic_link'),
                {'email': 'Test@Example.com'},
                format='json'
            )
        
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # Check user was created with lowercase email
        user = User.objects.get(email='test@example.com')
        self.assertEqual(user.email, 'test@example.com')
        
        # Try to send to same email with different case
        with override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response2 = self.client.post(
                reverse('authentication:send_magic_link'),
                {'email': 'TEST@EXAMPLE.COM'},
                format='json'
            )
        
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertFalse(response2.data['new_user'])  # Should be existing user
    
    def test_rate_limiting_simulation(self):
        """Simulate rate limiting by checking multiple requests"""
        email = 'ratelimit@example.com'
        
        # Create multiple requests
        responses = []
        for i in range(5):
            with override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
                response = self.client.post(
                    reverse('authentication:send_magic_link'),
                    {'email': email},
                    format='json'
                )
            responses.append(response)
        
        # All should succeed (rate limiting would be implemented at infrastructure level)
        for response in responses:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # But only one user should be created
        self.assertEqual(User.objects.filter(email=email).count(), 1)
        
        # And old magic links should be invalidated
        user = User.objects.get(email=email)
        active_links = MagicLink.objects.filter(user=user, is_used=False)
        self.assertEqual(active_links.count(), 1)  # Only the latest one should be active
