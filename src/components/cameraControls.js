/**
 * Camera Rig, Exploration Look-Controls, Viewpoint Transitions & Raycasting
 */

export const CAMERA_VIEWPOINTS = {
  overview: {
    name: 'Cinematic Overview',
    position: { x: 22, y: 15, z: 38 },
    lookAt: { x: -2, y: 1, z: 0 }
  },
  sanctuary: {
    name: 'Ancient Sanctuary',
    position: { x: 0, y: 3.2, z: 10.5 },
    lookAt: { x: 0, y: 1.8, z: 0 }
  },
  cabin: {
    name: 'Cozy Cabin',
    position: { x: 14, y: 3.2, z: 13.5 },
    lookAt: { x: 14, y: 2.2, z: 6 }
  },
  waterfall: {
    name: 'Grand Waterfall',
    position: { x: -12, y: 4.5, z: 24 },
    lookAt: { x: -18, y: 0.5, z: 16 }
  },
  abyss: {
    name: 'Moonlit Abyss',
    position: { x: 12, y: -16, z: 32 },
    lookAt: { x: 0, y: -12, z: 0 }
  }
};

export function setupCamera(sceneEl) {
  const AFRAME = window.AFRAME;
  const THREE = window.THREE || AFRAME.THREE;

  // Camera Rig entity for clean position & rotation hierarchy
  const rig = document.createElement('a-entity');
  rig.setAttribute('id', 'camera-rig');
  const initVp = CAMERA_VIEWPOINTS.overview;
  rig.setAttribute('position', `${initVp.position.x} ${initVp.position.y} ${initVp.position.z}`);

  // Camera entity with look-controls and wasd-controls
  const camera = document.createElement('a-camera');
  camera.setAttribute('id', 'main-camera');
  camera.setAttribute('fov', '55');
  camera.setAttribute('near', '0.1');
  camera.setAttribute('far', '600');
  camera.setAttribute('wasd-controls', 'fly: true; acceleration: 45');
  camera.setAttribute('look-controls', 'pointerLockEnabled: false');

  // Mouse Raycaster cursor for clicking 3D entities
  // Note: raycaster targets only .clickable entities so HUD clicks don't hit 3D world
  camera.setAttribute('cursor', 'rayOrigin: mouse; fuse: false');
  camera.setAttribute('raycaster', 'objects: .clickable; far: 200; interval: 50');

  rig.appendChild(camera);
  sceneEl.appendChild(rig);

  // Smooth Viewpoint Transition Controller Component
  if (!AFRAME.components['viewpoint-mover']) {
    AFRAME.registerComponent('viewpoint-mover', {
      init() {
        this.isMoving = false;
        this.progress = 0;
        this.duration = 1.6; // seconds
        this.startPos = new THREE.Vector3();
        this.targetPos = new THREE.Vector3();
      },
      moveTo(targetPos) {
        this.startPos.copy(this.el.object3D.position);
        this.targetPos.set(targetPos.x, targetPos.y, targetPos.z);
        this.progress = 0;
        this.isMoving = true;
      },
      tick(time, timeDelta) {
        if (!this.isMoving) return;
        const deltaSec = timeDelta / 1000;
        this.progress += deltaSec / this.duration;

        if (this.progress >= 1.0) {
          this.progress = 1.0;
          this.isMoving = false;
          this.el.object3D.position.copy(this.targetPos);
        } else {
          // Smooth easeInOutCubic
          const t = this.progress;
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          this.el.object3D.position.lerpVectors(this.startPos, this.targetPos, ease);
        }
      }
    });
  }

  rig.setAttribute('viewpoint-mover', '');

  // Point camera toward initial overview target
  setTimeout(() => {
    orientCameraTowards(initVp.lookAt);
  }, 100);

  // Mouse-wheel zoom handling
  window.addEventListener('wheel', (e) => {
    // Only zoom if not hovering over a UI control
    if (e.target.closest('.interactive-ui')) return;
    const currentPos = rig.object3D.position;
    const delta = Math.sign(e.deltaY) * 1.8;
    // Move along camera forward vector
    const dir = new THREE.Vector3();
    camera.object3D.getWorldDirection(dir);
    currentPos.addScaledVector(dir, -delta);
  }, { passive: true });
}

export function orientCameraTowards(targetPoint) {
  const camera = document.querySelector('#main-camera');
  const rig = document.querySelector('#camera-rig');
  if (!camera || !rig) return;

  const THREE = window.THREE || window.AFRAME.THREE;
  const target = new THREE.Vector3(targetPoint.x, targetPoint.y, targetPoint.z);
  const lookDir = target.clone().sub(rig.object3D.position).normalize();

  // Calculate pitch & yaw for look-controls
  const yaw = Math.atan2(-lookDir.x, -lookDir.z);
  const pitch = Math.asin(lookDir.y);

  if (camera.components && camera.components['look-controls']) {
    camera.components['look-controls'].yawObject.rotation.y = yaw;
    camera.components['look-controls'].pitchObject.rotation.x = pitch;
  }
}

export function transitionToViewpoint(viewpointKey) {
  const vp = CAMERA_VIEWPOINTS[viewpointKey];
  if (!vp) return;

  const rig = document.querySelector('#camera-rig');
  if (rig && rig.components['viewpoint-mover']) {
    rig.components['viewpoint-mover'].moveTo(vp.position);
    orientCameraTowards(vp.lookAt);
  }
}

export function resetCamera() {
  transitionToViewpoint('overview');
}
