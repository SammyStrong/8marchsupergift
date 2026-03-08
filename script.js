// --- 1. ЛОГИКА ОПРОСА ---
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

// --- 2. ЗАПУСК И ИНТРО ---
const startButton = document.getElementById('startButton');
const bgMusic = document.getElementById('bgMusic');

startButton.addEventListener('click', () => {
    document.getElementById('startScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('startScreen').style.display = 'none';
        document.querySelector('.intro').style.display = 'flex';
        bgMusic.play().catch(() => console.log("Music ready"));
        runIntroText();
    }, 1000);
});

function runIntroText() {
    const words = document.querySelectorAll('.word');
    words.forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 1600);
    });

    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            initCinematicScene();
        }, 1500);
    }, 8500);
}

// --- 3. КИНЕМАТОГРАФИЧНОЕ 3D ---
function initCinematicScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.008);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('scene3d').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false; // Отключаем до конца анимации облета
    controls.enableDamping = true;

    // Звезды на фоне
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for(let i=0; i<10000; i++) {
        starPos.push((Math.random()-0.5)*1500, (Math.random()-0.5)*1500, (Math.random()-0.5)*1500);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(starGeo, starMat));

    // ГРУППА ГАЛАКТИКИ
    const galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    // СЕРДЦЕ (Большое и яркое)
    const heartPoints = [];
    for (let i = 0; i < 12000; i++) {
        const t = Math.random() * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        const z = (Math.random() - 0.5) * 10;
        heartPoints.push(x * 1.2, y * 1.2, z * 1.2);
    }
    const heartGeo = new THREE.BufferGeometry();
    heartGeo.setAttribute('position', new THREE.Float32BufferAttribute(heartPoints, 3));
    const spark = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');
    const heartMat = new THREE.PointsMaterial({ color: 0xff0055, size: 0.6, map: spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
    const heartPointsMesh = new THREE.Points(heartGeo, heartMat);
    galaxyGroup.add(heartPointsMesh);

    // ТРИ БЕЛЫХ КОЛЬЦА
    const createRing = (radius, count, size) => {
        const rPos = [];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * 4;
            rPos.push(Math.cos(a) * r, (Math.random() - 0.5) * 0.5, Math.sin(a) * r);
        }
        const rGeo = new THREE.BufferGeometry();
        rGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
        const rMat = new THREE.PointsMaterial({ color: 0xffffff, size: size, map: spark, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 });
        return new THREE.Points(rGeo, rMat);
    };

    const ring1 = createRing(35, 4000, 0.2); // Внутреннее
    const ring2 = createRing(50, 6000, 0.25); // Среднее
    const ring3 = createRing(65, 3000, 0.15); // Внешнее
    galaxyGroup.add(ring1, ring2, ring3);

    // ФОТОГРАФИИ (Карусель по кольцу)
    const photoFiles = ["photos/photo1.jpg", "photos/photo2.jpg", "photos/photo3.jpg", "photos/photo4.jpg", "photos/photo5.jpg", "photos/photo6.jpg", "photos/photo7.jpg", "photos/photo8.jpg"];
    const photoMeshes = [];
    const loader = new THREE.TextureLoader();

    for (let i = 0; i < 100; i++) {
        loader.load(photoFiles[i % 8], (tex) => {
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
            const angle = Math.random() * Math.PI * 2;
            const radius = 45 + Math.random() * 10;
            mesh.userData = { angle: angle, speed: 0.002 + Math.random() * 0.002, radius: radius };
            scene.add(mesh);
            photoMeshes.push(mesh);
        });
    }

    // --- КИНЕМАТОГРАФИЧЕСКАЯ КАМЕРА ---
    camera.position.set(0, 300, 500); // Стартовая позиция в космосе
    let cineTime = 0;
    let isCineActive = true;

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.001;

        if (isCineActive) {
            cineTime += 0.005;
            // Облет 360 сверху вниз
            camera.position.x = Math.sin(cineTime * 2) * 150;
            camera.position.z = Math.cos(cineTime * 2) * 150;
            camera.position.y = Math.cos(cineTime) * 80;
            camera.lookAt(0, 0, 0);

            if (cineTime > Math.PI) {
                isCineActive = false;
                controls.enabled = true;
                // Вспышка колец
                ring1.material.size = 1.5;
                ring2.material.size = 1.5;
                setTimeout(() => {
                    ring1.material.size = 0.2;
                    ring2.material.size = 0.25;
                    showFinalTexts();
                }, 1000);
            }
        }

        // Анимация объектов
        heartPointsMesh.rotation.y += 0.002;
        ring1.rotation.y += 0.008;
        ring2.rotation.y -= 0.005;
        ring3.rotation.y += 0.003;

        photoMeshes.forEach(m => {
            m.userData.angle += m.userData.speed;
            m.position.x = Math.cos(m.userData.angle) * m.userData.radius;
            m.position.z = Math.sin(m.userData.angle) * m.userData.radius;
            m.position.y = Math.sin(time + m.userData.angle) * 2; // Легкая волна
            m.lookAt(0, 0, 0);
        });

        controls.update();
        renderer.render(scene, camera);
    }

    function showFinalTexts() {
        const wish = document.getElementById('wishText');
        const final = document.getElementById('finalTitle');

        wish.style.opacity = '1';
        wish.style.transform = 'scale(1)';

        setTimeout(() => {
            wish.style.opacity = '0';
            wish.style.transform = 'scale(0.8)';
            setTimeout(() => {
                final.style.opacity = '1';
                final.style.transform = 'scale(1.1)';
            }, 1500);
        }, 5000);
    }

    animate();
}

window.addEventListener('resize', () => { location.reload(); });
