from django.urls import path
from .views import TodoListView, TodoCreateView, TodoUpdateView, TodoDeleteView
from rest_framework.authtoken.views import obtain_auth_token
from myapp.views import MyProtectedView
from .views import SecureHelloView

urlpatterns = [
    path('fetch/', TodoListView.as_view(), name='todo-list'),  # Fetch all tasks
    path('create/', TodoCreateView.as_view(), name='todo-create'),  # Create a new task
    path('<int:pk>/update/', TodoUpdateView.as_view(), name='todo-update'),  # Update a task
    path('<int:pk>/delete/', TodoDeleteView.as_view(), name='todo-delete'),  # Delete a task
    path('api/protected/', MyProtectedView.as_view(), name='protected-view'),
    path('api/token/', obtain_auth_token, name='token-obtain'),
    path('secure-hello/', SecureHelloView.as_view()),
]
