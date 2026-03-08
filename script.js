// --- 1. ЛОГИКА ОПРОСА ---
function nextStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const next = document.getElementById('step' + n);
    if (next) next.classList.add('active');
}

function moveButton() {
    const b = document.getElementById('noBtn');
    b.style.position = 'fixed';
    b.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    b.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    b.style.zIndex = "2500";
}

// --- 2. ЗАПУСК ---
const startBtn = document.getElementById('startButton');
const music = document.getElementById('bgMusic');

if (startBtn) {
    startBtn.onclick = () => {
        document.getElementById('startScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            document.querySelector('.intro').style.display = 'flex';
            music.play().catch(() => {});
            runIntroSequence();
        }, 1000);
    };
}

function runIntroSequence() {
    const words = document.querySelectorAll('.word');
    words.forEach((w, i) => setTimeout(() => w.classList.add('visible'), i * 1500));

    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            initUniverse();
        }, 1200);
    }, 8000);
}

// --- 3. 3D СЦЕНА С РАБОЧИМ УПРАВЛЕНИЕМ ---
function initUniverse() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050005, 0.0003);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 15000);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1); 
    document.getElementById('scene3d').innerHTML = ""; 
    document.getElementById('scene3d').appendChild(renderer.domElement);

    // --- НАСТРОЙКА СВОБОДНОГО РЕЖИМА ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false; // Сначала выключен
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 600;  // Максимальное приближение
    controls.maxDistance = 5000; // Максимальное отдаление
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const loader = new THREE.TextureLoader();
    const spark = loader.load('https://threejs.org/examples/textures/sprites/spark1.png');

    // Звезды фона
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for(let i=0; i<8000; i++) {
        starPos.push((Math.random()-0.5)*8000, (Math.random()-0.5)*5000, (Math.random()-0.5)*8000);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 5, map: spark, transparent: true, opacity: 0.8})));

    const group = new THREE.Group();
    scene.add(group);

    // ПЛАНЕТА
    const pGeo = new THREE.BufferGeometry(); const pPos = [];
    for (let i = 0; i < 10000; i++) {
        const k = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, r = 450;
        pPos.push(Math.sqrt(1 - u * u) * Math.cos(k) * r, Math.sqrt(1 - u * u) * Math.sin(k) * r, u * r);
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({color: 0xff0066, size: 18, map: spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false})));

    // КОЛЬЦА
    const createRing = (radius, width, count, size) => {
        const pos = [];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2, r = radius + (Math.random() - 0.5) * width;
            pos.push(Math.cos(a) * r, (Math.random() - 0.5) * 5, Math.sin(a) * r);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({color: 0xffffff, size: size, map: spark, blending: THREE.AdditiveBlending, transparent: true}));
    };
    group.add(createRing(850, 150, 10000, 10), createRing(1250, 200, 12000, 12));

    // ФОТОГРАФИИ
    const imgs = ["photos/photo1.jpg","photos/photo2.jpg","photos/photo3.jpg","photos/photo4.jpg","photos/photo5.jpg","photos/photo6.jpg","photos/photo7.jpg","photos/photo8.jpg"];
    const phs = [];
    for(let i=0; i<60; i++){
        loader.load(imgs[i%8], (t) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({map: t, side: 2}));
            const a = Math.random() * Math.PI * 2, r = 800 + Math.random() * 800;
            m.userData = {a: a, s: 0.002 + Math.random() * 0.002, r: r, y: (Math.random()-0.5)*300};
            scene.add(m); phs.push(m);
        });
    }

    // --- ОБЛЕТ КАМЕРЫ ---
    camera.position.set(0, 1500, 3000); 
    let cTime = 0, isCine = true;
    const finalTargetPos = new THREE.Vector3(0, 600, 2000);

    function animate() {
        requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        if (isCine) {
            cTime += 0.015; 
            if (cTime > Math.PI * 1.3) {
                camera.position.lerp(finalTargetPos, 0.06);
                if (camera.position.distanceTo(finalTargetPos) < 25) {
                    isCine = false;
                    // --- АКТИВАЦИЯ СВОБОДНОГО РЕЖИМА ---
                    controls.enabled = true; 
                    controls.target.set(0, 0, 0); // Фокус на планету
                    showFinalTexts();
                }
            } else {
                camera.position.set(Math.sin(cTime) * 2500, 1000 - (cTime * 150), Math.cos(cTime) * 2500);
            }
            camera.lookAt(0, 0, 0);
        }

        group.rotation.y += 0.002;
        phs.forEach(m => {
            m.userData.a += m.userData.s;
            m.position.set(Math.cos(m.userData.a)*m.userData.r, m.userData.y + Math.sin(t + m.userData.a)*40, Math.sin(m.userData.a)*m.userData.r);
            m.lookAt(0, 0, 0);
        });

        controls.update(); // Важно для плавности и работы OrbitControls
        renderer.render(scene, camera);
    }

    function showFinalTexts() {
        document.getElementById('wishText').style.opacity = '1';
        setTimeout(() => {
            document.getElementById('wishText').style.opacity = '0';
            setTimeout(() => document.getElementById('finalTitle').style.opacity = '1', 1200);
        }, 5000);
    }

    animate();
}

window.addEventListener('resize', () => { location.reload(); });
