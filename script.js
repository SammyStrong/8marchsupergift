// Первый экран
setTimeout(()=>{
  document.querySelector(".intro").style.display="none";
  document.querySelector(".wishes").style.display="flex";
},9000);

setTimeout(()=>{
  document.querySelector(".wishes").style.display="none";
  document.getElementById("scene3d").style.display="block";
  init3D();
},16000);

// 3D сцена
function init3D(){
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("scene3d").appendChild(renderer.domElement);
  camera.position.z=20;

  // Звезды
  const starGeometry=new THREE.BufferGeometry();
  const stars=[];
  for(let i=0;i<1000;i++){
    stars.push((Math.random()-0.5)*200,(Math.random()-0.5)*200,(Math.random()-0.5)*200);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars,3));
  const starMaterial=new THREE.PointsMaterial({color:0xffffff});
  const starField=new THREE.Points(starGeometry,starMaterial);
  scene.add(starField);

  // Фото
  const loader=new THREE.TextureLoader();
  const photos=[
    "photos/photo1.jpg",
    "photos/photo2.jpg",
    "photos/photo3.jpg",
    "photos/photo4.jpg",
    "photos/photo5.jpg",
    "photos/photo6.jpg",
    "photos/photo7.jpg",
    "photos/photo8.jpg"
  ];
  let meshes=[];
  photos.forEach((p,i)=>{
    let texture=loader.load(p);
    let material=new THREE.MeshBasicMaterial({map:texture});
    let geometry=new THREE.PlaneGeometry(3,3);
    let mesh=new THREE.Mesh(geometry,material);
    mesh.position.set((Math.random()-0.5)*20,(Math.random()-0.5)*20,(Math.random()-0.5)*20);
    scene.add(mesh);
    meshes.push(mesh);
  });

  let time=0;
  function animate(){
    requestAnimationFrame(animate);
    time+=0.01;
    meshes.forEach((m,i)=>{
      let angle=i/photos.length*Math.PI*2;
      let r=8;
      m.position.x=Math.cos(angle+time)*r;
      m.position.z=Math.sin(angle+time)*r;
      m.lookAt(0,0,0);
    });
    scene.rotation.y+=0.002;
    renderer.render(scene,camera);
  }
  animate();

  // Показ финальной надписи
  setTimeout(()=>{
    document.getElementById("finalText").style.opacity=1;
  },15000);

  // Показ последней кнопки
  setTimeout(()=>{
    document.getElementById("finalButton").style.display="block";
  },20000);

  // Кнопка "Нажми ещё раз ❤️"
  document.querySelector("#finalButton button").addEventListener("click",()=>{
    document.getElementById("thankYou").style.display="block";
  });
}
