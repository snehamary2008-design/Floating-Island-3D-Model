/**
 * Master Island Assembly & Dramatic Rocky Underside
 */
import { createTerrain, getIslandBoundaryRadius } from './createTerrain.js';

export function createIsland(sceneEl) {
  const THREE = window.THREE || window.AFRAME.THREE;
  const islandGroup = document.createElement('a-entity');
  islandGroup.setAttribute('id', 'floating-island-master');

  // 1. Build Upper Terrain & get height function
  const { getElevation } = createTerrain(islandGroup);

  // 2. Procedural Inverted Rocky Underside Mesh
  // Generates jagged basaltic inverted cone with layered ridges
  const radialSegments = 48;
  const heightSegments = 28;
  const undersideGeo = new THREE.BufferGeometry();

  const vertices = [];
  const indices = [];
  const colors = [];
  const uvs = [];

  const rockColorDark = new THREE.Color('#0f172a');  // Deep obsidian/slate
  const rockColorMid = new THREE.Color('#1e293b');   // Weathered basalt
  const rockColorRidge = new THREE.Color('#334155'); // Highlighted cliff ridge

  // Generate rings from rim (level 0, Y ~ -1) down to the bottom spire tip (level heightSegments, Y ~ -30)
  for (let j = 0; j <= heightSegments; j++) {
    const v = j / heightSegments; // 0 at top rim, 1 at bottom tip
    // Non-linear depth taper
    const yDepth = -1.5 - Math.pow(v, 1.25) * 28.5; // reaches ~ -30m
    const radiusScale = Math.pow(1 - v, 0.75); // Tapers down to point

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const theta = u * Math.PI * 2;
      const baseR = getIslandBoundaryRadius(theta) * radiusScale;

      // Fractured crag noise displacement
      const ridgeNoise = Math.sin(theta * 7 + j * 1.8) * (1.6 * (1 - v)) +
                         Math.cos(theta * 11 - j * 2.2) * (1.1 * (1 - v)) +
                         Math.sin(theta * 17) * 0.5;

      const r = Math.max(0.1, baseR + ridgeNoise);
      const px = Math.cos(theta) * r;
      const pz = Math.sin(theta) * r;
      const py = yDepth + (Math.sin(theta * 5) * 1.2 * (1 - v));

      vertices.push(px, py, pz);
      uvs.push(u, v);

      // Vertex color blending based on depth and ridges
      const col = rockColorMid.clone();
      if (ridgeNoise > 0.8) {
        col.lerp(rockColorRidge, 0.6);
      } else if (v > 0.5) {
        col.lerp(rockColorDark, 0.5);
      }
      colors.push(col.r, col.g, col.b);
    }
  }

  // Build triangular faces
  for (let j = 0; j < heightSegments; j++) {
    for (let i = 0; i < radialSegments; i++) {
      const row1 = j * (radialSegments + 1);
      const row2 = (j + 1) * (radialSegments + 1);

      const a = row1 + i;
      const b = row1 + i + 1;
      const c = row2 + i;
      const d = row2 + i + 1;

      // Clockwise ordering for exterior faces
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  undersideGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  undersideGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  undersideGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  undersideGeo.setIndex(indices);
  undersideGeo.computeVertexNormals();

  const undersideMat = new THREE.MeshLambertMaterial({
    vertexColors: true,
    roughness: 0.95,
    fog: true
  });
  const undersideMesh = new THREE.Mesh(undersideGeo, undersideMat);
  islandGroup.object3D.add(undersideMesh);

  // 3. Hanging Ancient Roots & Mossy Vines
  // Long creeping roots dangling from the rim into the abyss
  const rootCount = 26;
  const rootMat = new THREE.MeshLambertMaterial({
    color: 0x27272a, // Dark gnarly root
    roughness: 0.95
  });

  for (let r = 0; r < rootCount; r++) {
    const theta = (r / rootCount) * Math.PI * 2 + (Math.sin(r * 3) * 0.2);
    const rimR = getIslandBoundaryRadius(theta) * 0.96;
    const startX = Math.cos(theta) * rimR;
    const startZ = Math.sin(theta) * rimR;
    const startY = -1.2;

    const rootLen = 7 + Math.random() * 9;
    const segments = 9;
    const curvePoints = [];

    for (let s = 0; s <= segments; s++) {
      const prog = s / segments;
      const swingX = Math.sin(prog * 3 + r) * (1.2 * prog);
      const swingZ = Math.cos(prog * 2.5 + r) * (1.2 * prog);
      curvePoints.push(new THREE.Vector3(
        startX + swingX,
        startY - prog * rootLen,
        startZ + swingZ
      ));
    }

    const rootCurve = new THREE.CatmullRomCurve3(curvePoints);
    const rootGeo = new THREE.TubeGeometry(rootCurve, 12, 0.18 * (1 - (r % 3 === 0 ? 0.3 : 0)), 6, false);
    const rootMesh = new THREE.Mesh(rootGeo, rootMat);
    islandGroup.object3D.add(rootMesh);
  }

  // 4. Embedded Glowing Mineral Geodes on Underside Crags
  const geodeClusters = [
    { theta: 0.8, depth: -12, color: 0x38bdf8 },
    { theta: 2.1, depth: -18, color: 0xc084fc },
    { theta: 3.5, depth: -8,  color: 0x38bdf8 },
    { theta: 4.8, depth: -15, color: 0x818cf8 },
    { theta: 5.6, depth: -22, color: 0x2dd4bf }
  ];

  geodeClusters.forEach(geode => {
    const r = getIslandBoundaryRadius(geode.theta) * (1 - Math.abs(geode.depth) / 36);
    const gx = Math.cos(geode.theta) * r;
    const gz = Math.sin(geode.theta) * r;
    const gy = geode.depth;

    const cGroup = new THREE.Group();
    cGroup.position.set(gx, gy, gz);

    const cMat = new THREE.MeshBasicMaterial({
      color: geode.color,
      fog: true
    });

    for (let i = 0; i < 5; i++) {
      const cGeo = new THREE.ConeGeometry(0.35 + Math.random() * 0.2, 1.4 + Math.random() * 0.8, 5);
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.rotation.set((Math.random() - 0.5) * 1.5, Math.random() * Math.PI, (Math.random() - 0.5) * 1.5);
      cMesh.position.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8);
      cGroup.add(cMesh);
    }
    islandGroup.object3D.add(cGroup);
  });

  // 5. Floating Stones & Detached Orbiting Crags
  const floatingRocks = [
    { x: -26, y: -4, z: 18, s: 1.4, rotSpeed: 0.008, bobSpeed: 0.8 },
    { x: 28, y: -8, z: -20, s: 1.8, rotSpeed: -0.006, bobSpeed: 0.6 },
    { x: -22, y: -14, z: -16, s: 1.2, rotSpeed: 0.009, bobSpeed: 0.9 },
    { x: 25, y: -2, z: 22, s: 1.6, rotSpeed: -0.007, bobSpeed: 0.7 },
    { x: 3, y: -19, z: 24, s: 2.1, rotSpeed: 0.005, bobSpeed: 0.5 }
  ];

  floatingRocks.forEach((fr, idx) => {
    const fEl = document.createElement('a-entity');
    fEl.setAttribute('position', `${fr.x} ${fr.y} ${fr.z}`);
    fEl.setAttribute('scale', `${fr.s} ${fr.s} ${fr.s}`);

    const rGeo = new THREE.DodecahedronGeometry(1, 1);
    const rMesh = new THREE.Mesh(rGeo, undersideMat);
    fEl.object3D.add(rMesh);

    // Mini crystal embedded on floating rock
    const crysGeo = new THREE.OctahedronGeometry(0.4, 0);
    const crysMat = new THREE.MeshBasicMaterial({
      color: idx % 2 === 0 ? 0x38bdf8 : 0xc084fc
    });
    const crysMesh = new THREE.Mesh(crysGeo, crysMat);
    crysMesh.position.set(0, 0.9, 0);
    fEl.object3D.add(crysMesh);

    // Floating animation component
    fEl.setAttribute('floating-rock-anim', `speed: ${fr.bobSpeed}; rotSpeed: ${fr.rotSpeed}; offset: ${idx * 1.3}`);
    sceneEl.appendChild(fEl);
  });

  sceneEl.appendChild(islandGroup);
  return { islandGroup, getElevation };
}
