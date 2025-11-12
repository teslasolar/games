# Portal Puzzle

Mind-bending portal-based puzzle game with 3D physics and teleportation.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Portal Puzzle</title>
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
            left: 50%;
            transform: translateX(-50%);
            color: #0ff;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px 30px;
            border: 2px solid #0ff;
            border-radius: 8px;
            font-size: 16px;
            z-index: 100;
            text-align: center;
        }
        #controls {
            position: absolute;
            bottom: 10px;
            left: 10px;
            color: #0ff;
            background: rgba(0, 0, 0, 0.8);
            padding: 12px 18px;
            border: 2px solid #0ff;
            border-radius: 5px;
            font-size: 12px;
            z-index: 100;
        }
        #objective {
            position: absolute;
            top: 10px;
            right: 10px;
            color: #0ff;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border: 2px solid #0ff;
            border-radius: 5px;
            font-size: 13px;
            z-index: 100;
            max-width: 250px;
        }
        .portal-indicator {
            position: absolute;
            padding: 8px 15px;
            border-radius: 5px;
            font-size: 14px;
            font-weight: bold;
            z-index: 100;
        }
        #portal1-indicator {
            top: 80px;
            left: 10px;
            background: rgba(255, 100, 0, 0.8);
            border: 2px solid #ff6400;
            color: #fff;
        }
        #portal2-indicator {
            top: 120px;
            left: 10px;
            background: rgba(0, 150, 255, 0.8);
            border: 2px solid #0096ff;
            color: #fff;
        }
        #victory {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid #0ff;
            border-radius: 15px;
            padding: 40px;
            color: #0ff;
            z-index: 200;
            display: none;
            text-align: center;
        }
        #victory h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }
        button {
            padding: 12px 30px;
            margin: 5px;
            background: rgba(0, 255, 255, 0.3);
            border: 2px solid #0ff;
            color: #0ff;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 16px;
        }
        button:hover {
            background: rgba(0, 255, 255, 0.6);
        }
    </style>
</head>
<body>
    <div id="hud">
        🌀 PORTAL PUZZLE - Level <span id="level">1</span>
    </div>

    <div id="portal1-indicator">🟠 Orange Portal: Click</div>
    <div id="portal2-indicator">🔵 Blue Portal: Right-Click</div>

    <div id="controls">
        WASD: Move<br>
        Space: Jump<br>
        Click: Orange Portal<br>
        Right-Click: Blue Portal<br>
        E: Pick/Drop Box
    </div>

    <div id="objective">
        <div style="font-weight: bold; margin-bottom: 8px;">OBJECTIVE:</div>
        <div id="objectiveText">Use portals to reach the exit platform!</div>
    </div>

    <div id="victory">
        <h1>🎉 LEVEL COMPLETE!</h1>
        <button id="nextLevelBtn">Next Level</button>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Game state
        const gameState = {
            level: 1,
            portals: { orange: null, blue: null },
            carriedBox: null
        };

        // Player
        const playerGeometry = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
        const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.set(0, 2, 5);
        player.castShadow = true;
        scene.add(player);

        camera.position.set(0, 2, 8);
        camera.lookAt(player.position);

        let playerVelocity = { x: 0, y: 0, z: 0 };
        const gravity = -0.02;
        const jumpForce = 0.3;

        // Portal class
        class Portal {
            constructor(color) {
                this.color = color;
                this.group = new THREE.Group();

                // Portal ring
                const ringGeometry = new THREE.TorusGeometry(1, 0.1, 16, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 1
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                this.group.add(ring);

                // Portal surface
                const surfaceGeometry = new THREE.CircleGeometry(0.9, 32);
                const surfaceMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.5,
                    side: THREE.DoubleSide
                });
                const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
                this.group.add(surface);

                // Particles
                this.particles = [];
                for (let i = 0; i < 20; i++) {
                    const particleGeo = new THREE.SphereGeometry(0.05);
                    const particleMat = new THREE.MeshBasicMaterial({ color: color });
                    const particle = new THREE.Mesh(particleGeo, particleMat);
                    this.group.add(particle);
                    this.particles.push({
                        mesh: particle,
                        angle: Math.random() * Math.PI * 2,
                        radius: Math.random() * 0.8,
                        speed: 0.02 + Math.random() * 0.03
                    });
                }

                scene.add(this.group);
                this.active = true;
            }

            setPosition(position, normal) {
                this.group.position.copy(position);

                // Orient portal to surface normal
                const up = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
                this.group.setRotationFromQuaternion(quaternion);
            }

            update() {
                this.particles.forEach(p => {
                    p.angle += p.speed;
                    p.mesh.position.x = Math.cos(p.angle) * p.radius;
                    p.mesh.position.y = Math.sin(p.angle) * p.radius;
                });
            }

            remove() {
                scene.remove(this.group);
                this.active = false;
            }

            checkTeleport(object) {
                const dist = this.group.position.distanceTo(object.position);
                return dist < 1.2;
            }
        }

        // Movable box
        class Box {
            constructor(position) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshPhongMaterial({ color: 0xffaa00 });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.copy(position);
                this.mesh.castShadow = true;
                this.mesh.receiveShadow = true;
                scene.add(this.mesh);

                this.velocity = { x: 0, y: 0, z: 0 };
                this.onGround = false;
            }

            update(platforms) {
                if (!gameState.carriedBox || gameState.carriedBox !== this) {
                    // Apply gravity
                    this.velocity.y += gravity;
                    this.mesh.position.y += this.velocity.y;

                    // Check platform collision
                    this.onGround = false;
                    platforms.forEach(platform => {
                        if (this.checkPlatformCollision(platform)) {
                            this.mesh.position.y = platform.position.y + platform.geometry.parameters.height / 2 + 0.5;
                            this.velocity.y = 0;
                            this.onGround = true;
                        }
                    });
                } else {
                    // Carried by player
                    this.mesh.position.copy(player.position);
                    this.mesh.position.y += 1.5;
                }
            }

            checkPlatformCollision(platform) {
                const boxBottom = this.mesh.position.y - 0.5;
                const platformTop = platform.position.y + platform.geometry.parameters.height / 2;

                const dx = Math.abs(this.mesh.position.x - platform.position.x);
                const dz = Math.abs(this.mesh.position.z - platform.position.z);

                const platformHalfWidth = platform.geometry.parameters.width / 2;
                const platformHalfDepth = platform.geometry.parameters.depth / 2;

                return boxBottom <= platformTop + 0.1 &&
                       boxBottom >= platformTop - 0.5 &&
                       dx < platformHalfWidth &&
                       dz < platformHalfDepth &&
                       this.velocity.y <= 0;
            }
        }

        // Level setup
        let platforms = [];
        let boxes = [];
        let exitPlatform = null;

        function createLevel(levelNum) {
            // Clear previous level
            platforms.forEach(p => scene.remove(p));
            boxes.forEach(b => scene.remove(b.mesh));
            if (exitPlatform) scene.remove(exitPlatform);
            if (gameState.portals.orange) gameState.portals.orange.remove();
            if (gameState.portals.blue) gameState.portals.blue.remove();

            platforms = [];
            boxes = [];
            gameState.portals = { orange: null, blue: null };
            gameState.carriedBox = null;

            const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
            const exitMaterial = new THREE.MeshPhongMaterial({
                color: 0x00ff00,
                emissive: 0x00ff00,
                emissiveIntensity: 0.5
            });

            if (levelNum === 1) {
                // Simple level
                const platform1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 10), platformMaterial);
                platform1.position.set(0, 0, 0);
                platform1.receiveShadow = true;
                scene.add(platform1);
                platforms.push(platform1);

                const platform2 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 5), platformMaterial);
                platform2.position.set(-10, 5, 0);
                platform2.receiveShadow = true;
                scene.add(platform2);
                platforms.push(platform2);

                exitPlatform = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.5, 32), exitMaterial);
                exitPlatform.position.set(-10, 5.5, 0);
                scene.add(exitPlatform);

                player.position.set(0, 2, 3);
            } else if (levelNum === 2) {
                // Medium level with box
                const platform1 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 8), platformMaterial);
                platform1.position.set(0, 0, 0);
                platform1.receiveShadow = true;
                scene.add(platform1);
                platforms.push(platform1);

                const platform2 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), platformMaterial);
                platform2.position.set(12, 8, 0);
                platform2.receiveShadow = true;
                scene.add(platform2);
                platforms.push(platform2);

                const button = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 4), platformMaterial);
                button.position.set(0, 0.5, -6);
                button.receiveShadow = true;
                scene.add(button);
                platforms.push(button);

                boxes.push(new Box(new THREE.Vector3(0, 2, -6)));

                exitPlatform = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32), exitMaterial);
                exitPlatform.position.set(12, 8.5, 0);
                scene.add(exitPlatform);

                player.position.set(0, 2, 2);
            } else if (levelNum === 3) {
                // Complex level
                const platform1 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), platformMaterial);
                platform1.position.set(0, 0, 0);
                platform1.receiveShadow = true;
                scene.add(platform1);
                platforms.push(platform1);

                const platform2 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 4), platformMaterial);
                platform2.position.set(-12, 10, 0);
                platform2.receiveShadow = true;
                scene.add(platform2);
                platforms.push(platform2);

                const platform3 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 4), platformMaterial);
                platform3.position.set(12, 3, 0);
                platform3.receiveShadow = true;
                scene.add(platform3);
                platforms.push(platform3);

                exitPlatform = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32), exitMaterial);
                exitPlatform.position.set(-12, 10.5, 0);
                scene.add(exitPlatform);

                player.position.set(0, 2, 0);
            } else {
                // Victory! Cycle back
                alert('🎉 You completed all levels!');
                gameState.level = 1;
                createLevel(1);
                return;
            }

            playerVelocity = { x: 0, y: 0, z: 0 };
        }

        createLevel(1);

        // Input
        const keys = {};
        document.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;

            if (e.key === ' ') {
                // Jump
                if (Math.abs(playerVelocity.y) < 0.01) {
                    playerVelocity.y = jumpForce;
                }
            }

            if (e.key.toLowerCase() === 'e') {
                // Pick/drop box
                if (gameState.carriedBox) {
                    gameState.carriedBox = null;
                } else {
                    const nearbyBox = boxes.find(b =>
                        b.mesh.position.distanceTo(player.position) < 2
                    );
                    if (nearbyBox) {
                        gameState.carriedBox = nearbyBox;
                    }
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        // Portal placement
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        renderer.domElement.addEventListener('click', (e) => {
            placePortal(e, 'orange', 0xff6400);
        });

        renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            placePortal(e, 'blue', 0x0096ff);
        });

        function placePortal(e, type, color) {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(platforms);

            if (intersects.length > 0) {
                const point = intersects[0].point;
                const normal = intersects[0].face.normal;

                if (gameState.portals[type]) {
                    gameState.portals[type].remove();
                }

                gameState.portals[type] = new Portal(color);
                gameState.portals[type].setPosition(point, normal);
            }
        }

        // Portal teleportation
        function checkPortalTeleport(object) {
            if (!gameState.portals.orange || !gameState.portals.blue) return;

            if (gameState.portals.orange.checkTeleport(object)) {
                object.position.copy(gameState.portals.blue.group.position);
                playerVelocity.y *= 0.5;
            } else if (gameState.portals.blue.checkTeleport(object)) {
                object.position.copy(gameState.portals.orange.group.position);
                playerVelocity.y *= 0.5;
            }
        }

        // Update player
        function updatePlayer() {
            // Movement
            const speed = 0.15;
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

            if (keys['w']) {
                playerVelocity.x = forward.x * speed;
                playerVelocity.z = forward.z * speed;
            } else if (keys['s']) {
                playerVelocity.x = -forward.x * speed;
                playerVelocity.z = -forward.z * speed;
            } else {
                playerVelocity.x *= 0.8;
                playerVelocity.z *= 0.8;
            }

            if (keys['a']) {
                playerVelocity.x -= right.x * speed;
                playerVelocity.z -= right.z * speed;
            } else if (keys['d']) {
                playerVelocity.x += right.x * speed;
                playerVelocity.z += right.z * speed;
            }

            // Apply gravity
            playerVelocity.y += gravity;

            player.position.x += playerVelocity.x;
            player.position.y += playerVelocity.y;
            player.position.z += playerVelocity.z;

            // Platform collision
            platforms.forEach(platform => {
                const playerBottom = player.position.y - 1;
                const platformTop = platform.position.y + platform.geometry.parameters.height / 2;

                const dx = Math.abs(player.position.x - platform.position.x);
                const dz = Math.abs(player.position.z - platform.position.z);

                const platformHalfWidth = platform.geometry.parameters.width / 2;
                const platformHalfDepth = platform.geometry.parameters.depth / 2;

                if (playerBottom <= platformTop + 0.1 &&
                    playerBottom >= platformTop - 0.5 &&
                    dx < platformHalfWidth &&
                    dz < platformHalfDepth &&
                    playerVelocity.y <= 0) {

                    player.position.y = platformTop + 1;
                    playerVelocity.y = 0;
                }
            });

            // Check portal teleport
            checkPortalTeleport(player);

            // Check victory
            if (exitPlatform) {
                const dist = player.position.distanceTo(exitPlatform.position);
                if (dist < 2.5) {
                    levelComplete();
                }
            }

            // Camera follow
            camera.position.copy(player.position);
            camera.position.y += 3;
            camera.position.z += 8;
            camera.lookAt(player.position);

            // Reset if fall
            if (player.position.y < -10) {
                player.position.set(0, 5, 0);
                playerVelocity = { x: 0, y: 0, z: 0 };
            }
        }

        function levelComplete() {
            document.getElementById('victory').style.display = 'block';
        }

        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            document.getElementById('victory').style.display = 'none';
            gameState.level++;
            createLevel(gameState.level);
        });

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            updatePlayer();

            // Update boxes
            boxes.forEach(box => box.update(platforms));

            // Update portals
            if (gameState.portals.orange) gameState.portals.orange.update();
            if (gameState.portals.blue) gameState.portals.blue.update();

            // Update exit platform
            if (exitPlatform) {
                exitPlatform.rotation.y += 0.01;
            }

            document.getElementById('level').textContent = gameState.level;

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
