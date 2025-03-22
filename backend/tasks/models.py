from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    

class Item(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class FocusSession(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='focus_sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='focus_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.item.title} - {self.start_time} to {self.end_time}"