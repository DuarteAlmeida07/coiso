import json
from pathlib import Path


SEED_FILE = Path(__file__).resolve().with_name("catalog_seed.json")

SCHEMA = """
CREATE TABLE IF NOT EXISTS disciplines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    lesson_nodes_json TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS stages (
    discipline_id TEXT NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    name TEXT NOT NULL,
    node_index INTEGER NOT NULL CHECK (node_index BETWEEN 0 AND 5),
    node_name TEXT NOT NULL,
    PRIMARY KEY (discipline_id, level, node_index)
);
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    discipline_id TEXT NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('lesson', 'test')),
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    node_index INTEGER CHECK (node_index BETWEEN 0 AND 5),
    ordinal INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT NOT NULL DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    CHECK ((kind = 'lesson' AND node_index IS NOT NULL) OR (kind = 'test' AND node_index IS NULL)),
    UNIQUE (discipline_id, kind, level, node_index, ordinal)
);
CREATE INDEX IF NOT EXISTS questions_lookup
    ON questions (discipline_id, kind, level, node_index, is_active, ordinal);
CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp INTEGER NOT NULL CHECK (xp >= 0),
    tokens INTEGER NOT NULL CHECK (tokens >= 0),
    goal INTEGER NOT NULL CHECK (goal > 0),
    goal_type TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS rarities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    chance REAL NOT NULL CHECK (chance >= 0),
    duplicate_tokens INTEGER NOT NULL CHECK (duplicate_tokens >= 0),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    public_id TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('theme', 'border', 'ticket')),
    name TEXT NOT NULL,
    rarity_id TEXT NOT NULL REFERENCES rarities(id),
    image_url TEXT NOT NULL DEFAULT '',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    UNIQUE (item_type, public_id)
);
CREATE INDEX IF NOT EXISTS items_lookup
    ON items (item_type, rarity_id, is_active, sort_order);
CREATE TABLE IF NOT EXISTS store_boxes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    is_active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS appearance_themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purchase_item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS avatar_colors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS avatar_defaults (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    color_id TEXT NOT NULL REFERENCES avatar_colors(id),
    is_active INTEGER NOT NULL DEFAULT 1
);
"""

def initialize_catalog(connection, seed_file=SEED_FILE):
    connection.executescript(SCHEMA)
    item_columns = {
        row["name"] for row in connection.execute("PRAGMA table_info(items)")
    }
    if "public_id" not in item_columns:
        legacy_items = connection.execute("SELECT * FROM items").fetchall()
        legacy_themes = connection.execute("SELECT * FROM appearance_themes").fetchall()
        connection.execute("DROP TABLE appearance_themes")
        connection.execute("DROP TABLE items")
        connection.executescript(SCHEMA)
        for item in legacy_items:
            connection.execute(
                """INSERT OR IGNORE INTO items
                (id, public_id, item_type, name, rarity_id, image_url, metadata_json,
                 sort_order, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    f"{item['item_type']}:{item['id']}",
                    item["id"],
                    item["item_type"],
                    item["name"],
                    item["rarity_id"],
                    item["image_url"],
                    item["metadata_json"],
                    item["sort_order"],
                    item["is_active"],
                ),
            )
        for theme in legacy_themes:
            connection.execute(
                """INSERT OR IGNORE INTO appearance_themes
                (id, name, purchase_item_id, sort_order, is_active)
                VALUES (?, ?, ?, ?, ?)""",
                (
                    theme["id"],
                    theme["name"],
                    f"theme:{theme['purchase_item_id']}"
                    if theme["purchase_item_id"] else None,
                    theme["sort_order"],
                    theme["is_active"],
                ),
            )
    if not seed_file.exists():
        raise FileNotFoundError(f"Catálogo inicial não encontrado: {seed_file}")
    seed = json.loads(seed_file.read_text(encoding="utf-8"))

    for discipline in seed["disciplines"]:
        connection.execute(
            """INSERT OR IGNORE INTO disciplines
            (id, name, subtitle, lesson_nodes_json) VALUES (?, ?, ?, ?)""",
            (
                discipline["id"],
                discipline["name"],
                discipline["subtitle"],
                json.dumps(discipline["lesson_nodes"], ensure_ascii=False),
            ),
        )
    for stage in seed["stages"]:
        for node_index, node_name in enumerate(stage["nodes"]):
            connection.execute(
                """INSERT OR IGNORE INTO stages
                (discipline_id, level, name, node_index, node_name)
                VALUES (?, ?, ?, ?, ?)""",
                (stage["discipline_id"], stage["level"], stage["name"], node_index, node_name),
            )
    for kind in ("lesson_questions", "test_questions"):
        question_kind = "lesson" if kind == "lesson_questions" else "test"
        for question in seed[kind]:
            node_index = question.get("node_index")
            question_id = ":".join(
                (
                    question_kind,
                    question["discipline_id"],
                    str(question["level"]),
                    str(node_index if node_index is not None else "all"),
                    str(question["ordinal"]),
                )
            )
            connection.execute(
                """INSERT OR IGNORE INTO questions
                (id, discipline_id, kind, level, node_index, ordinal, prompt,
                 options_json, correct_index, explanation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    question_id,
                    question["discipline_id"],
                    question_kind,
                    question["level"],
                    node_index,
                    question["ordinal"],
                    question["prompt"],
                    json.dumps(question["options"], ensure_ascii=False),
                    question["correct_index"],
                    question.get("explanation", ""),
                ),
            )
    for sort_order, mission in enumerate(seed["missions"]):
        connection.execute(
            """INSERT OR IGNORE INTO missions
            (id, title, description, xp, tokens, goal, goal_type, icon, category, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                mission["id"],
                mission["title"],
                mission["description"],
                mission["xp"],
                mission["tokens"],
                mission["goal"],
                mission.get("type", "nodes"),
                mission.get("icon", ""),
                mission.get("category", ""),
                sort_order,
            ),
        )
    for rarity in seed["rarities"]:
        connection.execute(
            """INSERT OR IGNORE INTO rarities
            (id, name, chance, duplicate_tokens, sort_order)
            VALUES (?, ?, ?, ?, ?)""",
            (
                rarity["id"],
                rarity["name"],
                rarity["chance"],
                rarity["duplicate_tokens"],
                rarity["sort_order"],
            ),
        )
    for sort_order, item in enumerate(seed["items"]):
        connection.execute(
            """INSERT OR IGNORE INTO items
            (id, public_id, item_type, name, rarity_id, image_url, metadata_json, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                f"{item['type']}:{item['id']}",
                item["id"],
                item["type"],
                item["name"],
                item["rarity"],
                item.get("image_url", ""),
                json.dumps(item.get("metadata", {}), ensure_ascii=False),
                sort_order,
            ),
        )
    for sort_order, theme in enumerate(seed["appearance_themes"]):
        connection.execute(
            """INSERT OR IGNORE INTO appearance_themes
            (id, name, purchase_item_id, sort_order) VALUES (?, ?, ?, ?)""",
            (
                theme["id"],
                theme["name"],
                (
                    f"theme:{theme['purchase_item_id']}"
                    if theme.get("purchase_item_id") is not None
                    else None
                ),
                sort_order,
            ),
        )
    for store_box in seed["store_boxes"]:
        connection.execute(
            """INSERT OR IGNORE INTO store_boxes (id, name, price)
            VALUES (?, ?, ?)""",
            (store_box["id"], store_box["name"], store_box["price"]),
        )
    for sort_order, color in enumerate(seed["avatar_colors"]):
        connection.execute(
            "INSERT OR IGNORE INTO avatar_colors (id, name, sort_order) VALUES (?, ?, ?)",
            (color["id"], color["name"], sort_order),
        )
    avatar_default = seed["avatar_default"]
    connection.execute(
        """INSERT OR IGNORE INTO avatar_defaults (id, name, initials, color_id)
        VALUES ('default', ?, ?, ?)""",
        (avatar_default["name"], avatar_default["initials"], avatar_default["color"]),
    )


def load_context(connection):
    disciplines = {}
    for row in connection.execute(
        "SELECT id, name, subtitle, lesson_nodes_json FROM disciplines WHERE is_active = 1 ORDER BY rowid"
    ):
        disciplines[row["id"]] = {
            "name": row["name"],
            "subtitle": row["subtitle"],
            "nodes": json.loads(row["lesson_nodes_json"]),
        }
    stages = {}
    for row in connection.execute(
        """SELECT level, name, node_name FROM stages
        WHERE discipline_id = ? ORDER BY level, node_index""",
        (next(iter(disciplines), ""),),
    ):
        stages.setdefault(row["level"], {"name": row["name"], "nodes": []})["nodes"].append(row["node_name"])
    stage_node_counts = {}
    for row in connection.execute(
        """SELECT discipline_id, level, COUNT(*) AS node_count FROM stages
        GROUP BY discipline_id, level"""
    ):
        stage_node_counts.setdefault(row["discipline_id"], {})[row["level"]] = row["node_count"]
    level_names = {level: stage["name"] for level, stage in stages.items()}
    level_nodes = {level: stage["nodes"] for level, stage in stages.items()}
    theme_rows = connection.execute(
        """SELECT id, name, purchase_item_id FROM appearance_themes
        WHERE is_active = 1 ORDER BY sort_order"""
    )
    themes = {}
    free_theme_ids = set()
    for row in theme_rows:
        themes[row["id"]] = row["name"]
        if row["purchase_item_id"] is None:
            free_theme_ids.add(row["id"])
    return {
        "DISCIPLINES": disciplines,
        "LEVEL_NAMES": level_names,
        "LEVEL_NODES": level_nodes,
        "STAGE_NODE_COUNTS": stage_node_counts,
        "THEME_NAMES": themes,
        "FREE_THEME_IDS": free_theme_ids,
        "AVATAR_COLORS": {
            row["id"]: row["name"]
            for row in connection.execute(
                "SELECT id, name FROM avatar_colors WHERE is_active = 1 ORDER BY sort_order"
            )
        },
    }


def get_questions(connection, discipline_id, kind, level, node_index=None):
    if kind not in {"lesson", "test"}:
        raise ValueError(f"Tipo de pergunta inválido: {kind}")
    if kind == "lesson" and node_index is None:
        raise ValueError("As perguntas de jornada precisam de um node.")
    if kind == "lesson":
        rows = connection.execute(
            """SELECT id, prompt, options_json, correct_index, explanation, ordinal
            FROM questions WHERE discipline_id = ? AND kind = ? AND level = ?
            AND node_index = ? AND is_active = 1 ORDER BY ordinal""",
            (discipline_id, kind, level, node_index),
        )
    else:
        rows = connection.execute(
            """SELECT id, prompt, options_json, correct_index, explanation, ordinal
            FROM questions WHERE discipline_id = ? AND kind = ? AND level = ?
            AND node_index IS NULL AND is_active = 1 ORDER BY ordinal""",
            (discipline_id, kind, level),
        )
    return [
        {
            "id": row["id"],
            "prompt": row["prompt"],
            "options": json.loads(row["options_json"]),
            "correct_index": row["correct_index"],
            "explanation": row["explanation"],
            "ordinal": row["ordinal"],
        }
        for row in rows
    ]


def get_missions(connection):
    return [
        {
            "id": row["id"],
            "title": row["title"],
            "description": row["description"],
            "xp": row["xp"],
            "tokens": row["tokens"],
            "goal": row["goal"],
            "type": row["goal_type"],
            "icon": row["icon"],
            "category": row["category"],
        }
        for row in connection.execute(
            """SELECT id, title, description, xp, tokens, goal, goal_type, icon, category
            FROM missions WHERE is_active = 1 ORDER BY sort_order, id"""
        )
    ]


def get_rarities(connection):
    return [
        {
            "id": row["id"],
            "name": row["name"],
            "chance": row["chance"],
            "duplicate_tokens": row["duplicate_tokens"],
            "sort_order": row["sort_order"],
        }
        for row in connection.execute(
            "SELECT id, name, chance, duplicate_tokens, sort_order FROM rarities WHERE is_active = 1 ORDER BY sort_order"
        )
    ]


def get_items(connection, item_type=None):
    query = """SELECT items.public_id AS id, items.item_type, items.name, items.rarity_id,
        items.image_url, items.metadata_json, rarities.name AS rarity_name,
        rarities.duplicate_tokens, items.sort_order
        FROM items JOIN rarities ON rarities.id = items.rarity_id
        WHERE items.is_active = 1 AND rarities.is_active = 1"""
    params = ()
    if item_type:
        query += " AND items.item_type = ?"
        params = (item_type,)
    query += " ORDER BY items.sort_order, items.id"
    return [
        {
            "id": row["id"],
            "type": row["item_type"],
            "name": row["name"],
            "rarity": row["rarity_id"],
            "rarity_name": row["rarity_name"],
            "image_url": row["image_url"],
            "metadata": json.loads(row["metadata_json"]),
            "duplicate_tokens": row["duplicate_tokens"],
            "sort_order": row["sort_order"],
        }
        for row in connection.execute(query, params)
    ]


def get_default_avatar(connection):
    row = connection.execute(
        """SELECT avatar_defaults.name, avatar_defaults.initials, avatar_defaults.color_id
        FROM avatar_defaults JOIN avatar_colors ON avatar_colors.id = avatar_defaults.color_id
        WHERE avatar_defaults.id = 'default' AND avatar_defaults.is_active = 1
        AND avatar_colors.is_active = 1"""
    ).fetchone()
    if row is None:
        raise LookupError("Não existe avatar predefinido ativo na base de dados.")
    return {"name": row["name"], "initials": row["initials"], "color": row["color_id"]}
