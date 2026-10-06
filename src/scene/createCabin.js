/**
 * Cozy Wooden Cabin, Porch, Glowing Windows, Chimney Smoke & Interactive Hearth
 */

export function createCabin(sceneEl) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const cabinGroup = document.createElement('a-entity');
  cabinGroup.setAttribute('id', 'cozy-cabin');
  cabinGroup.setAttribute('position', '14 1.8 6');
  cabinGroup.setAttribute('rotation', '0 -35 0'); // Oriented towards path and moon

  // Materials
  const woodWallMat = new THREE.MeshLambertMaterial({
    color: 0x451a03, // Dark cedar timber logs
    roughness: 0.9,
    fog: true
  });

  const woodBeamMat = new THREE.MeshLambertMaterial({
    color: 0x291205, // Heavy framing timber
    roughness: 0.95,
    fog: true
  });

  const roofShingleMat = new THREE.MeshLambertMaterial({
    color: 0x1c1917, // Dark slate/shingle roof
    roughness: 0.9,
    fog: true
  });

  const stoneChimneyMat = new THREE.MeshLambertMaterial({
    color: 0x475569, // Rough chimney cobblestone
    roughness: 0.95,
    fog: true
  });

  const doorMat = new THREE.MeshLambertMaterial({
    color: 0x78350f, // Warm wood door planks
    roughness: 0.85
  });

  // Warm Amber Window Material (Emissive)
  const windowGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.95,
    roughness: 0.3,
    metalness: 0.1
  });

  // 1. Cabin Main Body Walls (4m wide, 2.8m high, 5m deep)
  const bodyGeo = new THREE.BoxGeometry(4.2, 2.7, 5.2);
  const cabinBody = new THREE.Mesh(bodyGeo, woodWallMat);
  cabinBody.position.y = 1.35;
  cabinBody.castShadow = true;
  cabinBody.receiveShadow = true;
  cabinGroup.object3D.add(cabinBody);

  // Exterior Timber Post Framing (Corners and horizontal beams)
  const cornerCoords = [
    [-2.15, -2.65], [2.15, -2.65], [-2.15, 2.65], [2.15, 2.65]
  ];
  cornerCoords.forEach(([cx, cz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.35), woodBeamMat);
    post.position.set(cx, 1.4, cz);
    cabinGroup.object3D.add(post);
  });

  // 2. Steep Pitched Roof (A-frame gable)
  const roofGroup = new THREE.Group();
  roofGroup.position.set(0, 2.7, 0);

  // Left roof slope
  const slopeGeo = new THREE.BoxGeometry(2.9, 0.22, 5.8);
  const leftSlope = new THREE.Mesh(slopeGeo, roofShingleMat);
  leftSlope.position.set(-1.15, 1.0, 0);
  leftSlope.rotation.z = Math.PI / 4.2; // ~42 deg pitch
  roofGroup.add(leftSlope);

  // Right roof slope
  const rightSlope = new THREE.Mesh(slopeGeo, roofShingleMat);
  rightSlope.position.set(1.15, 1.0, 0);
  rightSlope.rotation.z = -Math.PI / 4.2;
  roofGroup.add(rightSlope);

  // Triangular gable ends (Front & Back)
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-2.1, 0);
  gableShape.lineTo(0, 2.0);
  gableShape.lineTo(2.1, 0);
  gableShape.closePath();
  const gableGeo = new THREE.ShapeGeometry(gableShape);

  const frontGable = new THREE.Mesh(gableGeo, woodWallMat);
  frontGable.position.set(0, 0, 2.61);
  roofGroup.add(frontGable);

  const backGable = new THREE.Mesh(gableGeo, woodWallMat);
  backGable.position.set(0, 0, -2.61);
  backGable.rotation.y = Math.PI;
  roofGroup.add(backGable);

  cabinGroup.object3D.add(roofGroup);

  // 3. Stone Chimney & Smoke Pipe
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.2, 0.9), stoneChimneyMat);
  chimney.position.set(1.5, 2.8, -1.2);
  cabinGroup.object3D.add(chimney);

  const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.2, 1.15), stoneChimneyMat);
  chimneyCap.position.set(1.5, 4.9, -1.2);
  cabinGroup.object3D.add(chimneyCap);

  // 4. Cozy Front Porch, Railings & Steps
  const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 1.8), woodWallMat);
  porchDeck.position.set(0, 0.12, 3.4);
  cabinGroup.object3D.add(porchDeck);

  const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 1.9), roofShingleMat);
  porchRoof.position.set(0, 2.3, 3.4);
  porchRoof.rotation.x = 0.1;
  cabinGroup.object3D.add(porchRoof);

  // Porch Support Posts
  [-1.6, 1.6].forEach(px => {
    const pPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), woodBeamMat);
    pPost.position.set(px, 1.15, 4.15);
    cabinGroup.object3D.add(pPost);
  });

  // Steps
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.5), woodBeamMat);
  step.position.set(0, -0.05, 4.45);
  cabinGroup.object3D.add(step);

  // 5. Wooden Door (Clickable Interactive Target)
  const doorEntity = document.createElement('a-entity');
  doorEntity.setAttribute('id', 'cabin-door');
  doorEntity.setAttribute('class', 'clickable interactive-cabin');
  doorEntity.setAttribute('position', '0 0.95 2.62');

  const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.9, 0.1), doorMat);
  doorEntity.object3D.add(doorMesh);

  // Iron handle
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), new THREE.MeshBasicMaterial({ color: 0x18181b }));
  handle.position.set(0.4, 0, 0.07);
  doorEntity.object3D.add(handle);

  cabinGroup.appendChild(doorEntity);

  // 6. Glowing Amber Windows (Clickable targets)
  const windowConfigs = [
    // Front window left of door
    { pos: [-1.2, 1.45, 2.62], rotY: 0, w: 0.85, h: 0.95 },
    // Side window right
    { pos: [2.12, 1.45, 0.5], rotY: Math.PI / 2, w: 1.1, h: 0.95 },
    // Side window left
    { pos: [-2.12, 1.45, -0.5], rotY: -Math.PI / 2, w: 1.1, h: 0.95 }
  ];

  windowConfigs.forEach((wc, i) => {
    const winEntity = document.createElement('a-entity');
    winEntity.setAttribute('class', 'clickable interactive-cabin');
    winEntity.setAttribute('position', `${wc.pos[0]} ${wc.pos[1]} ${wc.pos[2]}`);
    winEntity.setAttribute('rotation', `0 ${wc.rotY * (180 / Math.PI)} 0`);

    const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(wc.w, wc.h), windowGlowMat);
    winGlass.name = `cabin-window-glass-${i}`;
    winEntity.object3D.add(winGlass);

    // Frame
    const winFrame = new THREE.Mesh(
      new THREE.BoxGeometry(wc.w + 0.15, wc.h + 0.15, 0.06),
      woodBeamMat
    );
    winFrame.position.z = -0.02;
    winEntity.object3D.add(winFrame);

    cabinGroup.appendChild(winEntity);
  });

  // 7. Porch Lantern with Warm Flickering Light
  const lanternGroup = new THREE.Group();
  lanternGroup.position.set(1.0, 1.8, 3.9);

  const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.35, 6), new THREE.MeshBasicMaterial({ color: 0x18181b }));
  lanternGroup.add(lampHousing);

  const lampBulb = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  lanternGroup.add(lampBulb);

  // Warm PointLight for porch & clearing illumination
  const lanternLight = new THREE.PointLight(0xf59e0b, 1.85, 12, 1.5);
  lanternLight.name = 'cabin-lantern-light';
  lanternLight.position.set(0, 0, 0);
  lanternLight.castShadow = true;
  lanternGroup.add(lanternLight);

  cabinGroup.object3D.add(lanternGroup);

  // 8. Attach Cabin Interaction Component & Smoke System
  cabinGroup.setAttribute('cabin-controller', '');
  cabinGroup.setAttribute('chimney-smoke', '');

  sceneEl.appendChild(cabinGroup);
}
