from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Hospital
from .serializers import HospitalSerializer

# View para a lista de Hospitais (O que aparece no mapa)
class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

# Função para cadastrar novos usuários pelo celular
@api_view(['POST'])
def cadastrar_usuario(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password:
        return Response({'erro': 'Usuário e senha são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'erro': 'Este usuário já existe'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'mensagem': 'Usuário criado com sucesso!'}, status=status.HTTP_201_CREATED)

# Função para fazer login pelo celular
@api_view(['POST'])
def login_usuario(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user is not None:
        return Response({'status': 'ok', 'username': user.username}, status=status.HTTP_200_OK)
    else:
        return Response({'status': 'erro', 'mensagem': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)