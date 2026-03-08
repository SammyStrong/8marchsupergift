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
        }, 1500);
    }, 8500);
}

function initGalaxy() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0004);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 10, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    document.getElementById('scene3d').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false; controls.enableDamping = true; controls.autoRotate = true;

    const spark = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');
    const group = new THREE.Group(); scene.add(group);

    // Планета (Оптимизирована до 15к точек)
    const pGeo = new THREE.BufferGeometry(); const pPos = [];
    for(let i=0; i<15000; i++){
        const k=Math.random()*Math.PI*2, u=Math.random()*2-1, r=450;
        pPos.push(Math.sqrt(1-u*u)*Math.cos(k)*r, Math.sqrt(1-u*u)*Math.sin(k)*r, u*r);
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({color: 0xff0066, size: 12, map: spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false})));

    // Кольца (Горизонтальные)
    const createR = (rad, w, c, s) => {
        const pos = []; for(let i=0; i<c; i++){
            const a=Math.random()*Math.PI*2, r=rad+(Math.random()-0.5)*w;
            pos.push(Math.cos(a)*r, (Math.random()-0.5)*10, Math.sin(a)*r);
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({color: 0xffffff, size: s, map: spark, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8}));
    };
    group.add(createR(900, 150, 15000, 7), createR(1300, 250, 20000, 9));

    // Фото (120 штук для густоты без вылета)
    const imgs = ["photos/photo1.jpg","photos/photo2.jpg","photos/photo3.jpg","photos/photo4.jpg","photos/photo5.jpg","photos/photo6.jpg","photos/photo7.jpg","photos/photo8.jpg"];
    const phs = []; const ldr = new THREE.TextureLoader();
    for(let i=0; i<120; i++){
        ldr.load(imgs[i%8], (t) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({map: t, side: 2}));
            const a=Math.random()*Math.PI*2, r=700+Math.random()*900;
            m.userData = {a: a, s: 0.001+Math.random()*0.002, r: r, y: (Math.random()-0.5)*200};
            scene.add(m); phs.push(m);
        });
    }

    // Камера и плавная анимация
    camera.position.set(0, 1500, 2500);
    let cTime = 0, isCine = true, lerp = 0;
    const target = new THREE.Vector3(0, 500, 1800);

    function anim() {
        requestAnimationFrame(anim);
        const t = Date.now() * 0.001;
        if(isCine){
            cTime += 0.004;
            if(cTime > Math.PI * 1.5){
                lerp += 0.01; camera.position.lerp(target, 0.05);
                if(camera.position.distanceTo(target) < 10){
                    isCine = false; controls.enabled = true; showT();
                }
            } else {
                camera.position.set(Math.sin(cTime)*2000, 800+Math.sin(cTime*0.5)*400, Math.cos(cTime)*2000);
            }
            camera.lookAt(0,0,0);
        }
        group.rotation.y += 0.001;
        phs.forEach(m => {
            m.userData.a += m.userData.s;
            m.position.set(Math.cos(m.userData.a)*m.userData.r, m.userData.y+Math.sin(t+m.userData.a)*30, Math.sin(m.userData.a)*m.userData.r);
            m.lookAt(0,0,0);
        });
        controls.update(); renderer.render(scene, camera);
    }
    function showT() {
        const w = document.getElementById('wishText'); const f = document.getElementById('finalTitle');
        w.style.opacity = '1'; 
        setTimeout(() => { 
            w.style.opacity = '0'; 
            setTimeout(() => f.style.opacity = '1', 1500);
        }, 5000);
    }
    anim();
}
window.addEventListener('resize', () => location.reload());
