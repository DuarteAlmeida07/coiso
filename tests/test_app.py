import json
import random
import re
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest import mock

import app as application


class StudyQuestWebTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        application.DATABASE = Path(self.temporary_directory.name) / "test.sqlite"
        application.initialize_db()
        application.app.config.update(TESTING=True, SECRET_KEY="test-secret")
        self.client = application.app.test_client()

    def tearDown(self):
        self.temporary_directory.cleanup()

    def csrf_token(self, response):
        match = re.search(rb'name="csrf_token" value="([^"]+)"', response.data)
        self.assertIsNotNone(match)
        return match.group(1).decode()

    def create_account_and_login(self):
        response = self.client.get("/html/login/login.html?mode=register")
        token = self.csrf_token(response)
        response = self.client.post(
            "/html/login/login.html",
            data={
                "csrf_token": token,
                "action": "register",
                "name": "Ana",
                "lastname": "Silva",
                "email": "ana@example.com",
                "password": "segredo123",
                "confirm": "segredo123",
                "terms": "on",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Conta criada", response.get_data(as_text=True))
        token = self.csrf_token(response)
        response = self.client.post(
            "/html/login/login.html",
            data={
                "csrf_token": token,
                "action": "login",
                "email": "ana@example.com",
                "password": "segredo123",
                "remember": "on",
            },
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.location, "/html/menu_html/dashboard.html")

    def state(self):
        user = application.load_user("ana@example.com")
        return json.loads(user["state_json"])

    def test_secret_key_is_stable_across_app_restarts(self):
        secret_path = Path(self.temporary_directory.name) / "secret_key"

        with mock.patch.dict("os.environ", {"STUDY_QUEST_SECRET_KEY": ""}):
            first_load_key = application.load_secret_key(secret_path)
            second_load_key = application.load_secret_key(secret_path)

        self.assertEqual(first_load_key, second_load_key)
        self.assertEqual(len(first_load_key), 64)

    def test_authentication_and_server_rendered_pages(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 302)
        self.create_account_and_login()

        pages = [
            "/html/menu_html/dashboard.html",
            "/html/menu_html/missoes.html",
            "/html/menu_html/jornada.html",
            "/html/menu_html/testes.html",
            "/html/menu_html/testes.html?disciplina=portugues",
            "/html/menu_html/ranking.html",
            "/html/menu_html/loja.html",
            "/html/menu_html/avatar.html",
            "/html/menu_html/definicoes.html",
            "/html/area_de_estudo/disciplinas.html",
            "/html/area_de_estudo/campanha.html?disciplina=portugues",
            "/html/area_de_estudo/exercicios.html?disciplina=portugues&level=1&node=0",
        ]
        for path in pages:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                page = response.get_data(as_text=True).lower()
                if path == "/html/menu_html/loja.html":
                    self.assertIn('/js/store.js', page)
                else:
                    self.assertNotIn("<script", page)

    def test_dashboard_loads_catalog_context_once_per_request(self):
        self.create_account_and_login()
        with mock.patch.object(
            application.catalog,
            "load_context",
            wraps=application.catalog.load_context,
        ) as load_context:
            response = self.client.get("/html/menu_html/dashboard.html")

        self.assertEqual(response.status_code, 200)
        load_context.assert_called_once()

    def test_avatar_shows_all_frames_and_can_equip_owned_frame(self):
        self.create_account_and_login()
        state = self.state()
        state["borders"].append("mint-loop")
        with application.app.app_context():
            application.save_state(state, application.load_user("ana@example.com"))

        response = self.client.get("/html/menu_html/avatar.html")
        page = response.get_data(as_text=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn("20 molduras", page)
        self.assertEqual(page.count('class="avatar-border-art"'), 20)
        self.assertIn("Musgo Antigo", page)
        self.assertIn("border-mint-loop.svg", page)
        self.assertIn('avatar-border-option unlocked', page)
        self.assertIn('avatar-border-status unlocked">Desbloqueada</span>', page)
        self.assertIn('avatar-border-status locked">Bloqueada</span>', page)
        self.assertIn('type="submit" form="avatar-form">Atualizar avatar</button>', page)
        self.assertIn('<form id="avatar-form" method="post">', page)
        self.assertIn("Bloqueada", page)

        response = self.client.post(
            "/html/menu_html/avatar.html",
            data={
                "csrf_token": self.csrf_token(response),
                "name": "Ana",
                "initials": "AS",
                "color": "blue",
                "border": "mint-loop",
            },
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.state()["selected_border"], "mint-loop")

    def test_reference_pages_render_their_visual_sections(self):
        self.create_account_and_login()

        settings = self.client.get("/html/menu_html/definicoes.html").get_data(as_text=True)
        self.assertIn("Ajuste a experiência visual da plataforma.", settings)
        self.assertIn("theme-preview theme-night", settings)
        self.assertIn("theme-preview theme-dawn", settings)
        self.assertIn("Lembrete diário", settings)

        shop = self.client.get("/html/menu_html/loja.html").get_data(as_text=True)
        self.assertIn("loot-box-wrap", shop)
        self.assertIn("loot-prize-tier", shop)
        self.assertIn("54,5%", shop)
        self.assertIn("Caixa de molduras", shop)
        store_script = self.client.get("/js/store.js")
        self.assertEqual(store_script.status_code, 200)
        store_script.close()

        tests = self.client.get("/html/menu_html/testes.html").get_data(as_text=True)
        self.assertIn("Escolha uma disciplina", tests)
        self.assertIn("/styles/disciplines.css", tests)
        self.assertIn("/imagens/disciplinas/portugues.svg", tests)

    def test_theme_selection_is_saved_and_applied_to_the_site(self):
        self.create_account_and_login()
        response = self.client.get("/html/menu_html/definicoes.html")
        response = self.client.post(
            "/html/menu_html/definicoes.html",
            data={
                "csrf_token": self.csrf_token(response),
                "name": "Ana",
                "daily_goal": "30 minutos",
                "week_start": "Segunda-feira",
                "theme": "dawn",
            },
            follow_redirects=True,
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('<html lang="pt-BR" class="theme-dawn">', response.get_data(as_text=True))
        self.assertEqual(self.state()["settings"]["theme"], "dawn")

        stylesheet_response = self.client.get("/styles/base.css")
        stylesheet = stylesheet_response.get_data(as_text=True)
        stylesheet_response.close()
        self.assertIn(".theme-dawn {", stylesheet)
        self.assertIn("--bg: #e8eff8;", stylesheet)
        self.assertIn('html[class^="theme-"] .panel', stylesheet)
        self.assertIn("--surface-card: rgba(255, 255, 255, 0.94);", stylesheet)

        dashboard = self.client.get("/html/menu_html/dashboard.html")
        self.assertIn('class="theme-dawn"', dashboard.get_data(as_text=True))
        dashboard.close()

    def test_shop_opens_up_to_five_boxes_and_animates_all_rewards(self):
        self.create_account_and_login()
        response = self.client.get("/html/menu_html/loja.html")
        token = self.csrf_token(response)
        with (
            mock.patch.object(application.random, "choices", return_value=["comum"]),
            mock.patch.object(application.random, "choice", side_effect=lambda values: values[0]),
        ):
            response = self.client.post(
                "/html/menu_html/loja.html",
                data={
                    "csrf_token": token,
                    "box": "border",
                    "quantity": "5",
                },
                follow_redirects=True,
            )

        page = response.get_data(as_text=True)
        state = self.state()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(page.count('class="case-reward-card rarity-comum"'), 5)
        self.assertIn("5 caixas abertas", page)
        self.assertGreater(page.index('id="case-opening"'), page.index("</main>"))
        self.assertIn("<noscript>", page)
        self.assertIn("Recompensas recebidas", page)
        self.assertEqual(state["tokens"], 500000 - 5 * 350 + 4 * 10)
        self.assertEqual(len(state["borders"]), 1)
        self.assertEqual(len(state["store_history"]), 5)

    def test_shop_rejects_more_than_five_boxes_without_charging(self):
        self.create_account_and_login()
        response = self.client.get("/html/menu_html/loja.html")
        response = self.client.post(
            "/html/menu_html/loja.html",
            data={
                "csrf_token": self.csrf_token(response),
                "box": "border",
                "quantity": "6",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.state()["tokens"], 500000)
        self.assertEqual(self.state()["store_history"], [])

    def test_campaign_completion_unlocks_test_and_persists_result(self):
        self.create_account_and_login()
        for node in range(6):
            with application.db_connection() as connection:
                questions = application.catalog.get_questions(
                    connection, "portugues", "lesson", 1, node
                )
            for question_index, question in enumerate(questions):
                response = self.client.get(
                    f"/html/area_de_estudo/exercicios.html?disciplina=portugues&level=1&node={node}"
                )
                token = self.csrf_token(response)
                response = self.client.post(
                    f"/html/area_de_estudo/exercicios.html?disciplina=portugues&level=1&node={node}",
                    data={
                        "csrf_token": token,
                        "question": str(question_index),
                        "question_id": question["id"],
                        "answer": str(question["correct_index"]),
                    },
                )
                self.assertEqual(response.status_code, 200)
        self.assertEqual(len(self.state()["campaigns"]["portugues:1"]), 6)

        with application.db_connection() as connection:
            question_bank = application.catalog.get_questions(
                connection, "portugues", "test", 1
            )
        selected = random.Random(f"{date.today().isoformat()}:portugues:1").sample(
            question_bank, 8
        )
        response = self.client.get("/html/area_de_estudo/teste.html?disciplina=portugues&level=1")
        token = self.csrf_token(response)
        answers = {
            f"answer_{index}": str(question["correct_index"])
            for index, question in enumerate(selected)
        }
        question_ids = {
            f"question_id_{index}": question["id"]
            for index, question in enumerate(selected)
        }
        response = self.client.post(
            "/html/area_de_estudo/teste.html?disciplina=portugues&level=1",
            data={"csrf_token": token, **answers, **question_ids},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Aprovado com 8/8", response.get_data(as_text=True))
        self.assertIn("portugues:1", self.state()["passed_tests"])

    def test_store_and_settings_update_are_saved(self):
        self.create_account_and_login()
        response = self.client.get("/html/menu_html/loja.html")
        token = self.csrf_token(response)
        with (
            mock.patch.object(application.random, "choices", return_value=["comum"]),
            mock.patch.object(application.random, "choice", side_effect=lambda values: values[0]),
        ):
            response = self.client.post(
                "/html/menu_html/loja.html",
                data={"csrf_token": token, "box": "theme"},
            )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.state()["tokens"], 499650)
        self.assertEqual(len(self.state()["purchases"]), 1)

        response = self.client.get("/html/menu_html/definicoes.html")
        token = self.csrf_token(response)
        response = self.client.post(
            "/html/menu_html/definicoes.html",
            data={
                "csrf_token": token,
                "name": "Ana S.",
                "daily_goal": "1 hora",
                "week_start": "Domingo",
                "theme": "night",
                "reminder": "on",
            },
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.state()["settings"]["daily_goal"], "1 hora")
        self.assertFalse(self.state()["settings"]["weekly_summary"])
        self.assertEqual(application.load_user("ana@example.com")["name"], "Ana S.")

    def test_catalogue_is_seeded_and_pages_read_questions_from_database(self):
        with application.db_connection() as connection:
            counts = {
                table: connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
                for table in (
                    "disciplines", "stages", "questions", "missions", "rarities",
                    "items", "appearance_themes", "avatar_colors", "avatar_defaults",
                    "store_boxes",
                )
            }
            connection.execute(
                """UPDATE questions SET prompt = ?
                WHERE id = 'lesson:portugues:1:0:0'""",
                ("Pergunta carregada da base de dados?",),
            )
            connection.execute(
                """INSERT INTO questions
                (id, discipline_id, kind, level, node_index, ordinal, prompt,
                 options_json, correct_index, explanation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    "lesson:portugues:1:0:2", "portugues", "lesson", 1, 0, 2,
                    "Pergunta adicional da base de dados?",
                    json.dumps(["Sim", "Não"]), 0, "A resposta correta é sim.",
                ),
            )
        self.assertEqual(counts["disciplines"], 4)
        self.assertEqual(counts["stages"], 72)
        self.assertGreaterEqual(counts["questions"], 288)
        self.assertGreaterEqual(counts["items"], 34)

        self.create_account_and_login()
        response = self.client.get(
            "/html/area_de_estudo/exercicios.html?disciplina=portugues&level=1&node=0"
        )
        self.assertEqual(response.status_code, 200)
        page = response.get_data(as_text=True)
        self.assertIn("Pergunta carregada da base de dados?", page)
        self.assertIn("Pergunta adicional da base de dados?", page)
        self.assertIn("0/3", page)
        self.assertIn("EXERCÍCIO 3</span> de 3", page)

        response = self.client.get("/html/menu_html/jornada.html")
        page = response.get_data(as_text=True)
        self.assertIn("de 72 módulos", page)
        self.assertIn("4 trilhas", page)

    def test_completed_missions_can_be_claimed_once_with_daily_bonus(self):
        self.create_account_and_login()
        state = self.state()
        state["daily"].update({
            "mission_ids": ["nodes-three", "nodes-four", "complete-stage"],
            "nodes": [
                {"discipline": "portugues", "level": 1, "node": node}
                for node in range(6)
            ],
            "final_tests": ["portugues:1"],
            "completed": [],
            "claimed": [],
            "bonus_claimed": False,
        })
        with application.app.app_context():
            application.save_state(state, application.load_user("ana@example.com"))

        response = self.client.get("/html/menu_html/missoes.html")
        token = self.csrf_token(response)
        for mission_id in ("nodes-three", "nodes-four", "complete-stage"):
            response = self.client.post(
                "/html/menu_html/missoes.html",
                data={"csrf_token": token, "mission_id": mission_id},
            )
            self.assertEqual(response.status_code, 302)
        response = self.client.post(
            "/html/menu_html/missoes.html",
            data={"csrf_token": token, "claim_bonus": "1"},
        )
        self.assertEqual(response.status_code, 302)

        state = self.state()
        self.assertEqual(state["xp"], 365)
        self.assertEqual(state["tokens"], 500735)
        self.assertEqual(state["completed_total"], 3)
        self.assertTrue(state["daily"]["bonus_claimed"])


if __name__ == "__main__":
    unittest.main()
