const startButton = document.getElementById('startButton');
const bgMusic = document.getElementById('bgMusic');

startButton.addEventListener('click', () => {
    document.getElementById('startScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('startScreen').style.display = 'none';
        document.querySelector('.intro').style.display = 'flex';
        bgMusic.play();
        runIntro();
    }, 600);
});

function runIntro() {
    const words = document.querySelectorAll('.word');
    words.forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 1600);
    });

    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            init3D();
        }, 1500);
    }, 8500);
}

function init3D() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('scene3d').appendChild(renderer.domElement);

    // УПРАВЛЕНИЕ ПАЛЬЦЕМ
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true; // Сцена будет сама медленно крутиться
    controls.autoRotateSpeed = 0.5;

    // СЕРДЦЕ-ГАЛАКТИКА
    const heartGroup = new THREE.Group();
    const heartPoints = [];
    for (let i = 0; i < 6000; i++) {
        const t = Math.random() * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        const z = (Math.random() - 0.5) * 6;
        heartPoints.push(x * 0.7, y * 0.7, z * 0.7);
    }
    const heartGeom = new THREE.BufferGeometry();
    heartGeom.setAttribute('position', new THREE.Float32BufferAttribute(heartPoints, 3));
    const heartMat = new THREE.PointsMaterial({ color: 0xff0044, size: 0.18, blending: THREE.AdditiveBlending });
    heartGroup.add(new THREE.Points(heartGeom, heartMat));

    // ЗОЛОТОЕ КОЛЬЦО
    const ringPoints = [];
    for (let i = 0; i < 2500; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 18 + Math.random() * 4;
        ringPoints.push(Math.cos(a) * r, (Math.random() - 0.5) * 1.5, Math.sin(a) * r);
    }
    const ringGeom = new THREE.BufferGeometry();
    ringGeom.setAttribute('position', new THREE.Float32BufferAttribute(ringPoints, 3));
    const ringMat = new THREE.PointsMaterial({ color: 0xffcc00, size: 0.1 });
    const ring = new THREE.Points(ringGeom, ringMat);
    heartGroup.add(ring);
    scene.add(heartGroup);

    // 100 ФОТОГРАФИЙ (8 повторяющихся)
    const loader = new THREE.TextureLoader();
    const basePhotos = ["photos/photo1.jpg", "photos/photo2.jpg", "photos/photo3.jpg", "photos/photo4.jpg", "photos/photo5.jpg", "photos/photo6.jpg", "photos/photo7.jpg", "photos/photo8.jpg"];
    const meshes = [];

    for (let i = 0; i < 100; i++) {
        loader.load(basePhotos[i % 8], (tex) => {
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
            mesh.position.set((Math.random()-0.5)*100, (Math.random()-0.5)*60, (Math.random()-0.5)*100);
            mesh.userData = { a: Math.random()*10, s: 0.002 + Math.random()*0.003, r: 25 + Math.random()*20 };
            scene.add(mesh);
            meshes.push(mesh);
        });
    }

    camera.position.set(0, 10, 50);

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.001;
        
        heartGroup.rotation.y += 0.002;
        ring.rotation.y -= 0.005;

        meshes.forEach(m => {
            m.userData.a += m.userData.s;
            m.position.x = Math.cos(m.userData.a) * m.userData.r;
            m.position.z = Math.sin(m.userData.a) * m.userData.r;
            m.lookAt(0,0,0);
        });

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    setTimeout(() => { document.getElementById('finalTitle').style.opacity = '1'; }, 2000);
}

window.addEventListener('resize', () => { location.reload(); });
