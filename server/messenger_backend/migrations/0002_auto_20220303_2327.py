# Generated by Django 3.2.4 on 2022-03-03 23:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('messenger_backend', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='conversation',
            name='user1',
        ),
        migrations.RemoveField(
            model_name='conversation',
            name='user2',
        ),
    ]