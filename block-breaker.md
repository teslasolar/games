# Block Breaker 3D

Classic block breaking game reimagined in 3D space with neon cyberpunk aesthetics.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="Block Breaker 3D - A classic block breaking game reimagined in stunning 3D space with neon cyberpunk aesthetics">
    <meta name="keywords" content="block breaker, 3D game, breakout, arcade game, WebGL, Three.js">
    <meta name="author" content="Games Gallery">

    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Block Breaker 3D - Neon Cyberpunk Edition">
    <meta property="og:description" content="Break blocks in stunning 3D space with neon cyberpunk aesthetics. Mouse or touch controls, multiple levels, and addictive gameplay!">
    <meta property="og:image" content="https://via.placeholder.com/1200x630/000510/00ff88?text=Block+Breaker+3D">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Block Breaker 3D">
    <meta name="twitter:description" content="Classic block breaking game in stunning 3D with neon aesthetics">

    <title>Block Breaker 3D - Neon Cyberpunk Edition</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }
        body {
            margin: 0;
            overflow: hidden;
            background: #000;
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
            background: linear-gradient(135deg, #000510, #001020);
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
            color: #00ff88;
            font-size: 18px;
            margin-top: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        /* HUD */
        #hud {
            position: absolute;
            top: 20px;
            width: 100%;
            text-align: center;
            color: #00ff88;
            font-size: 18px;
            font-weight: bold;
            text-shadow: 0 0 10px #00ff88;
            z-index: 10;
        }
        #hud-highscore {
            position: absolute;
            top: 50px;
            width: 100%;
            text-align: center;
            color: #ffaa00;
            font-size: 14px;
            text-shadow: 0 0 10px #ffaa00;
        }

        /* FPS Counter */
        #fps-counter {
            position: absolute;
            top: 20px;
            right: 20px;
            color: #00ff88;
            font-size: 14px;
            background: rgba(0, 20, 40, 0.8);
            padding: 8px 12px;
            border-radius: 5px;
            border: 1px solid #00ff88;
            display: none;
            z-index: 10;
        }

        /* Info Panel */
        #info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #00ff88;
            font-size: 12px;
            background: rgba(0, 20, 40, 0.8);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            max-width: 300px;
            z-index: 10;
        }

        /* Pause Overlay */
        #pause-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 5, 16, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 100;
        }
        #pause-overlay.active {
            display: flex;
        }
        #pause-text {
            color: #00ff88;
            font-size: 48px;
            font-weight: bold;
            text-shadow: 0 0 20px #00ff88;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* Game Over Screen */
        #gameover {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-size: 36px;
            font-weight: bold;
            text-align: center;
            display: none;
            z-index: 50;
            background: rgba(0, 20, 40, 0.95);
            padding: 40px;
            border-radius: 15px;
            border: 2px solid #00ff88;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
        }
        #gameover.active {
            display: block;
        }

        /* Settings Panel */
        #settings-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 40, 0.98);
            border: 2px solid #00ff88;
            border-radius: 15px;
            padding: 30px;
            color: #00ff88;
            display: none;
            z-index: 200;
            min-width: 400px;
            box-shadow: 0 0 40px rgba(0, 255, 136, 0.6);
        }
        #settings-panel.active {
            display: block;
        }
        #settings-panel h2 {
            margin-bottom: 20px;
            text-align: center;
            font-size: 28px;
            text-shadow: 0 0 15px #00ff88;
        }
        .setting-row {
            margin: 20px 0;
        }
        .setting-row label {
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
        }
        .setting-row select,
        .setting-row input[type="range"] {
            width: 100%;
            padding: 8px;
            background: rgba(0, 40, 80, 0.5);
            border: 1px solid #00ff88;
            color: #00ff88;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        .setting-row input[type="range"] {
            padding: 0;
        }
        .btn {
            background: rgba(0, 255, 136, 0.2);
            border: 2px solid #00ff88;
            color: #00ff88;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: bold;
            margin: 5px;
            transition: all 0.3s;
            text-transform: uppercase;
        }
        .btn:hover {
            background: rgba(0, 255, 136, 0.4);
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
        }
        .btn-container {
            text-align: center;
            margin-top: 25px;
        }

        /* Help Overlay */
        #help-overlay {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 40, 0.98);
            border: 2px solid #00ff88;
            border-radius: 15px;
            padding: 30px;
            color: #00ff88;
            display: none;
            z-index: 300;
            max-width: 500px;
            box-shadow: 0 0 40px rgba(0, 255, 136, 0.6);
        }
        #help-overlay.active {
            display: block;
        }
        #help-overlay h2 {
            margin-bottom: 20px;
            text-align: center;
            font-size: 28px;
            text-shadow: 0 0 15px #00ff88;
        }
        .help-section {
            margin: 15px 0;
        }
        .help-section h3 {
            color: #ffaa00;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .help-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }
        .help-key {
            color: #00ffff;
            font-weight: bold;
        }

        /* Mobile Touch Controls */
        #touch-controls {
            position: absolute;
            bottom: 80px;
            width: 100%;
            display: none;
            justify-content: center;
            gap: 20px;
            z-index: 10;
        }
        .touch-btn {
            background: rgba(0, 255, 136, 0.3);
            border: 2px solid #00ff88;
            color: #00ff88;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            #settings-panel {
                min-width: 90%;
                max-width: 90%;
            }
            #help-overlay {
                max-width: 90%;
            }
            #hud {
                font-size: 14px;
            }
            #touch-controls {
                display: flex;
            }
        }
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading">
        <div class="spinner"></div>
        <div id="loading-text">Loading Block Breaker 3D...</div>
    </div>

    <!-- HUD -->
    <div id="hud">
        SCORE: <span id="score">0</span> | LIVES: <span id="lives">3</span> | LEVEL: <span id="level">1</span>
    </div>
    <div id="hud-highscore">
        HIGH SCORE: <span id="highscore">0</span>
    </div>

    <!-- FPS Counter -->
    <div id="fps-counter">FPS: <span id="fps">60</span></div>

    <!-- Info Panel -->
    <div id="info">
        <strong>Controls:</strong><br>
        Mouse/Touch: Move Paddle<br>
        Click/Tap: Launch Ball<br>
        P: Pause | R: Restart<br>
        ESC: Settings | H: Help<br>
        F: Toggle FPS
    </div>

    <!-- Pause Overlay -->
    <div id="pause-overlay">
        <div id="pause-text">PAUSED<br><span style="font-size: 24px;">Press P to Resume</span></div>
    </div>

    <!-- Game Over Screen -->
    <div id="gameover">
        <span id="gameoverText">GAME OVER</span><br>
        <span style="font-size: 18px; color: #00ff88;">Final Score: <span id="finalScore">0</span></span><br>
        <span style="font-size: 18px;">Press R to Restart</span>
    </div>

    <!-- Settings Panel -->
    <div id="settings-panel">
        <h2>SETTINGS</h2>
        <div class="setting-row">
            <label for="difficulty">Difficulty Level:</label>
            <select id="difficulty">
                <option value="easy">Easy</option>
                <option value="normal" selected>Normal</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
            </select>
        </div>
        <div class="setting-row">
            <label for="ball-speed">Ball Speed: <span id="ball-speed-value">1.0x</span></label>
            <input type="range" id="ball-speed" min="0.5" max="2.0" step="0.1" value="1.0">
        </div>
        <div class="setting-row">
            <label for="graphics-quality">Graphics Quality:</label>
            <select id="graphics-quality">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
            </select>
        </div>
        <div class="btn-container">
            <button class="btn" onclick="applySettings()">Apply</button>
            <button class="btn" onclick="closeSettings()">Close</button>
        </div>
    </div>

    <!-- Help Overlay -->
    <div id="help-overlay">
        <h2>KEYBOARD SHORTCUTS</h2>
        <div class="help-section">
            <h3>Game Controls</h3>
            <div class="help-item">
                <span>Move Paddle</span>
                <span class="help-key">MOUSE / TOUCH</span>
            </div>
            <div class="help-item">
                <span>Launch Ball</span>
                <span class="help-key">CLICK / TAP</span>
            </div>
        </div>
        <div class="help-section">
            <h3>Keyboard Shortcuts</h3>
            <div class="help-item">
                <span>Pause/Resume</span>
                <span class="help-key">P</span>
            </div>
            <div class="help-item">
                <span>Restart Game</span>
                <span class="help-key">R</span>
            </div>
            <div class="help-item">
                <span>Settings</span>
                <span class="help-key">ESC</span>
            </div>
            <div class="help-item">
                <span>Toggle FPS</span>
                <span class="help-key">F</span>
            </div>
            <div class="help-item">
                <span>Help (This Screen)</span>
                <span class="help-key">H</span>
            </div>
        </div>
        <div class="btn-container">
            <button class="btn" onclick="closeHelp()">Close</button>
        </div>
    </div>

    <!-- Mobile Touch Controls -->
    <div id="touch-controls">
        <button class="touch-btn" onclick="launchBall()">LAUNCH</button>
        <button class="touch-btn" onclick="togglePause()">PAUSE</button>
    </div>

    <script>
        let scene, camera, renderer;
        let paddle, ball, blocks = [];
        let ballVelocity = new THREE.Vector3();
        let score = 0, lives = 3, level = 1;
        let ballLaunched = false;
        let mouse = new THREE.Vector2();
        let isPaused = false;
        let showFPS = false;
        let lastFrameTime = Date.now();
        let fps = 60;
        let frameCount = 0;

        // Game settings
        let settings = {
            difficulty: 'normal',
            ballSpeed: 1.0,
            graphicsQuality: 'medium'
        };

        // Difficulty configurations
        const difficultyConfig = {
            easy: { lives: 5, blockRows: 4, blockCols: 6, ballSpeed: 0.12 },
            normal: { lives: 3, blockRows: 5, blockCols: 8, ballSpeed: 0.15 },
            hard: { lives: 2, blockRows: 6, blockCols: 9, ballSpeed: 0.18 },
            extreme: { lives: 1, blockRows: 7, blockCols: 10, ballSpeed: 0.22 }
        };

        const PADDLE_WIDTH = 4;
        const PADDLE_HEIGHT = 0.5;
        const BALL_RADIUS = 0.3;
        let BLOCK_ROWS = 5;
        let BLOCK_COLS = 8;
        let BASE_BALL_SPEED = 0.15;

        // High score management
        function loadHighScore() {
            return parseInt(localStorage.getItem('blockBreaker3D_highscore') || '0');
        }

        function saveHighScore(score) {
            const current = loadHighScore();
            if (score > current) {
                localStorage.setItem('blockBreaker3D_highscore', score.toString());
                return true;
            }
            return false;
        }

        function updateHighScoreDisplay() {
            document.getElementById('highscore').textContent = loadHighScore();
        }

        // Settings functions
        function toggleSettings() {
            const panel = document.getElementById('settings-panel');
            panel.classList.toggle('active');
            if (panel.classList.contains('active')) {
                isPaused = true;
            }
        }

        function closeSettings() {
            document.getElementById('settings-panel').classList.remove('active');
            isPaused = false;
        }

        function applySettings() {
            settings.difficulty = document.getElementById('difficulty').value;
            settings.ballSpeed = parseFloat(document.getElementById('ball-speed').value);
            settings.graphicsQuality = document.getElementById('graphics-quality').value;

            // Apply graphics quality
            applyGraphicsQuality();

            // Show confirmation
            alert('Settings applied! Restart game (R) for difficulty changes to take effect.');
            closeSettings();
        }

        function applyGraphicsQuality() {
            const quality = settings.graphicsQuality;
            switch(quality) {
                case 'low':
                    renderer.setPixelRatio(1);
                    break;
                case 'medium':
                    renderer.setPixelRatio(window.devicePixelRatio * 0.75);
                    break;
                case 'high':
                    renderer.setPixelRatio(window.devicePixelRatio);
                    break;
            }
        }

        // Help overlay
        function toggleHelp() {
            const help = document.getElementById('help-overlay');
            help.classList.toggle('active');
            if (help.classList.contains('active')) {
                isPaused = true;
            }
        }

        function closeHelp() {
            document.getElementById('help-overlay').classList.remove('active');
            isPaused = false;
        }

        // Pause functionality
        function togglePause() {
            if (document.getElementById('settings-panel').classList.contains('active') ||
                document.getElementById('help-overlay').classList.contains('active')) {
                return;
            }
            isPaused = !isPaused;
            document.getElementById('pause-overlay').classList.toggle('active', isPaused);
        }

        // FPS counter
        function toggleFPS() {
            showFPS = !showFPS;
            document.getElementById('fps-counter').style.display = showFPS ? 'block' : 'none';
        }

        function updateFPS() {
            frameCount++;
            const now = Date.now();
            const delta = now - lastFrameTime;

            if (delta >= 1000) {
                fps = Math.round((frameCount * 1000) / delta);
                document.getElementById('fps').textContent = fps;
                frameCount = 0;
                lastFrameTime = now;
            }
        }

        function init() {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000510);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, -5, 20);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({ antialias: settings.graphicsQuality !== 'low' });
            renderer.setSize(window.innerWidth, window.innerHeight);
            applyGraphicsQuality();
            document.body.appendChild(renderer.domElement);

            createPaddle();
            createBall();
            createBlocks();
            createWalls();
            createLighting();
            setupEventListeners();

            // Hide loading screen
            setTimeout(() => {
                document.getElementById('loading').classList.add('hidden');
            }, 1000);

            animate();
        }

        function createPaddle() {
            const geometry = new THREE.BoxGeometry(PADDLE_WIDTH, PADDLE_HEIGHT, 1);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.5
            });

            paddle = new THREE.Mesh(geometry, material);
            paddle.position.y = -8;
            scene.add(paddle);

            // Add glow effect
            const glowGeometry = new THREE.BoxGeometry(PADDLE_WIDTH + 0.2, PADDLE_HEIGHT + 0.2, 1.2);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            paddle.add(glow);
        }

        function createBall() {
            const geometry = new THREE.SphereGeometry(BALL_RADIUS, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.8
            });

            ball = new THREE.Mesh(geometry, material);
            ball.position.copy(paddle.position);
            ball.position.y += 1;
            scene.add(ball);

            // Trail effect
            const trailGeometry = new THREE.SphereGeometry(BALL_RADIUS * 1.5, 8, 8);
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.2
            });
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            ball.add(trail);
        }

        function createBlocks() {
            const config = difficultyConfig[settings.difficulty];
            BLOCK_ROWS = config.blockRows;
            BLOCK_COLS = config.blockCols;
            BASE_BALL_SPEED = config.ballSpeed;

            const blockWidth = 2.5;
            const blockHeight = 0.8;
            const blockDepth = 1;
            const spacing = 0.3;

            const totalWidth = BLOCK_COLS * (blockWidth + spacing);
            const startX = -totalWidth / 2 + blockWidth / 2;
            const startY = 5;

            const colors = [0xff0088, 0xff8800, 0xffff00, 0x00ff88, 0x0088ff, 0xff00ff, 0x00ffff];

            for (let row = 0; row < BLOCK_ROWS; row++) {
                for (let col = 0; col < BLOCK_COLS; col++) {
                    const geometry = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
                    const material = new THREE.MeshPhongMaterial({
                        color: colors[row % colors.length],
                        emissive: colors[row % colors.length],
                        emissiveIntensity: 0.3
                    });

                    const block = new THREE.Mesh(geometry, material);
                    block.position.set(
                        startX + col * (blockWidth + spacing),
                        startY - row * (blockHeight + spacing),
                        0
                    );
                    block.userData.points = (BLOCK_ROWS - row) * 10 * level;
                    block.userData.alive = true;

                    scene.add(block);
                    blocks.push(block);
                }
            }
        }

        function createWalls() {
            const wallMaterial = new THREE.MeshPhongMaterial({
                color: 0x003366,
                emissive: 0x003366,
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.5
            });

            // Left wall
            const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 30, 5), wallMaterial);
            leftWall.position.set(-15, 0, 0);
            scene.add(leftWall);

            // Right wall
            const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 30, 5), wallMaterial);
            rightWall.position.set(15, 0, 0);
            scene.add(rightWall);

            // Top wall
            const topWall = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 5), wallMaterial);
            topWall.position.set(0, 10, 0);
            scene.add(topWall);
        }

        function createLighting() {
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0x00ffff, 1, 50);
            pointLight.position.set(0, 0, 10);
            scene.add(pointLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 10, 10);
            scene.add(directionalLight);
        }

        function setupEventListeners() {
            // Mouse movement
            document.addEventListener('mousemove', (e) => {
                mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            });

            // Touch movement
            document.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            }, { passive: false });

            // Click/Touch to launch
            document.addEventListener('click', () => {
                if (!ballLaunched && !isPaused) {
                    launchBall();
                }
            });

            document.addEventListener('touchstart', (e) => {
                if (!ballLaunched && !isPaused) {
                    launchBall();
                }
            }, { passive: true });

            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                const key = e.key.toLowerCase();

                if (key === 'r') {
                    restart();
                } else if (key === 'p') {
                    togglePause();
                } else if (key === 'f') {
                    toggleFPS();
                } else if (key === 'escape') {
                    if (document.getElementById('help-overlay').classList.contains('active')) {
                        closeHelp();
                    } else {
                        toggleSettings();
                    }
                } else if (key === 'h') {
                    toggleHelp();
                }
            });

            // Ball speed slider
            document.getElementById('ball-speed').addEventListener('input', (e) => {
                document.getElementById('ball-speed-value').textContent = e.target.value + 'x';
            });

            window.addEventListener('resize', onResize);
        }

        function launchBall() {
            if (ballLaunched || isPaused) return;

            ballLaunched = true;
            const speed = BASE_BALL_SPEED * settings.ballSpeed;
            ballVelocity.set(
                (Math.random() - 0.5) * speed * 0.7,
                speed,
                0
            );
        }

        function updatePaddle() {
            if (isPaused) return;

            const targetX = mouse.x * 12;
            paddle.position.x += (targetX - paddle.position.x) * 0.1;

            // Clamp paddle position
            paddle.position.x = Math.max(-13, Math.min(13, paddle.position.x));

            // Ball follows paddle before launch
            if (!ballLaunched) {
                ball.position.x = paddle.position.x;
                ball.position.y = paddle.position.y + 1;
            }
        }

        function updateBall() {
            if (!ballLaunched || isPaused) return;

            ball.position.add(ballVelocity);

            // Ball rotation
            ball.rotation.x += ballVelocity.y * 10;
            ball.rotation.y += ballVelocity.x * 10;

            // Wall collisions
            if (ball.position.x < -14.5 || ball.position.x > 14.5) {
                ballVelocity.x *= -1;
                ball.position.x = Math.max(-14.5, Math.min(14.5, ball.position.x));
            }

            if (ball.position.y > 9.5) {
                ballVelocity.y *= -1;
                ball.position.y = 9.5;
            }

            // Paddle collision
            if (ball.position.y < paddle.position.y + 0.5 &&
                ball.position.y > paddle.position.y - 0.5 &&
                Math.abs(ball.position.x - paddle.position.x) < PADDLE_WIDTH / 2) {

                ballVelocity.y = Math.abs(ballVelocity.y);
                const hitPos = (ball.position.x - paddle.position.x) / (PADDLE_WIDTH / 2);
                ballVelocity.x += hitPos * 0.05;

                // Normalize velocity
                const speed = BASE_BALL_SPEED * settings.ballSpeed;
                ballVelocity.normalize().multiplyScalar(speed);
            }

            // Ball falls off screen
            if (ball.position.y < -10) {
                lives--;
                updateHUD();

                if (lives <= 0) {
                    gameOver();
                } else {
                    resetBall();
                }
            }

            // Block collisions
            for (let i = blocks.length - 1; i >= 0; i--) {
                const block = blocks[i];
                if (!block.userData.alive) continue;

                const box = new THREE.Box3().setFromObject(block);
                const ballBox = new THREE.Box3().setFromObject(ball);

                if (box.intersectsBox(ballBox)) {
                    block.userData.alive = false;
                    score += block.userData.points;
                    updateHUD();

                    // Remove block with animation
                    animateBlockDestruction(block);
                    blocks.splice(i, 1);

                    // Bounce ball
                    const blockCenter = block.position;
                    const dx = ball.position.x - blockCenter.x;
                    const dy = ball.position.y - blockCenter.y;

                    if (Math.abs(dx) > Math.abs(dy)) {
                        ballVelocity.x *= -1;
                    } else {
                        ballVelocity.y *= -1;
                    }

                    // Check for level complete
                    if (blocks.filter(b => b.userData.alive).length === 0) {
                        nextLevel();
                    }
                }
            }
        }

        function animateBlockDestruction(block) {
            const scale = 1;
            const fade = () => {
                block.scale.multiplyScalar(0.9);
                block.material.opacity = block.scale.x;

                if (block.scale.x > 0.1) {
                    requestAnimationFrame(fade);
                } else {
                    scene.remove(block);
                }
            };
            fade();

            // Create explosion particles
            const particleCount = settings.graphicsQuality === 'low' ? 5 : settings.graphicsQuality === 'medium' ? 10 : 15;
            for (let i = 0; i < particleCount; i++) {
                const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: block.material.color
                });
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);

                particle.position.copy(block.position);
                particle.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2
                );

                scene.add(particle);

                const animateParticle = () => {
                    particle.position.add(particle.velocity);
                    particle.velocity.y -= 0.01;
                    particle.scale.multiplyScalar(0.95);

                    if (particle.scale.x > 0.01) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        scene.remove(particle);
                    }
                };

                animateParticle();
            }
        }

        function resetBall() {
            ballLaunched = false;
            ball.position.copy(paddle.position);
            ball.position.y += 1;
            ballVelocity.set(0, 0, 0);
        }

        function nextLevel() {
            level++;
            updateHUD();

            // Bonus points for completing level
            score += level * 100;

            blocks.forEach(b => scene.remove(b));
            blocks = [];
            createBlocks();
            resetBall();

            // Slight speed increase per level
            BASE_BALL_SPEED += 0.01;
        }

        function gameOver() {
            document.getElementById('gameoverText').textContent = 'GAME OVER';
            document.getElementById('finalScore').textContent = score;

            // Check and save high score
            if (saveHighScore(score)) {
                document.getElementById('gameoverText').textContent = 'NEW HIGH SCORE!';
            }
            updateHighScoreDisplay();

            document.getElementById('gameover').classList.add('active');
            ballLaunched = false;
            isPaused = true;
        }

        function restart() {
            // Apply difficulty settings
            const config = difficultyConfig[settings.difficulty];
            lives = config.lives;
            BASE_BALL_SPEED = config.ballSpeed;

            score = 0;
            level = 1;
            blocks.forEach(b => scene.remove(b));
            blocks = [];
            createBlocks();
            resetBall();
            updateHUD();
            updateHighScoreDisplay();
            document.getElementById('gameover').classList.remove('active');
            isPaused = false;
        }

        function updateHUD() {
            document.getElementById('score').textContent = score;
            document.getElementById('lives').textContent = lives;
            document.getElementById('level').textContent = level;
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            if (!isPaused) {
                updatePaddle();
                updateBall();
            }

            if (showFPS) {
                updateFPS();
            }

            renderer.render(scene, camera);
        }

        // Initialize game
        init();
        updateHUD();
        updateHighScoreDisplay();
    </script>
</body>
</html>
```
