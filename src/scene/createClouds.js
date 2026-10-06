/**
 * Cloud Sea and Drifting Atmospheric Clouds
 */

export function createClouds(sceneEl) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const cloudGroup = document.createElement('a-entity');
  cloudGroup.setAttribute('id', 'cloud-sea-system');

  // Shared geometry & materials for performance
  const puffGeo = new THREE.DodecahedronGeometry(1, 1);

  // Deform the puff geometry slightly for organic cloud lumpiness
  const posAttr = puffGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const noise = 1 + Math.sin(vx * 3 + vy * 2) * 0.15;
    posAttr.setXYZ(i, vx * noise, vy * (noise * 0.7), vz * noise); // Flatten slightly vertically
  }
  puffGeo.computeVertexNormals();

  const cloudMaterial1 = new THREE.MeshLambertMaterial({
    color: 0xe0e7ff, // Soft pale lavender-white
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    fog: true
  });

  const cloudMaterial2 = new THREE.MeshLambertMaterial({
    color: 0xc7d2fe, // Twilight-tinted blue cloud
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    fog: true
  });

  const cloudMaterial3 = new THREE.MeshLambertMaterial({
    color: 0x94a3b8, // Darker underside cloud mass
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    fog: true
  });

  // Helper to create an organic compound cloud cluster
  function createCloudCluster(scaleMultiplier = 1, mat = cloudMaterial1) {
    const cluster = new THREE.Group();
    const puffCount = 7 + Math.floor(Math.random() * 6);

    for (let p = 0; p < puffCount; p++) {
      const puff = new THREE.Mesh(puffGeo, mat);
      const angle = (p / puffCount) * Math.PI * 2 + Math.random() * 0.4;
      const radius = (Math.random() * 5 + 2) * scaleMultiplier;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      const py = (Math.sin(p * 2.3) * 1.5) * scaleMultiplier;

      const sx = (Math.random() * 4 + 4) * scaleMultiplier;
      const sy = (Math.random() * 2.5 + 2.5) * scaleMultiplier;
      const sz = (Math.random() * 4 + 4) * scaleMultiplier;

      puff.position.set(px, py, pz);
      puff.scale.set(sx, sy, sz);
      puff.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      cluster.add(puff);
    }
    return cluster;
  }

  // 1. Lower Endless Cloud Sea (Y = -38 to -22)
  // Form a vast ring/blanket around and beneath the island
  const seaRadiusSteps = [25, 45, 70, 100, 140, 185];
  const countsPerStep = [8, 12, 16, 20, 24, 28];

  seaRadiusSteps.forEach((r, stepIdx) => {
    const count = countsPerStep[stepIdx];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (stepIdx * 0.5);
      const dist = r + (Math.sin(i * 3 + stepIdx) * 8);
      const cx = Math.cos(angle) * dist;
      const cz = Math.sin(angle) * dist;
      const cy = -34 + (Math.sin(i * 2 + stepIdx) * 5) + (stepIdx * 1.8);

      const cluster = createCloudCluster(
        1.2 + (stepIdx * 0.4),
        stepIdx % 3 === 0 ? cloudMaterial1 : (stepIdx % 3 === 1 ? cloudMaterial2 : cloudMaterial3)
      );
      cluster.position.set(cx, cy, cz);

      // Attach to custom drifting A-Frame entity for subtle group motion
      const cloudEl = document.createElement('a-entity');
      cloudEl.object3D.add(cluster);
      cloudEl.setAttribute('drifting-cloud', `speed: ${0.003 + (stepIdx * 0.001)}; radius: ${dist}; angle: ${angle}`);
      cloudGroup.appendChild(cloudEl);
    }
  });

  // 2. Mid-elevation Drifting Wisps (Y = -6 to +12)
  // Floating gently past the island perimeters and cliffs
  const wispPositions = [
    { x: -34, y: -2, z: 22, s: 0.9 },
    { x: 38, y: 4, z: -26, s: 1.1 },
    { x: -28, y: 8, z: -32, s: 0.8 },
    { x: 32, y: -4, z: 28, s: 1.0 },
    { x: 42, y: 2, z: 12, s: 0.85 },
    { x: -38, y: 6, z: -10, s: 0.95 },
    { x: 8, y: -8, z: -38, s: 1.2 }
  ];

  wispPositions.forEach((wisp, idx) => {
    const cluster = createCloudCluster(wisp.s, cloudMaterial1);
    const wispEl = document.createElement('a-entity');
    wispEl.setAttribute('position', `${wisp.x} ${wisp.y} ${wisp.z}`);
    wispEl.object3D.add(cluster);
    wispEl.setAttribute('drifting-wisp', `dirX: ${idx % 2 === 0 ? 0.35 : -0.35}; range: 18; speed: ${0.08 + idx * 0.02}`);
    cloudGroup.appendChild(wispEl);
  });

  sceneEl.appendChild(cloudGroup);
}
