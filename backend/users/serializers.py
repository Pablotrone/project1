from drf_extra_fields.fields import Base64ImageField
from django.contrib.auth import password_validation
from rest_framework import serializers

from users.models import (
    User
)


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя."""

    password = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = (
            'email',
            'id',
            'username',
            'first_name',
            'last_name',
            'phone',
            'password',
            'avatar'
        )


class UserCreateSerializer(serializers.ModelSerializer):
    """Сериализатор создания пользователя."""

    password = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = (
            'email',
            'id',
            'username',
            'first_name',
            'last_name',
            'phone',
            'password',
            'avatar'
        )

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def validate_username(self, value):
        if value.lower() == 'me':
            raise serializers.ValidationError(
                'Неподходящее имя!'
            )
        return value

    def get_response(self):
        user = self.instance
        return {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            # Не возвращаем avatar и password
        }


class AvatarSerializer(serializers.ModelSerializer):
    """Сериализатор для аватара."""

    avatar = Base64ImageField(
        required=False
    )

    class Meta:
        model = User
        fields = ('avatar',)

    def validate(self, data):
        if self.context['request'].method == 'PUT' and 'avatar' not in data:
            raise serializers.ValidationError(
                {'avatar': 'Обязательное поле.'}
            )
        return data


class PasswordSerializer(serializers.Serializer):
    """Сериализатор для пароля."""

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Неверный пароль!')
        return value

    def validate(self, data):
        current = data.get('current_password')
        new = data.get('new_password')

        if not current or not new:
            raise serializers.ValidationError('Нужно указать и текущий, и новый пароль!')

        if current == new:
            raise serializers.ValidationError('Новый пароль не должен совпадать с текущим.')

        # Проверяем новый пароль по стандартным правилам Django
        password_validation.validate_password(new, self.context['request'].user)

        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
