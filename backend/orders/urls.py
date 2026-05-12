from django.urls import path
from .views import CartView, AddToCartView, RemoveFromCartView, CheckoutView, OrderHistoryView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart_view'),
    path('cart/add/', AddToCartView.as_view(), name='cart_add'),
    path('cart/remove/<int:item_id>/', RemoveFromCartView.as_view(), name='cart_remove'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('history/', OrderHistoryView.as_view(), name='order_history'),
]
