from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('MEMBER', 'Member'),
    )

    role = models.CharField(max_length=20,choices=ROLE_CHOICES, default='MEMBER'
    )

    profile_image = models.ImageField (upload_to='profile_images/',blank=True,null=True )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username