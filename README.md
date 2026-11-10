# Study Quest

## Django project

The migrated site is organized as a Django application in `meu_projeto/`. From that directory, start it with:

```powershell
python -m pip install -r ..\requirements.txt
python manage.py runserver
```

The pages keep their existing `/html/` paths, and the home page links to login. Static assets are served from the app's `static/meu_site/` directory.

To use the local MySQL server, install the dependencies and set the connection password in PowerShell before running migrations:

```powershell
python -m pip install -r ..\requirements.txt
$env:MYSQL_PASSWORD = "your-MySQL-password"
python manage.py migrate
python manage.py runserver
```

By default, Django connects to database `study_quest` as user `root` at `127.0.0.1:3306`. Set `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_HOST`, or `MYSQL_PORT` in the environment to override those values. The password is required and is read from `MYSQL_PASSWORD`; do not commit it to source control. Migrations create Django's tables but do not import or convert existing MySQL tables.

## Existing Flask application

The repository also retains its server-rendered Flask application at the root. Authentication, settings, missions, rewards, campaign progress, and test grading run in Python; its pages use regular HTML forms and do not require JavaScript.

### Run locally

1. Use Python 3.10 or newer.
2. Install the dependency:

   ```powershell
   python -m pip install -r requirements.txt
   ```

3. Set a persistent secret for Flask sessions, then start the app:

   ```powershell
   $env:STUDY_QUEST_SECRET_KEY = "replace-with-a-long-random-secret"
   python app.py
   ```

4. Open <http://127.0.0.1:5000>.

The SQLite database is created at `instance/study_quest.sqlite` by default. Set `STUDY_QUEST_DATABASE` to use another database path. Keep `STUDY_QUEST_SECRET_KEY` private and stable between restarts so existing sessions remain valid.

The previous standalone HTML pages in `html/` are retained as design references. Run the Flask app to use the server-rendered pages and persisted account data.

## Catálogo na base de dados

On startup, Flask creates the catalog tables in SQLite and imports the initial data from [catalog_seed.json](./catalog_seed.json). The seed is used only to initialize missing rows; page requests read the active catalog records from SQLite. Existing accounts and progress are kept in the same database.

Catalog tables:

- `disciplines` and `stages`: study subjects and their stage/node labels.
- `questions`: both lesson and test questions, their answer options, correct option, explanation, level, and node.
- `missions`: daily objectives and their XP/token rewards.
- `rarities`, `items`, and `store_boxes`: reward odds, themes, avatar borders, replay tickets, and box prices.
- `appearance_themes`, `avatar_colors`, and `avatar_defaults`: selectable themes and avatar choices.

To add or edit content, update the corresponding active rows in `instance/study_quest.sqlite` with a SQLite client. The app reads these tables on each request, so catalog changes are available without editing the Python code or restarting the server. Keep IDs stable: user progress and owned cosmetics refer to catalog IDs.

For example, after the app has created the schema, a lesson question can be added with:

```sql
INSERT INTO questions (
    id, discipline_id, kind, level, node_index, ordinal,
    prompt, options_json, correct_index, explanation
) VALUES (
    'lesson:portugues:1:0:2', 'portugues', 'lesson', 1, 0, 2,
    'Qual é a resposta correta?',
    '["Opção A", "Opção B", "Opção C"]',
    1,
    'A segunda opção é a correta.'
);
```

Questions for a lesson use `kind = 'lesson'` and a `node_index` from 0 to 5; a test question uses `kind = 'test'` and `node_index = NULL`. Each stage needs six nodes, and every lesson node needs at least two active questions. Each final test needs at least eight active questions for its discipline and level.

Cosmetic catalog records are connected by their internal item ID. For example, a purchasable theme needs both an item and an appearance option:

```sql
INSERT INTO items (
    id, public_id, item_type, name, rarity_id, image_url, metadata_json
) VALUES (
    'theme:forest', 'forest', 'theme', 'Floresta', 'raro', '',
    '{"background":"#183a2b"}'
);

INSERT INTO appearance_themes (id, name, purchase_item_id)
VALUES ('forest', 'Floresta', 'theme:forest');
```

Avatar colors are available to users when active; the default avatar references one of those color IDs:

```sql
INSERT INTO avatar_colors (id, name, sort_order)
VALUES ('forest', 'Verde floresta', 10);
```

Use an existing active rarity ID for each item. Set `image_url` to an image served by the app when the item has artwork; leave it empty otherwise.

The web app is read-only for catalog administration. Only edit the catalog with a trusted SQLite tool; never accept raw SQL or catalog edits from public form submissions.
