from django.shortcuts import render
from .serializers import UserSerializer, TaskSerializer, FocusSessionSerializer, ItemSerializer
from rest_framework import viewsets, permissions
from .models import User, Task, FocusSession, Item
from .permissions import IsOwner


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(id=self.request.user.id)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return self.queryset.filter(task__user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(task__user=self.request.user)


class FocusSessionViewSet(viewsets.ModelViewSet):
    queryset = FocusSession.objects.all()
    serializer_class = FocusSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)