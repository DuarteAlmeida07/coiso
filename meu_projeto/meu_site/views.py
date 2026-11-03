from django.shortcuts import render


def home(request):
    return render(request, 'meu_site/index.html')


def page(request, template_name):
    return render(request, template_name)
