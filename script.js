// Переход между шагами опроса
function nextStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');
}

// Улучшенная функция "убегающей" кнопки
function moveButton(event) {
    if (event) {
        event.preventDefault(); // Полная блокировка стандартного действия
        event.stopPropagation();
    }
    
    const b = document.getElementById('noBtn');
    
    // Рассчитываем координаты, чтобы кнопка не выходила за границы экрана
    // Вычитаем размеры кнопки (примерно 120x50), чтобы она не пряталась за край
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 50;
    
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    
    b.style.position = 'fixed';
    b.style.left = x + 'px';
    b.style.top = y + 'px';
}

// Назначаем обработчики для кнопки "Не хочу" сразу после загрузки
document.addEventListener('DOMContentLoaded', () => {
    const noBtn = document.getElementById('noBtn');
    if (noBtn) {
        // Убегает при наведении мышки
        noBtn.addEventListener('mouseover', moveButton);
        // Убегает при попытке нажать (на мобилках)
        noBtn.addEventListener('touchstart', moveButton);
        // Если вдруг клик всё же прошел — предотвращаем его
        noBtn.addEventListener('click', (e) => {
            e.preventDefault();
            moveButton(e);
        });
    }
});

const startBtn = document.getElementById('startButton');
const music = document.getElementById('bgMusic');

if (startBtn) {
    startBtn.onclick = () => {
        document.getElementById('startScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            document.querySelector('.intro').style.display = 'flex';
            music.play().catch(() => {
                console.log("Автовоспроизведение заблокировано браузером");
            });
            runIntro();
        }, 1000);
    };
}

function runIntro() {
    const ws = document.querySelectorAll('.word');
    ws.forEach((w, i) => setTimeout(() => w.classList.add('visible'), i * 1600));
    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            initFullGalaxy();
        }, 1200);
    }, 8500);
}

function initFullGalaxy() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a000a, 0.0002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 20000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    document.getElementById('scene3d').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // СВЕТ
    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    const loader = new THREE.TextureLoader();
    const spark = loader.load('https://threejs.org/examples/textures/sprites/spark1.png');

    // ФОНОВЫЕ ЗВЕЗДЫ
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < 15000; i++) {
        starPos.push((Math.random() - 0.5) * 12000, (Math.random() - 0.5) * 8000, (Math.random() - 0.5) * 12000);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 5, map: spark, transparent: true })));

    const group = new THREE.Group();
    scene.add(group);

    // ПЛАНЕТА
    const pGeo = new THREE.BufferGeometry();
    const pPos = [];
    for (let i = 0; i < 15000; i++) {
        const k = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, r = 450;
        pPos.push(Math.sqrt(1 - u * u) * Math.cos(k) * r, Math.sqrt(1 - u * u) * Math.sin(k) * r, u * r);
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xff0066, size: 18, map: spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));

    // КОЛЬЦА
    const createRing = (radius, width, count, size, color) => {
        const pos = [];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * width;
            pos.push(Math.cos(a) * r, (Math.random() - 0.5) * 15, Math.sin(a) * r);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({ color: color, size: size, map: spark, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 }));
    };

    group.add(createRing(800, 100, 15000, 10, 0xffffff));
    group.add(createRing(1000, 150, 20000, 12, 0xffffff));
    group.add(createRing(1300, 250, 25000, 14, 0xffffff));

    // ФОТОГРАФИИ (100 штук)
    const imgs = ["photos/photo1.jpg", "photos/photo2.jpg", "photos/photo3.jpg", "photos/photo4.jpg", "photos/photo5.jpg", "photos/photo6.jpg", "photos/photo7.jpg", "photos/photo8.jpg"];
    const phs = [];
    for (let i = 0; i < 100; i++) {
        loader.load(imgs[i % 8], (t) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshBasicMaterial({ map: t, side: 2, transparent: true, opacity: 0.95 }));
            const a = Math.random() * Math.PI * 2;
            const r = 850 + Math.random() * 1500;
            m.userData = { a: a, s: 0.0015 + Math.random() * 0.002, r: r, y: (Math.random() - 0.5) * 500 };
            scene.add(m);
            phs.push(m);
        });
    }

    camera.position.set(0, 1500, 3500);
    let cTime = 0, isCine = true;
    const targetPos = new THREE.Vector3(0, 600, 2200);

    function anim() {
        requestAnimationFrame(anim);
        const t = Date.now() * 0.001;

        if (isCine) {
            cTime += 0.015;
            if (cTime > Math.PI * 1.3) {
                camera.position.lerp(targetPos, 0.07);
                if (camera.position.distanceTo(targetPos) < 30) {
                    isCine = false;
                    controls.enabled = true;
                    controls.target.set(0, 0, 0);
                    showT();
                }
            } else {
                camera.position.set(Math.sin(cTime) * 2500, 1000, Math.cos(cTime) * 2500);
            }
            camera.lookAt(0, 0, 0);
        }

        group.rotation.y += 0.002;
        phs.forEach(m => {
            m.userData.a += m.userData.s;
            m.position.set(Math.cos(m.userData.a) * m.userData.r, m.userData.y + Math.sin(t + m.userData.a) * 50, Math.sin(m.userData.a) * m.userData.r);
            m.lookAt(camera.position);
        });

        controls.update();
        renderer.render(scene, camera);
    }

    function showT() {
        const wish = document.getElementById('wishText');
        if (wish) wish.style.opacity = '1';
        setTimeout(() => {
            if (wish) wish.style.opacity = '0';
            const final = document.getElementById('finalTitle');
            setTimeout(() => { if (final) final.style.opacity = '1'; }, 1200);
        }, 5000);
    }
    anim();
}

window.addEventListener('resize', () => {
    location.reload();
});
