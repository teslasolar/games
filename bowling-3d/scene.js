// Bowling 3D - Scene setup
const Scene = {
    scene: null,
    camera: null,
    renderer: null,
    lane: null,

    LANE_LENGTH: 60,
    LANE_WIDTH: 4,

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 30, 80);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.resetCamera();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.createLights();
        this.createLane();
        this.createEnvironment();

        window.addEventListener('resize', () => this.onResize());
    },

    resetCamera() {
        this.camera.position.set(0, 8, -5);
        this.camera.lookAt(0, 0, 20);
    },

    createLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambient);

        // Main spotlight
        const mainLight = new THREE.SpotLight(0xffffff, 1);
        mainLight.position.set(0, 20, 20);
        mainLight.angle = Math.PI / 4;
        mainLight.penumbra = 0.3;
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        this.scene.add(mainLight);

        // Pin area light
        const pinLight = new THREE.PointLight(0xfeca57, 0.8, 30);
        pinLight.position.set(0, 10, this.LANE_LENGTH - 5);
        this.scene.add(pinLight);

        // Colored accent lights
        const leftLight = new THREE.PointLight(0xff6b6b, 0.3, 20);
        leftLight.position.set(-5, 5, 30);
        this.scene.add(leftLight);

        const rightLight = new THREE.PointLight(0x4ade80, 0.3, 20);
        rightLight.position.set(5, 5, 30);
        this.scene.add(rightLight);
    },

    createLane() {
        // Lane floor
        const laneGeo = new THREE.BoxGeometry(this.LANE_WIDTH, 0.2, this.LANE_LENGTH);
        const laneMat = new THREE.MeshStandardMaterial({
            color: 0xdeb887,
            roughness: 0.3,
            metalness: 0.1
        });
        this.lane = new THREE.Mesh(laneGeo, laneMat);
        this.lane.position.set(0, -0.1, this.LANE_LENGTH / 2);
        this.lane.receiveShadow = true;
        this.scene.add(this.lane);

        // Lane markings
        this.createLaneMarkings();

        // Gutters
        this.createGutters();

        // Pin deck
        const deckGeo = new THREE.BoxGeometry(this.LANE_WIDTH + 2, 0.2, 8);
        const deckMat = new THREE.MeshStandardMaterial({ color: 0xc4a574 });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.set(0, -0.1, this.LANE_LENGTH - 2);
        deck.receiveShadow = true;
        this.scene.add(deck);
    },

    createLaneMarkings() {
        const arrowMat = new THREE.MeshBasicMaterial({ color: 0x8b7355 });

        // Arrows
        for (let i = 0; i < 7; i++) {
            const x = (i - 3) * 0.5;
            const arrowGeo = new THREE.ConeGeometry(0.1, 0.3, 3);
            const arrow = new THREE.Mesh(arrowGeo, arrowMat);
            arrow.rotation.x = -Math.PI / 2;
            arrow.position.set(x, 0.01, 15);
            this.scene.add(arrow);
        }

        // Foul line
        const lineGeo = new THREE.BoxGeometry(this.LANE_WIDTH, 0.02, 0.1);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const foulLine = new THREE.Mesh(lineGeo, lineMat);
        foulLine.position.set(0, 0.01, 5);
        this.scene.add(foulLine);
    },

    createGutters() {
        const gutterGeo = new THREE.BoxGeometry(0.5, 0.3, this.LANE_LENGTH);
        const gutterMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
        });

        const leftGutter = new THREE.Mesh(gutterGeo, gutterMat);
        leftGutter.position.set(-this.LANE_WIDTH / 2 - 0.25, -0.15, this.LANE_LENGTH / 2);
        this.scene.add(leftGutter);

        const rightGutter = new THREE.Mesh(gutterGeo, gutterMat);
        rightGutter.position.set(this.LANE_WIDTH / 2 + 0.25, -0.15, this.LANE_LENGTH / 2);
        this.scene.add(rightGutter);
    },

    createEnvironment() {
        // Back wall
        const wallGeo = new THREE.BoxGeometry(20, 10, 0.5);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2a4a });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(0, 5, this.LANE_LENGTH + 2);
        this.scene.add(wall);

        // Floor
        const floorGeo = new THREE.PlaneGeometry(30, 80);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.9
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.2;
        floor.position.z = 30;
        floor.receiveShadow = true;
        this.scene.add(floor);
    },

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    render() {
        this.renderer.render(this.scene, this.camera);
    }
};
