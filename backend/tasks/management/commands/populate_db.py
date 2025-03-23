from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tasks.models import Task, Item, FocusSession
from django.utils import timezone
from datetime import timedelta, datetime
from freezegun import freeze_time
import random

class Command(BaseCommand):
    help = 'Populates the database with test data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Deletes all existing data before creating new',
        )

    def handle(self, *args, **kwargs):
        if kwargs['delete']:
            self.stdout.write('Deleting existing data')
            FocusSession.objects.all().delete()
            Item.objects.all().delete()
            Task.objects.all().delete()
            User.objects.filter().delete()
            self.stdout.write(self.style.SUCCESS('Data deleted successfully'))
            return
        
        fixed_time = timezone.now() - timedelta(days=10)
        with freeze_time(fixed_time):
            all_users_data = [
                {
                    'username': 'admin',
                    'email': 'admin@focusflow.com',
                    'password': 'password123',
                    'is_superuser': True,
                    'tasks': [],
                },
                {
                    'username': 'franco',
                    'email': 'franco@focusflow.com',
                    'password': 'password123',
                    'is_superuser': False,
                    'tasks': [
                        {
                            'title': 'Mastering JavaScript Fundamentals',
                            'description': 'Dive deep into the core concepts of JavaScript to build a solid foundation for web development.',
                            'due_date': fixed_time + timedelta(days=random.randint(6, 30)),
                            'items': [
                                {
                                    'title': 'Variables, Data Types, Operators',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Control Flow (if/else, loops)',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Functions and Scope',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Arrays and Objects',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'DOM Manipulation',
                                    'is_completed': False,
                                },      
                            ]
                        },
                        {
                            'title': 'Learning React for Frontend Development',
                            'description': 'Explore the popular React library to build dynamic and interactive user interfaces.',
                            'due_date': fixed_time + timedelta(days=random.randint(6, 30)),
                            'items': [
                                {
                                    'title': 'Components and JSX',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'State and Props',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Event Handling and Conditional Rendering',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'React Hooks and Context API',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'React Router and Navigation',
                                    'is_completed': False,
                                },      
                            ]
                        },
                        {
                            'title': 'Understanding Node.js for Backend Development',
                            'description': 'Delve into the world of Node.js to create scalable and efficient server-side applications.',
                            'due_date': fixed_time + timedelta(days=random.randint(6, 30)),
                            'items': [
                                {
                                    'title': 'Node.js Fundamentals and Modules',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Asynchronous Programming and Callbacks',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Express.js Framework and Routing',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Database Integration and MongoDB',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Error Handling and Debugging',
                                    'is_completed': False,
                                },      
                            ]
                        },
                    ]
                },
                {
                    'username': 'christian',
                    'email': 'christian@focusflow.com',
                    'password': 'password123',
                    'is_superuser': False,
                    'tasks': [
                        {
                            'title': 'Cultivating a Daily Meditation Practice',
                            'description': 'Establish a consistent meditation routine to enhance mindfulness, reduce stress, and improve overall well-being.',
                            'due_date': fixed_time + timedelta(days=random.randint(6, 30)),
                            'items': [
                                {
                                    'title': 'Explore Different Meditation Techniques',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Set a Daily Meditation Schedule',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Create a Peaceful Meditation Space',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Practice Mindful Breathing Exercises',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Reflect on Meditation Experiences',
                                    'is_completed': False,
                                },      
                            ]
                        },
                        {
                            'title': 'Developing a Consistent Exercise Routine',
                            'description': 'Establish a regular exercise routine to improve physical health, boost energy levels, and enhance mental well-being.',
                            'due_date': fixed_time + timedelta(days=random.randint(6, 30)),
                            'items': [
                                {
                                    'title': 'Choose a Suitable Exercise Plan',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Schedule Exercise Sessions',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Invest in Essential Exercise Equipment',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Start with Low-Intensity Exercises',
                                    'is_completed': False,
                                },
                                {
                                    'title': 'Track Progress and Adjust the Plan',
                                    'is_completed': False,
                                },      
                            ]
                        },
                    ]
                },
            ]
            
            for user_data in all_users_data:
                user = self._create_user(**{k: v for k, v in user_data.items() if k != "tasks"})
                if user is None:
                    self.stdout.write(self.style.ERROR(f'Error while creating user: {user_data["username"]}'))
                    continue
                self.stdout.write(f'User created: {user.username}')

                for task_data in user_data['tasks']:
                    task = self._create_task(user, **{k: v for k, v in task_data.items() if k != 'items'})
                    if task is None:
                        self.stdout.write(self.style.ERROR(f'Error while creating task: {task_data["title"]}'))
                        continue
                    self.stdout.write(f'Task created: {task.title}')

                    for item_data in task_data['items']:
                        item = self._create_item(task, **item_data)
                        if item is None:
                            self.stdout.write(self.style.ERROR(f'Error while creating item: {item_data["title"]}'))
                            continue
                        self.stdout.write(f'Item created: {item.title}')

                        if random.random() > 0.5:  # 50% de probabilidad
                            start_time = item.created_at + timedelta(days=random.randint(1, 5))
                            end_time = start_time + timedelta(minutes=random.randint(25, 45))
                            focus_session = self._create_focus_session(user, item, start_time, end_time)
                            if focus_session is None:
                                self.stdout.write(self.style.ERROR(f'Error while creating focus session: {item.title}'))
                                continue
                            self.stdout.write(f'Focus session created: {focus_session.item.title}')
                self.stdout.write(self.style.SUCCESS(f'Tasks created for: {user}'))
        self.stdout.write(self.style.SUCCESS('Test data created successfully'))

    def _create_user(self, username: str, email: str, password: str, is_superuser: bool = False) -> User | None:
        if is_superuser:
            superuser_exists = User.objects.filter(username=username, is_superuser=True).exists()
            if superuser_exists:
                return
            
            user = User.objects.create_superuser(username=username, email=email, password=password)
        else:
            user_exists = User.objects.filter(username=username, is_active=True).exists()
            if user_exists:
                return
            
            user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'is_active': True})
            if created:
                user.set_password(password)
                user.save()

        return user
    

    def _create_task(self, user: User, title: str, description: str, due_date: datetime) -> Task | None:
        task_exists = Task.objects.filter(user=user, title=title, description=description, due_date=due_date).exists()
        if task_exists:
            return
        
        task = Task.objects.create(user=user, title=title, description=description, due_date=due_date)
        return task


    def _create_item(self, task: Task, title: str, is_completed: bool = False) -> Item | None:
        item_exists = Item.objects.filter(task=task, title=title, is_completed=is_completed).exists()
        if item_exists:
            return
        
        item = Item.objects.create(task=task, title=title, is_completed=is_completed)
        return item
    

    def _create_focus_session(self, user: User, item: Item, start_time: datetime, end_time: datetime) -> FocusSession | None:
        focus_session_exists = FocusSession.objects.filter(user=user, item=item, start_time=start_time, end_time=end_time).exists()
        if focus_session_exists:
            return
        
        focus_session = FocusSession.objects.create(user=user, item=item, start_time=start_time, end_time=end_time)
        return focus_session
    
