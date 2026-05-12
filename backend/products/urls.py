from django.urls import path
from .views import CategoryListView, ProductListView, ProductDetailView, ReviewCreateView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('', ProductListView.as_view(), name='product_list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('<int:product_id>/reviews/', ReviewCreateView.as_view(), name='review_create'),
]
