# 🏙️ City Builder

Build and manage your own 3D cyberpunk city with resource management, multiple building types, and strategic gameplay.

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

function getGameMetadata(dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.all("SELECT key, value FROM metadata", [], (err, rows) => {
            if (err) reject(err);
            const metadata = {};
            rows.forEach(row => metadata[row.key] = row.value);
            resolve(metadata);
        });
        db.close();
    });
}

function getSourceHTML(dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.get("SELECT content FROM source_files WHERE filename = 'index.html'", [], (err, row) => {
            if (err) reject(err);
            resolve(row ? row.content : null);
        });
        db.close();
    });
}
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
city-builder/
├── game.db          # SQLite database with all game data
├── index.html       # Standalone playable version
└── README.md        # This documentation file
```

## Playing the Game

Open `index.html` in a modern web browser, or navigate to:
- Local: `file:///home/user/games/city-builder/index.html`
- GitHub Pages: `https://teslasolar.github.io/games/city-builder/`

## Controls

| Input | Action |
|-------|--------|


## Dependencies

| Library | Version | Source |
|---------|---------|--------|
| three | r128 | [CDN](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js) |


## Category

**Strategy** - 🏙️

---

*Part of the [Konomi Games](https://github.com/teslasolar/games) collection*
