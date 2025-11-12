# Physics Sandbox 3D

Interactive physics playground with realistic physics simulation and object spawning.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Physics Sandbox 3D</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            font-family: 'Courier New', monospace;
            background: #000;
        }
        #info {
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
        #controls {
            position: absolute;
            bottom: 10px;
            left: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            max-width: 400px;
            z-index: 100;
        }
        .control-btn {
            background: rgba(0, 255, 136, 0.2);
            border: 2px solid #00ff88;
            color: #00ff88;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            transition: all 0.3s;
        }
        .control-btn:hover {
            background: rgba(0, 255, 136, 0.4);
            transform: translateY(-2px);
        }
        .control-btn.active {
            background: rgba(0, 255, 136, 0.6);
        }
        .hint {
            font-size: 10px;
            color: #88ff88;
            margin-top: 5px;
        }
        #sliders {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff88;
            padding: 15px;
            border-radius: 8px;
            color: #00ff88;
            font-size: 12px;
            z-index: 100;
        }
        input[type="range"] {
            width: 150px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div id="info">
        <div>🎮 PHYSICS SANDBOX</div>
        <div class="hint">Click to spawn objects</div>
        <div class="hint">Drag to throw</div>
        <div class="hint">Mouse wheel: Zoom</div>
        <div class="hint">Objects: <span id="objCount">0</span></div>
    </div>

    <div id="sliders">
        <div>⚖️ Gravity</div>
        <input type="range" id="gravity" min="0" max="30" value="9.8" step="0.1">
        <div style="margin-top: 10px;">💪 Throw Force</div>
        <input type="range" id="force" min="1" max="50" value="15" step="1">
        <div style="margin-top: 10px;">📦 Size</div>
        <input type="range" id="size" min="0.5" max="5" value="1" step="0.1">
    </div>

    <div id="controls">
        <button class="control-btn active" data-shape="box">📦 Box</button>
        <button class="control-btn" data-shape="sphere">⚽ Sphere</button>
        <button class="control-btn" data-shape="cylinder">🗜️ Cylinder</button>
        <button class="control-btn" data-shape="cone">🔺 Cone</button>
        <button class="control-btn" data-shape="domino">🎴 Domino</button>
        <button class="control-btn" data-shape="tower">🏰 Tower</button>
        <button class="control-btn" style="background: rgba(255, 50, 50, 0.2); border-color: #ff3333; color: #ff3333;" id="clearBtn">🗑️ Clear All</button>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/cannon@0.6.2/build/cannon.min.js"></script>
    <script>
        // Physics world
        const world = new CANNON.World();
        world.gravity.set(0, -9.8, 0);
        world.broadphase = new CANNON.NaiveBroadphase();
        world.solver.iterations = 10;

        // Three.js setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x001122);
        scene.fog = new THREE.Fog(0x001122, 50, 100);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(15, 15, 15);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(20, 30, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Ground
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0, material: new CANNON.Material() });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.add(groundBody);

        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x0a3322,
            side: THREE.DoubleSide
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);

        // Grid
        const gridHelper = new THREE.GridHelper(100, 50, 0x00ff88, 0x004433);
        scene.add(gridHelper);

        // Game objects
        const objects = [];
        let selectedShape = 'box';
        const settings = {
            gravity: 9.8,
            force: 15,
            size: 1
        };

        // Materials
        const materials = [
            new THREE.MeshPhongMaterial({ color: 0xff4444 }),
            new THREE.MeshPhongMaterial({ color: 0x44ff44 }),
            new THREE.MeshPhongMaterial({ color: 0x4444ff }),
            new THREE.MeshPhongMaterial({ color: 0xffff44 }),
            new THREE.MeshPhongMaterial({ color: 0xff44ff }),
            new THREE.MeshPhongMaterial({ color: 0x44ffff })
        ];

        class PhysicsObject {
            constructor(mesh, body) {
                this.mesh = mesh;
                this.body = body;
                this.mesh.castShadow = true;
                this.mesh.receiveShadow = true;
                scene.add(this.mesh);
                world.addBody(this.body);
                objects.push(this);
            }

            update() {
                this.mesh.position.copy(this.body.position);
                this.mesh.quaternion.copy(this.body.quaternion);

                // Remove if fallen too far
                if (this.body.position.y < -20) {
                    this.remove();
                }
            }

            remove() {
                scene.remove(this.mesh);
                world.remove(this.body);
                const idx = objects.indexOf(this);
                if (idx > -1) objects.splice(idx, 1);
            }
        }

        function createBox(position, size = 1) {
            const geometry = new THREE.BoxGeometry(size, size, size);
            const material = materials[Math.floor(Math.random() * materials.length)].clone();
            const mesh = new THREE.Mesh(geometry, material);

            const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
            const body = new CANNON.Body({ mass: size * size * size });
            body.addShape(shape);
            body.position.copy(position);

            return new PhysicsObject(mesh, body);
        }

        function createSphere(position, size = 1) {
            const geometry = new THREE.SphereGeometry(size / 2, 32, 32);
            const material = materials[Math.floor(Math.random() * materials.length)].clone();
            const mesh = new THREE.Mesh(geometry, material);

            const shape = new CANNON.Sphere(size / 2);
            const body = new CANNON.Body({ mass: size * size });
            body.addShape(shape);
            body.position.copy(position);

            return new PhysicsObject(mesh, body);
        }

        function createCylinder(position, size = 1) {
            const geometry = new THREE.CylinderGeometry(size / 2, size / 2, size, 32);
            const material = materials[Math.floor(Math.random() * materials.length)].clone();
            const mesh = new THREE.Mesh(geometry, material);

            const shape = new CANNON.Cylinder(size / 2, size / 2, size, 8);
            const body = new CANNON.Body({ mass: size * size });
            body.addShape(shape);
            body.position.copy(position);

            return new PhysicsObject(mesh, body);
        }

        function createCone(position, size = 1) {
            const geometry = new THREE.ConeGeometry(size / 2, size, 32);
            const material = materials[Math.floor(Math.random() * materials.length)].clone();
            const mesh = new THREE.Mesh(geometry, material);

            const shape = new CANNON.Cylinder(0.01, size / 2, size, 8);
            const body = new CANNON.Body({ mass: size * size });
            body.addShape(shape);
            body.position.copy(position);

            return new PhysicsObject(mesh, body);
        }

        function createDominoLine(position) {
            for (let i = 0; i < 10; i++) {
                const pos = new CANNON.Vec3(
                    position.x + i * 2,
                    position.y + 2,
                    position.z
                );
                const geometry = new THREE.BoxGeometry(0.5, 4, 2);
                const material = materials[i % materials.length].clone();
                const mesh = new THREE.Mesh(geometry, material);

                const shape = new CANNON.Box(new CANNON.Vec3(0.25, 2, 1));
                const body = new CANNON.Body({ mass: 2 });
                body.addShape(shape);
                body.position.copy(pos);

                new PhysicsObject(mesh, body);
            }
        }

        function createTower(position) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 3; x++) {
                    const pos = new CANNON.Vec3(
                        position.x + (x - 1) * 1.1,
                        position.y + y * 1.1 + 0.5,
                        position.z
                    );
                    createBox(pos, 1);
                }
            }
        }

        // Mouse interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let isDragging = false;
        let dragStart = null;
        let dragEnd = null;

        renderer.domElement.addEventListener('mousedown', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            isDragging = true;
            dragStart = { x: event.clientX, y: event.clientY, time: Date.now() };
        });

        renderer.domElement.addEventListener('mousemove', (event) => {
            if (isDragging) {
                dragEnd = { x: event.clientX, y: event.clientY, time: Date.now() };
            }
        });

        renderer.domElement.addEventListener('mouseup', (event) => {
            if (!isDragging) return;
            isDragging = false;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(groundMesh);

            if (intersects.length > 0) {
                const position = intersects[0].point;
                position.y = 5;

                let obj;
                switch (selectedShape) {
                    case 'box': obj = createBox(position, settings.size); break;
                    case 'sphere': obj = createSphere(position, settings.size); break;
                    case 'cylinder': obj = createCylinder(position, settings.size); break;
                    case 'cone': obj = createCone(position, settings.size); break;
                    case 'domino': createDominoLine(position); return;
                    case 'tower': createTower(position); return;
                }

                // Apply throw force
                if (dragEnd && dragStart) {
                    const dx = dragEnd.x - dragStart.x;
                    const dy = dragEnd.y - dragStart.y;
                    const dt = (dragEnd.time - dragStart.time) / 1000 || 0.1;

                    const force = new CANNON.Vec3(
                        (dx / dt) * settings.force * 0.01,
                        Math.abs(dy / dt) * settings.force * 0.01,
                        0
                    );
                    obj.body.applyImpulse(force, obj.body.position);
                }
            }

            dragStart = null;
            dragEnd = null;
        });

        // Mouse wheel zoom
        renderer.domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            const delta = event.deltaY * 0.01;
            camera.position.multiplyScalar(1 + delta * 0.1);
        });

        // UI controls
        document.querySelectorAll('.control-btn[data-shape]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.control-btn[data-shape]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedShape = btn.dataset.shape;
            });
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            objects.forEach(obj => obj.remove());
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            settings.gravity = parseFloat(e.target.value);
            world.gravity.set(0, -settings.gravity, 0);
        });

        document.getElementById('force').addEventListener('input', (e) => {
            settings.force = parseFloat(e.target.value);
        });

        document.getElementById('size').addEventListener('input', (e) => {
            settings.size = parseFloat(e.target.value);
        });

        // Camera orbit
        let cameraAngle = 0;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            // Update physics
            world.step(1 / 60);

            // Update objects
            objects.forEach(obj => obj.update());

            // Slowly orbit camera
            cameraAngle += 0.001;
            const radius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
            camera.position.x = Math.sin(cameraAngle) * radius;
            camera.position.z = Math.cos(cameraAngle) * radius;
            camera.lookAt(0, 5, 0);

            // Update UI
            document.getElementById('objCount').textContent = objects.length;

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
