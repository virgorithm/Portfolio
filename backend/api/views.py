import json
import logging
import secrets
import uuid
from datetime import timedelta

from django import forms
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import EmailMessage
from django.db import transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_POST
from django.utils import timezone
from django.utils.crypto import salted_hmac

from .models import ContactMessage, ContactVerification

logger = logging.getLogger(__name__)


class ContactForm(forms.ModelForm):
    topic = forms.ChoiceField(choices=[(topic, topic) for topic in (
        'Project collaboration', 'Internship opportunity',
        'Question about my work', 'Just saying hello',
    )])

    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'topic', 'message']


@require_GET
def contact_csrf(request):
    response = JsonResponse({'csrfToken': get_token(request)})
    response['Cache-Control'] = 'no-store'
    return response


@require_POST
def contact_verification(request):
    data, error = read_json(request)
    if error is not None:
        return error
    try:
        email = forms.EmailField(max_length=254).clean(data.get('email', '')).lower()
    except forms.ValidationError:
        return JsonResponse({'error': 'Please enter a valid email address.'}, status=400)
    if not settings.CONTACT_EMAIL_NOTIFICATIONS:
        return JsonResponse({'error': 'Email is not configured yet. Please use the email link below.'}, status=503)
    # Limit both the sending IP and destination without putting addresses in cache keys.
    keys = [f'contact-code:{salted_hmac("contact-code", value).hexdigest()}' for value in
            (request.META.get('REMOTE_ADDR', 'unknown'), email)]
    acquired = []
    for key in keys:
        if not cache.add(key, True, timeout=60):
            cache.delete_many(acquired)
            return JsonResponse({'error': 'Please wait 60 seconds before requesting another code.'}, status=429)
        acquired.append(key)
    code = f'{secrets.randbelow(1000000):06d}'
    verification = ContactVerification.objects.create(
        email=email, code_hash=make_password(code), expires_at=timezone.now() + timedelta(minutes=10),
    )
    try:
        sent = EmailMessage(
            subject='Verify your email - Imari Calado portfolio',
            body=f'Your verification code is: {code}\n\nIt expires in 10 minutes. Enter it on the contact form to send your message.\nIf you did not request this code, you can ignore this email.',
            from_email=settings.DEFAULT_FROM_EMAIL, to=[email],
        ).send(fail_silently=False)
        if sent != 1:
            raise RuntimeError('Verification email was not accepted')
    except Exception:
        verification.delete()
        logger.exception('Could not send contact verification email')
        return JsonResponse({'error': 'Could not send a code. Check your email address and try again later.'}, status=503)
    return JsonResponse({'verificationId': str(verification.pk), 'message': 'Check your inbox or spam folder for your verification code.'}, status=201)


def read_json(request):
    if request.content_type != 'application/json':
        return None, JsonResponse({'error': 'Please send JSON.'}, status=415)
    if len(request.body) > 20000:
        return None, JsonResponse({'error': 'Your message is too long.'}, status=413)
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return None, JsonResponse({'error': 'Invalid message data.'}, status=400)
    if not isinstance(data, dict) or any(not isinstance(value, str) for value in data.values()):
        return None, JsonResponse({'error': 'Invalid message data.'}, status=400)
    return data, None


@require_POST
def contact_message(request):
    data, error = read_json(request)
    if error is not None:
        return error
    form = ContactForm(data)
    if not form.is_valid():
        return JsonResponse({'error': 'Please check your details.', 'fields': form.errors}, status=400)
    if not settings.CONTACT_EMAIL_NOTIFICATIONS:
        return JsonResponse({'error': 'Email is not configured yet. Please use the email link below.'}, status=503)
    try:
        verification_id = uuid.UUID(data.get('verificationId', ''))
    except ValueError:
        return JsonResponse({'error': 'Please request an email verification code first.'}, status=400)
    throttle_key = f'contact:{request.META.get("REMOTE_ADDR", "unknown")}'
    if not cache.add(throttle_key, True, timeout=30):
        return JsonResponse({'error': 'Please wait 30 seconds before sending another message.'}, status=429)
    try:
        with transaction.atomic():
            verification = ContactVerification.objects.select_for_update().filter(pk=verification_id).first()
            if (not verification or verification.email != form.cleaned_data['email'].lower()
                    or verification.used_at or verification.expires_at <= timezone.now()
                    or verification.attempts >= 5):
                cache.delete(throttle_key)
                return JsonResponse({'error': 'Verification expired or unavailable. Please request a new code.'}, status=400)
            verification.attempts += 1
            verification.save(update_fields=['attempts'])
            if not check_password(data.get('verificationCode', ''), verification.code_hash):
                cache.delete(throttle_key)
                return JsonResponse({'error': 'Incorrect verification code. Please check your email.'}, status=400)
            verification.used_at = timezone.now()
            verification.save(update_fields=['used_at'])
            message = form.save()
            sent = EmailMessage(
                subject=f'Portfolio: {message.topic}',
                body=f'From: {message.name}\nVerified email: {message.email}\nTopic: {message.topic}\n\n{message.message}\n\nUse Reply to respond directly to the sender.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.CONTACT_RECIPIENT_EMAIL],
                reply_to=[message.email],
            ).send(fail_silently=False)
            if sent != 1:
                raise RuntimeError('Contact email was not accepted')
    except Exception:
        cache.delete(throttle_key)
        logger.exception('Could not deliver contact message')
        return JsonResponse({'error': 'Could not deliver your message. Please try again.'}, status=503)
    return JsonResponse({'message': 'Message sent! Thank you for reaching out.'}, status=201)
