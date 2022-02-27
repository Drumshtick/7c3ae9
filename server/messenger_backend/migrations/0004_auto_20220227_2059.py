# Generated by Django 3.2.4 on 2022-02-27 20:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messenger_backend', '0003_remove_message_isunread'),
    ]

    operations = [
        migrations.AddField(
            model_name='conversation',
            name='user1LastViewed',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='conversation',
            name='user2LastViewed',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
