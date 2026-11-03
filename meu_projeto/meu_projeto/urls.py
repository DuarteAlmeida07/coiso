"""
URL configuration for meu_projeto project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
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
from django.urls import path

from meu_site import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path(
        'html/login/login.html',
        views.page,
        {'template_name': 'meu_site/login/login.html'},
        name='login',
    ),
    path(
        'html/area_de_estudo/campanha.html',
        views.page,
        {'template_name': 'meu_site/area_de_estudo/campanha.html'},
        name='campanha',
    ),
    path(
        'html/area_de_estudo/disciplinas.html',
        views.page,
        {'template_name': 'meu_site/area_de_estudo/disciplinas.html'},
        name='disciplinas',
    ),
    path(
        'html/area_de_estudo/exercicios.html',
        views.page,
        {'template_name': 'meu_site/area_de_estudo/exercicios.html'},
        name='exercicios',
    ),
    path(
        'html/area_de_estudo/teste.html',
        views.page,
        {'template_name': 'meu_site/area_de_estudo/teste.html'},
        name='teste',
    ),
    path(
        'html/menu_html/avatar.html',
        views.page,
        {'template_name': 'meu_site/menu_html/avatar.html'},
        name='avatar',
    ),
    path(
        'html/menu_html/dashboard.html',
        views.page,
        {'template_name': 'meu_site/menu_html/dashboard.html'},
        name='dashboard',
    ),
    path(
        'html/menu_html/definicoes.html',
        views.page,
        {'template_name': 'meu_site/menu_html/definicoes.html'},
        name='definicoes',
    ),
    path(
        'html/menu_html/jornada.html',
        views.page,
        {'template_name': 'meu_site/menu_html/jornada.html'},
        name='jornada',
    ),
    path(
        'html/menu_html/loja.html',
        views.page,
        {'template_name': 'meu_site/menu_html/loja.html'},
        name='loja',
    ),
    path(
        'html/menu_html/missoes.html',
        views.page,
        {'template_name': 'meu_site/menu_html/missoes.html'},
        name='missoes',
    ),
    path(
        'html/menu_html/ranking.html',
        views.page,
        {'template_name': 'meu_site/menu_html/ranking.html'},
        name='ranking',
    ),
    path(
        'html/menu_html/testes.html',
        views.page,
        {'template_name': 'meu_site/menu_html/testes.html'},
        name='testes',
    ),
]
