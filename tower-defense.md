# Tower Defense 3D

Strategic tower defense game in full 3D with multiple tower types and enemy waves.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Tower Defense 3D</title>
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
            color: #00ff88;
            background: rgba(0, 0, 0, 0.9);
            padding: 15px;
            border: 2px solid #00ff88;
            border-radius: 8px;
            font-size: 14px;
            z-index: 100;
        }
        #towers {
            position: absolute;
            bottom: 10px;
            left: 10px;
            display: flex;
            gap: 10px;
            z-index: 100;
        }
        .tower-btn {
            background: rgba(0, 255, 136, 0.2);
            border: 2px solid #00ff88;
            color: #00ff88;
            padding: 15px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            transition: all 0.3s;
        }
        .tower-btn:hover {
            background: rgba(0, 255, 136, 0.4);
            transform: translateY(-2px);
        }
        .tower-btn.selected {
            background: rgba(0, 255, 136, 0.6);
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
        }
        .tower-btn.disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
        #startBtn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 200, 0, 0.3);
            border: 2px solid #ffc800;
            color: #ffc800;
            padding: 15px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: bold;
            z-index: 100;
        }
        #startBtn:hover {
            background: rgba(255, 200, 0, 0.5);
        }
    </style>
</head>
<body>
    <div id="hud">
        <div>⚔️ TOWER DEFENSE</div>
        <div style="font-size: 11px; margin-top: 5px;">Wave: <span id="wave">0</span></div>
        <div style="font-size: 11px;">Gold: <span id="gold">500</span>💰</div>
        <div style="font-size: 11px;">Lives: <span id="lives">20</span>❤️</div>
        <div style="font-size: 11px; margin-top: 5px;">Enemies: <span id="enemies">0</span></div>
    </div>

    <div id="towers">
        <button class="tower-btn" data-type="cannon" data-cost="100">
            🔫 Cannon<br><small>100💰 | Fast</small>
        </button>
        <button class="tower-btn" data-type="laser" data-cost="200">
            ⚡ Laser<br><small>200💰 | Strong</small>
        </button>
        <button class="tower-btn" data-type="freeze" data-cost="150">
            ❄️ Freeze<br><small>150💰 | Slow</small>
        </button>
        <button class="tower-btn" data-type="aoe" data-cost="300">
            💥 AOE<br><small>300💰 | Area</small>
        </button>
    </div>

    <button id="startBtn">▶ START WAVE</button>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x001122);
        scene.fog = new THREE.Fog(0x001122, 10, 80);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(20, 25, 20);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        scene.add(directionalLight);

        // Game state
        const gameState = {
            gold: 500,
            lives: 20,
            wave: 0,
            selectedTowerType: null,
            isWaveActive: false
        };

        const towers = [];
        const enemies = [];
        const projectiles = [];

        // Create path
        const pathPoints = [
            new THREE.Vector3(-15, 0, -15),
            new THREE.Vector3(-15, 0, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 15),
            new THREE.Vector3(15, 0, 15),
            new THREE.Vector3(15, 0, 0),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -15),
            new THREE.Vector3(15, 0, -15)
        ];

        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(40, 40);
        const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x0a3322 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Draw path
        const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
        const pathGeometry = new THREE.TubeGeometry(pathCurve, 100, 0.5, 8, false);
        const pathMaterial = new THREE.MeshPhongMaterial({ color: 0x665533 });
        const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
        pathMesh.receiveShadow = true;
        scene.add(pathMesh);

        // Tower types
        const towerTypes = {
            cannon: {
                color: 0x888888,
                damage: 20,
                range: 8,
                fireRate: 30,
                projectileSpeed: 0.3,
                projectileColor: 0xffaa00
            },
            laser: {
                color: 0xff0000,
                damage: 40,
                range: 10,
                fireRate: 60,
                projectileSpeed: 0.5,
                projectileColor: 0xff0000
            },
            freeze: {
                color: 0x00ffff,
                damage: 10,
                range: 7,
                fireRate: 40,
                projectileSpeed: 0.25,
                projectileColor: 0x00ffff,
                slowEffect: 0.5
            },
            aoe: {
                color: 0xff00ff,
                damage: 30,
                range: 6,
                fireRate: 90,
                projectileSpeed: 0.2,
                projectileColor: 0xff00ff,
                splashRadius: 3
            }
        };

        // Tower class
        class Tower {
            constructor(type, position) {
                this.type = type;
                this.stats = towerTypes[type];
                this.position = position;
                this.target = null;
                this.cooldown = 0;

                // Create tower mesh
                const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.5, 8);
                const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 8);
                const baseMaterial = new THREE.MeshPhongMaterial({ color: this.stats.color });

                this.base = new THREE.Mesh(baseGeometry, baseMaterial);
                this.base.position.copy(position);
                this.base.position.y = 0.25;
                this.base.castShadow = true;
                scene.add(this.base);

                this.body = new THREE.Mesh(bodyGeometry, baseMaterial);
                this.body.position.copy(position);
                this.body.position.y = 1.25;
                this.body.castShadow = true;
                scene.add(this.body);

                // Range indicator
                const rangeGeometry = new THREE.RingGeometry(this.stats.range - 0.1, this.stats.range, 32);
                const rangeMaterial = new THREE.MeshBasicMaterial({
                    color: this.stats.color,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.2
                });
                this.rangeIndicator = new THREE.Mesh(rangeGeometry, rangeMaterial);
                this.rangeIndicator.rotation.x = -Math.PI / 2;
                this.rangeIndicator.position.copy(position);
                this.rangeIndicator.position.y = 0.1;
                scene.add(this.rangeIndicator);
            }

            update() {
                this.cooldown--;

                // Find target
                if (!this.target || this.target.health <= 0 ||
                    this.position.distanceTo(this.target.position) > this.stats.range) {
                    this.target = this.findTarget();
                }

                // Aim at target
                if (this.target) {
                    const direction = new THREE.Vector3()
                        .subVectors(this.target.position, this.position);
                    const angle = Math.atan2(direction.x, direction.z);
                    this.body.rotation.y = angle;

                    // Fire
                    if (this.cooldown <= 0) {
                        this.fire();
                        this.cooldown = this.stats.fireRate;
                    }
                }
            }

            findTarget() {
                let closest = null;
                let minDist = this.stats.range;

                for (const enemy of enemies) {
                    if (enemy.health <= 0) continue;
                    const dist = this.position.distanceTo(enemy.position);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = enemy;
                    }
                }
                return closest;
            }

            fire() {
                projectiles.push(new Projectile(
                    this.position.clone(),
                    this.target,
                    this.stats,
                    this.type
                ));
            }
        }

        // Enemy class
        class Enemy {
            constructor(wave) {
                this.health = 50 + wave * 20;
                this.maxHealth = this.health;
                this.speed = 0.05 + wave * 0.005;
                this.baseSpeed = this.speed;
                this.progress = 0;
                this.gold = 10 + wave * 2;
                this.slowEffect = 1;

                const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
                const material = new THREE.MeshPhongMaterial({ color: 0xff4444 });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.castShadow = true;
                scene.add(this.mesh);

                this.position = pathCurve.getPointAt(0);
                this.mesh.position.copy(this.position);
            }

            update() {
                if (this.health <= 0) {
                    scene.remove(this.mesh);
                    return;
                }

                this.progress += this.speed * this.slowEffect;
                this.slowEffect = Math.min(1, this.slowEffect + 0.02);

                if (this.progress >= 1) {
                    gameState.lives--;
                    updateHUD();
                    scene.remove(this.mesh);
                    this.health = 0;
                    if (gameState.lives <= 0) {
                        alert('💀 Game Over! Refresh to restart.');
                    }
                    return;
                }

                this.position = pathCurve.getPointAt(this.progress);
                this.mesh.position.copy(this.position);
                this.mesh.position.y = 0.4;

                // Health bar
                this.mesh.material.color.setHSL(this.health / this.maxHealth * 0.3, 1, 0.5);
            }

            damage(amount, effect) {
                this.health -= amount;
                if (effect?.slowEffect) {
                    this.slowEffect = Math.min(this.slowEffect, effect.slowEffect);
                }
                if (this.health <= 0) {
                    gameState.gold += this.gold;
                    updateHUD();
                }
            }
        }

        // Projectile class
        class Projectile {
            constructor(position, target, stats, type) {
                this.position = position.clone();
                this.position.y = 1;
                this.target = target;
                this.stats = stats;
                this.type = type;

                const geometry = new THREE.SphereGeometry(0.2, 8, 8);
                const material = new THREE.MeshBasicMaterial({ color: stats.projectileColor });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.copy(this.position);
                scene.add(this.mesh);

                this.active = true;
            }

            update() {
                if (!this.active || !this.target || this.target.health <= 0) {
                    scene.remove(this.mesh);
                    this.active = false;
                    return;
                }

                const direction = new THREE.Vector3()
                    .subVectors(this.target.position, this.position)
                    .normalize()
                    .multiplyScalar(this.stats.projectileSpeed);

                this.position.add(direction);
                this.mesh.position.copy(this.position);

                // Check hit
                if (this.position.distanceTo(this.target.position) < 0.5) {
                    this.hit();
                }
            }

            hit() {
                if (this.stats.splashRadius) {
                    // AOE damage
                    for (const enemy of enemies) {
                        if (enemy.health > 0) {
                            const dist = this.position.distanceTo(enemy.position);
                            if (dist < this.stats.splashRadius) {
                                enemy.damage(this.stats.damage * (1 - dist / this.stats.splashRadius));
                            }
                        }
                    }
                } else {
                    this.target.damage(this.stats.damage, this.stats);
                }

                scene.remove(this.mesh);
                this.active = false;
            }
        }

        // Wave management
        function startWave() {
            if (gameState.isWaveActive) return;

            gameState.wave++;
            gameState.isWaveActive = true;
            document.getElementById('startBtn').style.display = 'none';

            const enemyCount = 5 + gameState.wave * 3;
            let spawned = 0;

            const spawnInterval = setInterval(() => {
                enemies.push(new Enemy(gameState.wave));
                spawned++;

                if (spawned >= enemyCount) {
                    clearInterval(spawnInterval);
                    checkWaveComplete();
                }
            }, 1000);
        }

        function checkWaveComplete() {
            const checkInterval = setInterval(() => {
                const activeEnemies = enemies.filter(e => e.health > 0).length;
                if (activeEnemies === 0) {
                    clearInterval(checkInterval);
                    gameState.isWaveActive = false;
                    document.getElementById('startBtn').style.display = 'block';
                    gameState.gold += 50 + gameState.wave * 10;
                    updateHUD();
                }
            }, 500);
        }

        // Tower placement
        let hoveredPosition = null;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        renderer.domElement.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(ground);

            if (intersects.length > 0 && gameState.selectedTowerType) {
                hoveredPosition = intersects[0].point;
            }
        });

        renderer.domElement.addEventListener('click', () => {
            if (hoveredPosition && gameState.selectedTowerType) {
                const towerBtn = document.querySelector(`[data-type="${gameState.selectedTowerType}"]`);
                const cost = parseInt(towerBtn.dataset.cost);

                if (gameState.gold >= cost) {
                    towers.push(new Tower(gameState.selectedTowerType, hoveredPosition.clone()));
                    gameState.gold -= cost;
                    updateHUD();
                }
            }
        });

        // UI handlers
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                gameState.selectedTowerType = btn.dataset.type;
            });
        });

        document.getElementById('startBtn').addEventListener('click', startWave);

        function updateHUD() {
            document.getElementById('wave').textContent = gameState.wave;
            document.getElementById('gold').textContent = gameState.gold;
            document.getElementById('lives').textContent = gameState.lives;
            document.getElementById('enemies').textContent = enemies.filter(e => e.health > 0).length;

            // Update tower button states
            document.querySelectorAll('.tower-btn').forEach(btn => {
                const cost = parseInt(btn.dataset.cost);
                if (gameState.gold < cost) {
                    btn.classList.add('disabled');
                } else {
                    btn.classList.remove('disabled');
                }
            });
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            towers.forEach(tower => tower.update());
            enemies.forEach(enemy => enemy.update());
            projectiles.forEach((proj, idx) => {
                proj.update();
                if (!proj.active) projectiles.splice(idx, 1);
            });

            // Rotate camera slowly
            camera.position.x = Math.sin(Date.now() * 0.0001) * 25;
            camera.position.z = Math.cos(Date.now() * 0.0001) * 25;
            camera.lookAt(0, 0, 0);

            updateHUD();
            renderer.render(scene, camera);
        }

        // Window resize
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
