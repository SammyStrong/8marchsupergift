function nextStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');
}

function moveButton() {
    const b = document.getElementById('noBtn');
    b.style.position = 'fixed';
    b.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    b.style.top = Math.random() * (window.innerHeight - 100) + 'px';
}

const startBtn = document.getElementById('startButton');
const music = document.getElementById('bgMusic');

startBtn.onclick = () => {
    document.getElementById('startScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('startScreen').style.display = 'none';
        document.querySelector('.intro').style.display = 'flex';
        music.play().catch(() => {});
        runIntro();
    }, 1000);
};

function runIntro() {
    const ws = document.querySelectorAll('.word');
    ws.forEach((w, i) => setTimeout(() => w.classList.add('visible'), i * 1600));
    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            initGalaxy();
        }, 1200);
    }, 8500);
}

function initGalaxy() {
    const scene = new THREE.Scene();
    // Добавляем легкий фиолетовый туман для глубины
    scene.fog = new THREE.FogExp2(0x050005, 0.0002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 10, 15000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio > 1.5 ? 1.5 : 1);
    document.getElementById('scene3d').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableDamping = true;
    controls.rotateSpeed = 0.7;

    const loader = new THREE.TextureLoader();
    const spark = loader.load('https://threejs.org/examples/textures/sprites/spark1.png');

    // --- 1. ОСВЕЩЕНИЕ ФОНА (ЗВЕЗДНАЯ ПЫЛЬ) ---
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for(let i=0; i<15000; i++) {
        starPos.push((Math.random()-0.5)*10000, (Math.random()-0.5)*7000, (Math.random()-0.5)*10000);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 4, map: spark, transparent: true, opacity: 0.8});
    scene.add(new THREE.Points(starGeo, starMat));

    const group = new THREE.Group(); scene.add(group);

    // --- 2. ПЛАНЕТА ---
    const pGeo = new THREE.BufferGeometry(); const pPos = [];
    for(let i=0; i<12000; i++){
        const k=Math.random()*Math.PI*2, u=Math.random()*2-1, r=450;
        pPos.push(Math.sqrt(1-u*u)*Math.cos(k)*r, Math.sqrt(1-u*u)*Math.sin(k)*r, u*r);
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({color: 0xff0066, size: 16, map: spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false})));

    // --- 3. ТЕ САМЫЕ КОЛЬЦА ---
    const createRing = (radius, width, count, size, color) => {
        const pos = [];
        for(let i=0; i<count; i++){
            const a = Math.random() * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * width;
            pos.push(Math.cos(a) * r, (Math.random() - 0.5) * 10, Math.sin(a) * r);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({color: color, size: size, map: spark, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.7}));
    };
    // Внутреннее и внешнее кольцо
    group.add(createRing(850, 120, 10000, 9, 0xffffff));
    group.add(createRing(1150, 200, 15000, 11, 0xffffff));

    // --- 4. ФОТОГРАФИИ ---
    const imgs = ["photos/photo1.jpg","photos/photo2.jpg","photos/photo3.jpg","photos/photo4.jpg","photos/photo5.jpg","photos/photo6.jpg","photos/photo7.jpg","photos/photo8.jpg"];
    const phs = [];
    for(let i=0; i<60; i++){
        loader.load(imgs[i%8], (t) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({map: t, side: 2}));
            const a = Math.random()*Math.PI*2, r = 750+Math.random()*900;
            m.userData = {a: a, s: 0.002 + Math.random()*0.002, r: r, y: (Math.random()-0.5)*350};
            scene.add(m); phs.push(m);
        });
    }

    // КАМЕРА (5 секунд облета)
    camera.position.set(0, 1500, 3000);
    let cTime = 0, isCine = true;
    const targetPos = new THREE.Vector3(0, 500, 1900);

    function anim() {
        requestAnimationFrame(anim);
        const t = Date.now() * 0.001;
        if(isCine){
            cTime += 0.015;
            if(cTime > Math.PI * 1.3){
                camera.position.lerp(targetPos, 0.07);
                if(camera.position.distanceTo(targetPos) < 20){
                    isCine = false; 
                    controls.enabled = true; 
                    controls.target.set(0,0,0);
                    showT();
                }
            } else {
                camera.position.set(Math.sin(cTime)*2300, 1000 - (cTime*150), Math.cos(cTime)*2300);
            }
            camera.lookAt(0,0,0);
        }
        group.rotation.y += 0.002;
        phs.forEach(m => {
            m.userData.a += m.userData.s;
            m.position.set(Math.cos(m.userData.a)*m.userData.r, m.userData.y+Math.sin(t+m.userData.a)*35, Math.sin(m.userData.a)*m.userData.r);
            m.lookAt(0,0,0);
        });
        controls.update();
        renderer.render(scene, camera);
    }
    function showT() {
        const w = document.getElementById('wishText');
        const f = document.getElementById('finalTitle');
        w.style.opacity = '1';
        setTimeout(() => {
            w.style.opacity = '0';
            setTimeout(() => f.style.opacity = '1', 1200);
        }, 4500);
    }
    anim();
}
window.addEventListener('resize', () => { location.reload(); });
