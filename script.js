// --- 1. ЛОГИКА ОПРОСА (Оставляем без изменений) ---
function nextStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.style.display = 'none';
        step.classList.remove('active');
    });
    const next = document.getElementById('step' + stepNumber);
    if (next) {
        next.style.display = 'flex';
        next.classList.add('active');
    }
}

function moveButton() {
    const btn = document.getElementById('noBtn');
    const x = Math.random() * (window.innerWidth - btn.offsetWidth - 100);
    const y = Math.random() * (window.innerHeight - btn.offsetHeight - 100);
    btn.style.position = 'fixed';
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
}

// --- 2. ЗАПУСК ---
const startButton = document.getElementById('startButton');
const bgMusic = document.getElementById('bgMusic');

startButton.addEventListener('click', () => {
    document.getElementById('startScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('startScreen').style.display = 'none';
        document.querySelector('.intro').style.display = 'flex';
        bgMusic.play().catch(() => console.log("Music play"));
        runIntroSequence();
    }, 1000);
});

function runIntroSequence() {
    const words = document.querySelectorAll('.word');
    words.forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 1600);
    });
    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            initMegaUniverse();
        }, 1500);
    }, 8500);
}

// --- 3. ГИГАНТСКАЯ ВСЕЛЕННАЯ ---
function initMegaUniverse() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0002); // Туман реже, так как объекты огромные

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('scene3d').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    const spark = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');

    // 1. ГИГАНТСКАЯ ПЛАНЕТА (Радиус 500)
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const planetGeo = new THREE.BufferGeometry();
    const planetPos = [];
    for (let i = 0; i < 40000; i++) {
        const k = Math.random() * Math.PI * 2;
        const u = Math.random() * 2 - 1;
        const r = 500; 
        planetPos.push(
            Math.sqrt(1 - u * u) * Math.cos(k) * r + (Math.random()-0.5)*15,
            Math.sqrt(1 - u * u) * Math.sin(k) * r + (Math.random()-0.5)*15,
            u * r + (Math.random()-0.5)*15
        );
    }
    planetGeo.setAttribute('position', new THREE.Float32BufferAttribute(planetPos, 3));
    const planetMat = new THREE.PointsMaterial({ color: 0xff0066, size: 8, map: spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
    planetGroup.add(new THREE.Points(planetGeo, planetMat));

    // 2. ГОРИЗОНТАЛЬНЫЕ МЕГА-КОЛЬЦА (Белые и широкие)
    const createMegaRing = (radius, width, count, size) => {
        const rPos = [];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * width;
            rPos.push(Math.cos(a) * r, (Math.random() - 0.5) * 10, Math.sin(a) * r);
        }
        const rGeo = new THREE.BufferGeometry();
        rGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
        return new THREE.Points(rGeo, new THREE.PointsMaterial({ color: 0xffffff, size: size, map: spark, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 }));
    };

    const ring1 = createMegaRing(1200, 150, 40000, 4); // Внутреннее
    const ring2 = createMegaRing(1600, 250, 60000, 5); // Среднее (самое мощное)
    const ring3 = createMegaRing(2100, 300, 30000, 3); // Внешнее
    planetGroup.add(ring1, ring2, ring3);

    // 3. ОБЛАКО ИЗ 300 ФОТО
    const photoFiles = ["photos/photo1.jpg", "photos/photo2.jpg", "photos/photo3.jpg", "photos/photo4.jpg", "photos/photo5.jpg", "photos/photo6.jpg", "photos/photo7.jpg", "photos/photo8.jpg"];
    const photoMeshes = [];
    const loader = new THREE.TextureLoader();

    for (let i = 0; i < 300; i++) {
        loader.load(photoFiles[i % 8], (tex) => {
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
            const angle = Math.random() * Math.PI * 2;
            const radius = 800 + Math.random() * 1200;
            mesh.userData = { angle: angle, speed: 0.0005 + Math.random() * 0.001, radius: radius, yOff: (Math.random()-0.5)*200 };
            scene.add(mesh);
            photoMeshes.push(mesh);
        });
    }

    // --- ИСПРАВЛЕННАЯ КАМЕРА (Близкий облет 360) ---
    camera.position.set(0, 800, 2500); // Стартовая точка
    let cineTime = 0;
    let isCineActive = true;

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.001;

        if (isCineActive) {
            cineTime += 0.003; 
            // Камера крутится вокруг, пролетая над кольцами
            camera.position.x = Math.sin(cineTime * 1.5) * 2200;
            camera.position.z = Math.cos(cineTime * 1.5) * 2200;
            camera.position.y = 600 + Math.sin(cineTime) * 400; 
            camera.lookAt(0, 0, 0);

            if (cineTime > Math.PI * 1.4) { // После круга останавливаемся
                isCineActive = false;
                controls.enabled = true;
                showFinalTexts();
            }
        }

        planetGroup.rotation.y += 0.001;
        ring1.rotation.y += 0.003;
        ring2.rotation.y -= 0.001;
        ring3.rotation.y += 0.0005;

        photoMeshes.forEach(m => {
            m.userData.angle += m.userData.speed;
            m.position.x = Math.cos(m.userData.angle) * m.userData.radius;
            m.position.z = Math.sin(m.userData.angle) * m.userData.radius;
            m.position.y = m.userData.yOff + Math.sin(time + m.userData.angle) * 50;
            m.lookAt(0, 0, 0);
        });

        controls.update();
        renderer.render(scene, camera);
    }

    function showFinalTexts() {
        document.getElementById('wishText').style.opacity = '1';
        setTimeout(() => {
            document.getElementById('wishText').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('finalTitle').style.opacity = '1';
            }, 1500);
        }, 5000);
    }

    animate();
}

window.addEventListener('resize', () => { location.reload(); });
