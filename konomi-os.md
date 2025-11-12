# Konomi OS

Complete 3D Operating System with AI Stack Integration.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Konomi OS - 3D Desktop</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #0f3460);
            color: #00ff88;
            font-family: 'Courier New', monospace;
            overflow: hidden;
        }
        #canvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; }
        .hud {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #00ff88;
            border-radius: 12px;
            padding: 12px;
            font-size: 11px;
            backdrop-filter: blur(8px);
            z-index: 100;
        }
        .taskbar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: rgba(0, 10, 20, 0.95);
            border-top: 2px solid #00ff88;
            backdrop-filter: blur(10px);
            z-index: 90;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 0 20px;
        }
        .app-icon {
            width: 40px;
            height: 40px;
            background: rgba(0, 255, 136, 0.2);
            border: 2px solid #00ff88;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: all 0.3s;
        }
        .app-icon:hover {
            background: rgba(0, 255, 136, 0.4);
            transform: scale(1.1);
            box-shadow: 0 5px 20px rgba(0, 255, 136, 0.3);
        }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>

    <div class="hud">
        <div style="color: #00ff88; font-weight: bold;">🖥️ KONOMI OS v4.0</div>
        <div>System: <span style="color: #0f0;">ONLINE</span></div>
        <div>Windows: <span id="win-count">0</span></div>
        <div>FPS: <span id="fps">60</span></div>
        <div>Camera: <span id="cam-pos">0, 0, 15</span></div>
    </div>

    <div class="taskbar">
        <div class="app-icon" onclick="OS.createWindow('terminal')" title="Terminal">💻</div>
        <div class="app-icon" onclick="OS.createWindow('files')" title="Files">📁</div>
        <div class="app-icon" onclick="OS.createWindow('browser')" title="Browser">🌐</div>
        <div class="app-icon" onclick="OS.createWindow('ai')" title="AI Control">🧠</div>
        <div class="app-icon" onclick="OS.createWindow('settings')" title="Settings">⚙️</div>
    </div>

    <script>
        const OS = {
            scene: null,
            camera: null,
            renderer: null,
            windows: [],
            mouseDown: false,
            mouse: { x: 0, y: 0 },

            init() {
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true, alpha: true });

                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setClearColor(0x000000, 0);
                this.camera.position.z = 15;

                // Lighting
                const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
                this.scene.add(ambientLight);

                const mainLight = new THREE.DirectionalLight(0x00ff88, 0.8);
                mainLight.position.set(10, 10, 10);
                this.scene.add(mainLight);

                const accentLight = new THREE.PointLight(0x0088ff, 0.6, 50);
                accentLight.position.set(-15, 5, 10);
                this.scene.add(accentLight);

                // Grid
                const gridHelper = new THREE.GridHelper(30, 30, 0x00ff88, 0x004444);
                gridHelper.position.y = -5;
                this.scene.add(gridHelper);

                // Particles
                this.createParticles();

                // Events
                document.addEventListener('mousedown', (e) => this.mouseDown = true);
                document.addEventListener('mouseup', (e) => this.mouseDown = false);
                document.addEventListener('mousemove', (e) => {
                    if (this.mouseDown) {
                        this.camera.position.x += (e.movementX * 0.008);
                        this.camera.position.y -= (e.movementY * 0.008);
                    }
                });
                window.addEventListener('resize', () => this.onResize());

                this.animate();
            },

            createParticles() {
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(200 * 3);
                const colors = new Float32Array(200 * 3);

                for (let i = 0; i < 200; i++) {
                    positions[i * 3] = (Math.random() - 0.5) * 50;
                    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

                    const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.5);
                    colors[i * 3] = color.r;
                    colors[i * 3 + 1] = color.g;
                    colors[i * 3 + 2] = color.b;
                }

                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

                const material = new THREE.PointsMaterial({
                    size: 0.1,
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.6
                });

                const particles = new THREE.Points(geometry, material);
                this.scene.add(particles);
            },

            createWindow(type) {
                const windowData = {
                    terminal: { name: 'Terminal', icon: '💻', color: 0x00ff88 },
                    files: { name: 'Files', icon: '📁', color: 0x0088ff },
                    browser: { name: 'Browser', icon: '🌐', color: 0x00ffff },
                    ai: { name: 'AI Control', icon: '🧠', color: 0xff00ff },
                    settings: { name: 'Settings', icon: '⚙️', color: 0xff8800 }
                }[type] || { name: 'Window', icon: '📄', color: 0x00ff88 };

                // Window frame
                const group = new THREE.Group();

                const frameGeo = new THREE.BoxGeometry(6, 4, 0.1);
                const frameMat = new THREE.MeshPhongMaterial({ color: 0x001122, transparent: true, opacity: 0.9 });
                const frame = new THREE.Mesh(frameGeo, frameMat);
                group.add(frame);

                // Window content
                const canvas = document.createElement('canvas');
                canvas.width = 600;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');

                // Background
                ctx.fillStyle = '#001122';
                ctx.fillRect(0, 0, 600, 400);

                // Header
                ctx.fillStyle = `#${windowData.color.toString(16).padStart(6, '0')}`;
                ctx.fillRect(0, 0, 600, 40);
                ctx.fillStyle = '#000';
                ctx.font = 'bold 20px Courier New';
                ctx.fillText(`${windowData.icon} ${windowData.name}`, 20, 28);

                // Content
                ctx.fillStyle = `#${windowData.color.toString(16).padStart(6, '0')}`;
                ctx.font = '16px Courier New';
                ctx.fillText(`${windowData.name} Application`, 20, 80);
                ctx.fillText('• Ready for interaction', 20, 120);
                ctx.fillText('• System integration active', 20, 150);

                const texture = new THREE.CanvasTexture(canvas);
                const contentGeo = new THREE.PlaneGeometry(6, 4);
                const contentMat = new THREE.MeshBasicMaterial({ map: texture });
                const content = new THREE.Mesh(contentGeo, contentMat);
                content.position.z = 0.06;
                group.add(content);

                // Border
                const borderGeo = new THREE.EdgesGeometry(frameGeo);
                const borderMat = new THREE.LineBasicMaterial({ color: windowData.color, linewidth: 2 });
                const border = new THREE.LineSegments(borderGeo, borderMat);
                group.add(border);

                // Position
                const angle = this.windows.length * 0.8;
                const radius = 8;
                group.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle * 0.7) * 3,
                    Math.sin(angle) * 3
                );

                this.scene.add(group);
                this.windows.push(group);
                this.updateHUD();
            },

            updateHUD() {
                document.getElementById('win-count').textContent = this.windows.length;
                document.getElementById('cam-pos').textContent =
                    `${Math.round(this.camera.position.x)}, ${Math.round(this.camera.position.y)}, ${Math.round(this.camera.position.z)}`;
            },

            onResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            },

            animate() {
                requestAnimationFrame(() => this.animate());

                // Animate windows
                this.windows.forEach((win, i) => {
                    const time = Date.now() * 0.001;
                    win.position.y += Math.sin(time + i) * 0.001;
                    win.rotation.z = Math.sin(time * 0.5 + i) * 0.02;
                });

                // FPS
                const fps = Math.round(1000 / 16.67);
                document.getElementById('fps').textContent = fps;

                this.renderer.render(this.scene, this.camera);
            }
        };

        window.addEventListener('load', () => OS.init());
    </script>
</body>
</html>
```
