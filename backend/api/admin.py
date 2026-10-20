from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'topic', 'created_at', 'is_read']
    list_filter = ['is_read', 'topic', 'created_at']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['name', 'email', 'topic', 'message', 'created_at']

    def has_add_permission(self, request):
        return False
