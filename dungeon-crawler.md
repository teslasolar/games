# Dungeon Crawler

Procedural dungeon exploration with enemies, loot, and turn-based combat.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dungeon Crawler</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            font-family: 'Courier New', monospace;
            background: #000;
        }
        #hud {
            position: absolute;
            top: 10px;
            left: 10px;
            color: #ffa500;
            background: rgba(0, 0, 0, 0.9);
            padding: 15px;
            border: 2px solid #ffa500;
            border-radius: 8px;
            font-size: 14px;
            z-index: 100;
        }
        .hud-item {
            margin: 8px 0;
        }
        .health-bar {
            width: 150px;
            height: 15px;
            background: #333;
            border: 1px solid #ffa500;
            margin-top: 5px;
        }
        .health-fill {
            height: 100%;
            background: #ff0000;
            transition: width 0.3s;
        }
        #minimap {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 200px;
            height: 200px;
            border: 2px solid #ffa500;
            background: rgba(0, 0, 0, 0.9);
            z-index: 100;
        }
        #controls {
            position: absolute;
            bottom: 10px;
            left: 10px;
            color: #ffa500;
            background: rgba(0, 0, 0, 0.9);
            padding: 10px 15px;
            border: 2px solid #ffa500;
            border-radius: 5px;
            font-size: 11px;
            z-index: 100;
        }
        #combat {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #ff0000;
            border-radius: 10px;
            padding: 30px;
            color: #ffa500;
            z-index: 200;
            display: none;
            text-align: center;
        }
        #combat h2 {
            color: #ff0000;
            margin-bottom: 20px;
        }
        .combat-btn {
            padding: 10px 20px;
            margin: 5px;
            background: rgba(255, 165, 0, 0.3);
            border: 2px solid #ffa500;
            color: #ffa500;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
        }
        .combat-btn:hover {
            background: rgba(255, 165, 0, 0.6);
        }
    </style>
</head>
<body>
    <div id="hud">
        <div style="font-size: 18px; margin-bottom: 10px;">⚔️ DUNGEON CRAWLER</div>
        <div class="hud-item">Level: <span id="level">1</span></div>
        <div class="hud-item">
            HP: <span id="hp">100</span>/100
            <div class="health-bar"><div class="health-fill" id="healthBar" style="width: 100%"></div></div>
        </div>
        <div class="hud-item">Attack: <span id="attack">10</span></div>
        <div class="hud-item">Gold: <span id="gold">0</span> 💰</div>
        <div class="hud-item">Keys: <span id="keys">0</span> 🔑</div>
        <div class="hud-item">Floor: <span id="floor">1</span></div>
    </div>

    <canvas id="minimap"></canvas>

    <div id="controls">
        WASD/Arrows: Move<br>
        Space: Next Floor<br>
        Click: Interact
    </div>

    <div id="combat">
        <h2>⚔️ COMBAT!</h2>
        <div id="enemyInfo"></div>
        <div style="margin: 20px 0;">
            <button class="combat-btn" id="attackBtn">⚔️ Attack</button>
            <button class="combat-btn" id="defendBtn">🛡️ Defend</button>
            <button class="combat-btn" id="fleeBtn">🏃 Flee</button>
        </div>
        <div id="combatLog"></div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.Fog(0x000000, 5, 30);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Minimap
        const minimapCanvas = document.getElementById('minimap');
        const minimapCtx = minimapCanvas.getContext('2d');
        minimapCanvas.width = 200;
        minimapCanvas.height = 200;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

        // Torch light
        const torch = new THREE.PointLight(0xff8800, 1.5, 15);
        scene.add(torch);

        // Game state
        const gameState = {
            hp: 100,
            maxHp: 100,
            attack: 10,
            defense: 5,
            gold: 0,
            keys: 0,
            level: 1,
            floor: 1,
            inCombat: false,
            currentEnemy: null
        };

        // Dungeon generation
        const DUNGEON_SIZE = 20;
        const dungeon = [];

        function generateDungeon() {
            // Clear old dungeon
            scene.children.forEach(child => {
                if (child.userData.isDungeon) {
                    scene.remove(child);
                }
            });

            // Initialize grid
            for (let x = 0; x < DUNGEON_SIZE; x++) {
                dungeon[x] = [];
                for (let z = 0; z < DUNGEON_SIZE; z++) {
                    dungeon[x][z] = { type: 'wall', mesh: null, object: null };
                }
            }

            // Create rooms
            const rooms = [];
            const numRooms = 5 + Math.floor(Math.random() * 5);

            for (let i = 0; i < numRooms; i++) {
                const w = 3 + Math.floor(Math.random() * 4);
                const h = 3 + Math.floor(Math.random() * 4);
                const x = Math.floor(Math.random() * (DUNGEON_SIZE - w - 2)) + 1;
                const z = Math.floor(Math.random() * (DUNGEON_SIZE - h - 2)) + 1;

                let overlaps = false;
                for (const room of rooms) {
                    if (x < room.x + room.w + 1 && x + w + 1 > room.x &&
                        z < room.z + room.h + 1 && z + h + 1 > room.z) {
                        overlaps = true;
                        break;
                    }
                }

                if (!overlaps) {
                    rooms.push({ x, z, w, h });

                    // Carve room
                    for (let rx = x; rx < x + w; rx++) {
                        for (let rz = z; rz < z + h; rz++) {
                            dungeon[rx][rz].type = 'floor';
                        }
                    }
                }
            }

            // Connect rooms with corridors
            for (let i = 0; i < rooms.length - 1; i++) {
                const roomA = rooms[i];
                const roomB = rooms[i + 1];

                const ax = roomA.x + Math.floor(roomA.w / 2);
                const az = roomA.z + Math.floor(roomA.h / 2);
                const bx = roomB.x + Math.floor(roomB.w / 2);
                const bz = roomB.z + Math.floor(roomB.h / 2);

                // Horizontal corridor
                for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
                    dungeon[x][az].type = 'floor';
                }

                // Vertical corridor
                for (let z = Math.min(az, bz); z <= Math.max(az, bz); z++) {
                    dungeon[bx][z].type = 'floor';
                }
            }

            // Place objects in rooms
            rooms.forEach((room, idx) => {
                const centerX = room.x + Math.floor(room.w / 2);
                const centerZ = room.z + Math.floor(room.h / 2);

                if (idx === rooms.length - 1) {
                    // Stairs in last room
                    dungeon[centerX][centerZ].object = 'stairs';
                } else if (idx > 0 && Math.random() > 0.5) {
                    // Enemy or treasure
                    if (Math.random() > 0.5) {
                        dungeon[centerX][centerZ].object = 'enemy';
                    } else {
                        dungeon[centerX][centerZ].object = 'chest';
                    }
                }
            });

            // Build 3D dungeon
            buildDungeon3D();

            // Place player in first room
            const firstRoom = rooms[0];
            player.position.set(
                (firstRoom.x + Math.floor(firstRoom.w / 2)) * 2,
                1,
                (firstRoom.z + Math.floor(firstRoom.h / 2)) * 2
            );
        }

        function buildDungeon3D() {
            const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });

            for (let x = 0; x < DUNGEON_SIZE; x++) {
                for (let z = 0; z < DUNGEON_SIZE; z++) {
                    const cell = dungeon[x][z];

                    if (cell.type === 'floor') {
                        // Floor
                        const floorGeo = new THREE.BoxGeometry(2, 0.1, 2);
                        const floor = new THREE.Mesh(floorGeo, floorMaterial);
                        floor.position.set(x * 2, 0, z * 2);
                        floor.receiveShadow = true;
                        floor.userData.isDungeon = true;
                        scene.add(floor);
                        cell.mesh = floor;

                        // Objects
                        if (cell.object === 'enemy') {
                            const enemyGeo = new THREE.ConeGeometry(0.5, 1.5, 4);
                            const enemyMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
                            const enemy = new THREE.Mesh(enemyGeo, enemyMat);
                            enemy.position.set(x * 2, 0.75, z * 2);
                            enemy.rotation.y = Math.PI / 4;
                            enemy.userData.isDungeon = true;
                            enemy.userData.type = 'enemy';
                            enemy.userData.hp = 20 + gameState.floor * 10;
                            enemy.userData.attack = 5 + gameState.floor * 2;
                            scene.add(enemy);
                            cell.mesh = enemy;
                        } else if (cell.object === 'chest') {
                            const chestGeo = new THREE.BoxGeometry(0.8, 0.6, 0.6);
                            const chestMat = new THREE.MeshPhongMaterial({ color: 0xffd700 });
                            const chest = new THREE.Mesh(chestGeo, chestMat);
                            chest.position.set(x * 2, 0.3, z * 2);
                            chest.userData.isDungeon = true;
                            chest.userData.type = 'chest';
                            scene.add(chest);
                            cell.mesh = chest;
                        } else if (cell.object === 'stairs') {
                            const stairsGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 8);
                            const stairsMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                            const stairs = new THREE.Mesh(stairsGeo, stairsMat);
                            stairs.position.set(x * 2, 0.1, z * 2);
                            stairs.userData.isDungeon = true;
                            stairs.userData.type = 'stairs';
                            scene.add(stairs);
                            cell.mesh = stairs;
                        }
                    } else {
                        // Wall
                        const wallGeo = new THREE.BoxGeometry(2, 3, 2);
                        const wall = new THREE.Mesh(wallGeo, wallMaterial);
                        wall.position.set(x * 2, 1.5, z * 2);
                        wall.castShadow = true;
                        wall.receiveShadow = true;
                        wall.userData.isDungeon = true;
                        scene.add(wall);
                        cell.mesh = wall;
                    }
                }
            }
        }

        // Player
        const playerGeometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
        const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.set(5, 1, 5);
        scene.add(player);

        camera.position.set(0, 3, 5);
        player.add(camera);
        player.add(torch);

        // Input
        const keys = {};
        document.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;

            if (e.key === ' ' && !gameState.inCombat) {
                checkStairs();
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        // Movement
        function movePlayer(dx, dz) {
            const newX = player.position.x + dx;
            const newZ = player.position.z + dz;

            const gridX = Math.floor(newX / 2);
            const gridZ = Math.floor(newZ / 2);

            if (gridX >= 0 && gridX < DUNGEON_SIZE && gridZ >= 0 && gridZ < DUNGEON_SIZE) {
                if (dungeon[gridX][gridZ].type === 'floor') {
                    player.position.x = newX;
                    player.position.z = newZ;

                    // Check for objects
                    checkInteraction(gridX, gridZ);
                }
            }
        }

        function checkInteraction(gridX, gridZ) {
            const cell = dungeon[gridX][gridZ];

            if (cell.object === 'enemy' && cell.mesh) {
                startCombat(cell);
            } else if (cell.object === 'chest' && cell.mesh) {
                openChest(cell);
            }
        }

        function checkStairs() {
            const gridX = Math.floor(player.position.x / 2);
            const gridZ = Math.floor(player.position.z / 2);

            if (dungeon[gridX][gridZ].object === 'stairs') {
                gameState.floor++;
                gameState.hp = Math.min(gameState.maxHp, gameState.hp + 20);
                generateDungeon();
            }
        }

        // Combat
        function startCombat(cell) {
            gameState.inCombat = true;
            gameState.currentEnemy = cell.mesh.userData;
            document.getElementById('combat').style.display = 'block';
            document.getElementById('enemyInfo').innerHTML = `
                Enemy HP: ${cell.mesh.userData.hp}<br>
                Enemy Attack: ${cell.mesh.userData.attack}
            `;
        }

        document.getElementById('attackBtn').addEventListener('click', () => {
            if (!gameState.inCombat) return;

            const damage = gameState.attack + Math.floor(Math.random() * 5);
            gameState.currentEnemy.hp -= damage;

            log(`You deal ${damage} damage!`);

            if (gameState.currentEnemy.hp <= 0) {
                log('Enemy defeated!');
                gameState.gold += 10 + gameState.floor * 5;
                gameState.level++;
                gameState.attack += 2;
                endCombat(true);
            } else {
                enemyAttack();
            }
        });

        document.getElementById('defendBtn').addEventListener('click', () => {
            if (!gameState.inCombat) return;
            log('You brace for impact!');
            const reducedDamage = Math.max(0, gameState.currentEnemy.attack - gameState.defense);
            gameState.hp -= reducedDamage;
            log(`Enemy deals ${reducedDamage} damage!`);
            checkPlayerDeath();
        });

        document.getElementById('fleeBtn').addEventListener('click', () => {
            if (Math.random() > 0.5) {
                log('You escaped!');
                endCombat(false);
            } else {
                log('Failed to escape!');
                enemyAttack();
            }
        });

        function enemyAttack() {
            const damage = gameState.currentEnemy.attack + Math.floor(Math.random() * 3);
            gameState.hp -= damage;
            log(`Enemy deals ${damage} damage!`);
            checkPlayerDeath();
        }

        function log(message) {
            const combatLog = document.getElementById('combatLog');
            combatLog.innerHTML = message + '<br>' + combatLog.innerHTML;
        }

        function checkPlayerDeath() {
            if (gameState.hp <= 0) {
                alert('You died! Game Over.');
                location.reload();
            }
            updateHUD();
        }

        function endCombat(victory) {
            gameState.inCombat = false;
            document.getElementById('combat').style.display = 'none';
            document.getElementById('combatLog').innerHTML = '';

            const gridX = Math.floor(player.position.x / 2);
            const gridZ = Math.floor(player.position.z / 2);

            if (victory && dungeon[gridX][gridZ].mesh) {
                scene.remove(dungeon[gridX][gridZ].mesh);
                dungeon[gridX][gridZ].object = null;
                dungeon[gridX][gridZ].mesh = null;
            }
        }

        function openChest(cell) {
            const gold = 20 + Math.floor(Math.random() * 30);
            gameState.gold += gold;
            scene.remove(cell.mesh);
            cell.object = null;
            cell.mesh = null;
        }

        // HUD
        function updateHUD() {
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('hp').textContent = gameState.hp;
            document.getElementById('attack').textContent = gameState.attack;
            document.getElementById('gold').textContent = gameState.gold;
            document.getElementById('keys').textContent = gameState.keys;
            document.getElementById('floor').textContent = gameState.floor;

            const healthPercent = (gameState.hp / gameState.maxHp) * 100;
            document.getElementById('healthBar').style.width = healthPercent + '%';
        }

        // Minimap
        function drawMinimap() {
            minimapCtx.fillStyle = '#000';
            minimapCtx.fillRect(0, 0, 200, 200);

            const scale = 200 / DUNGEON_SIZE;

            for (let x = 0; x < DUNGEON_SIZE; x++) {
                for (let z = 0; z < DUNGEON_SIZE; z++) {
                    const cell = dungeon[x][z];

                    if (cell.type === 'floor') {
                        minimapCtx.fillStyle = '#333';
                    } else {
                        minimapCtx.fillStyle = '#666';
                    }

                    minimapCtx.fillRect(x * scale, z * scale, scale, scale);

                    if (cell.object === 'stairs') {
                        minimapCtx.fillStyle = '#0f0';
                        minimapCtx.fillRect(x * scale, z * scale, scale, scale);
                    } else if (cell.object === 'enemy') {
                        minimapCtx.fillStyle = '#f00';
                        minimapCtx.fillRect(x * scale + 2, z * scale + 2, scale - 4, scale - 4);
                    } else if (cell.object === 'chest') {
                        minimapCtx.fillStyle = '#ff0';
                        minimapCtx.fillRect(x * scale + 2, z * scale + 2, scale - 4, scale - 4);
                    }
                }
            }

            // Player
            const px = Math.floor(player.position.x / 2);
            const pz = Math.floor(player.position.z / 2);
            minimapCtx.fillStyle = '#00f';
            minimapCtx.fillRect(px * scale, pz * scale, scale, scale);
        }

        // Game loop
        generateDungeon();

        function animate() {
            requestAnimationFrame(animate);

            if (!gameState.inCombat) {
                if (keys['w'] || keys['arrowup']) movePlayer(0, -0.15);
                if (keys['s'] || keys['arrowdown']) movePlayer(0, 0.15);
                if (keys['a'] || keys['arrowleft']) movePlayer(-0.15, 0);
                if (keys['d'] || keys['arrowright']) movePlayer(0.15, 0);
            }

            // Torch flicker
            torch.intensity = 1.5 + Math.sin(Date.now() * 0.005) * 0.2;

            updateHUD();
            drawMinimap();
            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    </script>
</body>
</html>
```
