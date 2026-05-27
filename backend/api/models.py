# Create your models here.
from django.db import models

class Hospital(models.Model):
    nome = models.CharField(max_length=200)
    lat = models.FloatField()
    lng = models.FloatField()
    minutos_espera = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default="Verde") # Verde, Amarelo, Laranja, Vermelho
    ultima_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome