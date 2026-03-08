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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 10, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    document.getElementById('scene3d').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableDamping = true;

    const spark = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/spark1.png');
    const group = new THREE.Group(); scene.add(group);

    // Звезды
    const pGeo = new THREE.BufferGeometry(); const pPos = [];
    for(let i=0; i<10000; i++){
        const k=Math.random()*Math.PI*2, u=Math.random()*2-1, r=450;
        pPos.push(Math.sqrt(1-u*u)*Math.cos(k)*r, Math.sqrt(1-u*u)*Math.sin(k)*r, u*r);
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({color: 0xff0066, size: 15, map: spark, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false})));

    // Фото (8 штук)
    const imgs = ["photos/photo1.jpg","photos/photo2.jpg","photos/photo3.jpg","photos/photo4.jpg","photos/photo5.jpg","photos/photo6.jpg","photos/photo7.jpg","photos/photo8.jpg"];
    const phs = [];
    for(let i=0; i<40; i++){
        new THREE.TextureLoader().load(imgs[i%8], (t) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), new THREE.MeshBasicMaterial({map: t, side: 2}));
            const a = Math.random()*Math.PI*2, r = 750+Math.random()*800;
            m.userData = {a: a, s: 0.003, r: r, y: (Math.random()-0.5)*300};
            scene.add(m); phs.push(m);
        });
    }

    camera.position.set(0, 1500, 2500);
    let cTime = 0, isCine = true;
    const targetPos = new THREE.Vector3(0, 500, 1800);

    function anim() {
        requestAnimationFrame(anim);
        const t = Date.now() * 0.001;
        if(isCine){
            cTime += 0.015;
            if(cTime > Math.PI * 1.3){
                camera.position.lerp(targetPos, 0.08);
                if(camera.position.distanceTo(targetPos) < 20){
                    isCine = false; controls.enabled = true; showT();
                }
            } else {
                camera.position.set(Math.sin(cTime)*2200, 800, Math.cos(cTime)*2200);
            }
            camera.lookAt(0,0,0);
        }
        group.rotation.y += 0.002;
        phs.forEach(m => {
            m.userData.a += m.userData.s;
            m.position.set(Math.cos(m.userData.a)*m.userData.r, m.userData.y+Math.sin(t+m.userData.a)*30, Math.sin(m.userData.a)*m.userData.r);
            m.lookAt(0,0,0);
        });
        controls.update();
        renderer.render(scene, camera);
    }
    function showT() {
        document.getElementById('wishText').style.opacity = '1';
        setTimeout(() => {
            document.getElementById('wishText').style.opacity = '0';
            setTimeout(() => document.getElementById('finalTitle').style.opacity = '1', 1500);
        }, 4500);
    }
    anim();
}
