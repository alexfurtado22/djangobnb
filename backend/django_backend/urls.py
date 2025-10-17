"""
URL configuration for django_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.http import JsonResponse
# from useraccount.views import BackendLogoutView


def api_root(request):
    return JsonResponse(
        {"message": "Welcome to the djangobnb API.", "api_endpoints": "/api/v1/"}
    )


# API v1 URLs
api_urlpatterns = [
    # Auth endpoints
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    # App endpoints
    path("useraccount/", include("useraccount.urls")),
    path("property/", include("property.urls")),
]

# Main URL patterns
urlpatterns = [
    path(
        "", api_root
    ),  # 👈 catch root requestspath("", api_root),  # 👈 catch root requests
    path("admin/", admin.site.urls),
    # API endpoints
    path("api/v1/", include(api_urlpatterns)),
    # DRF browsable API login/logout
    path("api-auth/", include("rest_framework.urls")),
    # path("api/v1/auth/logout/", BackendLogoutView.as_view(), name="backend_logout"),
]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns += [
        path("silk/", include("silk.urls", namespace="silk")),
        path("__debug__/", include(debug_toolbar.urls)),
        path("__reload__/", include("django_browser_reload.urls")),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
