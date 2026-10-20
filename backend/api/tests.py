from datetime import timedelta
from unittest.mock import patch

from django.core import mail
from django.core.cache import cache
from django.test import Client, TestCase, override_settings
from django.utils import timezone

from .models import ContactMessage, ContactVerification


@override_settings(
    CONTACT_EMAIL_NOTIFICATIONS=True,
    MAILERS={'default': {'BACKEND': 'django.core.mail.backends.locmem.EmailBackend'}},
    CSRF_TRUSTED_ORIGINS=['http://localhost:5173'],
)
class ContactMessageTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = Client(enforce_csrf_checks=True)
        self.token = self.client.get('/api/contact/csrf/').json()['csrfToken']
        self.payload = {
            'name': 'Test Visitor', 'email': 'visitor@example.com',
            'topic': 'Project collaboration', 'message': 'Can we discuss a design project?',
        }

    def post(self, payload=None, url='/api/contact/'):
        return self.client.post(url, self.payload if payload is None else payload,
                                content_type='application/json', HTTP_X_CSRFTOKEN=self.token,
                                HTTP_ORIGIN='http://localhost:5173')

    def request_code(self, email='visitor@example.com'):
        with patch('api.views.secrets.randbelow', return_value=123456):
            return self.post({'email': email}, '/api/contact/verification/')

    def verified_payload(self):
        response = self.request_code()
        self.assertEqual(response.status_code, 201)
        return {**self.payload, 'verificationId': response.json()['verificationId'],
                'verificationCode': '123456'}

    def test_verified_message_delivered_with_reply_to_and_saved(self):
        payload = self.verified_payload()
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('123456', mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].to, ['visitor@example.com'])
        self.assertEqual(self.post(payload).status_code, 201)
        self.assertEqual(ContactMessage.objects.get().email, self.payload['email'])
        self.assertEqual(mail.outbox[-1].reply_to, ['visitor@example.com'])
        self.assertEqual(mail.outbox[-1].to, ['imariscalado@gmail.com'])
        self.assertIn('Verified email: visitor@example.com', mail.outbox[-1].body)
        self.assertIsNotNone(ContactVerification.objects.get().used_at)

    def test_unverified_address_cannot_send(self):
        self.assertEqual(self.post().status_code, 400)
        self.assertFalse(ContactMessage.objects.exists())

    def test_code_is_hashed_and_not_returned_in_response(self):
        response = self.request_code()
        self.assertNotIn('123456', response.content.decode())
        self.assertNotEqual(ContactVerification.objects.get().code_hash, '123456')

    def test_rejects_missing_csrf_on_both_endpoints(self):
        for url in ['/api/contact/', '/api/contact/verification/']:
            response = Client(enforce_csrf_checks=True).post(url, self.payload, content_type='application/json')
            self.assertEqual(response.status_code, 403)

    def test_rejects_invalid_fields(self):
        for field, value in [('email', 'invalid'), ('name', '  '), ('topic', 'unknown'),
                             ('message', ' '), ('message', 'x' * 3001)]:
            with self.subTest(field=field):
                response = self.post({**self.payload, field: value})
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.json()['fields'])
        self.assertFalse(ContactMessage.objects.exists())

    def test_rejects_malformed_json_and_non_object_payloads(self):
        for url in ['/api/contact/', '/api/contact/verification/']:
            for payload in ['{', '[]', '{"name": []}']:
                self.assertEqual(self.post(payload, url).status_code, 400)

    def test_rejects_invalid_verification_email(self):
        self.assertEqual(self.request_code('not-an-email').status_code, 400)
        self.assertFalse(ContactVerification.objects.exists())

    def test_verification_requires_correct_code_and_limits_guesses(self):
        payload = self.verified_payload()
        for _ in range(5):
            self.assertEqual(self.post({**payload, 'verificationCode': '000000'}).status_code, 400)
        self.assertEqual(ContactVerification.objects.get().attempts, 5)
        self.assertEqual(self.post(payload).status_code, 400)
        self.assertFalse(ContactMessage.objects.exists())

    def test_code_cannot_be_used_for_another_email(self):
        payload = self.verified_payload()
        self.assertEqual(self.post({**payload, 'email': 'someone-else@example.com'}).status_code, 400)
        self.assertFalse(ContactMessage.objects.exists())

    def test_expired_code_is_rejected(self):
        payload = self.verified_payload()
        ContactVerification.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.post(payload).status_code, 400)
        self.assertFalse(ContactMessage.objects.exists())

    def test_successful_code_is_single_use_and_submission_is_throttled(self):
        payload = self.verified_payload()
        self.assertEqual(self.post(payload).status_code, 201)
        self.assertEqual(self.post(payload).status_code, 429)
        cache.clear()
        self.assertEqual(self.post(payload).status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_verification_send_is_throttled_by_ip_and_email(self):
        self.assertEqual(self.request_code().status_code, 201)
        self.assertEqual(self.request_code('another@example.com').status_code, 429)
        self.client.defaults['REMOTE_ADDR'] = '192.0.2.2'
        self.assertEqual(self.request_code().status_code, 429)

    @override_settings(CONTACT_EMAIL_NOTIFICATIONS=False)
    def test_missing_smtp_configuration_does_not_claim_success(self):
        self.assertEqual(self.request_code().status_code, 503)
        self.assertEqual(self.post().status_code, 503)
        self.assertFalse(ContactMessage.objects.exists())

    def test_verification_delivery_failure_does_not_leave_usable_code(self):
        with patch('api.views.EmailMessage.send', side_effect=OSError('SMTP unavailable')):
            with self.assertLogs('api.views', level='ERROR'):
                self.assertEqual(self.request_code().status_code, 503)
        self.assertFalse(ContactVerification.objects.exists())

    def test_contact_delivery_failure_allows_retry_without_false_success(self):
        payload = self.verified_payload()
        with patch('api.views.EmailMessage.send', side_effect=OSError('SMTP unavailable')):
            with self.assertLogs('api.views', level='ERROR'):
                self.assertEqual(self.post(payload).status_code, 503)
        self.assertFalse(ContactMessage.objects.exists())
        self.assertIsNone(ContactVerification.objects.get().used_at)
        self.assertEqual(self.post(payload).status_code, 201)
