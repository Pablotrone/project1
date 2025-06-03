import re

from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


@deconstructible
class CustomNameValidator:
    """Валидатор для проверки имени и фамилии"""

    def __init__(self, message=None):
        if message is None:
            message = '''Имя и фамилия могут содержать только
                        буквы, пробелы, дефисы и апострофы'''
        self.message = message

    def __call__(self, value):
        if not value or value.strip() == '':
            raise ValidationError(
                'Поле обязательно для заполнения.',
                  code='field_required'
                  )
        if not re.match(r"^[A-Za-zА-Яа-я\s\-\'']+$", value):
            raise ValidationError(self.message, code='invalid_name')

    def __eq__(self, other):
        return isinstance(
            other, CustomNameValidator
        ) and self.message == other.message
