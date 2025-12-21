// Bowling 3D - Pin management
const Pins = {
    pins: [],
    PIN_HEIGHT: 1.2,
    PIN_RADIUS: 0.15,
    PIN_Z: 55,

    // Pin positions (standard 10-pin triangle)
    positions: [
        { x: 0, row: 0 },           // 1 (head pin)
        { x: -0.6, row: 1 },        // 2
        { x: 0.6, row: 1 },         // 3
        { x: -1.2, row: 2 },        // 4
        { x: 0, row: 2 },           // 5
        { x: 1.2, row: 2 },         // 6
        { x: -1.8, row: 3 },        // 7
        { x: -0.6, row: 3 },        // 8
        { x: 0.6, row: 3 },         // 9
        { x: 1.8, row: 3 }          // 10
    ],

    init() {
        this.createPins();
    },

    createPins() {
        this.pins = [];

        const pinGroup = new THREE.Group();

        this.positions.forEach((pos, index) => {
            const pin = this.createPin();
            const z = this.PIN_Z + pos.row * 1;
            pin.position.set(pos.x, this.PIN_HEIGHT / 2, z);
            pin.userData = {
                index: index,
                standing: true,
                velocity: new THREE.Vector3(),
                angularVel: new THREE.Vector3(),
                originalPos: new THREE.Vector3(pos.x, this.PIN_HEIGHT / 2, z)
            };
            this.pins.push(pin);
            Scene.scene.add(pin);
        });
    },

    createPin() {
        const group = new THREE.Group();

        // Pin body (simplified shape)
        const bodyGeo = new THREE.CylinderGeometry(
            this.PIN_RADIUS * 0.6,
            this.PIN_RADIUS,
            this.PIN_HEIGHT * 0.7,
            12
        );
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = -this.PIN_HEIGHT * 0.15;
        body.castShadow = true;
        group.add(body);

        // Pin neck
        const neckGeo = new THREE.CylinderGeometry(
            this.PIN_RADIUS * 0.4,
            this.PIN_RADIUS * 0.6,
            this.PIN_HEIGHT * 0.2,
            12
        );
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.position.y = this.PIN_HEIGHT * 0.25;
        neck.castShadow = true;
        group.add(neck);

        // Pin head
        const headGeo = new THREE.SphereGeometry(this.PIN_RADIUS * 0.5, 12, 12);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = this.PIN_HEIGHT * 0.4;
        head.castShadow = true;
        group.add(head);

        // Red stripes
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
        const stripeGeo = new THREE.TorusGeometry(this.PIN_RADIUS * 0.85, 0.02, 8, 24);

        const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
        stripe1.rotation.x = Math.PI / 2;
        stripe1.position.y = this.PIN_HEIGHT * 0.15;
        group.add(stripe1);

        const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
        stripe2.rotation.x = Math.PI / 2;
        stripe2.position.y = this.PIN_HEIGHT * 0.2;
        group.add(stripe2);

        return group;
    },

    reset(keepFallen = false) {
        this.pins.forEach(pin => {
            if (keepFallen && !pin.userData.standing) {
                // Remove fallen pins
                Scene.scene.remove(pin);
            } else if (!keepFallen || pin.userData.standing) {
                // Reset standing pins
                pin.position.copy(pin.userData.originalPos);
                pin.rotation.set(0, 0, 0);
                pin.userData.standing = true;
                pin.userData.velocity.set(0, 0, 0);
                pin.userData.angularVel.set(0, 0, 0);
            }
        });

        if (keepFallen) {
            this.pins = this.pins.filter(p => p.userData.standing);
        }
    },

    resetAll() {
        // Remove all pins
        this.pins.forEach(pin => Scene.scene.remove(pin));
        this.pins = [];
        // Create new pins
        this.createPins();
    },

    update(delta) {
        const gravity = -20;
        const damping = 0.98;
        const floorY = this.PIN_HEIGHT / 2;

        this.pins.forEach(pin => {
            if (!pin.userData.standing) {
                // Apply gravity
                pin.userData.velocity.y += gravity * delta;

                // Update position
                pin.position.add(pin.userData.velocity.clone().multiplyScalar(delta));

                // Update rotation
                pin.rotation.x += pin.userData.angularVel.x * delta;
                pin.rotation.z += pin.userData.angularVel.z * delta;

                // Floor collision
                if (pin.position.y < 0.1) {
                    pin.position.y = 0.1;
                    pin.userData.velocity.multiplyScalar(0.3);
                    pin.userData.angularVel.multiplyScalar(0.5);
                }

                // Damping
                pin.userData.velocity.multiplyScalar(damping);
                pin.userData.angularVel.multiplyScalar(damping);
            }
        });
    },

    checkCollision(ballPos, ballRadius, ballVelocity) {
        let hitCount = 0;

        this.pins.forEach(pin => {
            if (!pin.userData.standing) return;

            const dx = pin.position.x - ballPos.x;
            const dz = pin.position.z - ballPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const minDist = ballRadius + this.PIN_RADIUS;

            if (dist < minDist) {
                // Pin knocked down!
                pin.userData.standing = false;
                hitCount++;

                // Calculate knockback direction
                const angle = Math.atan2(dx, dz);
                const force = ballVelocity.length() * 0.5;

                pin.userData.velocity.set(
                    Math.sin(angle) * force + (Math.random() - 0.5) * 2,
                    3 + Math.random() * 2,
                    Math.cos(angle) * force + Math.random() * 2
                );

                pin.userData.angularVel.set(
                    (Math.random() - 0.5) * 10,
                    0,
                    (Math.random() - 0.5) * 10
                );

                // Chain reaction - check nearby pins
                this.chainReaction(pin);
            }
        });

        return hitCount;
    },

    chainReaction(hitPin) {
        this.pins.forEach(pin => {
            if (!pin.userData.standing) return;
            if (pin === hitPin) return;

            const dx = pin.position.x - hitPin.position.x;
            const dz = pin.position.z - hitPin.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 0.8) {
                // Close enough for chain reaction
                setTimeout(() => {
                    if (pin.userData.standing && Math.random() > 0.3) {
                        pin.userData.standing = false;
                        const angle = Math.atan2(dx, dz);
                        pin.userData.velocity.set(
                            Math.sin(angle) * 3,
                            2,
                            Math.cos(angle) * 3
                        );
                        pin.userData.angularVel.set(
                            (Math.random() - 0.5) * 8,
                            0,
                            (Math.random() - 0.5) * 8
                        );
                    }
                }, 50 + Math.random() * 100);
            }
        });
    },

    countStanding() {
        return this.pins.filter(p => p.userData.standing).length;
    }
};
