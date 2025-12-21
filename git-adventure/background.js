// Three.js Background - Git commit graph visualization
let scene, camera, renderer;
const commits = [];
const branches = [];

function initBackground() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    createCommits();
    createBranches();
    animateBackground();
}

function createCommits() {
    const colors = [0x3fb950, 0x58a6ff, 0xa371f7, 0xf85149];

    for (let i = 0; i < 40; i++) {
        const geometry = new THREE.OctahedronGeometry(0.5, 0);
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            wireframe: true
        });
        const commit = new THREE.Mesh(geometry, material);

        commit.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 20
        );
        commit.userData = {
            vx: (Math.random() - 0.5) * 0.03,
            vy: -0.02 - Math.random() * 0.02,
            rotSpeed: (Math.random() - 0.5) * 0.02
        };
        commits.push(commit);
        scene.add(commit);
    }
}

function createBranches() {
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x30363d,
        transparent: true,
        opacity: 0.3
    });

    for (let i = 0; i < 8; i++) {
        const points = [];
        const x = (i - 4) * 12;
        for (let y = -40; y < 40; y += 5) {
            points.push(new THREE.Vector3(x + Math.sin(y * 0.1) * 3, y, -10));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        branches.push(line);
        scene.add(line);
    }
}

function animateBackground() {
    requestAnimationFrame(animateBackground);

    commits.forEach(commit => {
        commit.position.y += commit.userData.vy;
        commit.position.x += commit.userData.vx;
        commit.rotation.x += commit.userData.rotSpeed;
        commit.rotation.y += commit.userData.rotSpeed;

        // Reset when off screen
        if (commit.position.y < -35) {
            commit.position.y = 35;
            commit.position.x = (Math.random() - 0.5) * 100;
        }
    });

    renderer.render(scene, camera);
}

function flashCommits() {
    commits.forEach(c => {
        c.material.color.setHex(0xffffff);
        setTimeout(() => {
            const colors = [0x3fb950, 0x58a6ff, 0xa371f7];
            c.material.color.setHex(colors[Math.floor(Math.random() * 3)]);
        }, 150);
    });
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
