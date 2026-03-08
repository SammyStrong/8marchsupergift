const startButton = document.getElementById('startButton');
const bgMusic = document.getElementById('bgMusic');

startButton.addEventListener('click', () => {
    document.getElementById('startScreen').style.fadeOut = "1s";
    setTimeout(() => {
        document.getElementById('startScreen').style.display = 'none';
        document.querySelector('.intro').style.display = 'flex';
        bgMusic.play();
        runIntro();
    }, 500);
});

function runIntro() {
    const words = document.querySelectorAll('.word');
    words.forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 1500);
    });

    // Через 7 секунд переходим к 3D
    setTimeout(() => {
        document.querySelector('.intro').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.intro').style.display = 'none';
            document.getElementById('scene3d').style.display = 'block';
            init3D();
        }, 1000);
    }, 7000);
}

function init3D() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene3d').appendChild(renderer.domElement);

    // Добавляем тысячи звезд (как на видео)
    const starQty = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starQty * 3);
    for(let i=0; i < starQty * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 100;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    // Загружаем фото
    const loader = new THREE.TextureLoader();
    const photoFiles = ["photos/photo1.jpg", "photos/photo2.jpg", "photos/photo3.jpg", "photos/photo4.jpg", "photos/photo5.jpg", "photos/photo6.jpg", "photos/photo7.jpg", "photos/photo8.jpg"];
    const meshes = [];

    photoFiles.forEach((file, i) => {
        loader.load(file, (texture) => {
            const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            const geom = new THREE.PlaneGeometry(3, 3);
            const mesh = new THREE.Mesh(geom, mat);
            scene.add(mesh);
            meshes.push(mesh);
        });
    });

    camera.position.z = 20;

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.0005;

        meshes.forEach((m, i) => {
            const angle = (i / meshes.length) * Math.PI * 2 + time;
            m.position.x = Math.cos(angle) * 12;
            m.position.z = Math.sin(angle) * 12;
            m.position.y = Math.sin(time + i) * 3;
            m.lookAt(0, 0, 0); // Чтобы фото всегда смотрели в центр
        });

        stars.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();

    // Плавное появление финального заголовка
    setTimeout(() => {
        document.getElementById('finalTitle').style.opacity = '1';
    }, 2000);
}

// Реакция на изменение размера окна
window.addEventListener('resize', () => {
    location.reload(); 
});
