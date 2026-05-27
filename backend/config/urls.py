from django.contrib import admin
from django.urls import path, include  # <-- Faltava importar o 'path' aqui!
from rest_framework.routers import DefaultRouter
from api.views import HospitalViewSet, cadastrar_usuario, login_usuario

# Configuração do Router para os Hospitais
router = DefaultRouter()
router.register(r'hospitais', HospitalViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),           # Rotas automáticas dos hospitais
    path('api/cadastro/', cadastrar_usuario),     # Rota de cadastro manual
    path('api/login/', login_usuario),           # Rota de login manual
]