# Neural Network Visualizer

Real-time 3D visualization of neural network training with advanced controls and settings.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="Interactive 3D neural network visualization with real-time training animation. Watch neurons activate and connections strengthen in stunning cyberpunk style.">
    <meta name="keywords" content="neural network, 3D visualization, machine learning, AI, WebGL, Three.js">
    <meta name="author" content="Neural Network Visualizer">

    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Neural Network Visualizer - 3D AI Training Simulation">
    <meta property="og:description" content="Interactive 3D neural network visualization with real-time training animation in cyberpunk style.">
    <meta property="og:image" content="https://via.placeholder.com/1200x630/0a0a0a/00ff88?text=Neural+Network+Visualizer">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Neural Network Visualizer">
    <meta name="twitter:description" content="Interactive 3D neural network visualization with real-time training animation.">

    <title>Neural Network Visualizer - 3D AI Training Simulation</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            overflow: hidden;
            background: #0a0a0a;
            font-family: 'Courier New', monospace;
            touch-action: none;
        }
        canvas { display: block; }

        /* Loading Screen */
        #loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0a0a0a;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s;
        }
        #loading.hidden {
            opacity: 0;
            pointer-events: none;
        }
        .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(0, 255, 136, 0.2);
            border-top: 4px solid #00ff88;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .loading-text {
            color: #00ff88;
            margin-top: 20px;
            font-size: 14px;
            animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* Info Panel */
        #info {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #00ff88;
            font-size: 12px;
            background: rgba(0, 20, 40, 0.9);
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #00ff88;
            max-width: 300px;
            backdrop-filter: blur(10px);
        }
        .metric {
            margin: 5px 0;
            font-size: 11px;
        }
        .bar {
            height: 8px;
            background: rgba(0, 255, 136, 0.2);
            border-radius: 4px;
            overflow: hidden;
            margin-top: 3px;
        }
        .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ff88, #0088ff);
            transition: width 0.3s;
        }

        /* FPS Counter */
        #fps-counter {
            position: absolute;
            top: 20px;
            right: 20px;
            color: #00ff88;
            font-size: 12px;
            background: rgba(0, 20, 40, 0.9);
            padding: 10px 15px;
            border-radius: 8px;
            border: 2px solid #00ff88;
            display: none;
            backdrop-filter: blur(10px);
        }
        #fps-counter.visible {
            display: block;
        }

        /* Settings Panel */
        #settings-panel {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #00ff88;
            border-radius: 12px;
            padding: 25px;
            min-width: 350px;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            display: none;
            backdrop-filter: blur(15px);
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        }
        #settings-panel.visible {
            display: block;
        }
        #settings-panel h2 {
            color: #00ff88;
            margin: 0 0 20px 0;
            font-size: 18px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .setting-group {
            margin-bottom: 20px;
        }
        .setting-group label {
            display: block;
            color: #00ff88;
            margin-bottom: 8px;
            font-size: 12px;
        }
        .setting-group input[type="range"] {
            width: 100%;
            height: 6px;
            background: rgba(0, 255, 136, 0.2);
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
        }
        .setting-group input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: #00ff88;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }
        .setting-group input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: #00ff88;
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
        .setting-value {
            color: #88ff88;
            font-size: 11px;
            float: right;
        }
        .close-btn {
            background: #00ff88;
            color: #0a0a0a;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            width: 100%;
            margin-top: 10px;
            transition: all 0.3s;
        }
        .close-btn:hover {
            background: #88ff88;
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
        }

        /* Help Overlay */
        #help-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #00ff88;
            border-radius: 12px;
            padding: 25px;
            min-width: 400px;
            max-width: 90%;
            display: none;
            backdrop-filter: blur(15px);
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        }
        #help-overlay.visible {
            display: block;
        }
        #help-overlay h2 {
            color: #00ff88;
            margin: 0 0 20px 0;
            font-size: 18px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .help-section {
            margin-bottom: 15px;
        }
        .help-section h3 {
            color: #00ff88;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .shortcut {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid rgba(0, 255, 136, 0.2);
            font-size: 11px;
        }
        .shortcut:last-child {
            border-bottom: none;
        }
        .key {
            color: #00ff88;
            background: rgba(0, 255, 136, 0.2);
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: bold;
        }
        .action {
            color: #88ff88;
        }

        /* Status Messages */
        #status-message {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 20, 40, 0.9);
            border: 2px solid #00ff88;
            border-radius: 8px;
            padding: 12px 20px;
            color: #00ff88;
            font-size: 12px;
            display: none;
            backdrop-filter: blur(10px);
            animation: slideUp 0.3s ease-out;
        }
        #status-message.visible {
            display: block;
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }

        /* Mobile Controls */
        #mobile-controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: none;
            gap: 10px;
        }
        @media (max-width: 768px) {
            #mobile-controls {
                display: flex;
            }
            #info {
                font-size: 10px;
                padding: 10px;
                max-width: 250px;
            }
        }
        .mobile-btn {
            background: rgba(0, 20, 40, 0.9);
            border: 2px solid #00ff88;
            color: #00ff88;
            padding: 12px 18px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s;
        }
        .mobile-btn:active {
            background: rgba(0, 255, 136, 0.3);
            transform: scale(0.95);
        }
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading">
        <div class="spinner"></div>
        <div class="loading-text">INITIALIZING NEURAL NETWORK...</div>
    </div>

    <!-- Info Panel -->
    <div id="info">
        <strong>NEURAL NETWORK TRAINING</strong><br><br>
        <div class="metric">
            Epoch: <span id="epoch">0</span> / <span id="max-epochs">100</span>
            <div class="bar"><div class="bar-fill" id="epoch-bar"></div></div>
        </div>
        <div class="metric">
            Loss: <span id="loss">1.0000</span>
            <div class="bar"><div class="bar-fill" id="loss-bar"></div></div>
        </div>
        <div class="metric">
            Accuracy: <span id="accuracy">0.00%</span>
            <div class="bar"><div class="bar-fill" id="accuracy-bar"></div></div>
        </div>
        <div class="metric">
            Learning Rate: <span id="lr">0.001</span>
        </div>
        <div class="metric">
            Neurons: <span id="neuron-count">0</span>
        </div>
        <div class="metric">
            Connections: <span id="connection-count">0</span>
        </div>
        <br>
        <small style="color: #88ff88;">
        Press H for help
        </small>
    </div>

    <!-- FPS Counter -->
    <div id="fps-counter">
        FPS: <span id="fps">60</span>
    </div>

    <!-- Settings Panel -->
    <div id="settings-panel">
        <h2>Network Settings</h2>

        <div class="setting-group">
            <label>
                Layer 1 (Input): <span class="setting-value" id="layer1-value">8</span> neurons
            </label>
            <input type="range" id="layer1" min="4" max="16" value="8" step="1">
        </div>

        <div class="setting-group">
            <label>
                Layer 2: <span class="setting-value" id="layer2-value">12</span> neurons
            </label>
            <input type="range" id="layer2" min="4" max="20" value="12" step="1">
        </div>

        <div class="setting-group">
            <label>
                Layer 3: <span class="setting-value" id="layer3-value">12</span> neurons
            </label>
            <input type="range" id="layer3" min="4" max="20" value="12" step="1">
        </div>

        <div class="setting-group">
            <label>
                Layer 4: <span class="setting-value" id="layer4-value">8</span> neurons
            </label>
            <input type="range" id="layer4" min="4" max="16" value="8" step="1">
        </div>

        <div class="setting-group">
            <label>
                Layer 5 (Output): <span class="setting-value" id="layer5-value">4</span> neurons
            </label>
            <input type="range" id="layer5" min="2" max="10" value="4" step="1">
        </div>

        <div class="setting-group">
            <label>
                Learning Rate: <span class="setting-value" id="lr-setting-value">0.001</span>
            </label>
            <input type="range" id="lr-setting" min="0.0001" max="0.01" value="0.001" step="0.0001">
        </div>

        <div class="setting-group">
            <label>
                Animation Speed: <span class="setting-value" id="anim-speed-value">1.0</span>x
            </label>
            <input type="range" id="anim-speed" min="0.1" max="3.0" value="1.0" step="0.1">
        </div>

        <button class="close-btn" onclick="applySettings()">Apply & Rebuild Network</button>
        <button class="close-btn" style="background: rgba(0, 255, 136, 0.2); margin-top: 5px;" onclick="toggleSettings()">Cancel</button>
    </div>

    <!-- Help Overlay -->
    <div id="help-overlay">
        <h2>Keyboard Shortcuts</h2>

        <div class="help-section">
            <h3>Controls</h3>
            <div class="shortcut">
                <span class="key">P / SPACE</span>
                <span class="action">Pause/Resume Training</span>
            </div>
            <div class="shortcut">
                <span class="key">R</span>
                <span class="action">Reset Network</span>
            </div>
            <div class="shortcut">
                <span class="key">ESC</span>
                <span class="action">Settings Panel</span>
            </div>
            <div class="shortcut">
                <span class="key">F</span>
                <span class="action">Toggle FPS Counter</span>
            </div>
            <div class="shortcut">
                <span class="key">H</span>
                <span class="action">Toggle Help (this overlay)</span>
            </div>
        </div>

        <div class="help-section">
            <h3>Interaction</h3>
            <div class="shortcut">
                <span class="key">CLICK</span>
                <span class="action">Activate Neuron</span>
            </div>
            <div class="shortcut">
                <span class="key">TOUCH</span>
                <span class="action">Mobile: Activate Neuron</span>
            </div>
        </div>

        <div class="help-section">
            <h3>Visual Guide</h3>
            <div class="shortcut">
                <span style="color: #00ff88;">Green Glow</span>
                <span class="action">High Activation</span>
            </div>
            <div class="shortcut">
                <span style="color: #0088ff;">Blue Glow</span>
                <span class="action">Low Activation</span>
            </div>
            <div class="shortcut">
                <span style="color: #ff0088;">Red Lines</span>
                <span class="action">Negative Weights</span>
            </div>
        </div>

        <button class="close-btn" onclick="toggleHelp()">Close</button>
    </div>

    <!-- Status Message -->
    <div id="status-message"></div>

    <!-- Mobile Controls -->
    <div id="mobile-controls">
        <button class="mobile-btn" onclick="togglePause()">P</button>
        <button class="mobile-btn" onclick="resetNetwork()">R</button>
        <button class="mobile-btn" onclick="toggleSettings()">SET</button>
        <button class="mobile-btn" onclick="toggleHelp()">?</button>
    </div>

    <script>
        let scene, camera, renderer;
        let network = { layers: [] };
        let neurons = [];
        let connections = [];
        let trainingActive = true;
        let isPaused = false;
        let epoch = 0;
        let loss = 1.0;
        let accuracy = 0;
        let learningRate = 0.001;
        let animationSpeed = 1.0;
        let maxEpochs = 100;

        // FPS tracking
        let fpsVisible = false;
        let frameCount = 0;
        let lastFpsUpdate = Date.now();
        let currentFps = 60;

        // Settings
        let layerSizes = [8, 12, 12, 8, 4];

        function init() {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0a0a0a);
            scene.fog = new THREE.Fog(0x0a0a0a, 30, 60);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.set(0, 0, 25);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            createNetwork();
            createLighting();
            setupEventListeners();
            setupSettingsListeners();

            // Hide loading screen after initialization
            setTimeout(() => {
                document.getElementById('loading').classList.add('hidden');
            }, 1000);

            animate();
        }

        function createNetwork() {
            // Clear existing network
            neurons.forEach(neuron => scene.remove(neuron));
            connections.forEach(conn => scene.remove(conn));
            neurons = [];
            connections = [];
            network = { layers: [] };

            const layerSpacing = 10;
            const startX = -(layerSizes.length - 1) * layerSpacing / 2;

            layerSizes.forEach((size, layerIndex) => {
                const layer = [];
                const x = startX + layerIndex * layerSpacing;
                const neuronSpacing = 2;
                const startY = -(size - 1) * neuronSpacing / 2;

                for (let i = 0; i < size; i++) {
                    const y = startY + i * neuronSpacing;

                    // Neuron sphere
                    const geometry = new THREE.SphereGeometry(0.3, 16, 16);
                    const material = new THREE.MeshPhongMaterial({
                        color: 0x00ff88,
                        emissive: 0x00ff88,
                        emissiveIntensity: 0.2,
                        transparent: true,
                        opacity: 0.8
                    });

                    const neuron = new THREE.Mesh(geometry, material);
                    neuron.position.set(x, y, 0);
                    neuron.userData = {
                        layer: layerIndex,
                        index: i,
                        activation: 0,
                        weight: Math.random(),
                        bias: Math.random() - 0.5
                    };

                    scene.add(neuron);
                    layer.push(neuron);
                    neurons.push(neuron);

                    // Create connections to previous layer
                    if (layerIndex > 0) {
                        const prevLayer = network.layers[layerIndex - 1];

                        prevLayer.forEach(prevNeuron => {
                            const points = [];
                            points.push(prevNeuron.position);
                            points.push(neuron.position);

                            const geometry = new THREE.BufferGeometry().setFromPoints(points);
                            const material = new THREE.LineBasicMaterial({
                                color: 0x00ff88,
                                transparent: true,
                                opacity: 0.1
                            });

                            const connection = new THREE.Line(geometry, material);
                            connection.userData = {
                                from: prevNeuron,
                                to: neuron,
                                weight: Math.random() - 0.5
                            };

                            scene.add(connection);
                            connections.push(connection);
                        });
                    }
                }

                network.layers.push(layer);
            });

            // Update stats
            document.getElementById('neuron-count').textContent = neurons.length;
            document.getElementById('connection-count').textContent = connections.length;
        }

        function createLighting() {
            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            scene.add(ambientLight);

            const pointLight1 = new THREE.PointLight(0x00ff88, 1, 50);
            pointLight1.position.set(10, 10, 20);
            scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0x0088ff, 0.5, 50);
            pointLight2.position.set(-10, -10, 20);
            scene.add(pointLight2);
        }

        function setupEventListeners() {
            document.addEventListener('keydown', (e) => {
                // Prevent default for keys we use
                if (['Space', 'KeyP', 'KeyR', 'KeyF', 'KeyH', 'Escape'].includes(e.code)) {
                    e.preventDefault();
                }

                if (e.code === 'Space' || e.code === 'KeyP') {
                    togglePause();
                } else if (e.key.toLowerCase() === 'r') {
                    resetNetwork();
                } else if (e.key.toLowerCase() === 'f') {
                    toggleFPS();
                } else if (e.key.toLowerCase() === 'h') {
                    toggleHelp();
                } else if (e.code === 'Escape') {
                    toggleSettings();
                }
            });

            document.addEventListener('click', (e) => {
                const mouse = new THREE.Vector2(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1
                );

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);

                const intersects = raycaster.intersectObjects(neurons);
                if (intersects.length > 0) {
                    const neuron = intersects[0].object;
                    activateNeuron(neuron);
                }
            });

            // Touch support for mobile
            document.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouse = new THREE.Vector2(
                    (touch.clientX / window.innerWidth) * 2 - 1,
                    -(touch.clientY / window.innerHeight) * 2 + 1
                );

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);

                const intersects = raycaster.intersectObjects(neurons);
                if (intersects.length > 0) {
                    const neuron = intersects[0].object;
                    activateNeuron(neuron);
                }
            }, { passive: false });

            window.addEventListener('resize', onResize);
        }

        function activateNeuron(neuron) {
            neuron.userData.activation = 1.0;

            // Create activation pulse
            const pulseGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const pulseMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });

            const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
            pulse.position.copy(neuron.position);
            scene.add(pulse);

            let scale = 1;
            const animatePulse = () => {
                scale += 0.1;
                pulse.scale.set(scale, scale, scale);
                pulse.material.opacity = 0.8 / scale;

                if (scale < 3) {
                    requestAnimationFrame(animatePulse);
                } else {
                    scene.remove(pulse);
                }
            };

            animatePulse();
        }

        function forwardPass() {
            // Input layer random activation
            network.layers[0].forEach(neuron => {
                neuron.userData.activation = Math.random();
            });

            // Propagate through network
            for (let l = 1; l < network.layers.length; l++) {
                network.layers[l].forEach(neuron => {
                    let sum = neuron.userData.bias;

                    connections
                        .filter(conn => conn.userData.to === neuron)
                        .forEach(conn => {
                            sum += conn.userData.from.userData.activation * conn.userData.weight;
                        });

                    // ReLU activation
                    neuron.userData.activation = Math.max(0, sum);
                });
            }
        }

        function updateNetwork() {
            if (!trainingActive || isPaused) return;

            // Run forward pass
            forwardPass();

            // Update visualizations
            neurons.forEach(neuron => {
                const activation = neuron.userData.activation;

                // Update neuron color and size based on activation
                const intensity = Math.min(1, activation);
                neuron.material.emissiveIntensity = 0.2 + intensity * 0.8;
                neuron.scale.setScalar(0.8 + intensity * 0.4);

                // Color gradient based on activation
                const color = new THREE.Color();
                if (activation > 0.5) {
                    color.setRGB(0, 1, activation - 0.5);
                } else {
                    color.setRGB(0, activation * 2, 0.5);
                }
                neuron.material.color = color;
                neuron.material.emissive = color;

                // Decay activation
                neuron.userData.activation *= 0.95;
            });

            // Update connections
            connections.forEach(conn => {
                const activation = conn.userData.from.userData.activation;
                const weight = Math.abs(conn.userData.weight);

                conn.material.opacity = activation * weight * 0.5;

                // Color based on weight
                if (conn.userData.weight > 0) {
                    conn.material.color.setRGB(0, 1, 0.5);
                } else {
                    conn.material.color.setRGB(1, 0, 0.5);
                }

                // Update weight (simulated training)
                conn.userData.weight += (Math.random() - 0.5) * learningRate;
                conn.userData.weight = Math.max(-1, Math.min(1, conn.userData.weight));
            });

            // Update training metrics (with animation speed multiplier)
            if (Math.random() < 0.05 * animationSpeed) {
                epoch = Math.min(maxEpochs, epoch + 1);
                loss = Math.max(0.01, loss * 0.95);
                accuracy = Math.min(99.9, accuracy + Math.random() * 2);
                learningRate *= 0.99;

                updateMetrics();
            }
        }

        function updateMetrics() {
            document.getElementById('epoch').textContent = epoch;
            document.getElementById('max-epochs').textContent = maxEpochs;
            document.getElementById('loss').textContent = loss.toFixed(4);
            document.getElementById('accuracy').textContent = accuracy.toFixed(2) + '%';
            document.getElementById('lr').textContent = learningRate.toFixed(6);

            document.getElementById('epoch-bar').style.width = (epoch / maxEpochs * 100) + '%';
            document.getElementById('loss-bar').style.width = ((1 - loss) * 100) + '%';
            document.getElementById('accuracy-bar').style.width = accuracy + '%';
        }

        function resetNetwork() {
            epoch = 0;
            loss = 1.0;
            accuracy = 0;
            learningRate = 0.001;

            neurons.forEach(neuron => {
                neuron.userData.activation = 0;
                neuron.userData.weight = Math.random();
                neuron.userData.bias = Math.random() - 0.5;
            });

            connections.forEach(conn => {
                conn.userData.weight = Math.random() - 0.5;
            });

            updateMetrics();
            showStatus('Network reset');
        }

        // UI Toggle Functions
        function togglePause() {
            isPaused = !isPaused;
            trainingActive = !isPaused;
            showStatus(isPaused ? 'Training paused' : 'Training resumed');
        }

        function toggleFPS() {
            fpsVisible = !fpsVisible;
            const fpsCounter = document.getElementById('fps-counter');
            if (fpsVisible) {
                fpsCounter.classList.add('visible');
            } else {
                fpsCounter.classList.remove('visible');
            }
        }

        function toggleHelp() {
            const helpOverlay = document.getElementById('help-overlay');
            const settingsPanel = document.getElementById('settings-panel');

            if (helpOverlay.classList.contains('visible')) {
                helpOverlay.classList.remove('visible');
            } else {
                helpOverlay.classList.add('visible');
                settingsPanel.classList.remove('visible');
            }
        }

        function toggleSettings() {
            const settingsPanel = document.getElementById('settings-panel');
            const helpOverlay = document.getElementById('help-overlay');

            if (settingsPanel.classList.contains('visible')) {
                settingsPanel.classList.remove('visible');
            } else {
                settingsPanel.classList.add('visible');
                helpOverlay.classList.remove('visible');
            }
        }

        function showStatus(message) {
            const statusDiv = document.getElementById('status-message');
            statusDiv.textContent = message;
            statusDiv.classList.add('visible');

            setTimeout(() => {
                statusDiv.classList.remove('visible');
            }, 2000);
        }

        // Settings Panel Functions
        function setupSettingsListeners() {
            const sliders = [
                { id: 'layer1', valueId: 'layer1-value', index: 0 },
                { id: 'layer2', valueId: 'layer2-value', index: 1 },
                { id: 'layer3', valueId: 'layer3-value', index: 2 },
                { id: 'layer4', valueId: 'layer4-value', index: 3 },
                { id: 'layer5', valueId: 'layer5-value', index: 4 },
            ];

            sliders.forEach(slider => {
                const input = document.getElementById(slider.id);
                const valueDisplay = document.getElementById(slider.valueId);

                input.addEventListener('input', (e) => {
                    valueDisplay.textContent = e.target.value;
                });
            });

            // Learning rate slider
            document.getElementById('lr-setting').addEventListener('input', (e) => {
                document.getElementById('lr-setting-value').textContent = parseFloat(e.target.value).toFixed(4);
            });

            // Animation speed slider
            document.getElementById('anim-speed').addEventListener('input', (e) => {
                document.getElementById('anim-speed-value').textContent = parseFloat(e.target.value).toFixed(1);
            });
        }

        function applySettings() {
            // Get layer sizes from sliders
            layerSizes = [
                parseInt(document.getElementById('layer1').value),
                parseInt(document.getElementById('layer2').value),
                parseInt(document.getElementById('layer3').value),
                parseInt(document.getElementById('layer4').value),
                parseInt(document.getElementById('layer5').value),
            ];

            // Get other settings
            learningRate = parseFloat(document.getElementById('lr-setting').value);
            animationSpeed = parseFloat(document.getElementById('anim-speed').value);

            // Rebuild network
            createNetwork();
            resetNetwork();

            // Close settings panel
            toggleSettings();
            showStatus('Settings applied - network rebuilt');
        }

        // FPS Counter Update
        function updateFPS() {
            frameCount++;
            const now = Date.now();
            const elapsed = now - lastFpsUpdate;

            if (elapsed >= 1000) {
                currentFps = Math.round((frameCount * 1000) / elapsed);
                document.getElementById('fps').textContent = currentFps;
                frameCount = 0;
                lastFpsUpdate = now;
            }
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            updateNetwork();
            updateFPS();

            // Rotate camera
            const time = Date.now() * 0.0001;
            camera.position.x = Math.sin(time) * 25;
            camera.position.z = Math.cos(time) * 25;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        init();
        updateMetrics();
    </script>
</body>
</html>
```
