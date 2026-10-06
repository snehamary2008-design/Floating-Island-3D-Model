/**
 * Fantasy Flora, Layered Trees, Glowing Mushrooms & Interactive Crystals
 */

export function createVegetation(sceneEl, getElevation) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const vegGroup = document.createElement('a-entity');
  vegGroup.setAttribute('id', 'vegetation-system');

  // Shared Materials
  const trunkMat = new THREE.MeshLambertMaterial({
    color: 0x3d2817, // Dark rough bark
    roughness: 0.95
  });

  const pineFoliageMat1 = new THREE.MeshLambertMaterial({
    color: 0x14452f, // Deep alpine green
    roughness: 0.85
  });

  const pineFoliageMat2 = new THREE.MeshLambertMaterial({
    color: 0x1d5e3f, // Emerald foliage
    roughness: 0.8
  });

  const magicalWillowMat = new THREE.MeshLambertMaterial({
    color: 0x4338ca, // Twilight violet-indigo foliage
    roughness: 0.85
  });

  // 1. Procedural Fantasy Pine / Conifer Tree Generator
  function createPineTree(x, z, scale = 1, rotationY = 0) {
    const y = getElevation(x, z);
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.rotation.y = rotationY;
    tree.scale.set(scale, scale, scale);

    // Trunk
    const trunkH = 2.4 * scale;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, trunkH, 7), trunkMat);
    trunk.position.y = trunkH / 2;
    tree.add(trunk);

    // Layered Conical Foliage (3 tiered cones)
    const tiers = 3;
    for (let t = 0; t < tiers; t++) {
      const tierH = 2.0;
      const tierR = 1.6 - (t * 0.35);
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(tierR, tierH, 7),
        t % 2 === 0 ? pineFoliageMat1 : pineFoliageMat2
      );
      cone.position.y = trunkH * 0.75 + (t * 1.3);
      tree.add(cone);
    }
    return tree;
  }

  // 2. Procedural Enchanted Willow / Broadleaf Tree Generator
  function createWillowTree(x, z, scale = 1) {
    const y = getElevation(x, z);
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.scale.set(scale, scale, scale);

    // Curved Trunk
    const trunkCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.4, 2.0, 0.2),
      new THREE.Vector3(-0.3, 3.8, 0)
    );
    const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 8, 0.35, 6, false), trunkMat);
    tree.add(trunk);

    // Multiple rounded foliage clusters
    const canopyClusters = [
      { x: -0.3, y: 4.2, z: 0, s: 1.8 },
      { x: 0.8,  y: 3.8, z: 0.6, s: 1.4 },
      { x: -1.0, y: 3.5, z: -0.5, s: 1.3 },
      { x: 0.2,  y: 4.8, z: -0.3, s: 1.5 }
    ];
    canopyClusters.forEach(cc => {
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(cc.s, 1), magicalWillowMat);
      foliage.position.set(cc.x, cc.y, cc.z);
      tree.add(foliage);
    });

    return tree;
  }

  // Tree Placement Layout (Natural clustering around perimeters, behind cabin, framing ruins)
  const treeCoords = [
    // Groves behind & around the cabin
    { type: 'pine', x: 19, z: 7, s: 1.2 },
    { type: 'pine', x: 17, z: 12, s: 1.0 },
    { type: 'willow', x: 14, z: 13, s: 1.1 },
    { type: 'pine', x: 12, z: 15, s: 0.9 },
    { type: 'pine', x: 20, z: 2, s: 1.3 },
    { type: 'willow', x: 16, z: -2, s: 1.0 },
    // Groves framing the sanctuary
    { type: 'willow', x: -8, z: -10, s: 1.25 },
    { type: 'pine', x: -12, z: -8, s: 1.1 },
    { type: 'pine', x: -14, z: -4, s: 0.85 },
    { type: 'pine', x: 5, z: -14, s: 1.15 },
    { type: 'willow', x: -3, z: -16, s: 1.0 },
    // Southern ridge grove
    { type: 'pine', x: -9, z: 14, s: 1.05 },
    { type: 'pine', x: -6, z: 18, s: 0.95 },
    { type: 'willow', x: 2, z: 16, s: 1.2 },
    { type: 'pine', x: 7, z: 17, s: 1.1 }
  ];

  treeCoords.forEach(tc => {
    let tMesh;
    if (tc.type === 'willow') {
      tMesh = createWillowTree(tc.x, tc.z, tc.s);
    } else {
      tMesh = createPineTree(tc.x, tc.z, tc.s, Math.random() * Math.PI);
    }
    vegGroup.object3D.add(tMesh);
  });

  // 3. Bioluminescent Glowing Mushrooms (Clusters in grass and near roots)
  const shroomClusters = [
    { cx: 12.5, cz: 4.2 },
    { cx: 16.2, cz: 8.5 },
    { cx: -5.2, cz: 2.5 },
    { cx: -2.0, cz: -6.2 },
    { cx: 7.5,  cz: 8.2 }
  ];

  const shroomStemMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
  const shroomCapMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.3
  });

  shroomClusters.forEach(sc => {
    const sGroup = new THREE.Group();
    const count = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const ox = (Math.random() - 0.5) * 1.2;
      const oz = (Math.random() - 0.5) * 1.2;
      const px = sc.cx + ox;
      const pz = sc.cz + oz;
      const py = getElevation(px, pz);

      const sScale = 0.4 + Math.random() * 0.4;
      const shroom = new THREE.Group();
      shroom.position.set(px, py, pz);
      shroom.scale.set(sScale, sScale, sScale);

      // Curved stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.4, 6), shroomStemMat);
      stem.position.y = 0.2;
      stem.rotation.z = (Math.random() - 0.5) * 0.2;
      shroom.add(stem);

      // Glowing umbrella cap
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), shroomCapMat);
      cap.position.y = 0.4;
      shroom.add(cap);

      sGroup.add(shroom);
    }
    vegGroup.object3D.add(sGroup);
  });

  // 4. Interactive Bioluminescent Flowers / Night-Lilies
  const flowerSpots = [
    { x: 10.5, z: 6.2, color: '#38bdf8' },
    { x: -4.5, z: 4.8, color: '#c084fc' },
    { x: 4.2,  z: -3.8, color: '#38bdf8' },
    { x: -14.2, z: 12.5, color: '#f472b6' }
  ];

  flowerSpots.forEach((fs, idx) => {
    const fy = getElevation(fs.x, fs.z);
    const flEntity = document.createElement('a-entity');
    flEntity.setAttribute('class', 'clickable interactive-flora');
    flEntity.setAttribute('position', `${fs.x} ${fy} ${fs.z}`);
    flEntity.setAttribute('id', `glowing-flora-${idx}`);

    // Stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.75, 5),
      new THREE.MeshLambertMaterial({ color: 0x15803d })
    );
    stem.position.y = 0.37;
    flEntity.object3D.add(stem);

    // Glowing Flower Petals
    const flowerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(fs.color),
      emissive: new THREE.Color(fs.color),
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    const flowerCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), flowerMat);
    flowerCore.name = 'flora-bulb-mesh';
    flowerCore.position.y = 0.78;
    flEntity.object3D.add(flowerCore);

    // Flower interaction component
    flEntity.setAttribute('flora-controller', `initialColor: ${fs.color}`);
    vegGroup.appendChild(flEntity);
  });

  // 5. Interactive Floating & Embedded Ground Crystals
  const crystalFormations = [
    { x: -7.5, z: -2.5,  h: 1.4, color: 0x38bdf8, name: 'Sapphire Spire' },
    { x: 5.5,  z: 5.0,   h: 1.2, color: 0xc084fc, name: 'Amethyst Cluster' },
    { x: -16.5, z: 14.5, h: 1.5, color: 0x2dd4bf, name: 'Aquamarine Geode' },
    { x: 18.2, z: -4.5,  h: 1.3, color: 0x818cf8, name: 'Celestine Shard' }
  ];

  crystalFormations.forEach((cf, idx) => {
    const cy = getElevation(cf.x, cf.z);
    const crEntity = document.createElement('a-entity');
    crEntity.setAttribute('class', 'clickable interactive-crystal');
    crEntity.setAttribute('position', `${cf.x} ${cy} ${cf.z}`);
    crEntity.setAttribute('id', `crystal-shard-${idx}`);

    const crMat = new THREE.MeshStandardMaterial({
      color: cf.color,
      emissive: cf.color,
      emissiveIntensity: 0.75,
      roughness: 0.15,
      metalness: 0.2
    });

    const cGroup = new THREE.Group();
    // Central primary crystal
    const mainShard = new THREE.Mesh(new THREE.ConeGeometry(0.35, cf.h, 5), crMat);
    mainShard.position.y = cf.h / 2;
    mainShard.rotation.y = idx * 1.2;
    cGroup.add(mainShard);

    // Flanking smaller crystals
    for (let c = 0; c < 3; c++) {
      const sideShard = new THREE.Mesh(new THREE.ConeGeometry(0.2, cf.h * 0.6, 5), crMat);
      const angle = (c / 3) * Math.PI * 2;
      sideShard.position.set(Math.cos(angle) * 0.45, (cf.h * 0.6) / 2, Math.sin(angle) * 0.45);
      sideShard.rotation.set((Math.random() - 0.5) * 0.35, angle, (Math.random() - 0.5) * 0.35);
      cGroup.add(sideShard);
    }

    crEntity.object3D.add(cGroup);
    crEntity.setAttribute('crystal-controller', `color: ${cf.color}; title: ${cf.name}`);
    vegGroup.appendChild(crEntity);
  });

  sceneEl.appendChild(vegGroup);
}
