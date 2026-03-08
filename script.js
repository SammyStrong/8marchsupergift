// --- 1. ЛОГИКА ПРАНК-ОПРОСА ---

function nextStep(stepNumber) {
    // Скрываем текущий активный шаг
    document.querySelectorAll('.step').forEach(step => {
        step.style.display = 'none';
        step.classList.remove('active');
    });
    // Показываем следующий
    const next = document.getElementById('step' + stepNumber);
    if (next) {
        next.style.display = 'flex';
        next.classList.add('active');
    }
}

// Функция для убегающей кнопки "Не хочу"
function moveButton() {
    const btn = document.getElementById('noBtn');
    // Случайные координаты в пределах экрана (с отступом)
    const x = Math.random() * (window.innerWidth - btn.offsetWidth - 100);
    const y = Math.random() * (window.innerHeight - btn.offsetHeight - 100);
    
    btn.style.position = 'fixed';
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
    btn.style.zIndex = "1001";
}

// --- 2. ЗАПУСК ОСНОВНОЙ АНИМАЦИИ ---

const startButton = document.getElementById('startButton');
const bgMusic = document.getElementById('bgMusic');

if (startButton) {
    startButton.addEventListener('click', () => {
        // Убираем стартовый экран
        document.getElementById('startScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            // Показываем экран с текстом "Аиша Жарылкас"
            const intro = document.querySelector('.intro');
            intro.style.display = 'flex';
            
            // Запускаем музыку
            bgMusic.play().catch(() => console.log("Музыка ждет клика"));
            
            runIntroSequence();
        }, 600);
    });
}

function runIntroSequence() {
    const words = document.querySelectorAll('.word');
    words.forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 1600);
    });

    // Через 8.5 секунд переходим к 3D сердцу
    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            init3DScene();
        }, 1500);
    }, 8500);
}

// --- 3. РЕАЛИСТИЧНОЕ 3D СЕРДЦЕ И КОСМОС ---

function init3DScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('scene3d').appendChild(renderer.domElement);

    // Контроллеры для вращения пальцем
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = false;

    // СВЕТ
    const pLight = new THREE.PointLight(0xff4b8a, 5, 100);
    scene.add(pLight);
    scene.add(new THREE.AmbientLight(0x222222));

    // СОЗДАНИЕ СЕРДЦА
    const heartGroup = new THREE.Group();
    const heartGeo = new THREE.BufferGeometry();
    const heartPos = [];
    const heartSizes = [];
    
    // Текстура сияющей точки
    const spark = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');

    for (let i = 0; i < 8000; i++) {
        const t = Math.random() * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        const z = (Math.random() - 0.5) * 8;
        const noise = (Math.random() - 0.5) * 2;
        heartPos.push((x + noise) * 0.6, (y + noise) * 0.6, z * 0.6);
        heartSizes.push(Math.random() * 0.5);
    }
    heartGeo.setAttribute('position', new THREE.Float32BufferAttribute(heartPos, 3));
    
    const heartMat = new THREE.PointsMaterial({
        color: 0xff0044,
        size: 0.4,
        map: spark,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });
    const heart = new THREE.Points(heartGeo, heartMat);
    heartGroup.add(heart);

    // ЗОЛОТОЕ КОЛЬЦО
    const ringGeo = new THREE.BufferGeometry();
    const ringPos = [];
    for (let i = 0; i < 3500; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 20 + Math.random() * 5;
        ringPos.push(Math.cos(a) * r, (Math.random() - 0.5) * 1.5, Math.sin(a) * r);
    }
    ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(ringPos, 3));
    const ringMat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.15, map: spark, blending: THREE.AdditiveBlending, transparent: true });
    const ring = new THREE.Points(ringGeo, ringMat);
    heartGroup.add(ring);
    scene.add(heartGroup);

    // 100 ФОТОГРАФИЙ (из 8 файлов)
    const loader = new THREE.TextureLoader();
    const photoFiles = ["photos/photo1.jpg", "photos/photo2.jpg", "photos/photo3.jpg", "photos/photo4.jpg", "photos/photo5.jpg", "photos/photo6.jpg", "photos/photo7.jpg", "photos/photo8.jpg"];
    const photoMeshes = [];

    for (let i = 0; i < 100; i++) {
        loader.load(photoFiles[i % 8], (tex) => {
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
            mesh.position.set((Math.random()-0.5)*120, (Math.random()-0.5)*80, (Math.random()-0.5)*120);
            mesh.userData = { a: Math.random()*10, s: 0.002 + Math.random()*0.004, r: 30 + Math.random()*30 };
            scene.add(mesh);
            photoMeshes.push(mesh);
        });
    }

    camera.position.set(0, 10, 70);

    function animate() {
        requestAnimationFrame(animate);
        heartGroup.rotation.y += 0.002;
        ring.rotation.y -= 0.004;

        photoMeshes.forEach(m => {
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
