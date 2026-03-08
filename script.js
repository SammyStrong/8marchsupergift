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
    // Пранк: кнопка убегает в случайную точку экрана
    const x = Math.random() * (window.innerWidth - btn.offsetWidth - 100);
    const y = Math.random() * (window.innerHeight - btn.offsetHeight - 100);
    btn.style.position = 'fixed';
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
    btn.style.zIndex = "2500";
}

// --- 2. ЗАПУСК И ИНТРО-ТЕКСТ ---
const startButton = document.getElementById('startButton');
const bgMusic = document.getElementById('bgMusic');

if (startButton) {
    startButton.addEventListener('click', () => {
        document.getElementById('startScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            // Показываем экран с текстом поздравления
            const intro = document.querySelector('.intro');
            intro.style.display = 'flex';
            
            // Запускаем музыку (если браузер не заблокирует)
            bgMusic.play().catch(() => console.log("Музыка ждет клика"));
            
            runIntroSequence();
        }, 1000);
    });
}

function runIntroSequence() {
    const words = document.querySelectorAll('.word');
    words.forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 1600);
    });

    // Через 8.5 секунд переходим к 3D сцене
    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            initCinematicPlanetScene();
        }, 1500);
    }, 8500);
}

// --- 3. ВЕЛИЧЕСТВЕННАЯ ПЛАНЕТА И СУПЕР-КОЛЬЦА ---
function initCinematicPlanetScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // Глубокий космический туман
    scene.fog = new THREE.FogExp2(0x000000, 0.005);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('scene3d').appendChild(renderer.domElement);

    // Контроллеры (будут включены после облета)
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false; 
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true; // Сцена будет сама медленно крутиться в конце
    controls.autoRotateSpeed = 0.3;
    controls.enablePan = false; // Запрет сдвигать планету с центра

    // Текстура сияющей искры (для всех частиц)
    const sparkTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');

    // 1. ОГРОМНАЯ ПЛАНЕТА-ШАР (Вместо сердца)
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const planetParticles = 25000; // Очень плотно
    const planetGeo = new THREE.BufferGeometry();
    const planetPos = [];
    const planetColors = [];
    const color = new THREE.Color();

    for (let i = 0; i < planetParticles; i++) {
        // Создаем плотный шар
        const k = Math.random() * Math.PI * 2;
        const u = Math.random() * 2 - 1;
        const r = 25; // Огромный радиус планеты
        
        planetPos.push(
            Math.sqrt(1 - u * u) * Math.cos(k) * r + (Math.random()-0.5)*2,
            Math.sqrt(1 - u * u) * Math.sin(k) * r + (Math.random()-0.5)*2,
            u * r + (Math.random()-0.5)*2
        );

        // Градиент цвета планеты (розово-красный)
        color.setHSL(0.95, 1.0, 0.5 + Math.random()*0.2);
        planetColors.push(color.r, color.g, color.b);
    }
    planetGeo.setAttribute('position', new THREE.Float32BufferAttribute(planetPos, 3));
    planetGeo.setAttribute('color', new THREE.Float32BufferAttribute(planetColors, 3));

    const planetMat = new THREE.PointsMaterial({
        size: 0.8,
        map: sparkTexture,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.9
    });
    const planetMesh = new THREE.Points(planetGeo, planetMat);
    planetGroup.add(planetMesh);

    // 2. ОГРОМНЫЕ И СВЕТЛЫЕ ТРЁХСЛОЙНЫЕ КОЛЬЦА (Мега-видимые)
    const createThickRing = (radius, width, count, size, color) => {
        const rPos = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * width;
            // Толстое кольцо (спред по Y)
            const y = (Math.random() - 0.5) * 1.5;
            rPos.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
        }
        const rGeo = new THREE.BufferGeometry();
        rGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
        const rMat = new THREE.PointsMaterial({
            color: color, // Чисто белый или золотистый
            size: size, // Большой размер для видимости
            map: sparkTexture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        });
        return new THREE.Points(rGeo, rMat);
    };

    // Делаем кольца супер-заметными
    const ring1 = createThickRing(50, 6, 20000, 0.4, 0xffffff); // Внутреннее, плотное, белое
    const ring2 = createThickRing(70, 8, 30000, 0.5, 0xffeeaa); // Среднее, самое толстое, кремовое
    const ring3 = createThickRing(95, 10, 15000, 0.3, 0xffffff); // Внешнее, тонкое, белое
    
    // Легкий наклон колец для объема
    ring1.rotation.x = Math.PI * 0.1;
    ring2.rotation.x = Math.PI * 0.12;
    ring3.rotation.x = Math.PI * 0.08;

    planetGroup.add(ring1, ring2, ring3);

    // 3. ФОТОГРАФИИ (100 ШТУК, по карусели)
    const photoLoader = new THREE.TextureLoader();
    const photoFiles = ["photos/photo1.jpg", "photos/photo2.jpg", "photos/photo3.jpg", "photos/photo4.jpg", "photos/photo5.jpg", "photos/photo6.jpg", "photos/photo7.jpg", "photos/photo8.jpg"];
    const photoMeshes = [];

    for (let i = 0; i < 100; i++) {
        photoLoader.load(photoFiles[i % 8], (tex) => {
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(7, 7), // Чуть больше
                new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
            );
            // Орбита строго по кольцу
            const angle = Math.random() * Math.PI * 2;
            const radius = 60 + Math.random() * 25; // Внутри колец
            const speed = 0.001 + Math.random() * 0.002;
            mesh.userData = { angle: angle, speed: speed, radius: radius };
            scene.add(mesh);
            photoMeshes.push(mesh);
        });
    }

    // --- ИСПРАВЛЕННАЯ КИНЕМАТОГРАФИЧЕСКАЯ КАМЕРА (Полный 360 облет) ---
    // Стартуем издалека, чтобы показать масштаб
    camera.position.set(0, 400, 800); 
    
    let cineTime = 0;
    const cineDuration = Math.PI * 2; // Время для полного круга
    let isCineActive = true;

    // СВЕТ (Для фона)
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // Звезды на фоне (чтобы космос не был пустым)
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for(let i=0; i<15000; i++) {
        starPos.push((Math.random()-0.5)*2000, (Math.random()-0.5)*1500, (Math.random()-0.5)*2000);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.8, transparent: true, opacity: 0.6})));


    // АНИМАЦИЯ (Главный цикл)
    function animateScene() {
        requestAnimationFrame(animateScene);
        const time = Date.now() * 0.001;

        // ЛОГИКА ОБЛЕТА КАМЕРЫ
        if (isCineActive) {
            cineTime += 0.004; // Скорость облета

            // Камера описывает величественную дугу вокруг планеты
            // Полный круг в плоскости XZ
            camera.position.x = Math.sin(cineTime * 2) * 250;
            camera.position.z = Math.cos(cineTime * 2) * 250;
            // Плавный спуск сверху вниз (от Y=150 до Y=30)
            camera.position.y = 150 * (1 - cineTime/cineDuration) + 30;
            
            camera.lookAt(0, 0, 0); // Камера всегда смотрит на планету

            // Проверка завершения облета
            if (cineTime >= cineDuration) {
                isCineActive = false;
                controls.enabled = true; // Включаем палец в конце
                camera.position.set(0, 50, 180); // Встаем на финальную позицию
                camera.lookAt(0, 0, 0);
                showFinalOverlayTexts(); // Показываем тексты "Принцесска"
            }
        }

        // Вращение объектов
        planetMesh.rotation.y += 0.001;
        planetMesh.rotation.z += Math.sin(time)*0.0002; // Легкое покачивание
        
        // Кольца крутятся в разные стороны
        ring1.rotation.y += 0.006;
        ring2.rotation.y -= 0.003;
        ring3.rotation.y += 0.002;

        // Полет фотографий
        photoMeshes.forEach(m => {
            const data = m.userData;
            data.angle += data.speed;
            m.position.x = Math.cos(data.angle) * data.radius;
            m.position.z = Math.sin(data.angle) * data.radius;
            m.position.y = Math.sin(data.angle * 2) * 2; // Легкая волна
            m.lookAt(0, 0, 0); // Всегда смотрят в центр
        });

        controls.update();
        renderer.render(scene, camera);
    }

    // ЛОГИКА СМЕНЫ ТЕКСТА
    function showFinalOverlayTexts() {
        const wishText = document.getElementById('wishText');
        const finalTitle = document.getElementById('finalTitle');

        // 1. Сначала плавно всплывает пожелание про Принцесску
        wishText.style.opacity = '1';
        wishText.style.transform = 'scale(1) translateY(0)';

        // 2. Через 5 секунд оно исчезает и меняется на финал
        setTimeout(() => {
            wishText.style.opacity = '0';
            wishText.style.transform = 'scale(0.8) translateY(-15px)';
            
            setTimeout(() => {
                finalTitle.style.opacity = '1';
                finalTitle.style.transform = 'scale(1.1) translateY(0)';
            }, 1800); // Небольшая пауза между сменой

        }, 5500);
    }

    animateScene();
}

// Изменение размера окна
window.addEventListener('resize', () => { location.reload(); });
