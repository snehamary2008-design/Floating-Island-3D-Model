/**
 * Dynamic Particles: Wandering Fireflies, Magical Motes & Chimney Smoke
 */

export function createParticles(sceneEl) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const particleSystemGroup = document.createElement('a-entity');
  particleSystemGroup.setAttribute('id', 'dynamic-particles');

  // Procedural soft luminous particle disc texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext('2d');
  const pGrad = pCtx.createRadialGradient(16, 16, 2, 16, 16, 16);
  pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  pGrad.addColorStop(0.35, 'rgba(125, 211, 252, 0.85)');
  pGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
  pGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 32, 32);

  const particleTexture = new THREE.CanvasTexture(pCanvas);

  // 1. Wandering Fireflies / Magical Motes (65 particles)
  const fireflyCount = 70;
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyPositions = new Float32Array(fireflyCount * 3);
  const fireflyColors = new Float32Array(fireflyCount * 3);
  const fireflyOffsets = [];

  const colorPalette = [
    new THREE.Color('#38bdf8'), // Cyan mote
    new THREE.Color('#facc15'), // Golden firefly
    new THREE.Color('#c084fc'), // Violet spark
    new THREE.Color('#4ade80')  // Emerald glow
  ];

  for (let i = 0; i < fireflyCount; i++) {
    // Distributed across the island surface
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 22;
    const px = Math.cos(angle) * dist;
    const py = 1.0 + Math.random() * 4.5;
    const pz = Math.sin(angle) * dist;

    fireflyPositions[i * 3] = px;
    fireflyPositions[i * 3 + 1] = py;
    fireflyPositions[i * 3 + 2] = pz;

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    fireflyColors[i * 3] = col.r;
    fireflyColors[i * 3 + 1] = col.g;
    fireflyColors[i * 3 + 2] = col.b;

    fireflyOffsets.push({
      baseX: px,
      baseY: py,
      baseZ: pz,
      freqX: 0.8 + Math.random() * 0.8,
      freqY: 1.2 + Math.random() * 0.9,
      freqZ: 0.9 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2
    });
  }

  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
  fireflyGeo.setAttribute('color', new THREE.BufferAttribute(fireflyColors, 3));

  const fireflyMat = new THREE.PointsMaterial({
    size: 0.65,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const firefliesMesh = new THREE.Points(fireflyGeo, fireflyMat);
  firefliesMesh.name = 'firefly-points';
  particleSystemGroup.object3D.add(firefliesMesh);

  // Store data on entity for tick component
  const fireflyEntity = document.createElement('a-entity');
  fireflyEntity.setAttribute('firefly-swarm', '');
  fireflyEntity.particleOffsets = fireflyOffsets;
  particleSystemGroup.appendChild(fireflyEntity);

  // 2. Sanctuary Swirling Energy Motes (Altar Orbit Motes)
  const altarMoteCount = 35;
  const altarMoteGeo = new THREE.BufferGeometry();
  const altarPositions = new Float32Array(altarMoteCount * 3);
  const altarColors = new Float32Array(altarMoteCount * 3);

  for (let i = 0; i < altarMoteCount; i++) {
    const angle = (i / altarMoteCount) * Math.PI * 2;
    const r = 0.8 + (i % 3) * 0.6;
    altarPositions[i * 3] = Math.cos(angle) * r;
    altarPositions[i * 3 + 1] = 1.2 + (i / altarMoteCount) * 2.2;
    altarPositions[i * 3 + 2] = Math.sin(angle) * r;

    altarColors[i * 3] = 0.22;
    altarColors[i * 3 + 1] = 0.74;
    altarColors[i * 3 + 2] = 0.97;
  }

  altarMoteGeo.setAttribute('position', new THREE.BufferAttribute(altarPositions, 3));
  altarMoteGeo.setAttribute('color', new THREE.BufferAttribute(altarColors, 3));

  const altarMoteMat = new THREE.PointsMaterial({
    size: 0.45,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const altarMotesMesh = new THREE.Points(altarMoteGeo, altarMoteMat);
  altarMotesMesh.position.set(0, 0.4, 0);

  const altarMotesEntity = document.createElement('a-entity');
  altarMotesEntity.object3D.add(altarMotesMesh);
  altarMotesEntity.setAttribute('altar-motes-spiral', '');
  particleSystemGroup.appendChild(altarMotesEntity);

  sceneEl.appendChild(particleSystemGroup);
}
