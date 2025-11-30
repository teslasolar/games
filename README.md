# Konomi Games - 3D Interactive Gallery

A collection of interactive Three.js experiences and games that run entirely in the browser. Perfect for GitHub Pages!

**Live Site**: https://teslasolar.github.io/games
**Repository**: https://github.com/teslasolar/games

## Features

- **14 Interactive Experiences**: From simple cube spinners to complete 3D operating systems
- **SQLite Databases**: Each game stored in its own `.db` file with full source code
- **Pure JavaScript**: No build process required - just HTML, CSS, and Three.js
- **GitHub Pages Ready**: Automatically loads all games from subdirectories
- **ISA-95/88 Structure**: Repository organized following industrial standard patterns
- **Query Functions**: Python/JS helper functions for database access

## Games by Category

### Arcade
| Game | Description |
|------|-------------|
| [Space Shooter](space-shooter/) | Classic space shooter in 3D with enemies, scoring, and levels |
| [Block Breaker 3D](block-breaker/) | Brick breaker reimagined in 3D with particle effects |

### Simulation
| Game | Description |
|------|-------------|
| [Particle Storm](particle-system/) | 5000+ particles with physics and interaction modes |
| [Konomi OS](konomi-os/) | Complete 3D operating system with floating windows |
| [Physics Sandbox](physics-sandbox/) | Interactive physics playground |

### Visualization
| Game | Description |
|------|-------------|
| [Neural Network](neural-network-viz/) | Real-time neural network training visualization |
| [Fractal Explorer](fractal-explorer/) | Sierpinski, Menger Sponge, Koch, Mandelbrot |
| [Music Visualizer](music-visualizer/) | Audio-reactive 3D visualization |

### Exploration
| Game | Description |
|------|-------------|
| [Terrain Explorer](terrain-explorer/) | Procedurally generated 3D terrain navigation |
| [Maze Runner](maze-runner/) | First-person procedural maze exploration |

### Strategy
| Game | Description |
|------|-------------|
| [Tower Defense](tower-defense/) | Strategic 3D tower defense with enemy waves |
| [City Builder](city-builder/) | Build and manage your 3D city |

### Racing
| Game | Description |
|------|-------------|
| [Neon Racer](neon-racer/) | Futuristic high-speed racing game |

### Interactive
| Game | Description |
|------|-------------|
| [Cube Spinner](cube-spinner/) | Rotating cube with mouse control and color animations |

## Quick Start

### View Online
Visit https://teslasolar.github.io/games or open `index.html` locally.

### Local Development
```bash
# Clone and serve
git clone https://github.com/teslasolar/games.git
cd games
python -m http.server 8000
# Open http://localhost:8000
```

### Rebuild Databases
```bash
python build_databases.py
```

## Project Structure

```
games/
├── index.html                  # Main gallery entry point
├── README.md                   # This documentation
├── repo.udt                    # ISA-95/88 structure definition
├── build_databases.py          # Database generation script
│
├── {game-id}/                  # Game module (14 total)
│   ├── index.html              # Standalone playable version
│   ├── game.db                 # SQLite database
│   └── README.md               # Game docs with query functions
│
└── {game}.md                   # Legacy: embedded HTML games
```

## Database Schema

Each `game.db` contains:

| Table | Purpose |
|-------|---------|
| `metadata` | Game info (name, description, category, engine) |
| `source_files` | HTML, CSS, JS source code |
| `dependencies` | External libraries (Three.js) |
| `controls` | Input mappings and keybindings |
| `configuration` | Game settings (graphics, audio) |
| `version_history` | Release changelog |

### Query Examples

**Python:**
```python
import sqlite3
conn = sqlite3.connect('cube-spinner/game.db')
cursor = conn.cursor()

# Get game metadata
cursor.execute("SELECT key, value FROM metadata")
print(dict(cursor.fetchall()))

# Get source code
cursor.execute("SELECT content FROM source_files WHERE filename = 'index.html'")
html = cursor.fetchone()[0]
```

**SQL:**
```sql
-- List all games with categories
SELECT value FROM metadata WHERE key = 'category';

-- Get control mappings
SELECT input_key, action FROM controls;

-- Search source code
SELECT filename FROM source_files WHERE content LIKE '%animate%';
```

## ISA-95/88 Structure

This repository follows ISA-95/88 hierarchical patterns:

| Level | Concept | Implementation |
|-------|---------|----------------|
| 0 | Enterprise | Repository root |
| 1 | Site | Game categories |
| 2 | Area | Individual game modules |
| 3 | Process Cell | SQLite database tables |
| 4 | Unit | Individual records |

See [repo.udt](repo.udt) for complete structure definition.

## Controls

- **Arrow Keys**: Navigation (varies by game)
- **Mouse**: Rotate camera / Look around
- **Scroll**: Zoom in/out
- **Space**: Action / Pause
- **R**: Restart / Reset
- See individual game READMEs for specific controls

## Technical Stack

- **Three.js r128**: WebGL 3D rendering
- **SQLite3**: Data storage
- **Vanilla JavaScript**: No frameworks
- **HTML5 Canvas**: UI rendering
- **60 FPS** target performance

## License

MIT License - Free to use and modify.

---

*Konomi Games - 3D Interactive Gallery*
