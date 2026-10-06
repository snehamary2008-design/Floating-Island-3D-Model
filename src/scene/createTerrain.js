/**
 * Procedural Island Upper Terrain, Paths, Streams and Outcrops
 */

// Deterministic harmonic noise
function getTerrainElevation(x, z) {
  // Sanctuary center (0, 0): slightly flattened plateau
  const distFromCenter = Math.hypot(x, z);

  // Cabin clearing (approx x: 14, z: 6)
  const distFromCabin = Math.hypot(x - 14, z - 6);

  // Stream path from near center toward waterfall edge (-18, 16)
  // Distance to line segment
  const stX = -18 - 2, stZ = 16 - 0;
  const pX = x - 2, pZ = z - 0;
  const t = Math.max(0, Math.min(1, (pX * stX + pZ * stZ) / (stX * stX + stZ * stZ)));
  const streamDist = Math.hypot(pX - t * stX, pZ - t * stZ);

  // Base rolling landscape
  let h = Math.sin(x * 0.12 + 0.8) * 1.3 + Math.cos(z * 0.14 - 0.5) * 1.1;
  h += Math.sin((x + z) * 0.22) * 0.6 + Math.cos((x - z) * 0.18) * 0.5;

  // Flatten sanctuary floor slightly
  if (distFromCenter < 9) {
    const factor = distFromCenter / 9;
    h = h * factor + 0.3 * (1 - factor);
  }

  // Gently elevate cabin clearing
  if (distFromCabin < 7) {
    const factor = distFromCabin / 7;
    h = h * factor + 1.6 * (1 - factor);
  }

  // Western scenic cliff ridge
  if (x < -10 && z < 0) {
    h += Math.min(2.2, Math.abs(x + 10) * 0.25);
  }

  // Stream carving
  if (streamDist < 3.2 && distFromCenter > 4 && x < 0 && z > 0) {
    const streamDepth = Math.cos((streamDist / 3.2) * (Math.PI / 2)) * 0.9;
    h -= streamDepth;
  }

  return h;
}

// Organic boundary radius
export function getIslandBoundaryRadius(theta) {
  return 26 + 4.2 * Math.sin(3 * theta) + 3.1 * Math.cos(5 * theta + 0.7) + 1.8 * Math.sin(7 * theta - 1.2) - 2.5 * Math.cos(2 * theta);
}

export function createTerrain(islandGroup) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const terrainEntity = document.createElement('a-entity');
  terrainEntity.setAttribute('id', 'upper-terrain');

  // 1. Procedural High-Density Top Surface Mesh
  const segmentsX = 90;
  const segmentsZ = 90;
  const geo = new THREE.PlaneGeometry(62, 62, segmentsX, segmentsZ);
  geo.rotateX(-Math.PI / 2); // Lay horizontal

  const posAttr = geo.attributes.position;
  const count = posAttr.count;
  const colors = new Float32Array(count * 3);

  const colGrassLush = new THREE.Color('#327548'); // Rich fantasy emerald
  const colGrassDark = new THREE.Color('#1f4d30'); // Deep moss
  const colStoneSlate = new THREE.Color('#475569'); // Exposed slate stone
  const colStoneCliff = new THREE.Color('#334155'); // Deep rocky cliff
  const colSoilPath = new THREE.Color('#44372c');  // Earthy path soil

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const r = Math.hypot(x, z);
    const theta = Math.atan2(z, x);
    const maxR = getIslandBoundaryRadius(theta);

    if (r > maxR) {
      // Outside boundary: tuck down beneath rim
      posAttr.setY(i, -6 - (r - maxR) * 2.5);
      colors[i * 3] = colStoneCliff.r;
      colors[i * 3 + 1] = colStoneCliff.g;
      colors[i * 3 + 2] = colStoneCliff.b;
    } else {
      const edgeFactor = r / maxR;
      let y = getTerrainElevation(x, z);

      if (edgeFactor > 0.82) {
        // Cliff dropoff at the rim
        const drop = Math.pow((edgeFactor - 0.82) / 0.18, 2);
        y -= drop * 3.5;
        // Blend to rock
        const col = colStoneSlate.clone().lerp(colStoneCliff, drop);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      } else {
        // Interior grass with slope and elevation coloring
        const slope = Math.abs(Math.sin(x * 0.3) * Math.cos(z * 0.3));
        let col = colGrassLush.clone().lerp(colGrassDark, Math.sin(x * 0.5 + z * 0.4) * 0.5 + 0.5);

        if (slope > 0.55 || y > 2.2) {
          col.lerp(colStoneSlate, 0.45);
        }

        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      posAttr.setY(i, y);
    }
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const terrainMat = new THREE.MeshLambertMaterial({
    vertexColors: true,
    roughness: 0.85,
    fog: true
  });

  const terrainMesh = new THREE.Mesh(geo, terrainMat);
  terrainMesh.receiveShadow = true;
  terrainEntity.object3D.add(terrainMesh);

  // 2. Winding Stone Flagstone Paths
  // Connects: Cabin [14, 6] -> Sanctuary [0, 0] -> Waterfall Overlook [-18, 16]
  const pathWaypoints = [
    // Cabin branch
    { x: 13, z: 6 }, { x: 11, z: 5 }, { x: 9, z: 4 }, { x: 7, z: 3 },
    { x: 5, z: 2 }, { x: 3, z: 1 }, { x: 1, z: 0.5 },
    // Sanctuary courtyard
    { x: 0, z: 0 },
    // Overlook branch
    { x: -2, z: 2 }, { x: -4, z: 4.5 }, { x: -7, z: 7.5 }, { x: -10, z: 10.5 },
    { x: -13, z: 13 }, { x: -16, z: 15 }, { x: -18, z: 16 }
  ];

  const stoneMat = new THREE.MeshLambertMaterial({
    color: 0x64748b, // Weathered stone slab
    roughness: 0.9,
    fog: true
  });

  pathWaypoints.forEach((wp, idx) => {
    // 2-3 flagstones per waypoint
    for (let s = 0; s < 2; s++) {
      const offsetX = (Math.sin(idx * 4 + s) * 0.6);
      const offsetZ = (Math.cos(idx * 3 + s) * 0.6);
      const px = wp.x + offsetX;
      const pz = wp.z + offsetZ;
      const py = getTerrainElevation(px, pz) + 0.05;

      const slabGeo = new THREE.CylinderGeometry(
        0.55 + Math.random() * 0.25,
        0.65 + Math.random() * 0.2,
        0.14,
        6
      );
      const slabMesh = new THREE.Mesh(slabGeo, stoneMat);
      slabMesh.position.set(px, py, pz);
      slabMesh.rotation.y = Math.random() * Math.PI;
      slabMesh.rotation.x = (Math.random() - 0.5) * 0.08;
      slabMesh.rotation.z = (Math.random() - 0.5) * 0.08;
      slabMesh.receiveShadow = true;
      terrainEntity.object3D.add(slabMesh);
    }
  });

  // 3. Sacred Pool & Reflective Turquoise Stream
  // Stream bed water geometry
  const poolGeo = new THREE.CircleGeometry(3.6, 24);
  poolGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.82,
    fog: true
  });

  // Sanctuary Reflecting Pool
  const sanctuaryPool = new THREE.Mesh(poolGeo, waterMat);
  sanctuaryPool.position.set(-3.5, 0.22, -3.5);
  terrainEntity.object3D.add(sanctuaryPool);

  // Pool border stones
  const stoneBorderMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
  for (let a = 0; a < 14; a++) {
    const angle = (a / 14) * Math.PI * 2;
    const bx = -3.5 + Math.cos(angle) * 3.6;
    const bz = -3.5 + Math.sin(angle) * 3.6;
    const by = getTerrainElevation(bx, bz) + 0.1;
    const rGeo = new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.2, 0);
    const rock = new THREE.Mesh(rGeo, stoneBorderMat);
    rock.position.set(bx, by, bz);
    terrainEntity.object3D.add(rock);
  }

  islandGroup.appendChild(terrainEntity);
  return { getElevation: getTerrainElevation };
}
