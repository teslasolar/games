# Neon Racer 3D

High-speed futuristic racing game with neon aesthetics and procedural tracks.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Neon Racer 3D</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            font-family: 'Courier New', monospace;
            background: #000;
        }
        #hud {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            color: #00ffff;
            font-size: 20px;
            text-shadow: 0 0 10px #00ffff;
            z-index: 100;
            pointer-events: none;
        }
        .hud-item {
            background: rgba(0, 0, 0, 0.7);
            padding: 10px 20px;
            border: 2px solid #00ffff;
            border-radius: 8px;
        }
        #speedometer {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 48px;
            color: #ff00ff;
            text-shadow: 0 0 20px #ff00ff;
            font-weight: bold;
            z-index: 100;
        }
        #controls {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #00ffff;
            font-size: 16px;
            background: rgba(0, 0, 0, 0.9);
            padding: 30px;
            border: 3px solid #00ffff;
            border-radius: 15px;
            z-index: 200;
        }
        #controls.hidden {
            display: none;
        }
        .key {
            display: inline-block;
            padding: 8px 12px;
            margin: 5px;
            background: rgba(0, 255, 255, 0.2);
            border: 2px solid #00ffff;
            border-radius: 5px;
        }
        #startBtn {
            margin-top: 20px;
            padding: 15px 40px;
            font-size: 20px;
            background: rgba(255, 0, 255, 0.3);
            border: 3px solid #ff00ff;
            color: #ff00ff;
            border-radius: 10px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        #startBtn:hover {
            background: rgba(255, 0, 255, 0.5);
        }
    </style>
</head>
<body>
    <div id="controls">
        <div style="font-size: 28px; margin-bottom: 20px;">🏎️ NEON RACER</div>
        <div style="margin: 15px 0;">
            <span class="key">↑ W</span> Accelerate
        </div>
        <div style="margin: 15px 0;">
            <span class="key">↓ S</span> Brake
        </div>
        <div style="margin: 15px 0;">
            <span class="key">← A</span> <span class="key">→ D</span> Steer
        </div>
        <div style="margin: 15px 0;">
            <span class="key">SPACE</span> Boost
        </div>
        <button id="startBtn">START RACE</button>
    </div>

    <div id="hud" class="hidden">
        <div class="hud-item">LAP: <span id="lap">1/3</span></div>
        <div class="hud-item">TIME: <span id="time">0:00</span></div>
        <div class="hud-item">BOOST: <span id="boost">100%</span></div>
    </div>

    <div id="speedometer" class="hidden">0</div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.015);

        const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Game state
        const gameState = {
            speed: 0,
            maxSpeed: 3,
            acceleration: 0.05,
            steering: 0,
            position: 0,
            lanePosition: 0,
            targetLane: 0,
            boost: 100,
            lap: 1,
            startTime: null,
            isPlaying: false
        };

        // Track
        const track = {
            segments: [],
            length: 200,
            width: 15,
            lanes: 3
        };

        // Colors
        const colors = {
            neon: [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff0000]
        };

        class TrackSegment {
            constructor(z, type = 'straight') {
                this.z = z;
                this.type = type;
                this.meshes = [];

                // Road
                const roadGeometry = new THREE.PlaneGeometry(track.width, 10);
                const roadMaterial = new THREE.MeshBasicMaterial({
                    color: 0x111111,
                    side: THREE.DoubleSide
                });
                const road = new THREE.Mesh(roadGeometry, roadMaterial);
                road.rotation.x = -Math.PI / 2;
                road.position.set(0, 0, z);
                scene.add(road);
                this.meshes.push(road);

                // Lane markers
                for (let i = -1; i <= 1; i++) {
                    if (z % 20 < 10) {
                        const markerGeometry = new THREE.PlaneGeometry(0.3, 5);
                        const markerMaterial = new THREE.MeshBasicMaterial({
                            color: 0xffffff,
                            side: THREE.DoubleSide
                        });
                        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                        marker.rotation.x = -Math.PI / 2;
                        marker.position.set(i * 4, 0.01, z);
                        scene.add(marker);
                        this.meshes.push(marker);
                    }
                }

                // Side barriers
                for (let side = -1; side <= 1; side += 2) {
                    const barrierGeometry = new THREE.BoxGeometry(0.5, 2, 10);
                    const neonColor = colors.neon[Math.floor(Math.random() * colors.neon.length)];
                    const barrierMaterial = new THREE.MeshBasicMaterial({
                        color: neonColor,
                        transparent: true,
                        opacity: 0.8
                    });
                    const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
                    barrier.position.set(side * (track.width / 2 + 0.5), 1, z);
                    scene.add(barrier);
                    this.meshes.push(barrier);
                }

                // Random obstacles
                if (Math.random() > 0.85 && z > 50) {
                    const obstacleGeometry = new THREE.BoxGeometry(3, 1, 3);
                    const neonColor = colors.neon[Math.floor(Math.random() * colors.neon.length)];
                    const obstacleMaterial = new THREE.MeshBasicMaterial({
                        color: neonColor,
                        wireframe: true
                    });
                    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
                    const lane = Math.floor(Math.random() * 3) - 1;
                    obstacle.position.set(lane * 4, 0.5, z);
                    scene.add(obstacle);
                    this.meshes.push(obstacle);
                    this.hasObstacle = true;
                }
            }

            update(playerPos) {
                this.meshes.forEach(mesh => {
                    if (mesh.position.z > playerPos + 50) {
                        mesh.position.z -= track.length * 10;
                    }
                });
            }

            remove() {
                this.meshes.forEach(mesh => scene.remove(mesh));
            }
        }

        // Generate track
        function generateTrack() {
            for (let i = 0; i < track.length; i++) {
                track.segments.push(new TrackSegment(-i * 10));
            }
        }

        // Starfield background
        const stars = [];
        function createStars() {
            const starGeometry = new THREE.BufferGeometry();
            const starVertices = [];

            for (let i = 0; i < 1000; i++) {
                const x = (Math.random() - 0.5) * 200;
                const y = (Math.random() - 0.5) * 200;
                const z = (Math.random() - 0.5) * 200;
                starVertices.push(x, y, z);
            }

            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

            const starMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.5
            });

            const starField = new THREE.Points(starGeometry, starMaterial);
            scene.add(starField);
            stars.push(starField);
        }

        // Player ship
        const shipGeometry = new THREE.ConeGeometry(0.5, 2, 4);
        const shipMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
        const ship = new THREE.Mesh(shipGeometry, shipMaterial);
        ship.rotation.x = Math.PI;
        scene.add(ship);

        // Ship glow
        const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        ship.add(glow);

        // Ship trail
        const trails = [];
        class Trail {
            constructor(position) {
                const geometry = new THREE.SphereGeometry(0.2, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xff00ff,
                    transparent: true,
                    opacity: 0.6
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.copy(position);
                scene.add(this.mesh);
                this.life = 1;
            }

            update() {
                this.life -= 0.05;
                this.mesh.material.opacity = this.life * 0.6;
                if (this.life <= 0) {
                    scene.remove(this.mesh);
                    return false;
                }
                return true;
            }
        }

        // Controls
        const keys = {};
        document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
        document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

        document.getElementById('startBtn').addEventListener('click', () => {
            document.getElementById('controls').classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            document.getElementById('speedometer').classList.remove('hidden');
            gameState.isPlaying = true;
            gameState.startTime = Date.now();
        });

        function updatePlayer() {
            if (!gameState.isPlaying) return;

            // Acceleration
            if (keys['w'] || keys['arrowup']) {
                gameState.speed = Math.min(gameState.speed + gameState.acceleration, gameState.maxSpeed);
            } else {
                gameState.speed = Math.max(gameState.speed - gameState.acceleration * 0.5, 0);
            }

            // Brake
            if (keys['s'] || keys['arrowdown']) {
                gameState.speed = Math.max(gameState.speed - gameState.acceleration * 2, 0);
            }

            // Steering
            if (keys['a'] || keys['arrowleft']) {
                gameState.targetLane = Math.max(gameState.targetLane - 1, -1);
                keys['arrowleft'] = false;
                keys['a'] = false;
            }
            if (keys['d'] || keys['arrowright']) {
                gameState.targetLane = Math.min(gameState.targetLane + 1, 1);
                keys['arrowright'] = false;
                keys['d'] = false;
            }

            // Boost
            if (keys[' '] && gameState.boost > 0) {
                gameState.speed = Math.min(gameState.speed + 0.1, gameState.maxSpeed * 2);
                gameState.boost = Math.max(gameState.boost - 1, 0);
            } else if (gameState.boost < 100) {
                gameState.boost = Math.min(gameState.boost + 0.2, 100);
            }

            // Smooth lane transition
            const targetX = gameState.targetLane * 4;
            gameState.lanePosition += (targetX - gameState.lanePosition) * 0.1;

            // Update position
            gameState.position += gameState.speed;

            // Lap counter
            if (gameState.position > track.length * 10) {
                gameState.lap++;
                gameState.position = 0;
                if (gameState.lap > 3) {
                    alert('🏁 Race Complete! Time: ' + document.getElementById('time').textContent);
                    location.reload();
                }
            }

            // Update ship
            ship.position.set(gameState.lanePosition, 1, 5);
            ship.rotation.z = -gameState.lanePosition * 0.1;

            // Camera follow
            camera.position.set(
                gameState.lanePosition * 0.3,
                2 + gameState.speed * 0.5,
                10 - gameState.speed
            );
            camera.lookAt(gameState.lanePosition, 1, 0);

            // Create trails
            if (Math.random() > 0.7) {
                trails.push(new Trail(ship.position.clone()));
            }

            // Update HUD
            document.getElementById('speedometer').textContent = Math.floor(gameState.speed * 100);
            document.getElementById('lap').textContent = `${gameState.lap}/3`;
            document.getElementById('boost').textContent = Math.floor(gameState.boost) + '%';

            const elapsed = Date.now() - gameState.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            updatePlayer();

            // Update track
            track.segments.forEach(segment => {
                segment.update(gameState.position);
            });

            // Update trails
            for (let i = trails.length - 1; i >= 0; i--) {
                if (!trails[i].update()) {
                    trails.splice(i, 1);
                }
            }

            // Rotate stars
            stars.forEach(star => {
                star.rotation.y += 0.0001;
                star.rotation.x += 0.0001;
            });

            // Pulse glow
            glow.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.2);

            renderer.render(scene, camera);
        }

        // Window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Initialize
        generateTrack();
        createStars();
        animate();
    </script>
</body>
</html>
```
