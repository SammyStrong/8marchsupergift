// --- 1. ЛОГИКА ПРАНК-ОПРОСА ---
function nextStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const next = document.getElementById('step' + n);
    if (next) next.classList.add('active');
}

function moveButton() {
    const b = document.getElementById('noBtn');
    // Кнопка "Не хочу" убегает от пальца
    b.style.position = 'fixed';
    b.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    b.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    b.style.zIndex = "2500";
}

// --- 2. ЗАПУСК И ПЕРЕХОДЫ ---
const startBtn = document.getElementById('startButton');
const music = document.getElementById('bgMusic');

if (startBtn) {
    startBtn.onclick = () => {
        document.getElementById('startScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            const intro = document.querySelector('.intro');
            intro.style.display = 'flex';
            music.play().catch(() => console.log("Музыка ждет взаимодействия"));
            runIntroSequence();
        }, 1000);
    };
}

function runIntroSequence() {
    const words = document.querySelectorAll('.word');
    words.forEach((w, i) => {
        setTimeout(() => w.classList.add('visible'), i * 1500);
    });

    // Через 8 секунд уходим в космос
    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            initMegaUniverse();
        }, 1200);
    }, 8000);
}

// --- 3. ГАЛАКТИКА (БЫСТРАЯ И ЯРКАЯ) ---
function initMegaUniverse() {
    const scene = new THREE.Scene();
    // Темно-фиолетовый туман для глубины без потери яркости
    scene.fog = new THREE.FogExp2(0x050005, 0.0003);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1); // Оптимизация для мобильных (убирает лаги)
    document.getElementById('scene3d').innerHTML = ""; 
    document.getElementById('scene3d').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false; // Выключен до конца облета
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    const loader = new THREE.TextureLoader();
    const spark = loader.load('https://threejs.org/examples/textures/sprites/spark1.png');

    // ЯРКИЕ ЗВЕЗДЫ НА ФОНЕ
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for(let i=0; i<10000; i++) {
        starPos.push((Math.random()-0.5)*6000, (Math.random()-0.5)*4000, (Math.random()-0.5)*6000);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 4, map: spark, transparent: true, opacity: 0.9});
    scene.add(new THREE.Points(starGeo, starMat));

    const group = new THREE.Group();
    scene.add(group);

    // ГИГАНТСКАЯ ПЛАНЕТА (Самосветящаяся)
    const pGeo = new THREE.BufferGeometry();
    const pPos = [];
    for (let i = 0; i < 12000; i++) {
        const k = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, r = 450;
        pPos.push(Math.sqrt(1 - u * u) * Math.cos(k) * r, Math.sqrt(1 - u * u) * Math.sin(k) * r, u * r);
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({color: 0xff0066, size: 16, map: spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false});
    group.add(new THREE.Points(pGeo, pMat));

    // ТОЛСТЫЕ ГОРИЗОНТАЛЬНЫЕ КОЛЬЦА
    const createRing = (radius, width, count, size, col) => {
        const pos = [];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * width;
            pos.push(Math.cos(a) * r, (Math.random() - 0.5) * 8, Math.sin(a) * r);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({color: col, size: size, map: spark, blending: THREE.AdditiveBlending, transparent: true, opacity: 1.0}));
    };
    group.add(createRing(850, 150, 12000, 10, 0xffffff)); 
    group.add(createRing(1200, 200, 15000, 12, 0xffffff));

    // ФОТОГРАФИИ (Увеличены до 110х110)
    const imgs = ["photos/photo1.jpg","photos/photo2.jpg","photos/photo3.jpg","photos/photo4.jpg","photos/photo5.jpg","photos/photo6.jpg","photos/photo7.jpg","photos/photo8.jpg"];
    const phs = [];
    for(let i=0; i<80; i++){
        loader.load(imgs[i%8], (t) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), new THREE.MeshBasicMaterial({map: t, side: 2}));
            const a = Math.random() * Math.PI * 2;
            const r = 700 + Math.random() * 900;
            m.userData = {a: a, s: 0.002 + Math.random() * 0.003, r: r, y: (Math.random()-0.5)*300};
            scene.add(m); 
            phs.push(m);
        });
    }

    // --- ПЛАВНАЯ И БЫСТРАЯ КАМЕРА (5 СЕКУНД) ---
    camera.position.set(0, 1500, 2800); 
    let cTime = 0, isCine = true, lerpVal = 0;
    const finalPos = new THREE.Vector3(0, 500, 1800);

    function animate() {
        requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        if (isCine) {
            cTime += 0.015; // Скорость облета
            
            if (cTime > Math.PI * 1.3) {
                // Плавное торможение и подлет к финалу
                lerpVal += 0.02;
                camera.position.lerp(finalPos, 0.08);
                
                if (camera.position.distanceTo(finalPos) < 20) {
                    isCine = false;
                    controls.enabled = true; // Свободный режим включен!
                    showFinalTexts();
                }
            } else {
                // Сам круговой облет
                camera.position.x = Math.sin(cTime) * 2300;
                camera.position.z = Math.cos(cTime) * 2300;
                camera.position.y = 1200 - (cTime * 200);
            }
            camera.lookAt(0, 0, 0);
        }

        // Вращение вселенной
        group.rotation.y += 0.002;
        
        // Полет фото
        phs.forEach(m => {
            m.userData.a += m.userData.s;
            m.position.x = Math.cos(m.userData.a) * m.userData.r;
            m.position.z = Math.sin(m.userData.a) * m.userData.r;
            m.position.y = m.userData.y + Math.sin(t + m.userData.a) * 30;
            m.lookAt(0, 0, 0);
        });

        controls.update();
        renderer.render(scene, camera);
    }

    function showFinalTexts() {
        const w = document.getElementById('wishText');
        const f = document.getElementById('finalTitle');
        w.style.opacity = '1';
        w.style.transform = 'translateY(0) scale(1)';
        
        setTimeout(() => {
            w.style.opacity = '0';
            setTimeout(() => {
                f.style.opacity = '1';
                f.style.transform = 'translateY(0) scale(1.1)';
            }, 1200);
        }, 4500);
    }

    animate();
}

// Перезапуск при ресайзе для фиксации размеров
window.addEventListener('resize', () => { location.reload(); });
