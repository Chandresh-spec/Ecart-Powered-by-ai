from django.urls import path
from .views import SmartSearchView, ChatbotView, MealPlannerView

urlpatterns = [
    path('search/', SmartSearchView.as_view(), name='smart_search'),
    path('chatbot/', ChatbotView.as_view(), name='chatbot'),
    path('meal-planner/', MealPlannerView.as_view(), name='meal_planner'),
]
