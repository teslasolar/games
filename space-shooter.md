# Space Shooter

Classic space shooter game in 3D with enemies and power-ups.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Space Shooter</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #000; }
        canvas { display: block; }
        #hud {
            position: absolute;
            top: 20px;
            width: 100%;
            text-align: center;
            color: #00ff88;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 0 0 10px #00ff88;
        }
        #info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #00ff88;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            background: rgba(0, 20, 40, 0.8);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #00ff88;
        }
        #gameover {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff4444;
            font-family: 'Courier New', monospace;
            font-size: 40px;
            font-weight: bold;
            text-align: center;
            display: none;
            text-shadow: 0 0 20px #ff4444;
        }
    </style>
</head>
<body>
    <div id="hud">
        SCORE: <span id="score">0</span> | HEALTH: <span id="health">100</span>
    </div>
    <div id="info">
        🚀 Arrow Keys: Move | Space: Shoot | R: Restart
    </div>
    <div id="gameover">
        GAME OVER<br>
        <span style="font-size: 20px;">Press R to Restart</span>
    </div>

    <script>
        let scene, camera, renderer;
        let player, bullets = [], enemies = [], stars = [];
        let score = 0, health = 100;
        let keys = {};
        let gameOver = false;
        let lastShot = 0;

        function init() {
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x000000, 50, 200);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 15);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            createPlayer();
            createStarfield();
            createLighting();

            document.addEventListener('keydown', (e) => {
                keys[e.key] = true;
                if (e.key === 'r' || e.key === 'R') restart();
            });
            document.addEventListener('keyup', (e) => keys[e.key] = false);
            window.addEventListener('resize', onResize);

            animate();
        }

        function createPlayer() {
            const geometry = new THREE.ConeGeometry(0.5, 2, 3);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.5
            });
            player = new THREE.Mesh(geometry, material);
            player.rotation.x = Math.PI / 2;
            scene.add(player);

            // Thruster effect
            const thrusterGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const thrusterMaterial = new THREE.MeshBasicMaterial({ color: 0xff8800 });
            const thruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
            thruster.position.z = -1;
            player.add(thruster);
        }

        function createStarfield() {
            const starsGeometry = new THREE.BufferGeometry();
            const starsMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.2,
                transparent: true
            });

            const starsVertices = [];
            for (let i = 0; i < 1000; i++) {
                const x = (Math.random() - 0.5) * 200;
                const y = (Math.random() - 0.5) * 200;
                const z = (Math.random() - 0.5) * 200 - 50;
                starsVertices.push(x, y, z);
            }

            starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
            const starField = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(starField);
        }

        function createLighting() {
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 10, 10);
            scene.add(directionalLight);
        }

        function shoot() {
            const now = Date.now();
            if (now - lastShot < 200) return;
            lastShot = now;

            const geometry = new THREE.SphereGeometry(0.2, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
            const bullet = new THREE.Mesh(geometry, material);

            bullet.position.copy(player.position);
            bullet.position.z -= 1;
            bullet.velocity = 0.8;

            scene.add(bullet);
            bullets.push(bullet);
        }

        function spawnEnemy() {
            const geometry = new THREE.OctahedronGeometry(0.8, 0);
            const material = new THREE.MeshPhongMaterial({
                color: 0xff0088,
                emissive: 0xff0088,
                emissiveIntensity: 0.5
            });
            const enemy = new THREE.Mesh(geometry, material);

            enemy.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10,
                -30
            );
            enemy.velocity = 0.1 + Math.random() * 0.15;
            enemy.health = 1;

            scene.add(enemy);
            enemies.push(enemy);
        }

        function updateGame() {
            if (gameOver) return;

            // Player movement
            const speed = 0.3;
            if (keys['ArrowLeft']) player.position.x -= speed;
            if (keys['ArrowRight']) player.position.x += speed;
            if (keys['ArrowUp']) player.position.y += speed;
            if (keys['ArrowDown']) player.position.y -= speed;
            if (keys[' ']) shoot();

            // Clamp player position
            player.position.x = Math.max(-10, Math.min(10, player.position.x));
            player.position.y = Math.max(-5, Math.min(5, player.position.y));

            // Update bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                bullet.position.z -= bullet.velocity;

                if (bullet.position.z < -50) {
                    scene.remove(bullet);
                    bullets.splice(i, 1);
                }
            }

            // Update enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                enemy.position.z += enemy.velocity;
                enemy.rotation.x += 0.05;
                enemy.rotation.y += 0.05;

                // Check collision with player
                const dist = player.position.distanceTo(enemy.position);
                if (dist < 1.5) {
                    health -= 10;
                    updateHUD();
                    scene.remove(enemy);
                    enemies.splice(i, 1);

                    if (health <= 0) {
                        endGame();
                    }
                    continue;
                }

                // Remove if past player
                if (enemy.position.z > 20) {
                    scene.remove(enemy);
                    enemies.splice(i, 1);
                }
            }

            // Check bullet-enemy collisions
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];

                for (let j = enemies.length - 1; j >= 0; j--) {
                    const enemy = enemies[j];
                    const dist = bullet.position.distanceTo(enemy.position);

                    if (dist < 1) {
                        enemy.health--;

                        if (enemy.health <= 0) {
                            score += 100;
                            updateHUD();
                            scene.remove(enemy);
                            enemies.splice(j, 1);
                            createExplosion(enemy.position);
                        }

                        scene.remove(bullet);
                        bullets.splice(i, 1);
                        break;
                    }
                }
            }

            // Spawn enemies
            if (Math.random() < 0.02 && enemies.length < 10) {
                spawnEnemy();
            }
        }

        function createExplosion(position) {
            const particlesCount = 20;
            for (let i = 0; i < particlesCount; i++) {
                const geometry = new THREE.SphereGeometry(0.1, 4, 4);
                const material = new THREE.MeshBasicMaterial({ color: 0xff8800 });
                const particle = new THREE.Mesh(geometry, material);

                particle.position.copy(position);
                particle.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                particle.life = 30;

                scene.add(particle);

                const updateParticle = () => {
                    particle.position.add(particle.velocity);
                    particle.life--;
                    particle.material.opacity = particle.life / 30;

                    if (particle.life > 0) {
                        requestAnimationFrame(updateParticle);
                    } else {
                        scene.remove(particle);
                    }
                };

                updateParticle();
            }
        }

        function updateHUD() {
            document.getElementById('score').textContent = score;
            document.getElementById('health').textContent = Math.max(0, health);
        }

        function endGame() {
            gameOver = true;
            document.getElementById('gameover').style.display = 'block';
        }

        function restart() {
            // Clear all objects
            bullets.forEach(b => scene.remove(b));
            enemies.forEach(e => scene.remove(e));
            bullets = [];
            enemies = [];

            // Reset game state
            score = 0;
            health = 100;
            gameOver = false;

            player.position.set(0, 0, 0);
            updateHUD();
            document.getElementById('gameover').style.display = 'none';
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            updateGame();

            renderer.render(scene, camera);
        }

        init();
        updateHUD();
    </script>
</body>
</html>
```
