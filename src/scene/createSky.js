/**
 * Cinematic Sky, Monumental Moon, Stars & Distant Islands
 */

export function createSky(sceneEl) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const skyGroup = document.createElement('a-entity');
  skyGroup.setAttribute('id', 'sky-system');

  // 1. Twilight Skydome with procedural gradient
  const domeRadius = 240;
  const domeGeo = new THREE.SphereGeometry(domeRadius, 32, 24);
  domeGeo.scale(-1, 1, 1); // Invert faces inward

  // Create smooth vertical gradient canvas
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#040714'); // Zenith: Midnight Black-Blue
  grad.addColorStop(0.3, '#0b132b'); // Deep Twilight Indigo
  grad.addColorStop(0.6, '#1c183b'); // Muted Royal Violet
  grad.addColorStop(0.8, '#322552'); // Dusty Lavender
  grad.addColorStop(1.0, '#151329'); // Horizon Mist
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 512);

  const skyTexture = new THREE.CanvasTexture(canvas);
  skyTexture.wrapS = THREE.ClampToEdgeWrapping;
  skyTexture.wrapT = THREE.ClampToEdgeWrapping;

  const domeMat = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide,
    depthWrite: false
  });
  const domeMesh = new THREE.Mesh(domeGeo, domeMat);
  skyGroup.object3D.add(domeMesh);

  // 2. Starfield (800+ stars with color variations)
  const starCount = 850;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const starColorPalette = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#93c5fd'), // Pale cyan
    new THREE.Color('#c4b5fd'), // Pale lavender
    new THREE.Color('#fef08a')  // Soft warm gold
  ];

  for (let i = 0; i < starCount; i++) {
    // Generate on upper hemisphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.9 + 0.1); // Keep above horizon
    const r = 210 + (Math.random() * 15);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    starPositions[i * 3] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;

    const col = starColorPalette[Math.floor(Math.random() * starColorPalette.length)];
    starColors[i * 3] = col.r;
    starColors[i * 3 + 1] = col.g;
    starColors[i * 3 + 2] = col.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  // Procedural soft star disc texture
  const starCanvas = document.createElement('canvas');
  starCanvas.width = 32;
  starCanvas.height = 32;
  const sCtx = starCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  sGrad.addColorStop(0, 'rgba(255,255,255,1)');
  sGrad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
  sGrad.addColorStop(1, 'rgba(255,255,255,0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 32, 32);

  const starTexture = new THREE.CanvasTexture(starCanvas);

  const starMat = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    map: starTexture,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const starPoints = new THREE.Points(starGeo, starMat);
  starPoints.name = 'starfield';
  skyGroup.object3D.add(starPoints);

  // 3. Monumental Moon with Procedural Surface & Luminous Halo
  const moonGroup = document.createElement('a-entity');
  moonGroup.setAttribute('id', 'monumental-moon');
  moonGroup.setAttribute('position', '50 48 -95');

  // Procedural Moon Surface Texture
  const moonCanvas = document.createElement('canvas');
  moonCanvas.width = 512;
  moonCanvas.height = 512;
  const mCtx = moonCanvas.getContext('2d');

  // Base moon disc gradient
  const mGrad = mCtx.createRadialGradient(256, 256, 50, 256, 256, 256);
  mGrad.addColorStop(0, '#f8fafc');
  mGrad.addColorStop(0.7, '#e2e8f0');
  mGrad.addColorStop(0.95, '#cbd5e1');
  mGrad.addColorStop(1.0, '#94a3b8');
  mCtx.fillStyle = mGrad;
  mCtx.fillRect(0, 0, 512, 512);

  // Dark maria patches (lunar seas)
  mCtx.fillStyle = 'rgba(71, 85, 105, 0.32)';
  const mariaCenters = [
    { x: 190, y: 180, r: 85 },
    { x: 310, y: 170, r: 95 },
    { x: 260, y: 280, r: 110 },
    { x: 360, y: 260, r: 75 },
    { x: 170, y: 310, r: 70 }
  ];
  mariaCenters.forEach(m => {
    mCtx.beginPath();
    mCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    mCtx.fill();
  });

  // Soft craters
  for (let c = 0; c < 28; c++) {
    const cx = Math.sin(c * 17) * 180 + 256;
    const cy = Math.cos(c * 23) * 180 + 256;
    const cr = (c % 5 + 3) * 3;
    mCtx.fillStyle = 'rgba(51, 65, 85, 0.25)';
    mCtx.beginPath();
    mCtx.arc(cx, cy, cr, 0, Math.PI * 2);
    mCtx.fill();
    // Crater rim highlight
    mCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    mCtx.lineWidth = 1.5;
    mCtx.stroke();
  }

  const moonTex = new THREE.CanvasTexture(moonCanvas);
  const moonGeo = new THREE.SphereGeometry(15, 36, 36);
  const moonMat = new THREE.MeshBasicMaterial({
    map: moonTex,
    color: 0xf1f5f9
  });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  moonMesh.rotation.y = -Math.PI / 4;
  moonGroup.object3D.add(moonMesh);

  // Soft glowing halo behind the moon
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = 128;
  haloCanvas.height = 128;
  const hCtx = haloCanvas.getContext('2d');
  const hGrad = hCtx.createRadialGradient(64, 64, 25, 64, 64, 64);
  hGrad.addColorStop(0, 'rgba(199, 210, 254, 0.65)');
  hGrad.addColorStop(0.4, 'rgba(165, 180, 252, 0.3)');
  hGrad.addColorStop(0.8, 'rgba(129, 140, 248, 0.1)');
  hGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
  hCtx.fillStyle = hGrad;
  hCtx.fillRect(0, 0, 128, 128);

  const haloTex = new THREE.CanvasTexture(haloCanvas);
  const haloGeo = new THREE.PlaneGeometry(48, 48);
  const haloMat = new THREE.MeshBasicMaterial({
    map: haloTex,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.z = -1;
  haloMesh.lookAt(0, 0, 0);
  moonGroup.object3D.add(haloMesh);

  // Moon slow rotation animation component
  moonGroup.setAttribute('moon-drift', '');
  skyGroup.appendChild(moonGroup);

  // 4. Distant Floating Islands (Atmospheric silhouettes in the clouds)
  const distantIslands = [
    { pos: [-90, 15, -120], scale: 0.7, rot: 0.3 },
    { pos: [115, -8, -100], scale: 0.85, rot: -0.5 },
    { pos: [-65, -15, 85], scale: 0.55, rot: 1.2 },
    { pos: [90, 24, 70], scale: 0.6, rot: -0.9 }
  ];

  distantIslands.forEach((di, idx) => {
    const distEl = document.createElement('a-entity');
    distEl.setAttribute('position', `${di.pos[0]} ${di.pos[1]} ${di.pos[2]}`);
    distEl.setAttribute('rotation', `0 ${di.rot * 50} 0`);
    distEl.setAttribute('scale', `${di.scale} ${di.scale} ${di.scale}`);

    // Procedural mini floating rock cone
    const rockGeo = new THREE.ConeGeometry(12, 22, 7);
    rockGeo.rotateX(Math.PI); // Inverted cone
    const distMat = new THREE.MeshLambertMaterial({
      color: 0x334155,
      fog: true
    });
    const distMesh = new THREE.Mesh(rockGeo, distMat);
    distEl.object3D.add(distMesh);

    // Flat grassy top
    const topGeo = new THREE.CylinderGeometry(12, 11, 2, 7);
    const topMat = new THREE.MeshLambertMaterial({
      color: 0x1e3a29,
      fog: true
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 11;
    distEl.object3D.add(topMesh);

    // Glowing crystal spire on top
    const crysGeo = new THREE.OctahedronGeometry(2.5, 0);
    const crysMat = new THREE.MeshBasicMaterial({
      color: idx % 2 === 0 ? 0x38bdf8 : 0xc084fc,
      fog: true
    });
    const crysMesh = new THREE.Mesh(crysGeo, crysMat);
    crysMesh.position.y = 15;
    distEl.object3D.add(crysMesh);

    // Gentle floating bob
    distEl.setAttribute('floating-island-bob', `offset: ${idx * 1.5}; speed: 0.6; amplitude: 1.2`);
    skyGroup.appendChild(distEl);
  });

  sceneEl.appendChild(skyGroup);
}
