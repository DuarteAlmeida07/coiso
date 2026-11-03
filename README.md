# Study Quest

## Estrutura do projeto

O site está organizado como uma aplicação Django em `meu_projeto/`:

```text
meu_projeto/
├── manage.py
├── meu_projeto/
│   ├── settings.py
│   └── urls.py
└── meu_site/
    ├── migrations/
    ├── templates/
    │   └── meu_site/
    │       ├── index.html
    │       ├── area_de_estudo/
    │       ├── login/
    │       └── menu_html/
    ├── static/
    │   └── meu_site/
    │       ├── css/
    │       ├── images/
    │       └── js/
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── tests.py
    └── views.py
```

Para executar localmente, entre em `meu_projeto/` e execute `python manage.py runserver`.
As páginas mantêm os caminhos existentes em `/html/`, e a página inicial encaminha para o login.