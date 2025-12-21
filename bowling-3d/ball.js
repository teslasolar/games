// Bowling 3D - Ball physics and controls
const Ball = {
    mesh: null,
    RADIUS: 0.4,
    START_Z: 2,

    velocity: new THREE.Vector3(),
    isRolling: false,
    isDragging: false,
    dragStart: null,
    aimX: 0,

    init() {
        this.createBall();
        this.setupControls();
    },

    createBall() {
        const geo = new THREE.SphereGeometry(this.RADIUS, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x1a1a8e,
            roughness: 0.2,
            metalness: 0.3
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.castShadow = true;
        this.reset();
        Scene.scene.add(this.mesh);

        // Finger holes
        const holeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const holeGeo = new THREE.CircleGeometry(0.08, 16);

        for (let i = 0; i < 3; i++) {
            const hole = new THREE.Mesh(holeGeo, holeMat);
            const angle = (i - 1) * 0.3;
            hole.position.set(Math.sin(angle) * 0.2, 0.35, Math.cos(angle) * 0.2);
            hole.lookAt(0, 2, 0);
            this.mesh.add(hole);
        }
    },

    reset() {
        this.mesh.position.set(0, this.RADIUS, this.START_Z);
        this.velocity.set(0, 0, 0);
        this.isRolling = false;
        this.aimX = 0;
    },

    setupControls() {
        const canvas = document.getElementById('canvas');

        canvas.addEventListener('mousedown', (e) => this.onDragStart(e));
        canvas.addEventListener('mousemove', (e) => this.onDragMove(e));
        canvas.addEventListener('mouseup', (e) => this.onDragEnd(e));

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onDragStart(e.touches[0]);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.onDragMove(e.touches[0]);
        });
        canvas.addEventListener('touchend', (e) => {
            this.onDragEnd(e.changedTouches[0]);
        });
    },

    onDragStart(e) {
        if (this.isRolling || !Game.canBowl) return;

        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY, time: Date.now() };

        document.getElementById('power-meter').classList.add('visible');
        document.getElementById('hint').classList.add('hidden');
    },

    onDragMove(e) {
        if (!this.isDragging) return;

        const dx = e.clientX - this.dragStart.x;
        const dy = this.dragStart.y - e.clientY;

        // Horizontal aim
        this.aimX = Math.max(-1.5, Math.min(1.5, dx * 0.01));
        this.mesh.position.x = this.aimX;

        // Power meter
        const power = Math.min(100, Math.max(0, dy * 0.5));
        document.getElementById('power-fill').style.height = power + '%';
    },

    onDragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;

        document.getElementById('power-meter').classList.remove('visible');

        const dx = e.clientX - this.dragStart.x;
        const dy = this.dragStart.y - e.clientY;
        const dt = (Date.now() - this.dragStart.time) / 1000;

        if (dy < 20) {
            // Not enough power
            this.mesh.position.x = 0;
            return;
        }

        // Calculate velocity
        const power = Math.min(40, Math.max(15, dy * 0.15));
        const curve = dx * 0.002;

        this.velocity.set(curve * power, 0, power);
        this.isRolling = true;

        Game.onBallThrown();
    },

    update(delta) {
        if (!this.isRolling) return;

        const friction = 0.995;
        const laneWidth = Scene.LANE_WIDTH / 2;

        // Update position
        this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

        // Ball rotation (visual)
        const speed = this.velocity.length();
        this.mesh.rotation.x += speed * delta * 2;

        // Lane boundaries (gutters)
        if (Math.abs(this.mesh.position.x) > laneWidth) {
            // Ball in gutter
            this.velocity.x *= 0.5;
            this.velocity.z *= 0.9;
        }

        // Friction
        this.velocity.multiplyScalar(friction);

        // Check pin collisions
        if (this.mesh.position.z > 50) {
            Pins.checkCollision(
                this.mesh.position,
                this.RADIUS,
                this.velocity
            );
        }

        // Ball reached end
        if (this.mesh.position.z > 65 || this.velocity.length() < 0.5) {
            this.isRolling = false;
            setTimeout(() => Game.onBallStopped(), 1000);
        }
    }
};
