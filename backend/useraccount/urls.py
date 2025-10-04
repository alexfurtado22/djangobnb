# useraccount/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UseraccountViewSet, get_csrf  # import CSRF view

router = DefaultRouter()
router.register(r"useraccount", UseraccountViewSet, basename="useraccount")

urlpatterns = [
    path("csrf/", get_csrf, name="get_csrf"),  # 👈 CSRF endpoint
    path("", include(router.urls)),
]
