from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html


User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    readonly_fields = ('date_joined', 'avatar_tag')
    list_display = (
        'id',
        'username',
        'email',
        'date_joined',
        'first_name',
        'last_name',
        'avatar_tag',
    )
    list_display_links = ('id', 'username')
    search_fields = (
        'username',
        'email'
    )

    def avatar_tag(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" width="50" height="50" />'.format(
                    obj.avatar.url
                )
            )
        return 'No Image'

    avatar_tag.short_description = 'Avatar'
