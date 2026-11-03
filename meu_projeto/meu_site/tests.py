from django.test import TestCase


class PageTests(TestCase):
    def test_home_page_redirects_to_login(self):
        response = self.client.get('/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '/html/login/login.html')

    def test_site_pages_render(self):
        pages = (
            '/html/login/login.html',
            '/html/area_de_estudo/campanha.html',
            '/html/area_de_estudo/disciplinas.html',
            '/html/area_de_estudo/exercicios.html',
            '/html/area_de_estudo/teste.html',
            '/html/menu_html/avatar.html',
            '/html/menu_html/dashboard.html',
            '/html/menu_html/definicoes.html',
            '/html/menu_html/jornada.html',
            '/html/menu_html/loja.html',
            '/html/menu_html/missoes.html',
            '/html/menu_html/ranking.html',
            '/html/menu_html/testes.html',
        )

        for page in pages:
            with self.subTest(page=page):
                self.assertEqual(self.client.get(page).status_code, 200)

    def test_page_uses_app_static_files(self):
        response = self.client.get('/html/login/login.html')

        self.assertContains(response, '/static/meu_site/css/principal.css')
        self.assertContains(response, '/static/meu_site/js/login/login.js')
