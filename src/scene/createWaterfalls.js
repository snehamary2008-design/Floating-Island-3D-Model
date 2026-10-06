/**
 * Waterfall System: Flowing Ribbons, Animated UVs, and Spray Mist
 */

export function createWaterfalls(sceneEl) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const waterfallGroup = document.createElement('a-entity');
  waterfallGroup.setAttribute('id', 'waterfall-system');

  // Procedural Flow Texture (shimmering turquoise water foam streaks)
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 128;
  texCanvas.height = 512;
  const ctx = texCanvas.getContext('2d');

  // Cyan gradient base
  const grad = ctx.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
  grad.addColorStop(0.3, 'rgba(165, 243, 252, 0.9)');
  grad.addColorStop(0.7, 'rgba(125, 211, 252, 0.8)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 512);

  // Vertical foam turbulence streaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (let s = 0; s < 45; s++) {
    const sx = Math.random() * 110 + 9;
    const sy = Math.random() * 500;
    const sw = Math.random() * 5 + 2;
    const sh = Math.random() * 60 + 20;
    ctx.fillRect(sx, sy, sw, sh);
  }

  const waterTexture = new THREE.CanvasTexture(texCanvas);
  waterTexture.wrapS = THREE.RepeatWrapping;
  waterTexture.wrapT = THREE.RepeatWrapping;
  waterTexture.repeat.set(1, 3);

  // Outer Shimmer Material
  const waterMatMain = new THREE.MeshBasicMaterial({
    map: waterTexture,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: true
  });

  // Inner Core Material (deeper turquoise)
  const waterMatCore = new THREE.MeshLambertMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: true
  });

  // Helper to build a curved parabolic ribbon mesh
  function createWaterfallRibbon(config) {
    const {
      startPoint, // [x, y, z]
      fallHeight, // distance down
      curveOut,   // horizontal throw vector [dx, dz]
      widthStart,
      widthEnd,
      segments = 36
    } = config;

    const ribbonGeo = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const indices = [];

    // Direction perpendicular to the fall throw vector for ribbon width
    const dirX = curveOut[0];
    const dirZ = curveOut[1];
    const len = Math.hypot(dirX, dirZ) || 1;
    const perpX = -dirZ / len;
    const perpZ = dirX / len;

    for (let i = 0; i <= segments; i++) {
      const v = i / segments; // 0 at top, 1 at bottom
      // Parabolic trajectory: starts falling forward, then curves downward
      const forwardT = Math.pow(v, 0.65);
      const px = startPoint[0] + (dirX * forwardT);
      const pz = startPoint[2] + (dirZ * forwardT);
      const py = startPoint[1] - (Math.pow(v, 1.4) * fallHeight);

      // Width tapers or flares slightly
      const currentWidth = widthStart + (widthEnd - widthStart) * v;
      // Slight wavy turbulence
      const wave = Math.sin(v * 16) * 0.15;

      // Left vertex
      vertices.push(
        px + perpX * (currentWidth * 0.5 + wave),
        py,
        pz + perpZ * (currentWidth * 0.5 + wave)
      );
      uvs.push(0, v * 4); // Stretch UV vertically

      // Right vertex
      vertices.push(
        px - perpX * (currentWidth * 0.5 + wave),
        py,
        pz - perpZ * (currentWidth * 0.5 + wave)
      );
      uvs.push(1, v * 4);
    }

    for (let i = 0; i < segments; i++) {
      const row1 = i * 2;
      const row2 = (i + 1) * 2;
      indices.push(row1, row2, row1 + 1);
      indices.push(row1 + 1, row2, row2 + 1);
    }

    ribbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    ribbonGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    ribbonGeo.setIndex(indices);
    ribbonGeo.computeVertexNormals();

    const group = new THREE.Group();
    const meshMain = new THREE.Mesh(ribbonGeo, waterMatMain);
    group.add(meshMain);

    // Inner narrower core for depth
    const meshCore = new THREE.Mesh(ribbonGeo, waterMatCore);
    meshCore.scale.set(0.85, 1, 0.85);
    group.add(meshCore);

    return { group, waterTexture };
  }

  // 1. Grand Cascade (North-East ledge)
  // Originates from the carved stream outlet and plunges 36 meters
  const grandFalls = createWaterfallRibbon({
    startPoint: [-18, 0.4, 16],
    fallHeight: 36,
    curveOut: [-5.5, 4.8],
    widthStart: 4.8,
    widthEnd: 6.2,
    segments: 40
  });

  const grandEl = document.createElement('a-entity');
  grandEl.object3D.add(grandFalls.group);
  grandEl.setAttribute('waterfall-flow', 'speed: 1.85');
  waterfallGroup.appendChild(grandEl);

  // 2. Twin Veil Waterfall (South-West ledge)
  const veil1 = createWaterfallRibbon({
    startPoint: [18.5, -0.2, -15.5],
    fallHeight: 32,
    curveOut: [4.2, -3.8],
    widthStart: 2.2,
    widthEnd: 3.4,
    segments: 34
  });
  const veil1El = document.createElement('a-entity');
  veil1El.object3D.add(veil1.group);
  veil1El.setAttribute('waterfall-flow', 'speed: 1.65');
  waterfallGroup.appendChild(veil1El);

  const veil2 = createWaterfallRibbon({
    startPoint: [21.5, -0.6, -12],
    fallHeight: 30,
    curveOut: [4.5, -3.2],
    widthStart: 1.8,
    widthEnd: 2.8,
    segments: 32
  });
  const veil2El = document.createElement('a-entity');
  veil2El.object3D.add(veil2.group);
  veil2El.setAttribute('waterfall-flow', 'speed: 1.75');
  waterfallGroup.appendChild(veil2El);

  // 3. Secret Sanctuary Falls (North-West)
  const sanctuaryFalls = createWaterfallRibbon({
    startPoint: [-8.5, -0.4, -22],
    fallHeight: 34,
    curveOut: [-2.2, -5.2],
    widthStart: 2.6,
    widthEnd: 4.0,
    segments: 36
  });
  const sanctuaryFallsEl = document.createElement('a-entity');
  sanctuaryFallsEl.object3D.add(sanctuaryFalls.group);
  sanctuaryFallsEl.setAttribute('waterfall-flow', 'speed: 1.95');
  waterfallGroup.appendChild(sanctuaryFallsEl);

  // 4. Mist & Spray Systems at Fall Outlets and Cloud Plunges
  const mistPositions = [
    // Top crest sprays
    { x: -18, y: 0.2, z: 16, size: 2.2 },
    { x: 19.5, y: -0.4, z: -14, size: 1.8 },
    { x: -8.5, y: -0.6, z: -22, size: 1.6 },
    // Bottom cloud plunge mists
    { x: -23.5, y: -34, z: 20.8, size: 8.5 },
    { x: 23, y: -31, z: -19, size: 6.5 },
    { x: -10.5, y: -33, z: -27, size: 7.2 }
  ];

  // Soft spray particle billboard
  const mistCanvas = document.createElement('canvas');
  mistCanvas.width = 64;
  mistCanvas.height = 64;
  const mCtx = mistCanvas.getContext('2d');
  const mGrad = mCtx.createRadialGradient(32, 32, 4, 32, 32, 32);
  mGrad.addColorStop(0, 'rgba(224, 242, 254, 0.75)');
  mGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.35)');
  mGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
  mCtx.fillStyle = mGrad;
  mCtx.fillRect(0, 0, 64, 64);

  const mistTex = new THREE.CanvasTexture(mistCanvas);
  const mistMat = new THREE.MeshBasicMaterial({
    map: mistTex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });

  mistPositions.forEach((mp, i) => {
    const mistGeo = new THREE.PlaneGeometry(mp.size, mp.size);
    const mistMesh = new THREE.Mesh(mistGeo, mistMat);
    mistMesh.position.set(mp.x, mp.y, mp.z);

    const mEl = document.createElement('a-entity');
    mEl.object3D.add(mistMesh);
    mEl.setAttribute('mist-pulse', `offset: ${i * 1.2}; size: ${mp.size}`);
    waterfallGroup.appendChild(mEl);
  });

  sceneEl.appendChild(waterfallGroup);
}
