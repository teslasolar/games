# Fractal Explorer

Explore infinite fractal patterns in 3D with dynamic generation.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="Explore infinite fractal patterns in 3D - Sierpinski, Menger Sponge, Koch Snowflake, and Mandelbrot visualizations with interactive controls">
    <meta name="keywords" content="fractal, 3D, Three.js, Sierpinski, Menger Sponge, Koch Snowflake, Mandelbrot, interactive, mathematics">
    <meta name="author" content="Fractal Explorer">

    <!-- Open Graph / Social Media Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Fractal Explorer - Interactive 3D Fractal Visualizations">
    <meta property="og:description" content="Explore infinite fractal patterns in 3D with dynamic generation and real-time manipulation">
    <meta property="og:image" content="https://via.placeholder.com/1200x630/000000/00ff88?text=Fractal+Explorer">
    <meta property="og:url" content="">

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Fractal Explorer - Interactive 3D Fractal Visualizations">
    <meta name="twitter:description" content="Explore infinite fractal patterns in 3D with dynamic generation">
    <meta name="twitter:image" content="https://via.placeholder.com/1200x630/000000/00ff88?text=Fractal+Explorer">

    <title>Fractal Explorer - Interactive 3D Fractals</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            margin: 0;
            overflow: hidden;
            background: #000;
            font-family: 'Courier New', monospace;
            touch-action: none;
        }

        canvas {
            display: block;
            touch-action: none;
        }

        /* Loading Screen */
        #loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s ease-out;
        }

        #loading.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(0, 255, 136, 0.1);
            border-top: 4px solid #00ff88;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        #loading-text {
            margin-top: 20px;
            color: #00ff88;
            font-size: 16px;
            text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        /* Info Panel */
        #info {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #00ff88;
            font-size: 12px;
            background: rgba(0, 20, 10, 0.9);
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #00ff88;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            min-width: 200px;
        }

        #info strong {
            color: #00ff88;
            text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);
        }

        /* FPS Counter */
        #fps {
            position: absolute;
            top: 20px;
            right: 20px;
            color: #00ff88;
            font-size: 12px;
            background: rgba(0, 20, 10, 0.9);
            padding: 10px 15px;
            border-radius: 8px;
            border: 2px solid #00ff88;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            display: none;
        }

        #fps.visible {
            display: block;
        }

        /* Controls */
        #controls {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #00ff88;
            font-size: 11px;
            background: rgba(0, 20, 10, 0.9);
            padding: 12px;
            border-radius: 8px;
            border: 2px solid #00ff88;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }

        button {
            background: rgba(0, 255, 136, 0.2);
            border: 1px solid #00ff88;
            color: #00ff88;
            padding: 6px 12px;
            margin: 3px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            border-radius: 4px;
            transition: all 0.2s;
            text-shadow: 0 0 5px rgba(0, 255, 136, 0.3);
        }

        button:hover {
            background: rgba(0, 255, 136, 0.4);
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        button:active {
            transform: scale(0.95);
        }

        button.active {
            background: rgba(0, 255, 136, 0.5);
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.7);
        }

        /* Settings Panel */
        #settings {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 10, 0.95);
            border: 3px solid #00ff88;
            border-radius: 12px;
            padding: 25px;
            color: #00ff88;
            font-size: 13px;
            box-shadow: 0 0 40px rgba(0, 255, 136, 0.5);
            display: none;
            z-index: 1000;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
        }

        #settings.visible {
            display: block;
        }

        #settings h2 {
            margin-bottom: 20px;
            text-align: center;
            font-size: 18px;
            text-shadow: 0 0 10px rgba(0, 255, 136, 0.7);
        }

        .setting-group {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(0, 255, 136, 0.3);
        }

        .setting-group:last-child {
            border-bottom: none;
        }

        .setting-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }

        select, input[type="range"] {
            width: 100%;
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid #00ff88;
            color: #00ff88;
            padding: 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }

        input[type="range"] {
            padding: 0;
            height: 6px;
            cursor: pointer;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            background: #00ff88;
            cursor: pointer;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.7);
        }

        input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #00ff88;
            cursor: pointer;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.7);
            border: none;
        }

        .range-value {
            display: inline-block;
            margin-left: 10px;
            font-weight: bold;
        }

        /* Help Overlay */
        #help {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 10, 0.95);
            border: 3px solid #00ff88;
            border-radius: 12px;
            padding: 25px;
            color: #00ff88;
            font-size: 13px;
            box-shadow: 0 0 40px rgba(0, 255, 136, 0.5);
            display: none;
            z-index: 1001;
            max-width: 500px;
        }

        #help.visible {
            display: block;
        }

        #help h2 {
            margin-bottom: 20px;
            text-align: center;
            font-size: 18px;
            text-shadow: 0 0 10px rgba(0, 255, 136, 0.7);
        }

        .help-section {
            margin-bottom: 15px;
        }

        .help-section h3 {
            margin-bottom: 8px;
            font-size: 14px;
            color: #00ff88;
        }

        .shortcut {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }

        .shortcut:last-child {
            border-bottom: none;
        }

        .key {
            background: rgba(0, 255, 136, 0.2);
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #00ff88;
            font-weight: bold;
        }

        /* Pause Indicator */
        #pause-indicator {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            color: #00ff88;
            text-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
            display: none;
            pointer-events: none;
            z-index: 999;
        }

        #pause-indicator.visible {
            display: block;
        }

        /* Overlay Background */
        .overlay-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            z-index: 998;
        }

        .overlay-bg.visible {
            display: block;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            #info, #controls, #fps {
                font-size: 10px;
                padding: 10px;
            }

            button {
                font-size: 9px;
                padding: 4px 8px;
            }

            #settings, #help {
                max-width: 90%;
                font-size: 11px;
            }
        }
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading">
        <div class="spinner"></div>
        <div id="loading-text">INITIALIZING FRACTAL EXPLORER...</div>
    </div>

    <!-- Info Panel -->
    <div id="info">
        <strong>FRACTAL EXPLORER</strong><br><br>
        Type: <span id="fractalType">Sierpinski</span><br>
        Depth: <span id="depth">3</span><br>
        Objects: <span id="objectCount">0</span><br>
        Zoom: <span id="zoomLevel">100%</span>
    </div>

    <!-- FPS Counter -->
    <div id="fps">
        FPS: <span id="fpsValue">60</span>
    </div>

    <!-- Controls -->
    <div id="controls">
        <strong>Quick Controls:</strong><br>
        Press <span class="key">H</span> for Help | <span class="key">ESC</span> for Settings<br>
        <button id="resetBtn">Reset View</button>
        <button id="zoomInBtn">Zoom +</button>
        <button id="zoomOutBtn">Zoom -</button>
    </div>

    <!-- Settings Panel -->
    <div id="settings">
        <h2>SETTINGS</h2>

        <div class="setting-group">
            <label>Fractal Type:</label>
            <select id="fractalSelect">
                <option value="sierpinski">Sierpinski Tetrahedron</option>
                <option value="menger">Menger Sponge</option>
                <option value="koch">Koch Snowflake</option>
                <option value="mandelbrot">Mandelbrot Set</option>
            </select>
        </div>

        <div class="setting-group">
            <label>Iteration Depth: <span class="range-value" id="depthValue">3</span></label>
            <input type="range" id="depthSlider" min="1" max="6" value="3">
        </div>

        <div class="setting-group">
            <label>Color Scheme:</label>
            <select id="colorSelect">
                <option value="0">Neon Cyber</option>
                <option value="1">Matrix Green</option>
                <option value="2">Rainbow</option>
            </select>
        </div>

        <div class="setting-group">
            <label>Graphics Quality:</label>
            <select id="qualitySelect">
                <option value="low">Low (Better Performance)</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High (Better Quality)</option>
            </select>
        </div>

        <div class="setting-group">
            <label>Auto-Rotation Speed: <span class="range-value" id="rotationValue">1x</span></label>
            <input type="range" id="rotationSlider" min="0" max="5" step="0.5" value="1">
        </div>

        <button onclick="FractalExplorer.closeSettings()" style="width: 100%; margin-top: 10px;">Close Settings</button>
    </div>

    <!-- Help Overlay -->
    <div id="help">
        <h2>KEYBOARD SHORTCUTS</h2>

        <div class="help-section">
            <h3>View Controls</h3>
            <div class="shortcut">
                <span>Pause/Resume</span>
                <span class="key">P</span>
            </div>
            <div class="shortcut">
                <span>Toggle FPS Counter</span>
                <span class="key">F</span>
            </div>
            <div class="shortcut">
                <span>Reset View</span>
                <span class="key">R</span>
            </div>
        </div>

        <div class="help-section">
            <h3>Panels</h3>
            <div class="shortcut">
                <span>Settings Panel</span>
                <span class="key">ESC</span>
            </div>
            <div class="shortcut">
                <span>Help (This Screen)</span>
                <span class="key">H</span>
            </div>
        </div>

        <div class="help-section">
            <h3>Mouse/Touch Controls</h3>
            <div class="shortcut">
                <span>Rotate Fractal</span>
                <span>Mouse Move / Drag</span>
            </div>
            <div class="shortcut">
                <span>Zoom In/Out</span>
                <span>Scroll / Pinch</span>
            </div>
        </div>

        <div class="help-section">
            <h3>Fractal Switching</h3>
            <div class="shortcut">
                <span>Sierpinski</span>
                <span class="key">1</span>
            </div>
            <div class="shortcut">
                <span>Menger Sponge</span>
                <span class="key">2</span>
            </div>
            <div class="shortcut">
                <span>Koch Snowflake</span>
                <span class="key">3</span>
            </div>
            <div class="shortcut">
                <span>Mandelbrot</span>
                <span class="key">4</span>
            </div>
        </div>

        <button onclick="FractalExplorer.closeHelp()" style="width: 100%; margin-top: 15px;">Close Help</button>
    </div>

    <!-- Pause Indicator -->
    <div id="pause-indicator">II PAUSED</div>

    <!-- Overlay Backgrounds -->
    <div id="overlay-bg" class="overlay-bg"></div>

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
            isPaused: false,
            showFPS: false,
            quality: 'medium',
            autoRotationSpeed: 1,

            // FPS tracking
            fps: 60,
            frameCount: 0,
            lastTime: performance.now(),

            // Touch controls
            touchStartDistance: 0,
            initialZoom: 20,

            // Camera defaults
            defaultCameraZ: 20,
            defaultRotation: { x: 0, y: 0, z: 0 },

            init() {
                // Show loading screen
                document.getElementById('loading').classList.remove('hidden');

                // Initialize Three.js
                setTimeout(() => {
                    this.scene = new THREE.Scene();
                    this.scene.background = new THREE.Color(0x000000);

                    this.camera = new THREE.PerspectiveCamera(
                        75,
                        window.innerWidth / window.innerHeight,
                        0.1,
                        1000
                    );
                    this.camera.position.z = this.defaultCameraZ;

                    this.renderer = new THREE.WebGLRenderer({
                        antialias: this.quality !== 'low',
                        powerPreference: this.quality === 'high' ? 'high-performance' : 'default'
                    });
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                    this.renderer.setPixelRatio(this.getPixelRatio());
                    document.body.appendChild(this.renderer.domElement);

                    this.fractalGroup = new THREE.Group();
                    this.scene.add(this.fractalGroup);

                    this.createLighting();
                    this.generateFractal();
                    this.setupEventListeners();
                    this.setupUIListeners();

                    // Hide loading screen
                    setTimeout(() => {
                        document.getElementById('loading').classList.add('hidden');
                    }, 500);

                    this.animate();
                }, 100);
            },

            getPixelRatio() {
                const ratios = { low: 1, medium: 1.5, high: window.devicePixelRatio };
                return Math.min(ratios[this.quality] || 1.5, window.devicePixelRatio);
            },

            createLighting() {
                const ambientLight = new THREE.AmbientLight(0x404040);
                this.scene.add(ambientLight);

                const pointLight1 = new THREE.PointLight(0x00ff88, 1, 100);
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
                    [0x00ff88, 0x00ffff, 0x88ff00],  // Neon Cyber
                    [0x00ff88, 0x00dd66, 0x00aa44],  // Matrix Green
                    [0xff00ff, 0x00ffff, 0xffff00]   // Rainbow
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
                    this.depth = Math.min(this.depth, 3);
                }
                document.getElementById('fractalSelect').value = type;
                this.generateFractal();
            },

            increaseDepth() {
                const maxDepth = this.fractalType === 'menger' ? 3 : 6;
                if (this.depth < maxDepth) {
                    this.depth++;
                    document.getElementById('depthSlider').value = this.depth;
                    this.generateFractal();
                }
            },

            decreaseDepth() {
                if (this.depth > 1) {
                    this.depth--;
                    document.getElementById('depthSlider').value = this.depth;
                    this.generateFractal();
                }
            },

            toggleColor() {
                this.colorMode = (this.colorMode + 1) % 3;
                this.generateFractal();
            },

            togglePause() {
                this.isPaused = !this.isPaused;
                const indicator = document.getElementById('pause-indicator');
                indicator.classList.toggle('visible', this.isPaused);
            },

            toggleFPS() {
                this.showFPS = !this.showFPS;
                const fpsElement = document.getElementById('fps');
                fpsElement.classList.toggle('visible', this.showFPS);
            },

            toggleSettings() {
                const settings = document.getElementById('settings');
                const overlay = document.getElementById('overlay-bg');
                const isVisible = settings.classList.contains('visible');

                settings.classList.toggle('visible');
                overlay.classList.toggle('visible');
            },

            closeSettings() {
                document.getElementById('settings').classList.remove('visible');
                document.getElementById('overlay-bg').classList.remove('visible');
            },

            toggleHelp() {
                const help = document.getElementById('help');
                const overlay = document.getElementById('overlay-bg');
                const isVisible = help.classList.contains('visible');

                help.classList.toggle('visible');
                overlay.classList.toggle('visible');
            },

            closeHelp() {
                document.getElementById('help').classList.remove('visible');
                document.getElementById('overlay-bg').classList.remove('visible');
            },

            resetView() {
                this.camera.position.z = this.defaultCameraZ;
                this.fractalGroup.rotation.set(0, 0, 0);
                this.updateInfo();
            },

            zoomIn() {
                this.camera.position.z = Math.max(5, this.camera.position.z - 2);
                this.updateInfo();
            },

            zoomOut() {
                this.camera.position.z = Math.min(50, this.camera.position.z + 2);
                this.updateInfo();
            },

            updateInfo() {
                document.getElementById('fractalType').textContent =
                    this.fractalType.charAt(0).toUpperCase() + this.fractalType.slice(1);
                document.getElementById('depth').textContent = this.depth;
                document.getElementById('objectCount').textContent = this.fractalGroup.children.length;

                const zoomPercent = Math.round((this.defaultCameraZ / this.camera.position.z) * 100);
                document.getElementById('zoomLevel').textContent = zoomPercent + '%';
            },

            updateFPS() {
                this.frameCount++;
                const currentTime = performance.now();
                const deltaTime = currentTime - this.lastTime;

                if (deltaTime >= 1000) {
                    this.fps = Math.round((this.frameCount * 1000) / deltaTime);
                    document.getElementById('fpsValue').textContent = this.fps;
                    this.frameCount = 0;
                    this.lastTime = currentTime;
                }
            },

            setupEventListeners() {
                // Mouse movement
                document.addEventListener('mousemove', (e) => {
                    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                    this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
                });

                // Mouse wheel zoom
                document.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    this.camera.position.z += e.deltaY * 0.01;
                    this.camera.position.z = Math.max(5, Math.min(50, this.camera.position.z));
                    this.updateInfo();
                }, { passive: false });

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    switch(e.key.toLowerCase()) {
                        case 'p':
                            this.togglePause();
                            break;
                        case 'f':
                            this.toggleFPS();
                            break;
                        case 'escape':
                            if (document.getElementById('help').classList.contains('visible')) {
                                this.closeHelp();
                            } else {
                                this.toggleSettings();
                            }
                            break;
                        case 'h':
                            this.toggleHelp();
                            break;
                        case 'r':
                            this.resetView();
                            break;
                        case '1':
                            this.changeFractal('sierpinski');
                            break;
                        case '2':
                            this.changeFractal('menger');
                            break;
                        case '3':
                            this.changeFractal('koch');
                            break;
                        case '4':
                            this.changeFractal('mandelbrot');
                            break;
                    }
                });

                // Touch events for mobile
                let touches = [];

                document.addEventListener('touchstart', (e) => {
                    touches = Array.from(e.touches);
                    if (touches.length === 2) {
                        this.touchStartDistance = Math.hypot(
                            touches[0].pageX - touches[1].pageX,
                            touches[0].pageY - touches[1].pageY
                        );
                        this.initialZoom = this.camera.position.z;
                    }
                }, { passive: true });

                document.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    touches = Array.from(e.touches);

                    if (touches.length === 1) {
                        // Single touch - rotate
                        this.mouseX = (touches[0].pageX / window.innerWidth) * 2 - 1;
                        this.mouseY = -(touches[0].pageY / window.innerHeight) * 2 + 1;
                    } else if (touches.length === 2) {
                        // Pinch zoom
                        const currentDistance = Math.hypot(
                            touches[0].pageX - touches[1].pageX,
                            touches[0].pageY - touches[1].pageY
                        );
                        const scale = this.touchStartDistance / currentDistance;
                        this.camera.position.z = this.initialZoom * scale;
                        this.camera.position.z = Math.max(5, Math.min(50, this.camera.position.z));
                        this.updateInfo();
                    }
                }, { passive: false });

                // Window resize
                window.addEventListener('resize', () => {
                    this.camera.aspect = window.innerWidth / window.innerHeight;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                });

                // Close panels on overlay click
                document.getElementById('overlay-bg').addEventListener('click', () => {
                    this.closeSettings();
                    this.closeHelp();
                });
            },

            setupUIListeners() {
                // Fractal type selector
                document.getElementById('fractalSelect').addEventListener('change', (e) => {
                    this.changeFractal(e.target.value);
                });

                // Depth slider
                const depthSlider = document.getElementById('depthSlider');
                depthSlider.addEventListener('input', (e) => {
                    this.depth = parseInt(e.target.value);
                    document.getElementById('depthValue').textContent = this.depth;
                    this.generateFractal();
                });

                // Color scheme selector
                document.getElementById('colorSelect').addEventListener('change', (e) => {
                    this.colorMode = parseInt(e.target.value);
                    this.generateFractal();
                });

                // Quality selector
                document.getElementById('qualitySelect').addEventListener('change', (e) => {
                    this.quality = e.target.value;
                    this.renderer.setPixelRatio(this.getPixelRatio());
                    if (e.target.value === 'low') {
                        this.renderer.antialias = false;
                    }
                });

                // Rotation speed slider
                const rotationSlider = document.getElementById('rotationSlider');
                rotationSlider.addEventListener('input', (e) => {
                    this.autoRotationSpeed = parseFloat(e.target.value);
                    document.getElementById('rotationValue').textContent = this.autoRotationSpeed + 'x';
                });

                // Button listeners
                document.getElementById('resetBtn').addEventListener('click', () => this.resetView());
                document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
                document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
            },

            animate() {
                requestAnimationFrame(() => this.animate());

                if (!this.isPaused) {
                    // Rotate fractal based on mouse
                    this.fractalGroup.rotation.x += (this.mouseY * 0.5 - this.fractalGroup.rotation.x) * 0.05;
                    this.fractalGroup.rotation.y += (this.mouseX * 0.5 - this.fractalGroup.rotation.y) * 0.05;

                    // Auto-rotation
                    this.fractalGroup.rotation.z += 0.001 * this.autoRotationSpeed;
                }

                this.renderer.render(this.scene, this.camera);

                // Update FPS
                if (this.showFPS) {
                    this.updateFPS();
                }
            }
        };

        window.addEventListener('load', () => FractalExplorer.init());
    </script>
</body>
</html>
```
