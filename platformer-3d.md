# 3D Platformer

Fast-paced 3D platformer with obstacles, power-ups, and challenging jumps.

```html
<!DOCTYPE html>
<html>
<head>
    <title>3D Platformer</title>
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
            color: #fff;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border: 2px solid #ffaa00;
            border-radius: 8px;
            font-size: 14px;
            z-index: 100;
        }
        .hud-item {
            margin: 5px 0;
        }
        #controls {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            color: #fff;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px 20px;
            border: 2px solid #ffaa00;
            border-radius: 8px;
            font-size: 12px;
            z-index: 100;
            text-align: center;
        }
        #gameOver {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #fff;
            background: rgba(0, 0, 0, 0.9);
            padding: 40px;
            border: 3px solid #ffaa00;
            border-radius: 15px;
            z-index: 200;
            display: none;
        }
        #gameOver h1 {
            font-size: 48px;
            color: #ffaa00;
            margin-bottom: 20px;
        }
        #restartBtn {
            padding: 15px 40px;
            font-size: 18px;
            background: rgba(255, 170, 0, 0.3);
            border: 3px solid #ffaa00;
            color: #fff;
            border-radius: 10px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        #restartBtn:hover {
            background: rgba(255, 170, 0, 0.6);
        }
    </style>
</head>
<body>
    <div id="hud">
        <div style="font-size: 18px; margin-bottom: 10px;">🏃 PLATFORMER</div>
        <div class="hud-item">Distance: <span id="distance">0</span>m</div>
        <div class="hud-item">Coins: <span id="coins">0</span> 💰</div>
        <div class="hud-item">Lives: <span id="lives">3</span> ❤️</div>
        <div class="hud-item">Speed: <span id="speed">1.0</span>x</div>
    </div>

    <div id="controls">
        SPACE: Jump | ↑↑: Double Jump | ← →: Move | R: Restart
    </div>

    <div id="gameOver">
        <h1>GAME OVER!</h1>
        <div style="font-size: 24px; margin: 20px 0;">
            Distance: <span id="finalDistance">0</span>m<br>
            Coins: <span id="finalCoins">0</span> 💰
        </div>
        <button id="restartBtn">Play Again</button>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 8, 15);
        camera.lookAt(0, 2, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        scene.add(directionalLight);

        // Game state
        const gameState = {
            distance: 0,
            coins: 0,
            lives: 3,
            speed: 0.15,
            baseSpeed: 0.15,
            isGameOver: false,
            canDoubleJump: false,
            hasDoubleJumped: false
        };

        // Player
        const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
        const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.set(0, 1, 0);
        player.castShadow = true;
        scene.add(player);

        let playerVelocityY = 0;
        let playerVelocityX = 0;
        const gravity = -0.02;
        const jumpForce = 0.4;
        const moveSpeed = 0.15;

        // Platform management
        const platforms = [];
        const obstacles = [];
        const collectibles = [];

        class Platform {
            constructor(x, y, z, width = 5, length = 10) {
                const geometry = new THREE.BoxGeometry(width, 0.5, length);
                const material = new THREE.MeshPhongMaterial({ color: 0x228b22 });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.set(x, y, z);
                this.mesh.receiveShadow = true;
                scene.add(this.mesh);
                this.width = width;
                this.length = length;
            }

            update() {
                this.mesh.position.z += gameState.speed;
                if (this.mesh.position.z > 20) {
                    return false;
                }
                return true;
            }

            remove() {
                scene.remove(this.mesh);
            }
        }

        class Obstacle {
            constructor(x, y, z, type = 'box') {
                let geometry;
                if (type === 'box') {
                    geometry = new THREE.BoxGeometry(1.5, 2, 1.5);
                } else if (type === 'spike') {
                    geometry = new THREE.ConeGeometry(0.8, 2, 4);
                }

                const material = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.set(x, y, z);
                this.mesh.castShadow = true;
                scene.add(this.mesh);
            }

            update() {
                this.mesh.position.z += gameState.speed;
                this.mesh.rotation.y += 0.05;

                if (this.mesh.position.z > 20) {
                    return false;
                }
                return true;
            }

            checkCollision(playerPos) {
                const dist = this.mesh.position.distanceTo(playerPos);
                return dist < 1.5;
            }

            remove() {
                scene.remove(this.mesh);
            }
        }

        class Coin {
            constructor(x, y, z) {
                const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
                const material = new THREE.MeshPhongMaterial({
                    color: 0xffaa00,
                    emissive: 0xffaa00,
                    emissiveIntensity: 0.5
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.set(x, y, z);
                this.mesh.rotation.x = Math.PI / 2;
                scene.add(this.mesh);
                this.collected = false;
            }

            update() {
                this.mesh.position.z += gameState.speed;
                this.mesh.rotation.y += 0.1;

                if (this.mesh.position.z > 20) {
                    return false;
                }
                return true;
            }

            checkCollision(playerPos) {
                if (this.collected) return false;
                const dist = this.mesh.position.distanceTo(playerPos);
                if (dist < 1.5) {
                    this.collected = true;
                    gameState.coins++;
                    scene.remove(this.mesh);
                    return true;
                }
                return false;
            }

            remove() {
                if (!this.collected) {
                    scene.remove(this.mesh);
                }
            }
        }

        // Level generation
        let lastPlatformZ = 0;

        function generateLevel() {
            const platformZ = lastPlatformZ - 10;
            lastPlatformZ = platformZ;

            // Main platform
            const width = 5 + Math.random() * 3;
            const xOffset = (Math.random() - 0.5) * 3;
            platforms.push(new Platform(xOffset, 0, platformZ, width, 10));

            // Add obstacles
            if (Math.random() > 0.5) {
                const obstacleType = Math.random() > 0.5 ? 'box' : 'spike';
                const obstacleX = xOffset + (Math.random() - 0.5) * (width - 2);
                obstacles.push(new Obstacle(obstacleX, 1, platformZ - 3, obstacleType));
            }

            // Add coins
            for (let i = 0; i < 3; i++) {
                const coinX = xOffset + (Math.random() - 0.5) * (width - 1);
                const coinY = 2 + Math.random() * 2;
                const coinZ = platformZ - i * 3;
                collectibles.push(new Coin(coinX, coinY, coinZ));
            }

            // Gap with floating platform
            if (Math.random() > 0.6) {
                const floatingX = xOffset + (Math.random() - 0.5) * 4;
                const floatingY = 2 + Math.random() * 2;
                platforms.push(new Platform(floatingX, floatingY, platformZ - 15, 3, 3));
            }
        }

        // Initialize level
        for (let i = 0; i < 10; i++) {
            generateLevel();
        }

        // Input handling
        const keys = {};
        document.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;

            if (e.key === ' ' && !gameState.isGameOver) {
                // Jump
                if (Math.abs(playerVelocityY) < 0.01) {
                    playerVelocityY = jumpForce;
                    gameState.canDoubleJump = true;
                    gameState.hasDoubleJumped = false;
                } else if (gameState.canDoubleJump && !gameState.hasDoubleJumped) {
                    // Double jump
                    playerVelocityY = jumpForce * 0.8;
                    gameState.hasDoubleJumped = true;
                }
            }

            if (e.key.toLowerCase() === 'r') {
                restartGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        document.getElementById('restartBtn').addEventListener('click', restartGame);

        function restartGame() {
            // Clear all objects
            platforms.forEach(p => p.remove());
            obstacles.forEach(o => o.remove());
            collectibles.forEach(c => c.remove());
            platforms.length = 0;
            obstacles.length = 0;
            collectibles.length = 0;

            // Reset game state
            gameState.distance = 0;
            gameState.coins = 0;
            gameState.lives = 3;
            gameState.speed = gameState.baseSpeed;
            gameState.isGameOver = false;

            // Reset player
            player.position.set(0, 1, 0);
            playerVelocityY = 0;
            playerVelocityX = 0;

            // Regenerate level
            lastPlatformZ = 0;
            for (let i = 0; i < 10; i++) {
                generateLevel();
            }

            document.getElementById('gameOver').style.display = 'none';
        }

        function gameOver() {
            gameState.isGameOver = true;
            document.getElementById('finalDistance').textContent = Math.floor(gameState.distance);
            document.getElementById('finalCoins').textContent = gameState.coins;
            document.getElementById('gameOver').style.display = 'block';
        }

        // Update player
        function updatePlayer() {
            if (gameState.isGameOver) return;

            // Horizontal movement
            if (keys['arrowleft'] || keys['a']) {
                playerVelocityX = -moveSpeed;
            } else if (keys['arrowright'] || keys['d']) {
                playerVelocityX = moveSpeed;
            } else {
                playerVelocityX *= 0.8;
            }

            player.position.x += playerVelocityX;
            player.position.x = Math.max(-5, Math.min(5, player.position.x));

            // Apply gravity
            playerVelocityY += gravity;
            player.position.y += playerVelocityY;

            // Check platform collision
            let onPlatform = false;
            platforms.forEach(platform => {
                const px = platform.mesh.position.x;
                const py = platform.mesh.position.y;
                const pz = platform.mesh.position.z;

                if (Math.abs(player.position.x - px) < platform.width / 2 &&
                    Math.abs(player.position.z - pz) < platform.length / 2 &&
                    player.position.y <= py + 0.75 &&
                    player.position.y >= py - 1 &&
                    playerVelocityY <= 0) {

                    player.position.y = py + 0.75;
                    playerVelocityY = 0;
                    onPlatform = true;
                    gameState.canDoubleJump = true;
                    gameState.hasDoubleJumped = false;
                }
            });

            // Fall off
            if (player.position.y < -10) {
                gameState.lives--;
                if (gameState.lives <= 0) {
                    gameOver();
                } else {
                    player.position.set(0, 5, 0);
                    playerVelocityY = 0;
                }
            }

            // Check obstacle collisions
            obstacles.forEach(obstacle => {
                if (obstacle.checkCollision(player.position)) {
                    gameState.lives--;
                    if (gameState.lives <= 0) {
                        gameOver();
                    } else {
                        player.position.set(0, 5, 0);
                        playerVelocityY = 0;
                    }
                }
            });

            // Check coin collisions
            collectibles.forEach(coin => {
                coin.checkCollision(player.position);
            });

            // Update distance and speed
            gameState.distance += gameState.speed;
            gameState.speed = gameState.baseSpeed + gameState.distance * 0.00001;

            // Player animation
            player.rotation.x += 0.1;
        }

        // Update HUD
        function updateHUD() {
            document.getElementById('distance').textContent = Math.floor(gameState.distance);
            document.getElementById('coins').textContent = gameState.coins;
            document.getElementById('lives').textContent = gameState.lives;
            document.getElementById('speed').textContent = (gameState.speed / gameState.baseSpeed).toFixed(1);
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            updatePlayer();

            // Update platforms
            for (let i = platforms.length - 1; i >= 0; i--) {
                if (!platforms[i].update()) {
                    platforms[i].remove();
                    platforms.splice(i, 1);
                }
            }

            // Update obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                if (!obstacles[i].update()) {
                    obstacles[i].remove();
                    obstacles.splice(i, 1);
                }
            }

            // Update collectibles
            for (let i = collectibles.length - 1; i >= 0; i--) {
                if (!collectibles[i].update()) {
                    collectibles[i].remove();
                    collectibles.splice(i, 1);
                }
            }

            // Generate new platforms
            if (platforms.length < 15) {
                generateLevel();
            }

            // Camera follow
            camera.position.x = player.position.x * 0.3;
            camera.position.y = 8 + player.position.y * 0.2;

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
