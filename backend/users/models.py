from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.validators import EmailValidator

from .constants import (
    ROLE_USER,
    ROLE_MODERATOR,
    ROLE_ADMIN,
    MAX_LENGTH_USERNAME,
    MAX_LENGTH_NAME,
    MAX_LENGTH_EMAIL,
    MAX_LENGTH_ROLE
)
from .validators import CustomNameValidator


class User(AbstractUser):
    """Модель пользователя."""

    ROLE_CHOICE = (
        (ROLE_USER, 'user'),
        (ROLE_MODERATOR, 'moderator'),
        (ROLE_ADMIN, 'admin')
    )

    username_validator = UnicodeUsernameValidator(
        message='Никнейм содержит недопустимые символы'
    )
    email_validator = EmailValidator(
        message='Введите корректный email'
    )
    name_validator = CustomNameValidator()

    username = models.CharField(
        max_length=MAX_LENGTH_USERNAME,
        unique=True,
        validators=[username_validator],
        verbose_name=('Никнейм'),
        error_messages={
            'unique': 'Пользователь с таким никнеймом уже существует.'
        }
    )
    email = models.EmailField(
        max_length=MAX_LENGTH_EMAIL,
        unique=True,
        validators=[email_validator],
        verbose_name='Электронная почта',
        error_messages={
            'unique': 'Такой адрес электронной почты уже используется'
        }
    )
    first_name = models.CharField(
        max_length=MAX_LENGTH_NAME,
        blank=False,
        validators=[name_validator],
        verbose_name='Имя пользователя'
    )
    last_name = models.CharField(
        max_length=MAX_LENGTH_NAME,
        blank=False,
        validators=[name_validator],
        verbose_name='Фамилия пользователя'
    )
    phone = models.CharField(
        max_length=20,
        blank=True
    )
    role = models.CharField(
        max_length=MAX_LENGTH_ROLE,
        choices=ROLE_CHOICE,
        default=ROLE_USER,
        verbose_name='Роль пользователя'
    )
    avatar = models.ImageField(
        upload_to='users/avatars/',
        null=True,
        blank=True,
        default='users/avatars/default_avatar.jpg',
        verbose_name='Аватар пользователя'
    )
    date_joined = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата регистрации'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ('username', 'first_name', 'last_name')

    class Meta:
        ordering = ('username',)
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.username

    @property
    def is_moderator(self):
        return self.role == ROLE_MODERATOR

    @property
    def is_admin(self):
        return self.role == ROLE_ADMIN or self.is_superuser
