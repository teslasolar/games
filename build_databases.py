#!/usr/bin/env python3
"""
Build SQLite databases for each game in the Konomi Games gallery.
Creates .db files with game metadata, source code, assets, and configuration.
"""

import sqlite3
import os
import re
import json
from datetime import datetime

# Game definitions with metadata
GAMES = [
    {"id": "cube-spinner", "name": "Cube Spinner", "icon": "🎲", "category": "interactive", "file": "cube-spinner.md"},
    {"id": "particle-system", "name": "Particle Storm", "icon": "✨", "category": "simulation", "file": "particle-system.md"},
    {"id": "space-shooter", "name": "Space Shooter", "icon": "🚀", "category": "arcade", "file": "space-shooter.md"},
    {"id": "terrain-explorer", "name": "Terrain Explorer", "icon": "🏔️", "category": "exploration", "file": "terrain-explorer.md"},
    {"id": "neural-network-viz", "name": "Neural Network", "icon": "🧠", "category": "visualization", "file": "neural-network-viz.md"},
    {"id": "block-breaker", "name": "Block Breaker 3D", "icon": "🧱", "category": "arcade", "file": "block-breaker.md"},
    {"id": "fractal-explorer", "name": "Fractal Explorer", "icon": "🌀", "category": "visualization", "file": "fractal-explorer.md"},
    {"id": "konomi-os", "name": "Konomi OS", "icon": "🖥️", "category": "simulation", "file": "konomi-os.md"},
    {"id": "maze-runner", "name": "Maze Runner", "icon": "🧭", "category": "exploration", "file": "maze-runner.md"},
    {"id": "tower-defense", "name": "Tower Defense", "icon": "⚔️", "category": "strategy", "file": "tower-defense.md"},
    {"id": "physics-sandbox", "name": "Physics Sandbox", "icon": "🎮", "category": "simulation", "file": "physics-sandbox.md"},
    {"id": "neon-racer", "name": "Neon Racer", "icon": "🏎️", "category": "racing", "file": "neon-racer.md"},
    {"id": "music-visualizer", "name": "Music Visualizer", "icon": "🎵", "category": "visualization", "file": "music-visualizer.md"},
    {"id": "city-builder", "name": "City Builder", "icon": "🏙️", "category": "strategy", "file": "city-builder.md"},
]

BASE_DIR = "/home/user/games"

def create_database_schema(conn):
    """Create the standard database schema for a game."""
    cursor = conn.cursor()

    # Metadata table - core game information
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT,
            data_type TEXT DEFAULT 'string',
            updated_at TEXT
        )
    ''')

    # Source files table - HTML, CSS, JS content
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS source_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            content TEXT,
            size_bytes INTEGER,
            checksum TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')

    # Assets table - images, audio, 3D models
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            asset_type TEXT NOT NULL,
            mime_type TEXT,
            data BLOB,
            url TEXT,
            size_bytes INTEGER,
            created_at TEXT
        )
    ''')

    # Dependencies table - external libraries
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dependencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            version TEXT,
            url TEXT,
            type TEXT DEFAULT 'cdn',
            required INTEGER DEFAULT 1
        )
    ''')

    # Configuration table - game settings
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS configuration (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT,
            default_value TEXT,
            description TEXT,
            UNIQUE(category, key)
        )
    ''')

    # Controls table - input mappings
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS controls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_type TEXT NOT NULL,
            input_key TEXT NOT NULL,
            action TEXT NOT NULL,
            description TEXT
        )
    ''')

    # Version history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS version_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version TEXT NOT NULL,
            changelog TEXT,
            released_at TEXT
        )
    ''')

    conn.commit()

def extract_game_content(md_file):
    """Extract HTML content and metadata from markdown file."""
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title (first line starting with #)
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else "Unknown"

    # Extract description (text between title and code block)
    lines = content.split('\n')
    description = ""
    in_description = False
    for line in lines:
        if line.startswith('# '):
            in_description = True
            continue
        if line.startswith('```'):
            break
        if in_description and line.strip():
            description = line.strip()
            break

    # Extract HTML code block
    html_match = re.search(r'```html\n([\s\S]*?)\n```', content)
    html_content = html_match.group(1) if html_match else ""

    # Extract CSS from HTML
    css_match = re.search(r'<style>([\s\S]*?)</style>', html_content)
    css_content = css_match.group(1) if css_match else ""

    # Extract JavaScript from HTML
    js_match = re.search(r'<script>([\s\S]*?)</script>', html_content)
    js_content = js_match.group(1) if js_match else ""

    # Extract dependencies (CDN scripts)
    deps = re.findall(r'<script src="([^"]+)"[^>]*></script>', html_content)

    # Extract controls from comments or info div
    controls = []
    control_patterns = re.findall(r'•\s*([^:]+):\s*([^\n<]+)', html_content)
    for key, action in control_patterns:
        controls.append({"input": key.strip(), "action": action.strip()})

    return {
        "title": title,
        "description": description,
        "html": html_content,
        "css": css_content,
        "js": js_content,
        "dependencies": deps,
        "controls": controls,
        "raw_md": content
    }

def populate_database(conn, game_info, content):
    """Populate the database with game content."""
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    # Insert metadata
    metadata = [
        ("id", game_info["id"], "string"),
        ("name", game_info["name"], "string"),
        ("title", content["title"], "string"),
        ("description", content["description"], "string"),
        ("icon", game_info["icon"], "string"),
        ("category", game_info["category"], "string"),
        ("engine", "Three.js", "string"),
        ("engine_version", "r128", "string"),
        ("platform", "web", "string"),
        ("created_at", now, "datetime"),
        ("updated_at", now, "datetime"),
        ("source_file", game_info["file"], "string"),
        ("lines_of_code", str(len(content["html"].split('\n'))), "integer"),
    ]

    for key, value, dtype in metadata:
        cursor.execute('''
            INSERT OR REPLACE INTO metadata (key, value, data_type, updated_at)
            VALUES (?, ?, ?, ?)
        ''', (key, value, dtype, now))

    # Insert source files
    source_files = [
        ("index.html", "html", content["html"]),
        ("style.css", "css", content["css"]),
        ("game.js", "javascript", content["js"]),
        ("source.md", "markdown", content["raw_md"]),
    ]

    for filename, ftype, fcontent in source_files:
        if fcontent:
            cursor.execute('''
                INSERT INTO source_files (filename, file_type, content, size_bytes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (filename, ftype, fcontent, len(fcontent.encode('utf-8')), now, now))

    # Insert dependencies
    for dep_url in content["dependencies"]:
        dep_name = dep_url.split('/')[-1].split('.')[0] if '/' in dep_url else dep_url
        version = re.search(r'/r(\d+)/', dep_url)
        version_str = f"r{version.group(1)}" if version else "latest"
        cursor.execute('''
            INSERT INTO dependencies (name, version, url, type)
            VALUES (?, ?, ?, ?)
        ''', (dep_name, version_str, dep_url, "cdn"))

    # Insert controls
    for ctrl in content["controls"]:
        cursor.execute('''
            INSERT INTO controls (input_type, input_key, action, description)
            VALUES (?, ?, ?, ?)
        ''', ("keyboard/mouse", ctrl["input"], ctrl["action"], ctrl["action"]))

    # Insert default configuration
    configs = [
        ("graphics", "antialias", "true", "true", "Enable antialiasing"),
        ("graphics", "shadows", "false", "false", "Enable shadows"),
        ("graphics", "fog", "true", "true", "Enable fog effects"),
        ("audio", "enabled", "true", "true", "Enable audio"),
        ("audio", "volume", "1.0", "1.0", "Master volume"),
        ("gameplay", "difficulty", "normal", "normal", "Game difficulty"),
    ]

    for category, key, value, default, desc in configs:
        cursor.execute('''
            INSERT OR IGNORE INTO configuration (category, key, value, default_value, description)
            VALUES (?, ?, ?, ?, ?)
        ''', (category, key, value, default, desc))

    # Insert version history
    cursor.execute('''
        INSERT INTO version_history (version, changelog, released_at)
        VALUES (?, ?, ?)
    ''', ("1.0.0", "Initial release", now))

    conn.commit()

def create_game_readme(game_dir, game_info, content):
    """Create README.md with query functions for the game."""
    readme = f'''# {game_info["icon"]} {game_info["name"]}

{content["description"]}

## Database Schema

This game's data is stored in `game.db` (SQLite3 format).

### Tables

| Table | Description |
|-------|-------------|
| `metadata` | Core game information (name, description, version, etc.) |
| `source_files` | HTML, CSS, JavaScript source code |
| `assets` | Images, audio, 3D models (binary data) |
| `dependencies` | External libraries (Three.js, etc.) |
| `configuration` | Game settings and preferences |
| `controls` | Input mappings and keybindings |
| `version_history` | Release changelog |

## Query Functions

### Python

```python
import sqlite3

def get_game_metadata(db_path):
    """Get all metadata as a dictionary."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM metadata")
    return dict(cursor.fetchall())

def get_source_html(db_path):
    """Get the main HTML source code."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT content FROM source_files WHERE filename = 'index.html'")
    result = cursor.fetchone()
    return result[0] if result else None

def get_controls(db_path):
    """Get all control mappings."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT input_key, action FROM controls")
    return cursor.fetchall()

def get_dependencies(db_path):
    """Get all external dependencies."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name, version, url FROM dependencies")
    return cursor.fetchall()

def get_config(db_path, category=None):
    """Get configuration values, optionally filtered by category."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    if category:
        cursor.execute("SELECT key, value FROM configuration WHERE category = ?", (category,))
    else:
        cursor.execute("SELECT category, key, value FROM configuration")
    return cursor.fetchall()

def update_config(db_path, category, key, value):
    """Update a configuration value."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE configuration SET value = ?
        WHERE category = ? AND key = ?
    """, (value, category, key))
    conn.commit()
    return cursor.rowcount > 0
```

### JavaScript (Node.js)

```javascript
const sqlite3 = require('sqlite3').verbose();

function getGameMetadata(dbPath) {{
    return new Promise((resolve, reject) => {{
        const db = new sqlite3.Database(dbPath);
        db.all("SELECT key, value FROM metadata", [], (err, rows) => {{
            if (err) reject(err);
            const metadata = {{}};
            rows.forEach(row => metadata[row.key] = row.value);
            resolve(metadata);
        }});
        db.close();
    }});
}}

function getSourceHTML(dbPath) {{
    return new Promise((resolve, reject) => {{
        const db = new sqlite3.Database(dbPath);
        db.get("SELECT content FROM source_files WHERE filename = 'index.html'", [], (err, row) => {{
            if (err) reject(err);
            resolve(row ? row.content : null);
        }});
        db.close();
    }});
}}
```

### SQL Examples

```sql
-- Get game name and description
SELECT value FROM metadata WHERE key IN ('name', 'description');

-- List all source files with sizes
SELECT filename, file_type, size_bytes FROM source_files;

-- Get all keyboard controls
SELECT input_key, action FROM controls WHERE input_type LIKE '%keyboard%';

-- Get graphics configuration
SELECT key, value FROM configuration WHERE category = 'graphics';

-- Get version history
SELECT version, changelog, released_at FROM version_history ORDER BY id DESC;

-- Search source code for specific pattern
SELECT filename, content FROM source_files WHERE content LIKE '%animate%';

-- Get total lines of code
SELECT SUM(LENGTH(content) - LENGTH(REPLACE(content, CHAR(10), '')) + 1) as total_lines
FROM source_files WHERE file_type IN ('html', 'javascript', 'css');
```

## File Structure

```
{game_info["id"]}/
├── game.db          # SQLite database with all game data
├── index.html       # Standalone playable version
└── README.md        # This documentation file
```

## Playing the Game

Open `index.html` in a modern web browser, or navigate to:
- Local: `file://{game_dir}/index.html`
- GitHub Pages: `https://teslasolar.github.io/games/{game_info["id"]}/`

## Controls

| Input | Action |
|-------|--------|
'''

    for ctrl in content["controls"]:
        readme += f'| {ctrl["input"]} | {ctrl["action"]} |\n'

    readme += f'''

## Dependencies

| Library | Version | Source |
|---------|---------|--------|
'''

    for dep in content["dependencies"]:
        name = dep.split('/')[-1].split('.')[0]
        version = re.search(r'/r(\d+)/', dep)
        version_str = f"r{version.group(1)}" if version else "latest"
        readme += f'| {name} | {version_str} | [CDN]({dep}) |\n'

    readme += f'''

## Category

**{game_info["category"].title()}** - {game_info["icon"]}

---

*Part of the [Konomi Games](https://github.com/teslasolar/games) collection*
'''

    return readme

def create_standalone_html(game_dir, content):
    """Create standalone index.html for the game."""
    return content["html"]

def main():
    """Main function to build all game databases."""
    print("Building SQLite databases for Konomi Games...")
    print("=" * 50)

    for game in GAMES:
        game_id = game["id"]
        game_dir = os.path.join(BASE_DIR, game_id)
        md_file = os.path.join(BASE_DIR, game["file"])
        db_file = os.path.join(game_dir, "game.db")

        print(f"\n{game['icon']} Processing: {game['name']}")

        if not os.path.exists(md_file):
            print(f"  ⚠️  Source file not found: {game['file']}")
            continue

        # Extract content from markdown
        content = extract_game_content(md_file)
        print(f"  📄 Extracted {len(content['html'])} bytes of HTML")

        # Create/reset database
        if os.path.exists(db_file):
            os.remove(db_file)

        conn = sqlite3.connect(db_file)
        create_database_schema(conn)
        populate_database(conn, game, content)
        conn.close()
        print(f"  💾 Created database: game.db")

        # Create README
        readme_content = create_game_readme(game_dir, game, content)
        readme_file = os.path.join(game_dir, "README.md")
        with open(readme_file, 'w', encoding='utf-8') as f:
            f.write(readme_content)
        print(f"  📝 Created README.md")

        # Create standalone index.html
        html_content = create_standalone_html(game_dir, content)
        html_file = os.path.join(game_dir, "index.html")
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"  🌐 Created index.html")

    print("\n" + "=" * 50)
    print("✅ All databases built successfully!")

if __name__ == "__main__":
    main()
