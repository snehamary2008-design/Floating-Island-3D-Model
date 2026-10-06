/**
 * Ancient Sanctuary, Ruined Columns, Arches & Interactive Sacred Altar
 */

export function createRuins(sceneEl) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const ruinsGroup = document.createElement('a-entity');
  ruinsGroup.setAttribute('id', 'ruins-sanctuary');
  ruinsGroup.setAttribute('position', '0 0.3 0');

  // Materials
  const stoneMat = new THREE.MeshLambertMaterial({
    color: 0x94a3b8, // Weathered ancient marble/granite
    roughness: 0.9,
    fog: true
  });

  const darkStoneMat = new THREE.MeshLambertMaterial({
    color: 0x475569, // Base masonry
    roughness: 0.95,
    fog: true
  });

  const mossyStoneMat = new THREE.MeshLambertMaterial({
    color: 0x3d5a45, // Moss-covered stone
    roughness: 0.95,
    fog: true
  });

  const runeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // Luminous cyan rune glow
    fog: true
  });

  // 1. Circular Ancient Stone Dais (Cracked ceremonial flooring)
  const daisBaseGeo = new THREE.CylinderGeometry(7.5, 7.8, 0.4, 28);
  const daisBase = new THREE.Mesh(daisBaseGeo, darkStoneMat);
  daisBase.position.y = 0.2;
  daisBase.receiveShadow = true;
  ruinsGroup.object3D.add(daisBase);

  // Concentric carved stone ring
  const ringGeo = new THREE.RingGeometry(4.8, 5.8, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMesh = new THREE.Mesh(ringGeo, stoneMat);
  ringMesh.position.y = 0.41;
  ruinsGroup.object3D.add(ringMesh);

  // Inner runic concentric ring
  const runeRingGeo = new THREE.RingGeometry(2.8, 3.1, 24);
  runeRingGeo.rotateX(-Math.PI / 2);
  const runeRingMesh = new THREE.Mesh(runeRingGeo, runeMat);
  runeRingMesh.position.y = 0.42;
  ruinsGroup.object3D.add(runeRingMesh);

  // 2. Colonnade: Ruined Columns of Varied Heights & Fallen Pillars
  const columnConfigs = [
    { angle: 0.2,  radius: 6.2, height: 5.5, broken: false },
    { angle: 1.1,  radius: 6.4, height: 4.0, broken: true },
    { angle: 2.1,  radius: 6.2, height: 5.5, broken: false },
    { angle: 3.2,  radius: 6.3, height: 2.8, broken: true },
    { angle: 4.3,  radius: 6.5, height: 3.6, broken: true },
    { angle: 5.3,  radius: 6.2, height: 5.5, broken: false }
  ];

  columnConfigs.forEach(col => {
    const cx = Math.cos(col.angle) * col.radius;
    const cz = Math.sin(col.angle) * col.radius;

    const colGroup = new THREE.Group();
    colGroup.position.set(cx, 0.4, cz);

    // Column Base plinth
    const baseBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), darkStoneMat);
    baseBox.position.y = 0.2;
    colGroup.add(baseBox);

    // Fluted Column Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.42, 0.48, col.height, 14);
    const shaft = new THREE.Mesh(shaftGeo, Math.random() > 0.4 ? stoneMat : mossyStoneMat);
    shaft.position.y = 0.4 + col.height / 2;
    colGroup.add(shaft);

    if (!col.broken) {
      // Capital & Architrave / Lintel segment
      const capGeo = new THREE.BoxGeometry(1.3, 0.45, 1.3);
      const cap = new THREE.Mesh(capGeo, stoneMat);
      cap.position.y = 0.4 + col.height + 0.22;
      colGroup.add(cap);
    } else {
      // Jagged broken top cap
      const jagged = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.6, 5), mossyStoneMat);
      jagged.position.y = 0.4 + col.height + 0.2;
      jagged.rotation.z = (Math.random() - 0.5) * 0.4;
      colGroup.add(jagged);
    }

    ruinsGroup.object3D.add(colGroup);
  });

  // 3. Partially Collapsed Stone Arch connecting two intact columns
  // Arch curve between columns at angle 0.2 and 5.3
  const archCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(Math.cos(0.2) * 6.2, 6.2, Math.sin(0.2) * 6.2),
    new THREE.Vector3(5.5, 7.6, 0),
    new THREE.Vector3(Math.cos(5.3) * 6.2, 6.2, Math.sin(5.3) * 6.2)
  );
  const archGeo = new THREE.TubeGeometry(archCurve, 12, 0.45, 6, false);
  const archMesh = new THREE.Mesh(archGeo, stoneMat);
  ruinsGroup.object3D.add(archMesh);

  // 4. Fallen Pillar & Scattered Masonry Blocks on Grass
  const fallenShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 3.2, 10), mossyStoneMat);
  fallenShaft.position.set(-2.8, 0.5, 5.2);
  fallenShaft.rotation.set(Math.PI / 2 - 0.1, 0.4, 0.8);
  ruinsGroup.object3D.add(fallenShaft);

  // Scattered carved masonry blocks
  const blockOffsets = [
    { x: -4.5, y: 0.35, z: 3.2, s: 0.8 },
    { x: 3.8,  y: 0.35, z: 4.8, s: 0.9 },
    { x: -5.2, y: 0.4,  z: -2.8, s: 1.1 },
    { x: 4.5,  y: 0.3,  z: -4.2, s: 0.75 }
  ];
  blockOffsets.forEach(bo => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(bo.s, bo.s * 0.7, bo.s * 1.2), stoneMat);
    block.position.set(bo.x, bo.y, bo.z);
    block.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
    ruinsGroup.object3D.add(block);
  });

  // 5. The Sacred Altar & Levitating Crystal (Interactive Focal Point)
  const altarEntity = document.createElement('a-entity');
  altarEntity.setAttribute('id', 'sacred-altar');
  altarEntity.setAttribute('class', 'clickable interactive-altar');
  altarEntity.setAttribute('position', '0 0.4 0');

  // Hexagonal Altar Pedestal with Carved Steps
  const step1 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.3, 6), darkStoneMat);
  step1.position.y = 0.15;
  altarEntity.object3D.add(step1);

  const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.35, 6), stoneMat);
  step2.position.y = 0.45;
  altarEntity.object3D.add(step2);

  const altarTop = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.5, 6), darkStoneMat);
  altarTop.position.y = 0.85;
  altarEntity.object3D.add(altarTop);

  // Altar Glyph Plate
  const glyphPlate = new THREE.Mesh(new THREE.CircleGeometry(0.7, 6), runeMat);
  glyphPlate.rotation.x = -Math.PI / 2;
  glyphPlate.position.y = 1.11;
  altarEntity.object3D.add(glyphPlate);

  // Master Floating Levitating Crystal (Clickable & Pulsing)
  const crystalGeo = new THREE.OctahedronGeometry(0.7, 0);
  crystalGeo.scale(0.8, 1.6, 0.8);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.95
  });
  const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
  crystalMesh.name = 'altar-crystal-mesh';
  crystalMesh.position.y = 2.2;
  altarEntity.object3D.add(crystalMesh);

  // Magical Light Source at Altar
  const altarLight = new THREE.PointLight(0x38bdf8, 1.8, 14);
  altarLight.name = 'altar-point-light';
  altarLight.position.set(0, 2.2, 0);
  altarEntity.object3D.add(altarLight);

  // 3 Orbiting Ancient Runestones
  const orbitingGroup = new THREE.Group();
  orbitingGroup.name = 'altar-orbiting-group';
  orbitingGroup.position.set(0, 2.2, 0);

  for (let o = 0; o < 3; o++) {
    const oAngle = (o / 3) * Math.PI * 2;
    const rDist = 1.45;
    const shardGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const shard = new THREE.Mesh(shardGeo, stoneMat);
    shard.position.set(Math.cos(oAngle) * rDist, (o % 2 === 0 ? 0.2 : -0.2), Math.sin(oAngle) * rDist);
    shard.rotation.set(0.5, o, 0.3);

    // Glowing dot on shard
    const dot = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), runeMat);
    shard.add(dot);

    orbitingGroup.add(shard);
  }
  altarEntity.object3D.add(orbitingGroup);

  // Expanding Energy Ring (for interaction pulse)
  const pulseRingGeo = new THREE.RingGeometry(0.8, 1.05, 32);
  pulseRingGeo.rotateX(-Math.PI / 2);
  const pulseRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  const pulseRingMesh = new THREE.Mesh(pulseRingGeo, pulseRingMat);
  pulseRingMesh.name = 'altar-pulse-ring';
  pulseRingMesh.position.y = 0.45;
  altarEntity.object3D.add(pulseRingMesh);

  // Component for continuous gentle hover and interaction response
  altarEntity.setAttribute('altar-controller', '');
  ruinsGroup.appendChild(altarEntity);

  sceneEl.appendChild(ruinsGroup);
}
