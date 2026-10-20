from unittest.mock import patch

from django.core.cache import cache
from django.test import Client, TestCase, override_settings

from .models import ContactMessage


@override_settings(CONTACT_EMAIL_NOTIFICATIONS=False)
class ContactMessageTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = Client(enforce_csrf_checks=True)
        self.token = self.client.get('/api/contact/csrf/').json()['csrfToken']
        self.payload = {
            'name': 'Test Visitor', 'email': 'visitor@example.com',
            'topic': 'Project collaboration', 'message': 'Can we discuss a design project?',
        }

    def post(self, payload=None):
        return self.client.post('/api/contact/', self.payload if payload is None else payload,
                                content_type='application/json', HTTP_X_CSRFTOKEN=self.token,
                                HTTP_ORIGIN='http://localhost:5173')

    def test_saves_message_with_csrf_from_frontend_origin(self):
        self.assertEqual(self.post().status_code, 201)
        message = ContactMessage.objects.get()
        self.assertEqual(message.email, self.payload['email'])
        self.assertEqual(message.message, self.payload['message'])

    def test_rejects_missing_csrf(self):
        response = Client(enforce_csrf_checks=True).post('/api/contact/', self.payload,
                                                       content_type='application/json')
        self.assertEqual(response.status_code, 403)
        self.assertFalse(ContactMessage.objects.exists())

    def test_rejects_invalid_fields(self):
        for field, value in [('email', 'invalid'), ('name', '  '), ('topic', 'unknown'),
                             ('message', ' '), ('message', 'x' * 3001)]:
            with self.subTest(field=field, value=value[:20]):
                response = self.post({**self.payload, field: value})
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.json()['fields'])
        self.assertFalse(ContactMessage.objects.exists())

    def test_rejects_malformed_json_and_non_object_payloads(self):
        for payload in ['{', '[]', '{"name": []}']:
            self.assertEqual(self.post(payload).status_code, 400)

    def test_limits_repeat_submissions(self):
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(self.post().status_code, 429)
        self.assertEqual(ContactMessage.objects.count(), 1)

    @override_settings(CONTACT_EMAIL_NOTIFICATIONS=True)
    @patch('api.views.EmailMessage')
    def test_notification_uses_visitor_as_reply_to(self, email_class):
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(email_class.call_args.kwargs['reply_to'], ['visitor@example.com'])
        self.assertEqual(email_class.call_args.kwargs['to'], ['imariscalado@gmail.com'])
        email_class.return_value.send.assert_called_once_with(fail_silently=False)

    @override_settings(CONTACT_EMAIL_NOTIFICATIONS=True)
    @patch('api.views.EmailMessage')
    def test_smtp_failure_keeps_message_in_admin_inbox(self, email_class):
        email_class.return_value.send.side_effect = OSError('SMTP unavailable')
        with self.assertLogs('api.views', level='ERROR'):
            self.assertEqual(self.post().status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)
