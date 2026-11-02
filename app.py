import json
import os
import random
import re
import secrets
import sqlite3
import math
from html import escape
from contextlib import contextmanager
from datetime import date
from functools import wraps
from pathlib import Path

from flask import (
    Flask,
    abort,
    flash,
    g,
    has_request_context,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash
from markupsafe import Markup

import catalog


ROOT = Path(__file__).resolve().parent


def load_secret_key(secret_path=None):
    configured_key = os.environ.get("STUDY_QUEST_SECRET_KEY")
    if configured_key:
        return configured_key

    secret_path = secret_path or ROOT / "instance" / "secret_key"
    secret_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with secret_path.open("x", encoding="utf-8") as secret_file:
            secret_key = secrets.token_hex(32)
            secret_file.write(secret_key)
            return secret_key
    except FileExistsError:
        secret_key = secret_path.read_text(encoding="utf-8").strip()
        if secret_key:
            return secret_key
        raise RuntimeError(f"A chave secreta da aplicação está vazia: {secret_path}")


app = Flask(__name__, template_folder="templates")
app.secret_key = load_secret_key()
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")
DATABASE = Path(os.environ.get("STUDY_QUEST_DATABASE", ROOT / "instance" / "study_quest.sqlite"))


def connect_db():
    DATABASE.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def db_connection():
    connection = connect_db()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_db():
    with db_connection() as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                state_json TEXT NOT NULL
            )"""
        )
        catalog.initialize_catalog(connection)


def catalog_context():
    if has_request_context() and hasattr(g, "_catalog_context"):
        return g._catalog_context
    with db_connection() as connection:
        context = catalog.load_context(connection)
    if has_request_context():
        g._catalog_context = context
    return context


def default_state(connection):
    missions = catalog.get_missions(connection)
    if len(missions) < 3:
        raise RuntimeError("A base de dados precisa de pelo menos três missões ativas.")
    return {
        "tokens": 500000,
        "xp": 0,
        "completed_total": 0,
        "campaigns": {},
        "passed_tests": [],
        "test_attempts": {},
        "test_results": {},
        "pending_answers": {},
        "daily": {
            "date": date.today().isoformat(),
            "mission_ids": [mission["id"] for mission in random.sample(missions, 3)],
            "completed": [],
            "claimed": [],
            "bonus_claimed": False,
            "nodes": [],
            "final_tests": [],
        },
        "purchases": [],
        "borders": [],
        "store_history": [],
        "selected_border": "",
        "tickets": 0,
        "avatar": catalog.get_default_avatar(connection),
        "settings": {
            "daily_goal": "30 minutos",
            "week_start": "Segunda-feira",
            "reminder": True,
            "weekly_summary": True,
            "achievements": False,
            "theme": "night",
        },
    }


def load_user(email):
    with db_connection() as connection:
        return connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def get_state(user=None):
    if user is None:
        user = g.user
    return json.loads(user["state_json"])


def save_state(state, user=None):
    if user is None:
        user = g.user
    with db_connection() as connection:
        connection.execute(
            "UPDATE users SET state_json = ? WHERE email = ?",
            (json.dumps(state, ensure_ascii=False), user["email"]),
        )
    g.user = load_user(user["email"])


def persist_new_user(email, name, password):
    with db_connection() as connection:
        state = default_state(connection)
        connection.execute(
            "INSERT INTO users (email, name, password_hash, state_json) VALUES (?, ?, ?, ?)",
            (email, name, generate_password_hash(password), json.dumps(state, ensure_ascii=False)),
        )


def csrf_value():
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_urlsafe(32)
    return session["csrf_token"]


@app.context_processor
def template_helpers():
    user = getattr(g, "user", None)
    common = {**catalog_context(), "today": date.today().isoformat()}
    if user:
        state = get_state(user)
        return {
            **common,
            "current_user": user,
            "profile": state,
            "token_balance": state["tokens"],
            "level_number": state["xp"] // 500 + 1,
            "level_xp": state["xp"] % 500,
            "csrf_token": csrf_value,
        }
    return {
        **common,
        "current_user": None,
        "profile": None,
        "token_balance": 0,
        "csrf_token": csrf_value,
    }


@app.before_request
def prepare_request():
    email = session.get("email")
    g.user = load_user(email) if email else None
    if request.method == "POST":
        supplied = request.form.get("csrf_token", "")
        if not supplied or not secrets.compare_digest(supplied, session.get("csrf_token", "")):
            abort(400, "Token de segurança inválido. Atualize a página e tente novamente.")


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if g.user is None:
            flash("Entre na sua conta para continuar.", "error")
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


def daily_state(state):
    saved = state["daily"]
    today = date.today().isoformat()
    if saved.get("date") != today:
        with db_connection() as connection:
            missions = catalog.get_missions(connection)
        if len(missions) < 3:
            raise RuntimeError("A base de dados precisa de pelo menos três missões ativas.")
        state["daily"] = {
            "date": today,
            "mission_ids": [mission["id"] for mission in random.sample(missions, 3)],
            "completed": [],
            "claimed": [],
            "bonus_claimed": False,
            "nodes": [],
            "final_tests": [],
        }
    return state["daily"]


def campaign_key(discipline, level):
    return f"{discipline}:{level}"


def completed_nodes(state):
    return state["campaigns"]


def mission_list(state):
    daily = daily_state(state)
    with db_connection() as connection:
        mission_catalog = catalog.get_missions(connection)
        discipline_count = connection.execute(
            "SELECT COUNT(*) FROM disciplines WHERE is_active = 1"
        ).fetchone()[0]
    missions = [item for item in mission_catalog if item["id"] in daily["mission_ids"]]
    nodes = daily["nodes"]
    passed = daily["final_tests"]
    for mission in missions:
        kind = mission.get("type", "nodes")
        if kind == "tests":
            progress = len(passed)
            label = f"{min(progress, mission['goal'])}/{mission['goal']} testes"
        elif kind == "disciplines":
            progress = len({item["discipline"] for item in nodes})
            label = f"{min(progress, mission['goal'])}/{mission['goal']} disciplinas"
        elif kind == "nodes-per-discipline":
            counts = {}
            for item in nodes:
                key = item["discipline"]
                counts.setdefault(key, set()).add((item["level"], item["node"]))
            progress = sum(len(items) >= mission["goal"] for items in counts.values())
            label = f"{progress}/{discipline_count} disciplinas"
        elif kind == "discipline-nodes":
            counts = {}
            for item in nodes:
                key = item["discipline"]
                counts.setdefault(key, set()).add((item["level"], item["node"]))
            progress = max((len(items) for items in counts.values()), default=0)
            label = f"{min(progress, mission['goal'])}/{mission['goal']} nodes na mesma disciplina"
        elif kind == "stage":
            counts = {}
            for item in nodes:
                key = campaign_key(item["discipline"], item["level"])
                counts[key] = counts.get(key, 0) + 1
            progress = max(counts.values(), default=0)
            label = f"{min(progress, mission['goal'])}/{mission['goal']} nodes na mesma etapa"
        else:
            progress = len(nodes)
            label = f"{min(progress, mission['goal'])}/{mission['goal']} nodes"
        mission["progress"] = progress
        mission["progress_label"] = label
        target = discipline_count if kind == "nodes-per-discipline" else mission["goal"]
        mission["target"] = target
        mission["complete"] = progress >= target
        if mission["complete"] and mission["id"] not in daily["completed"]:
            daily["completed"].append(mission["id"])
    return missions


def grant_rewards(state, xp, tokens, count_completion=True):
    state["xp"] += xp
    state["tokens"] += tokens
    if count_completion:
        state["completed_total"] += 1


def progress_by_discipline(state, discipline):
    context = catalog_context()
    levels = sorted(context["LEVEL_NAMES"])
    nodes_by_level = context["STAGE_NODE_COUNTS"].get(discipline, {})
    total_modules = sum(nodes_by_level.values())
    nodes = sum(
        sum(
            node_index in range(nodes_by_level.get(level, 0))
            for node_index in set(state["campaigns"].get(campaign_key(discipline, level), []))
        )
        for level in levels
    )
    passed = sum(
        f"{discipline}:{level}" in state["passed_tests"] for level in levels
    )
    attempts_by_level = [
        state["test_results"].get(campaign_key(discipline, level), [])
        for level in levels
    ]
    averages = []
    for attempts in attempts_by_level:
        valid = [
            item for item in attempts
            if item.get("total", 0) > 0 and 0 <= item.get("score", -1) <= item["total"]
        ]
        averages.append({
            "average": (
                sum(item["score"] / item["total"] * 12 for item in valid) / len(valid)
                if valid else None
            ),
            "count": len(valid),
        })
    return {
        "nodes": nodes,
        "total_modules": total_modules,
        "percent": round(nodes / total_modules * 100) if total_modules else 0,
        "passed": passed,
        "averages": averages,
    }


def radar_chart(state):
    axes = []
    for discipline, details in catalog_context()["DISCIPLINES"].items():
        progress = progress_by_discipline(state, discipline)
        test_percentages = [
            item["average"] / 12 * 100
            for item in progress["averages"]
            if item["average"] is not None
        ]
        test_bonus = round(sum(test_percentages) / len(test_percentages) * 0.2) if test_percentages else 0
        axes.append({
            "label": details["name"],
            "value": min(100, progress["percent"] + test_bonus),
        })
    axes.append({"label": "Rank", "value": min(100, round(state["xp"] / 5000 * 100))})
    center_x, center_y, radius = 240, 215, 132

    def point(index, scale):
        angle = -math.pi / 2 + index * 2 * math.pi / len(axes)
        return center_x + math.cos(angle) * radius * scale, center_y + math.sin(angle) * radius * scale

    def polygon_points(scale):
        return " ".join(f"{x:.1f},{y:.1f}" for x, y in (point(index, scale) for index in range(len(axes))))

    description = ". ".join(
        "{}: {}%".format(escape(axis["label"]), axis["value"])
        for axis in axes
    )
    parts = [
        '<svg viewBox="0 0 480 430" class="radar-svg" role="img" aria-labelledby="radar-title radar-desc">',
        '<title id="radar-title">Progresso nas disciplinas e rank</title>',
        f'<desc id="radar-desc">{description}</desc>',
    ]
    for percentage in (20, 40, 60, 80, 100):
        parts.append(f'<polygon points="{polygon_points(percentage / 100)}" class="radar-grid-line"/>')
    for index in range(len(axes)):
        x, y = point(index, 1)
        parts.append(f'<line x1="{center_x}" y1="{center_y}" x2="{x:.1f}" y2="{y:.1f}" class="radar-axis-line"/>')
    data_points = [
        point(index, axis["value"] / 100)
        for index, axis in enumerate(axes)
    ]
    data = " ".join(f"{x:.1f},{y:.1f}" for x, y in data_points)
    parts.append(f'<polygon points="{data}" class="radar-data-area"/>')
    for index, (axis, (x, y)) in enumerate(zip(axes, data_points)):
        label_x, label_y = point(index, 1.34)
        anchor = "end" if label_x < center_x - 12 else "start" if label_x > center_x + 12 else "middle"
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" class="radar-data-point"/>')
        parts.append(
            f'<text x="{label_x:.1f}" y="{label_y:.1f}" text-anchor="{anchor}" '
            f'class="radar-axis-label">{escape(axis["label"])}</text>'
        )
    parts.append("</svg>")
    return Markup("".join(parts))


def render_page(page, state=None, **context):
    if state is None and g.user:
        state = get_state()
    return render_template("page.html", page=page, state=state, **context)


def safe_discipline(value):
    if value not in catalog_context()["DISCIPLINES"]:
        abort(404, "Disciplina não encontrada.")
    return value


def safe_level(value):
    try:
        level = int(value)
    except (TypeError, ValueError):
        abort(404)
    if level not in catalog_context()["LEVEL_NAMES"]:
        abort(404)
    return level


@app.get("/")
def home():
    return redirect(url_for("dashboard") if g.user else url_for("login"))


@app.route("/html/login/login.html", methods=["GET", "POST"])
def login():
    form_mode = request.args.get("mode", "login")
    if request.method == "POST":
        action = request.form.get("action")
        email = request.form.get("email", "").strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            flash("Digite um e-mail válido.", "error")
            return render_template("auth.html", mode="register" if action == "register" else "login")
        if action == "register":
            name = f"{request.form.get('name', '').strip()} {request.form.get('lastname', '').strip()}".strip()
            password = request.form.get("password", "")
            if not name or not request.form.get("lastname", "").strip() or not password:
                flash("Preencha todos os campos.", "error")
            elif len(password) < 6:
                flash("A senha deve ter pelo menos 6 caracteres.", "error")
            elif password != request.form.get("confirm"):
                flash("As senhas não coincidem.", "error")
            elif not request.form.get("terms"):
                flash("Aceite os termos para criar a conta.", "error")
            elif load_user(email):
                flash("Já existe uma conta com este e-mail.", "error")
            else:
                persist_new_user(email, name, password)
                flash("Conta criada. Entre com os seus dados.", "success")
                return render_template("auth.html", mode="login", email=email)
            return render_template("auth.html", mode="register")
        password = request.form.get("password", "")
        user = load_user(email)
        if not user or not check_password_hash(user["password_hash"], password):
            flash("E-mail ou senha incorretos.", "error")
            return render_template("auth.html", mode="login", email=email)
        session.clear()
        session["email"] = email
        session["csrf_token"] = secrets.token_urlsafe(32)
        session.permanent = bool(request.form.get("remember"))
        return redirect(url_for("dashboard"))
    if g.user:
        return redirect(url_for("dashboard"))
    return render_template("auth.html", mode=form_mode if form_mode in {"login", "register"} else "login")


@app.post("/logout")
@login_required
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.get("/styles/<path:filename>")
def styles(filename):
    return send_from_directory(ROOT / "styles", filename)


@app.get("/js/<path:filename>")
def scripts(filename):
    return send_from_directory(ROOT / "js", filename)


@app.get("/imagens/<path:filename>")
def images(filename):
    return send_from_directory(ROOT / "imagens", filename)


@app.get("/favicon.ico")
def favicon():
    return "", 204


@app.route("/html/menu_html/dashboard.html", methods=["GET", "POST"])
@login_required
def dashboard():
    state = get_state()
    missions = mission_list(state)
    save_state(state)
    return render_page("dashboard", state, missions=missions, radar_svg=radar_chart(state))


@app.route("/html/menu_html/missoes.html", methods=["GET", "POST"])
@login_required
def missions_page():
    state = get_state()
    missions = mission_list(state)
    daily = daily_state(state)
    if request.method == "POST":
        mission_id = request.form.get("mission_id")
        mission = next((item for item in missions if item["id"] == mission_id), None)
        if mission and mission["complete"] and mission_id not in daily["claimed"]:
            daily["claimed"].append(mission_id)
            grant_rewards(state, mission["xp"], mission["tokens"])
            flash(f"Recompensa recebida: +{mission['xp']} XP e +{mission['tokens']} Tokens.", "success")
        elif request.form.get("claim_bonus") and not daily["bonus_claimed"] and all(
            mission_id in daily["claimed"] for mission_id in daily["mission_ids"]
        ):
            daily["bonus_claimed"] = True
            grant_rewards(state, 100, 250, count_completion=False)
            flash("Bónus diário recebido: +100 XP e +250 Tokens.", "success")
        else:
            flash("Essa recompensa ainda não está disponível.", "error")
        save_state(state)
        return redirect(request.path)
    save_state(state)
    all_claimed = all(mission_id in daily["claimed"] for mission_id in daily["mission_ids"])
    return render_page("missions", state, missions=missions, all_claimed=all_claimed)


@app.route("/html/menu_html/jornada.html")
@login_required
def journey():
    state = get_state()
    disciplines = catalog_context()["DISCIPLINES"]
    rows = [{"id": key, **progress_by_discipline(state, key)} for key in disciplines]
    active = sum(bool(row["nodes"] or row["passed"]) for row in rows)
    total_nodes = sum(row["nodes"] for row in rows)
    total_modules = sum(row["total_modules"] for row in rows)
    total_passed = sum(row["passed"] for row in rows)
    return render_page(
        "journey", state, rows=rows, active=active,
        total_nodes=total_nodes, total_modules=total_modules, total_passed=total_passed,
        overall=round(total_nodes / total_modules * 100) if total_modules else 0,
    )


@app.route("/html/menu_html/testes.html")
@login_required
def tests_page():
    state = get_state()
    discipline = request.args.get("disciplina")
    if discipline:
        safe_discipline(discipline)
    test_stages = []
    if discipline:
        today = date.today().isoformat()
        for level in sorted(catalog_context()["LEVEL_NAMES"]):
            key = campaign_key(discipline, level)
            attempts = state["test_attempts"].get(f"{today}:{key}", [])
            regular_attempts = sum(not attempt.get("ticket") for attempt in attempts)
            previous_passed = (
                level == min(catalog_context()["LEVEL_NAMES"])
                or f"{discipline}:{level - 1}" in state["passed_tests"]
            )
            passed_today = any(attempt.get("passed") for attempt in attempts)
            node_count = len(set(state["campaigns"].get(key, [])))
            already_passed = f"{discipline}:{level}" in state["passed_tests"]
            can_start = (
                node_count == 6 and previous_passed
                and ((not passed_today and regular_attempts < 2) or state["tickets"] > 0)
            )
            test_stages.append({
                "level": level,
                "nodes": node_count,
                "attempts": len(attempts),
                "regular_attempts": regular_attempts,
                "previous_passed": previous_passed,
                "passed_today": passed_today,
                "already_passed": already_passed,
                "can_start": can_start,
            })
    return render_page("tests", state, selected_discipline=discipline, test_stages=test_stages)


@app.route("/html/menu_html/ranking.html")
@login_required
def ranking():
    with db_connection() as connection:
        rows = connection.execute("SELECT name, state_json FROM users").fetchall()
    leaders = sorted(
        [{"name": row["name"], "xp": json.loads(row["state_json"])["xp"]} for row in rows],
        key=lambda item: (-item["xp"], item["name"].casefold()),
    )[:10]
    return render_page("ranking", leaders=leaders)


@app.route("/html/menu_html/loja.html", methods=["GET", "POST"])
@login_required
def shop():
    state = get_state()
    results = session.pop("store_results", [])
    with db_connection() as connection:
        rarities = catalog.get_rarities(connection)
        items = catalog.get_items(connection)
        boxes = {
            row["id"]: {"name": row["name"], "price": row["price"]}
            for row in connection.execute(
                "SELECT id, name, price FROM store_boxes WHERE is_active = 1"
            )
        }
    if not rarities:
        raise RuntimeError("Não existem raridades ativas na base de dados.")
    if request.method == "POST":
        box = request.form.get("box")
        if box not in boxes:
            abort(400, "Tipo de caixa inválido.")
        try:
            quantity = int(request.form.get("quantity", "1"))
        except ValueError:
            abort(400, "Quantidade de caixas inválida.")
        if not 1 <= quantity <= 5:
            abort(400, "Podes abrir entre uma e cinco caixas de cada vez.")
        total_price = boxes[box]["price"] * quantity
        if state["tokens"] < total_price:
            flash(f"Faltam {total_price - state['tokens']} Tokens para abrir {quantity} caixas.", "error")
        else:
            reward_pulls = []
            for _ in range(quantity):
                rarity_id = random.choices(
                    [rarity["id"] for rarity in rarities],
                    weights=[rarity["chance"] for rarity in rarities],
                    k=1,
                )[0]
                rarity = next(item for item in rarities if item["id"] == rarity_id)
                eligible_rewards = [
                    item for item in items
                    if item["rarity"] == rarity_id
                    and (item["type"] == "ticket" or item["type"] == box)
                ]
                if not eligible_rewards:
                    abort(503, f"Não existem recompensas ativas da raridade {rarity['name']} para esta caixa.")
                reward_pulls.append((rarity, random.choice(eligible_rewards)))

            state["tokens"] -= total_price
            results = []
            for rarity, reward in reward_pulls:
                reward_id = reward["id"]
                duplicate = False
                if reward["type"] == "ticket":
                    state["tickets"] += 1
                elif reward["type"] == "theme":
                    if reward_id in state["purchases"]:
                        duplicate = True
                    else:
                        state["purchases"].append(reward_id)
                elif reward_id in state["borders"]:
                    duplicate = True
                else:
                    state["borders"].append(reward_id)

                duplicate_tokens = rarity["duplicate_tokens"] if duplicate else 0
                state["tokens"] += duplicate_tokens
                result = {
                    "id": reward_id,
                    "name": reward["name"],
                    "rarity": rarity["name"],
                    "rarity_id": rarity["id"],
                    "box": box,
                    "type": reward["type"],
                    "image_url": reward["image_url"],
                    "duplicate": duplicate,
                    "duplicate_tokens": duplicate_tokens,
                }
                results.append(result)
                state["store_history"].append({
                    "name": reward["name"],
                    "rarity": rarity["name"],
                    "box": box,
                    "duplicate": duplicate,
                    "date": date.today().isoformat(),
                })
            flash(f"Abriste {quantity} {'caixa' if quantity == 1 else 'caixas'} e recebeste {quantity} {'recompensa' if quantity == 1 else 'recompensas'}.", "success")
            session["store_results"] = results
        save_state(state)
        return redirect(request.path)
    themes = {
        item["id"]: (item["name"], item["rarity"])
        for item in items if item["type"] == "theme"
    }
    borders = [item for item in items if item["type"] == "border"]
    box_prizes = {
        box_id: {
            rarity["id"]: [
                item for item in items
                if item["rarity"] == rarity["id"]
                and item["type"] in {box_id, "ticket"}
            ]
            for rarity in rarities
        }
        for box_id in ("theme", "border")
    }
    return render_page(
        "shop", state, results=results, themes=themes, borders=borders,
        rarities=rarities, boxes=boxes, box_prizes=box_prizes,
    )


@app.route("/html/menu_html/avatar.html", methods=["GET", "POST"])
@login_required
def avatar():
    state = get_state()
    with db_connection() as connection:
        colors = catalog.load_context(connection)["AVATAR_COLORS"]
        borders = catalog.get_items(connection, "border")
    if request.method == "POST":
        name = request.form.get("name", "").strip()[:30]
        initials = request.form.get("initials", "").strip()[:3].upper()
        color = request.form.get("color", "blue")
        border = request.form.get("border", "")
        with db_connection() as connection:
            default_avatar = catalog.get_default_avatar(connection)
        owned_borders = {item["id"] for item in borders}
        if color not in colors:
            abort(400, "Cor de avatar inválida.")
        if border and border not in state["borders"]:
            abort(400, "Moldura não desbloqueada.")
        state["avatar"] = {
            "name": name or default_avatar["name"],
            "initials": initials or default_avatar["initials"],
            "color": color,
        }
        state["selected_border"] = border if border in owned_borders else ""
        save_state(state)
        flash("Avatar atualizado com sucesso.", "success")
        return redirect(request.path)
    return render_page("avatar", state, colors=colors, borders=borders)


@app.route("/html/menu_html/definicoes.html", methods=["GET", "POST"])
@login_required
def settings():
    state = get_state()
    if request.method == "POST":
        goal = request.form.get("daily_goal")
        week_start = request.form.get("week_start")
        theme = request.form.get("theme")
        available_themes = catalog_context()["THEME_NAMES"]
        free_themes = catalog_context()["FREE_THEME_IDS"]
        allowed_themes = free_themes | set(state["purchases"])
        if goal not in {"15 minutos", "30 minutos", "1 hora", "2 horas"}:
            abort(400, "Meta diária inválida.")
        if week_start not in {"Segunda-feira", "Domingo"}:
            abort(400, "Início da semana inválido.")
        if theme not in available_themes or theme not in allowed_themes:
            abort(400, "Tema não desbloqueado.")
        state["settings"] = {
            "daily_goal": goal,
            "week_start": week_start,
            "reminder": bool(request.form.get("reminder")),
            "weekly_summary": bool(request.form.get("weekly_summary")),
            "achievements": bool(request.form.get("achievements")),
            "theme": theme,
        }
        display_name = request.form.get("name", "").strip()[:60]
        if display_name:
            with db_connection() as connection:
                connection.execute("UPDATE users SET name = ? WHERE email = ?", (display_name, g.user["email"]))
            g.user = load_user(g.user["email"])
        save_state(state)
        flash("Definições guardadas.", "success")
        return redirect(request.path)
    return render_page("settings", state, themes=catalog_context()["THEME_NAMES"])


@app.route("/html/area_de_estudo/disciplinas.html")
@login_required
def disciplines():
    state = get_state()
    return render_page("disciplines", state)


@app.route("/html/area_de_estudo/campanha.html")
@login_required
def campaign():
    state = get_state()
    discipline = safe_discipline(request.args.get("disciplina", "portugues"))
    level = safe_level(request.args.get("level", "1"))
    levels = sorted(catalog_context()["LEVEL_NAMES"])
    if level not in levels:
        abort(404, "Etapa não encontrada.")
    if level != levels[0] and f"{discipline}:{level - 1}" not in state["passed_tests"]:
        flash("Passe o teste da etapa anterior para desbloquear este caminho.", "error")
        return redirect(url_for("campaign", disciplina=discipline, level=level - 1))
    key = campaign_key(discipline, level)
    completed = set(state["campaigns"].get(key, []))
    next_node = next((node for node in range(6) if node not in completed), 5)
    with db_connection() as connection:
        campaign_nodes = [
            row["node_name"]
            for row in connection.execute(
                """SELECT node_name FROM stages WHERE discipline_id = ? AND level = ?
                ORDER BY node_index""",
                (discipline, level),
            )
        ]
    if len(campaign_nodes) != 6:
        abort(503, "Esta etapa ainda não tem seis nodes ativos na base de dados.")
    return render_page(
        "campaign", state, discipline=discipline, level=level,
        completed=completed, next_node=next_node, campaign_nodes=campaign_nodes,
    )


@app.route("/html/area_de_estudo/exercicios.html", methods=["GET", "POST"])
@login_required
def exercises():
    state = get_state()
    discipline = safe_discipline(request.args.get("disciplina", "portugues"))
    level = safe_level(request.args.get("level", "1"))
    levels = sorted(catalog_context()["LEVEL_NAMES"])
    if level not in levels:
        abort(404, "Etapa não encontrada.")
    try:
        node = int(request.args.get("node", "0"))
    except ValueError:
        abort(404)
    if node < 0 or node >= 6:
        abort(404)
    if level != levels[0] and f"{discipline}:{level - 1}" not in state["passed_tests"]:
        abort(403, "Passe o teste da etapa anterior.")
    key = campaign_key(discipline, level)
    completed = set(state["campaigns"].get(key, []))
    with db_connection() as connection:
        questions = catalog.get_questions(connection, discipline, "lesson", level, node)
        node_names = [
            row["node_name"]
            for row in connection.execute(
                """SELECT node_name FROM stages WHERE discipline_id = ? AND level = ?
                ORDER BY node_index""",
                (discipline, level),
            )
        ]
    if len(questions) < 2 or len(node_names) != 6:
        abort(503, "Este node precisa de pelo menos duas perguntas ativas na base de dados.")
    answer_key = f"{key}:{node}"
    solved = set(state["pending_answers"].get(answer_key, []))
    feedback = None
    if request.method == "POST":
        if node > 0 and node - 1 not in completed:
            abort(403, "Complete o nó anterior antes de continuar.")
        try:
            answer_index = int(request.form.get("answer", "-1"))
            question_index = int(request.form.get("question", "-1"))
        except ValueError:
            abort(400, "Resposta inválida.")
        if (
            question_index not in range(len(questions))
            or request.form.get("question_id") != questions[question_index]["id"]
        ):
            abort(400, "A pergunta mudou desde que a página foi carregada. Atualize e tente novamente.")
        if question_index not in range(len(questions)) or answer_index not in range(len(questions[question_index]["options"])):
            abort(400, "Resposta inválida.")
        if answer_index == questions[question_index]["correct_index"]:
            solved.add(question_index)
            feedback = "Resposta certa!"
            state["pending_answers"][answer_key] = sorted(solved)
            if len(solved) == len(questions):
                completed.add(node)
                state["campaigns"][key] = sorted(completed)
                del state["pending_answers"][answer_key]
                daily = daily_state(state)
                event_id = {"discipline": discipline, "level": level, "node": node}
                if event_id not in daily["nodes"]:
                    daily["nodes"].append(event_id)
                mission_list(state)
                feedback = "Nó concluído! As explicações ficaram disponíveis."
        else:
            feedback = "Ainda não. Tente outra opção."
        save_state(state)
    if node > 0 and node - 1 not in completed:
        feedback = "Este nó está bloqueado. Volte ao caminho e complete o anterior."
    return render_page(
        "exercises", state, discipline=discipline, level=level, node=node,
        questions=questions, completed=completed, solved=solved, feedback=feedback,
        node_names=node_names,
    )


@app.route("/html/area_de_estudo/teste.html", methods=["GET", "POST"])
@login_required
def final_test():
    state = get_state()
    discipline = safe_discipline(request.args.get("disciplina", "portugues"))
    level = safe_level(request.args.get("level", "1"))
    levels = sorted(catalog_context()["LEVEL_NAMES"])
    if level not in levels:
        abort(404, "Etapa não encontrada.")
    if level != levels[0] and f"{discipline}:{level - 1}" not in state["passed_tests"]:
        abort(403, "Passe o teste da etapa anterior.")
    key = campaign_key(discipline, level)
    if len(set(state["campaigns"].get(key, []))) < 6:
        flash("Conclua os seis nodes antes de fazer o teste final.", "error")
        return redirect(url_for("campaign", disciplina=discipline, level=level))
    attempts_key = f"{date.today().isoformat()}:{key}"
    attempts = state["test_attempts"].get(attempts_key, [])
    with db_connection() as connection:
        questions_source = catalog.get_questions(connection, discipline, "test", level)
    if len(questions_source) < 8:
        abort(503, "O teste precisa de pelo menos oito perguntas ativas na base de dados.")
    rng = random.Random(attempts_key)
    questions = rng.sample(questions_source, 8)
    feedback = None
    result = None
    if request.method == "POST":
        use_ticket = bool(request.form.get("use_ticket"))
        regular_attempts = sum(not attempt.get("ticket") for attempt in attempts)
        if use_ticket:
            if state["tickets"] < 1:
                abort(400, "Não tens bilhetes disponíveis.")
            if regular_attempts < 2 and not any(attempt.get("passed") for attempt in attempts):
                abort(400, "Usa primeiro as tentativas gratuitas disponíveis.")
        elif regular_attempts >= 2 or any(attempt.get("passed") for attempt in attempts):
            abort(403, "Não há mais tentativas gratuitas hoje.")
        answers = [request.form.get(f"answer_{index}", "") for index in range(len(questions))]
        submitted_question_ids = [
            request.form.get(f"question_id_{index}", "")
            for index in range(len(questions))
        ]
        if submitted_question_ids != [question["id"] for question in questions]:
            abort(400, "As perguntas mudaram desde que a página foi carregada. Atualize e tente novamente.")
        if any(not answer for answer in answers):
            feedback = f"Responda às {len(questions)} perguntas antes de corrigir."
        else:
            try:
                answer_indexes = [int(answer) for answer in answers]
            except ValueError:
                abort(400, "Resposta inválida.")
            if any(
                answer_index < 0 or answer_index >= len(question["options"])
                for answer_index, question in zip(answer_indexes, questions)
            ):
                abort(400, "Resposta inválida.")
            score = sum(
                answer_index == question["correct_index"]
                for answer_index, question in zip(answer_indexes, questions)
            )
            if use_ticket:
                state["tickets"] -= 1
            passed = score >= min(7, len(questions))
            result = {"score": score, "total": len(questions), "passed": passed}
            attempts.append({"score": score, "total": len(questions), "passed": passed, "ticket": use_ticket})
            state["test_attempts"][attempts_key] = attempts
            state["test_results"].setdefault(key, []).append({"score": score, "total": len(questions)})
            if passed:
                passed_key = f"{discipline}:{level}"
                newly_passed = passed_key not in state["passed_tests"]
                if newly_passed:
                    state["passed_tests"].append(passed_key)
                daily = daily_state(state)
                test_id = f"{discipline}:{level}"
                if test_id not in daily["final_tests"]:
                    daily["final_tests"].append(test_id)
                if newly_passed:
                    grant_rewards(state, 100, 180)
                mission_list(state)
                feedback = f"Aprovado com {score}/{len(questions)}! A próxima etapa foi desbloqueada."
            elif sum(not attempt.get("ticket") for attempt in attempts) < 2:
                feedback = f"Nota {score}/{len(questions)}. É preciso acertar 7 para passar. Ainda tens uma recuperação hoje."
            else:
                feedback = f"Nota {score}/{len(questions)}. Reveja o conteúdo e tente novamente mais tarde."
            save_state(state)
    return render_page(
        "final_test", state, discipline=discipline, level=level,
        questions=questions, attempts=attempts, feedback=feedback, result=result,
    )


@app.errorhandler(400)
@app.errorhandler(403)
@app.errorhandler(404)
def handle_http_error(error):
    return render_template("error.html", error=error), error.code


initialize_db()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=False)
