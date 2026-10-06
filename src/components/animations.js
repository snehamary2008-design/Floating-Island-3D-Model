/**
 * Continuous World Animations & Custom A-Frame Components
 */

export function registerAnimations() {
  const AFRAME = window.AFRAME;
  const THREE = window.THREE || AFRAME.THREE;
  if (!AFRAME) return;

  // 1. Waterfall Flow: Scrolls water UVs downward continuously
  if (!AFRAME.components['waterfall-flow']) {
    AFRAME.registerComponent('waterfall-flow', {
      schema: { speed: { type: 'number', default: 1.8 } },
      init() {
        this.materials = [];
        this.el.object3D.traverse(node => {
          if (node.isMesh && node.material && node.material.map) {
            this.materials.push(node.material);
          }
        });
      },
      tick(time, timeDelta) {
        const deltaSec = timeDelta / 1000;
        const offset = this.data.speed * deltaSec;
        for (let i = 0; i < this.materials.length; i++) {
          this.materials[i].map.offset.y -= offset;
        }
      }
    });
  }

  // 2. Drifting Cloud: Circular slow drift around island
  if (!AFRAME.components['drifting-cloud']) {
    AFRAME.registerComponent('drifting-cloud', {
      schema: {
        speed: { type: 'number', default: 0.004 },
        radius: { type: 'number', default: 60 },
        angle: { type: 'number', default: 0 }
      },
      init() {
        this.currentAngle = this.data.angle;
      },
      tick(time, timeDelta) {
        const deltaSec = timeDelta / 1000;
        this.currentAngle += this.data.speed * deltaSec;
        const x = Math.cos(this.currentAngle) * this.data.radius;
        const z = Math.sin(this.currentAngle) * this.data.radius;
        this.el.object3D.position.x = x;
        this.el.object3D.position.z = z;
      }
    });
  }

  // 3. Drifting Wisp: Gentle back-and-forth wisp
  if (!AFRAME.components['drifting-wisp']) {
    AFRAME.registerComponent('drifting-wisp', {
      schema: {
        dirX: { type: 'number', default: 0.3 },
        range: { type: 'number', default: 15 },
        speed: { type: 'number', default: 0.1 }
      },
      init() {
        this.baseX = this.el.object3D.position.x;
        this.time = Math.random() * 10;
      },
      tick(time, timeDelta) {
        this.time += (timeDelta / 1000) * this.data.speed;
        this.el.object3D.position.x = this.baseX + Math.sin(this.time) * this.data.range;
      }
    });
  }

  // 4. Mist Pulse: Subtle breathing for waterfall spray
  if (!AFRAME.components['mist-pulse']) {
    AFRAME.registerComponent('mist-pulse', {
      schema: {
        offset: { type: 'number', default: 0 },
        size: { type: 'number', default: 3 }
      },
      init() {
        this.mesh = this.el.object3D.children[0];
        this.initialScale = this.mesh ? this.mesh.scale.x : 1;
      },
      tick(time) {
        if (!this.mesh) return;
        const t = time / 1000 + this.data.offset;
        const s = 1 + Math.sin(t * 1.5) * 0.15;
        this.mesh.scale.set(s, s, s);
        if (this.mesh.material) {
          this.mesh.material.opacity = 0.45 + Math.sin(t * 1.8) * 0.15;
        }
      }
    });
  }

  // 5. Moon Drift: Slow rotation
  if (!AFRAME.components['moon-drift']) {
    AFRAME.registerComponent('moon-drift', {
      tick(time, timeDelta) {
        this.el.object3D.rotation.y += (timeDelta / 1000) * 0.008;
      }
    });
  }

  // 6. Floating Rock Animation: Bobbing and rotating stones
  if (!AFRAME.components['floating-rock-anim']) {
    AFRAME.registerComponent('floating-rock-anim', {
      schema: {
        speed: { type: 'number', default: 0.8 },
        rotSpeed: { type: 'number', default: 0.01 },
        offset: { type: 'number', default: 0 }
      },
      init() {
        this.baseY = this.el.object3D.position.y;
      },
      tick(time, timeDelta) {
        const deltaSec = timeDelta / 1000;
        const t = (time / 1000) * this.data.speed + this.data.offset;
        this.el.object3D.position.y = this.baseY + Math.sin(t) * 0.7;
        this.el.object3D.rotation.y += this.data.rotSpeed * deltaSec * 60;
        this.el.object3D.rotation.x = Math.sin(t * 0.5) * 0.1;
      }
    });
  }

  // 7. Distant Island Bob
  if (!AFRAME.components['floating-island-bob']) {
    AFRAME.registerComponent('floating-island-bob', {
      schema: {
        offset: { type: 'number', default: 0 },
        speed: { type: 'number', default: 0.5 },
        amplitude: { type: 'number', default: 1.0 }
      },
      init() {
        this.baseY = this.el.object3D.position.y;
      },
      tick(time) {
        const t = (time / 1000) * this.data.speed + this.data.offset;
        this.el.object3D.position.y = this.baseY + Math.sin(t) * this.data.amplitude;
      }
    });
  }

  // 8. Firefly Swarm: Multi-harmonic organic wandering
  if (!AFRAME.components['firefly-swarm']) {
    AFRAME.registerComponent('firefly-swarm', {
      init() {
        const parent = this.el.parentNode;
        this.pointsMesh = parent.object3D.getObjectByName('firefly-points');
      },
      tick(time) {
        if (!this.pointsMesh || !this.el.particleOffsets) return;
        const t = time / 1000;
        const posAttr = this.pointsMesh.geometry.attributes.position;
        const offsets = this.el.particleOffsets;

        for (let i = 0; i < offsets.length; i++) {
          const off = offsets[i];
          const x = off.baseX + Math.sin(t * off.freqX + off.phase) * 1.6;
          const y = off.baseY + Math.sin(t * off.freqY + off.phase * 1.3) * 0.8;
          const z = off.baseZ + Math.cos(t * off.freqZ + off.phase) * 1.6;
          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      }
    });
  }

  // 9. Altar Motes Spiral: Swirls upward
  if (!AFRAME.components['altar-motes-spiral']) {
    AFRAME.registerComponent('altar-motes-spiral', {
      tick(time, timeDelta) {
        const mesh = this.el.object3D.children[0];
        if (mesh) {
          mesh.rotation.y += (timeDelta / 1000) * 0.45;
        }
      }
    });
  }

  // 10. Chimney Smoke: Puffs rising from chimney
  if (!AFRAME.components['chimney-smoke']) {
    AFRAME.registerComponent('chimney-smoke', {
      init() {
        this.puffs = [];
        const puffGeo = new THREE.DodecahedronGeometry(0.3, 0);
        const puffMat = new THREE.MeshLambertMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.45,
          fog: true
        });

        // 6 smoke puffs looping
        for (let i = 0; i < 6; i++) {
          const puff = new THREE.Mesh(puffGeo, puffMat.clone());
          puff.position.set(1.5, 4.9 + i * 0.6, -1.2);
          this.el.object3D.add(puff);
          this.puffs.push({
            mesh: puff,
            progress: i / 6,
            driftX: (Math.random() - 0.5) * 0.05,
            driftZ: (Math.random() - 0.5) * 0.05
          });
        }
      },
      tick(time, timeDelta) {
        const deltaSec = timeDelta / 1000;
        this.puffs.forEach(p => {
          p.progress += deltaSec * 0.28;
          if (p.progress > 1.0) p.progress -= 1.0;

          // Rising Y, expanding scale, fading opacity
          const y = 4.9 + p.progress * 4.0;
          const s = 1.0 + p.progress * 2.2;
          const op = Math.sin(p.progress * Math.PI) * 0.42;

          p.mesh.position.y = y;
          p.mesh.position.x = 1.5 + (p.driftX + Math.sin(p.progress * 3) * 0.3) * p.progress * 4;
          p.mesh.position.z = -1.2 + (p.driftZ + Math.cos(p.progress * 3) * 0.3) * p.progress * 4;
          p.mesh.scale.set(s, s, s);
          p.mesh.material.opacity = Math.max(0, op);
        });
      }
    });
  }
}
