# Fractal Explorer

Explore infinite fractal patterns in 3D with dynamic generation.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Fractal Explorer</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #000; }
        canvas { display: block; }
        #info {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #ff00ff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            background: rgba(20, 0, 40, 0.9);
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #ff00ff;
        }
        #controls {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #ff00ff;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            background: rgba(20, 0, 40, 0.9);
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #ff00ff;
        }
        button {
            background: rgba(255, 0, 255, 0.3);
            border: 1px solid #ff00ff;
            color: #ff00ff;
            padding: 5px 10px;
            margin: 3px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            border-radius: 4px;
        }
        button:hover {
            background: rgba(255, 0, 255, 0.5);
        }
    </style>
</head>
<body>
    <div id="info">
        🌀 <strong>FRACTAL EXPLORER</strong><br><br>
        Type: <span id="fractalType">Sierpinski</span><br>
        Depth: <span id="depth">3</span><br>
        Objects: <span id="objectCount">0</span>
    </div>
    <div id="controls">
        <strong>Controls:</strong><br>
        Mouse: Rotate | Scroll: Zoom<br>
        <button onclick="FractalExplorer.changeFractal('sierpinski')">Sierpinski</button>
        <button onclick="FractalExplorer.changeFractal('menger')">Menger Sponge</button>
        <button onclick="FractalExplorer.changeFractal('koch')">Koch Snowflake</button>
        <button onclick="FractalExplorer.changeFractal('mandelbrot')">Mandelbrot</button><br>
        <button onclick="FractalExplorer.increaseDepth()">+ Depth</button>
        <button onclick="FractalExplorer.decreaseDepth()">- Depth</button>
        <button onclick="FractalExplorer.toggleColor()">Color Mode</button>
    </div>

    <script>
        const FractalExplorer = {
            scene: null,
            camera: null,
            renderer: null,
            fractalGroup: null,
            fractalType: 'sierpinski',
            depth: 3,
            colorMode: 0,
            mouseX: 0,
            mouseY: 0,

            init() {
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x000000);

                this.camera = new THREE.PerspectiveCamera(
                    75,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                this.camera.position.z = 20;

                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                document.body.appendChild(this.renderer.domElement);

                this.fractalGroup = new THREE.Group();
                this.scene.add(this.fractalGroup);

                this.createLighting();
                this.generateFractal();
                this.setupEventListeners();
                this.animate();
            },

            createLighting() {
                const ambientLight = new THREE.AmbientLight(0x404040);
                this.scene.add(ambientLight);

                const pointLight1 = new THREE.PointLight(0xff00ff, 1, 100);
                pointLight1.position.set(10, 10, 10);
                this.scene.add(pointLight1);

                const pointLight2 = new THREE.PointLight(0x00ffff, 0.5, 100);
                pointLight2.position.set(-10, -10, 10);
                this.scene.add(pointLight2);
            },

            generateFractal() {
                // Clear existing fractal
                while (this.fractalGroup.children.length > 0) {
                    this.fractalGroup.remove(this.fractalGroup.children[0]);
                }

                switch (this.fractalType) {
                    case 'sierpinski':
                        this.createSierpinski(new THREE.Vector3(0, 5, 0), 10, this.depth);
                        break;
                    case 'menger':
                        this.createMengerSponge(new THREE.Vector3(0, 0, 0), 8, this.depth);
                        break;
                    case 'koch':
                        this.createKochSnowflake(6, this.depth);
                        break;
                    case 'mandelbrot':
                        this.createMandelbrot();
                        break;
                }

                this.updateInfo();
            },

            createSierpinski(center, size, depth) {
                if (depth === 0) {
                    const geometry = new THREE.TetrahedronGeometry(size);
                    const material = new THREE.MeshPhongMaterial({
                        color: this.getColor(depth),
                        wireframe: depth % 2 === 0
                    });
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.copy(center);
                    this.fractalGroup.add(mesh);
                    return;
                }

                const newSize = size / 2;
                const height = size * Math.sqrt(2 / 3);

                // Four smaller tetrahedrons
                this.createSierpinski(
                    new THREE.Vector3(center.x, center.y + height / 2, center.z),
                    newSize, depth - 1
                );

                const offset = size / 2;
                const angle = Math.PI * 2 / 3;

                for (let i = 0; i < 3; i++) {
                    const x = center.x + offset * Math.cos(angle * i);
                    const z = center.z + offset * Math.sin(angle * i);
                    this.createSierpinski(
                        new THREE.Vector3(x, center.y - height / 4, z),
                        newSize, depth - 1
                    );
                }
            },

            createMengerSponge(center, size, depth) {
                if (depth === 0) {
                    const geometry = new THREE.BoxGeometry(size, size, size);
                    const material = new THREE.MeshPhongMaterial({
                        color: this.getColor(depth),
                        wireframe: false
                    });
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.copy(center);
                    this.fractalGroup.add(mesh);
                    return;
                }

                const newSize = size / 3;
                const offset = size / 3;

                // Create 20 smaller cubes (27 - 7 removed)
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        for (let z = -1; z <= 1; z++) {
                            // Skip the center cross pattern
                            const crossCount = (x === 0 ? 1 : 0) + (y === 0 ? 1 : 0) + (z === 0 ? 1 : 0);
                            if (crossCount >= 2) continue;

                            this.createMengerSponge(
                                new THREE.Vector3(
                                    center.x + x * offset,
                                    center.y + y * offset,
                                    center.z + z * offset
                                ),
                                newSize,
                                depth - 1
                            );
                        }
                    }
                }
            },

            createKochSnowflake(size, depth) {
                const points = [];
                const startAngle = Math.PI / 2;

                // Create three sides of the snowflake
                for (let i = 0; i < 3; i++) {
                    const angle = startAngle + (i * 2 * Math.PI / 3);
                    const start = new THREE.Vector2(
                        Math.cos(angle) * size,
                        Math.sin(angle) * size
                    );
                    const end = new THREE.Vector2(
                        Math.cos(angle + 2 * Math.PI / 3) * size,
                        Math.sin(angle + 2 * Math.PI / 3) * size
                    );

                    const sidePoints = this.kochCurve(start, end, depth);
                    points.push(...sidePoints);
                }

                // Create 3D extrusion of Koch curve
                const shape = new THREE.Shape(points);
                const extrudeSettings = {
                    depth: 0.5,
                    bevelEnabled: true,
                    bevelThickness: 0.2,
                    bevelSize: 0.1,
                    bevelSegments: 3
                };

                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const material = new THREE.MeshPhongMaterial({
                    color: this.getColor(depth),
                    wireframe: false
                });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.z = -0.25;
                this.fractalGroup.add(mesh);
            },

            kochCurve(start, end, depth) {
                if (depth === 0) {
                    return [start, end];
                }

                const delta = end.clone().sub(start);
                const p1 = start.clone();
                const p2 = start.clone().add(delta.clone().multiplyScalar(1/3));
                const p4 = start.clone().add(delta.clone().multiplyScalar(2/3));
                const p5 = end.clone();

                // Calculate the peak point
                const angle = -Math.PI / 3;
                const p3 = p2.clone().add(
                    delta.clone().multiplyScalar(1/3).rotateAround(new THREE.Vector2(0, 0), angle)
                );

                return [
                    ...this.kochCurve(p1, p2, depth - 1),
                    ...this.kochCurve(p2, p3, depth - 1),
                    ...this.kochCurve(p3, p4, depth - 1),
                    ...this.kochCurve(p4, p5, depth - 1)
                ];
            },

            createMandelbrot() {
                const size = 20;
                const resolution = 50;
                const maxIterations = 20;

                for (let x = 0; x < resolution; x++) {
                    for (let y = 0; y < resolution; y++) {
                        const cx = (x / resolution - 0.5) * 3;
                        const cy = (y / resolution - 0.5) * 2;

                        let zx = 0, zy = 0;
                        let iterations = 0;

                        while (zx * zx + zy * zy < 4 && iterations < maxIterations) {
                            const xtemp = zx * zx - zy * zy + cx;
                            zy = 2 * zx * zy + cy;
                            zx = xtemp;
                            iterations++;
                        }

                        if (iterations < maxIterations) {
                            const geometry = new THREE.BoxGeometry(0.4, 0.4, iterations * 0.3);
                            const material = new THREE.MeshPhongMaterial({
                                color: this.getColorByValue(iterations / maxIterations)
                            });

                            const mesh = new THREE.Mesh(geometry, material);
                            mesh.position.set(
                                (x / resolution - 0.5) * size,
                                (y / resolution - 0.5) * size,
                                iterations * 0.15
                            );

                            this.fractalGroup.add(mesh);
                        }
                    }
                }
            },

            getColor(depth) {
                const colors = [
                    [0xff00ff, 0x00ffff, 0xffff00],
                    [0xff0088, 0x00ff88, 0x8800ff],
                    [0xff4444, 0x44ff44, 0x4444ff]
                ];

                return colors[this.colorMode % colors.length][depth % 3];
            },

            getColorByValue(value) {
                const hue = value * 0.7;
                return new THREE.Color().setHSL(hue, 1, 0.5);
            },

            changeFractal(type) {
                this.fractalType = type;
                if (type === 'menger') {
                    this.depth = Math.min(this.depth, 3); // Limit Menger depth
                }
                this.generateFractal();
            },

            increaseDepth() {
                const maxDepth = this.fractalType === 'menger' ? 3 : 6;
                if (this.depth < maxDepth) {
                    this.depth++;
                    this.generateFractal();
                }
            },

            decreaseDepth() {
                if (this.depth > 1) {
                    this.depth--;
                    this.generateFractal();
                }
            },

            toggleColor() {
                this.colorMode++;
                this.generateFractal();
            },

            updateInfo() {
                document.getElementById('fractalType').textContent =
                    this.fractalType.charAt(0).toUpperCase() + this.fractalType.slice(1);
                document.getElementById('depth').textContent = this.depth;
                document.getElementById('objectCount').textContent = this.fractalGroup.children.length;
            },

            setupEventListeners() {
                document.addEventListener('mousemove', (e) => {
                    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                    this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
                });

                document.addEventListener('wheel', (e) => {
                    this.camera.position.z += e.deltaY * 0.01;
                    this.camera.position.z = Math.max(5, Math.min(50, this.camera.position.z));
                });

                window.addEventListener('resize', () => {
                    this.camera.aspect = window.innerWidth / window.innerHeight;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                });
            },

            animate() {
                requestAnimationFrame(() => this.animate());

                // Rotate fractal based on mouse
                this.fractalGroup.rotation.x += (this.mouseY * 0.5 - this.fractalGroup.rotation.x) * 0.05;
                this.fractalGroup.rotation.y += (this.mouseX * 0.5 - this.fractalGroup.rotation.y) * 0.05;

                // Auto-rotation
                this.fractalGroup.rotation.z += 0.001;

                this.renderer.render(this.scene, this.camera);
            }
        };

        window.addEventListener('load', () => FractalExplorer.init());
    </script>
</body>
</html>
```
