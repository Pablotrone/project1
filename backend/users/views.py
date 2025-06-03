from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser
)
from rest_framework.response import Response

from users.models import User

from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    AvatarSerializer,
    PasswordSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """Вьюсет для пользователя."""

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [AllowAny()]
        elif self.action in ['user_profile', 'set_password', 'avatar']:
            return [IsAuthenticated()]
        return [IsAdminUser()]  # или IsAuthenticated(), если список юзеров нужен обычным

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.get_response()
        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(
        detail=False,
        url_path='me',
        permission_classes=[IsAuthenticated],
        serializer_class=UserSerializer
    )
    def user_profile(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(
        detail=False,
        methods=['post'],
        url_path='set_password',
        permission_classes=[IsAuthenticated]
    )
    def set_password(self, request):
        serializer = PasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=['put', 'patch', 'delete', 'get'],
        url_path='me/avatar',
        permission_classes=[IsAuthenticated]
    )
    def avatar(self, request):
        user = request.user
        if request.method in ['PUT', 'PATCH']:
            serializer = AvatarSerializer(
                user,
                data=request.data,
                context={'request': request},
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == 'DELETE':
            if user.avatar:
                user.avatar.delete()
                user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        elif request.method == 'GET':
            if user.avatar:
                return Response(
                    {'avatar': request.build_absolute_url(user.avatar.url)})
            return Response(
                {'message': 'Аватар не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
