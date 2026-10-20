import json
import logging

from django import forms
from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMessage
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_POST

from .models import ContactMessage

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
def contact_message(request):
    if request.content_type != 'application/json':
        return JsonResponse({'error': 'Please send JSON.'}, status=415)
    if len(request.body) > 20000:
        return JsonResponse({'error': 'Your message is too long.'}, status=413)
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({'error': 'Invalid message data.'}, status=400)
    if not isinstance(data, dict) or any(not isinstance(value, str) for value in data.values()):
        return JsonResponse({'error': 'Invalid message data.'}, status=400)
    form = ContactForm(data)
    if not form.is_valid():
        return JsonResponse({'error': 'Please check your details.', 'fields': form.errors}, status=400)
    throttle_key = f'contact:{request.META.get("REMOTE_ADDR", "unknown")}'
    if not cache.add(throttle_key, True, timeout=30):
        return JsonResponse({'error': 'Please wait 30 seconds before sending another message.'}, status=429)
    try:
        message = form.save()
    except Exception:
        cache.delete(throttle_key)
        logger.exception('Could not save contact message')
        return JsonResponse({'error': 'Could not save your message. Please try again.'}, status=503)
    if settings.CONTACT_EMAIL_NOTIFICATIONS:
        try:
            EmailMessage(
                subject=f'Portfolio: {message.topic}',
                body=f'From: {message.name}\nEmail: {message.email}\n\n{message.message}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.CONTACT_RECIPIENT_EMAIL],
                reply_to=[message.email],
            ).send(fail_silently=False)
        except Exception:
            logger.exception('Email notification failed for contact message %s', message.pk)
    return JsonResponse({'message': 'Message received! Thank you for reaching out.'}, status=201)
