// Функция переключения между вопросами
function nextStep(stepNumber) {
    // Скрываем все шаги
    document.querySelectorAll('.step').forEach(step => {
        step.style.display = 'none';
    });
    // Показываем нужный шаг
    const next = document.getElementById('step' + stepNumber);
    if (next) {
        next.style.display = 'flex';
        next.classList.add('active'); // для анимации из CSS
    }
}

// Пранк: Кнопка "Не хочу" убегает от пальца/мышки
function moveButton() {
    const btn = document.getElementById('noBtn');
    // Случайные координаты
    const x = Math.random() * (window.innerWidth - btn.offsetWidth - 50);
    const y = Math.random() * (window.innerHeight - btn.offsetHeight - 50);
    
    btn.style.position = 'fixed';
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
}

// ОСТАЛЬНОЙ ТВОЙ КОД (Который запускает 3D сцену)
const startButton = document.getElementById('startButton');
const bgMusic = document.getElementById('bgMusic');

if (startButton) {
    startButton.addEventListener('click', () => {
        document.getElementById('startScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            document.querySelector('.intro').style.display = 'flex';
            bgMusic.play();
            runIntro(); // Твоя функция с текстом "Аиша Жарылкас"
        }, 600);
    });
}
// Финальный код для Аиши. Реалистичное сердце и золото.
const startButton = document.getElementById('startButton');
const bgMusic = document.getElementById('bgMusic');

// Загрузка
startButton.addEventListener('click', () => {
    document.getElementById('startScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('startScreen').style.display = 'none';
        document.querySelector('.intro').style.display = 'flex';
        // Если музыка не играет сразу, это защита браузера, она заиграет при клике
        bgMusic.play().catch(() => console.log("Музыка ждет клика"));
        runIntro();
    }, 600);
});

// Анимация текста
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
    }, 8500); // 8.5 секунд на текст
}

// ОСНОВНАЯ 3D СЦЕНА
function init3D() {
    const scene = new THREE.Scene();
    // Глубокий черный туман для масштаба
    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Оптимизация для ретины
    // Режим, необходимый для сияния (Bloom)
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('scene3d').appendChild(renderer.domElement);

    // УПРАВЛЕНИЕ ПАЛЬЦЕМ
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true; // Сцена сама медленно крутится
    controls.autoRotateSpeed = 0.4;
    controls.enablePan = false; // Запрет сдвигать сердце с центра

    // СВЕТ (Критично для реализма)
    const ambientLight = new THREE.AmbientLight(0x111111); // Общий полумрак
    scene.add(ambientLight);

    // Центральное розовое свечение сердца
    const coreLight = new THREE.PointLight(0xff4b8a, 10, 50);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // Золотой свет от кольца
    const ringLight = new THREE.PointLight(0xffaa00, 5, 60);
    ringLight.position.set(20, 0, 0);
    scene.add(ringLight);

    // 1. УЛУЧШЕННОЕ СЕРДЦЕ-ГАЛАКТИКА (Объемная туманность)
    const heartGroup = new THREE.Group();
    const heartParticles = 9000;
    const heartGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    // Используем сияющую текстуру-сферу для каждой частицы
    const particleTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');

    for (let i = 0; i < heartParticles; i++) {
        const t = Math.random() * Math.PI * 2;
        // Формула сердца
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        let z = (Math.random() - 0.5) * 6; // Толщина
        
        // Масштаб и шум для "пушистости"
        const scale = 0.8;
        const noise = (Math.random() - 0.5) * 1.5;
        positions.push((x + noise) * scale, (y + noise) * scale, z * scale);

        // Распределение цвета (от белого в центре к розовому по краям)
        const dist = Math.sqrt(x*x + y*y);
        if (dist < 10) { colors.push(1, 0.8, 0.9); } // Бело-розовый центр
        else { colors.push(1, 0.2, 0.5); } // Ярко-розовые края

        sizes.push(0.3 + Math.random() * 0.4); // Разные размеры частиц
    }

    heartGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    heartGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    heartGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Настоящий Шейдерный материал для сияния
    const heartMaterial = new THREE.PointsMaterial({
        size: 0.6,
        map: particleTexture,
        vertexColors: true,
        blending: THREE.AdditiveBlending, // Критично для Glow
        transparent: true,
        depthWrite: false, // Чтобы частицы не перекрывали друг друга черным
        opacity: 0.8
    });

    const heart = new THREE.Points(heartGeometry, heartMaterial);
    heartGroup.add(heart);

    // 2. УЛУЧШЕННОЕ КОЛЬЦО (Золотой вихрь Сатурна)
    const ringCount = 4000;
    const ringGeometry = new THREE.BufferGeometry();
    const ringPos = [];
    
    for (let i = 0; i < ringCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const baseR = 20; // Базовый радиус
        const width = Math.random() * 6; // Ширина кольца
        const r = baseR + width;
        // Кольцо не плоское, а имеет легкий изгиб по Y
        const y = Math.sin(a * 3) * 1.2 + (Math.random() - 0.5) * 1;
        ringPos.push(Math.cos(a) * r, y, Math.sin(a) * r);
    }
    ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ringPos, 3));

    const ringMaterial = new THREE.PointsMaterial({
        color: 0xffaa00, // Чистое золото
        size: 0.15,
        map: particleTexture, // Свечение
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
    });
    const ring = new THREE.Points(ringGeometry, ringMaterial);
    heartGroup.add(ring);
    scene.add(heartGroup);

    // 3. ФОТОГРАФИИ (100 штук) - оставляем как было, они выглядят хорошо
    const photoLoader = new THREE.TextureLoader();
    const basePhotos = ["photos/photo1.jpg", "photos/photo2.jpg", "photos/photo3.jpg", "photos/photo4.jpg", "photos/photo5.jpg", "photos/photo6.jpg", "photos/photo7.jpg", "photos/photo8.jpg"];
    const photoMeshes = [];

    for (let i = 0; i < 100; i++) {
        // Загружаем по кругу 8 фото
        photoLoader.load(basePhotos[i % 8], (tex) => {
            const mat = new THREE.MeshStandardMaterial({ // Используем Standard для реакции на свет
                map: tex, 
                side: THREE.DoubleSide, 
                metalness: 0.3,
                roughness: 0.5
            });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), mat); // Чуть больше
            
            // Расбрасываем в пространстве
            mesh.position.set((Math.random()-0.5)*120, (Math.random()-0.5)*70, (Math.random()-0.5)*120);
            
            // Запоминаем данные для орбиты
            mesh.userData = {
                a: Math.random() * 10,
                s: 0.001 + Math.random() * 0.003, // Разная скорость
                r: 30 + Math.random() * 30, // Разные орбиты
                dy: (Math.random()-0.5) * 0.1 // Легкое движение по Y
            };
            
            scene.add(mesh);
            photoMeshes.push(mesh);
        });
    }

    camera.position.set(0, 15, 70); // Начинаем чуть дальше для влета

    // АНИМАЦИЯ
    function animate() {
        requestAnimationFrame(animate);
        
        // Вращение сердца и кольца (они не синхронны)
        heartGroup.rotation.y += 0.0015;
        ring.rotation.y -= 0.003;
        ring.rotation.x = Math.sin(Date.now()*0.0001) * 0.1; // Кольцо немного "дышит"

        // Движение фотографий
        photoMeshes.forEach(m => {
            const d = m.userData;
            d.a += d.s;
            m.position.x = Math.cos(d.a) * d.r;
            m.position.z = Math.sin(d.a) * d.r;
            m.position.y += Math.sin(d.a * 2) * 0.01;
            m.lookAt(0,0,0);
        });

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Финальный текст
    setTimeout(() => {
        document.getElementById('finalTitle').style.opacity = '1';
        document.getElementById('finalTitle').style.transform = 'scale(1.1)';
    }, 2000);
}

// Реакция на изменение размера окна
window.addEventListener('resize', () => { location.reload(); });

