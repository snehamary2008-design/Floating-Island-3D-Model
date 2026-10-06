/**
 * Interactive Objects: Altar Pulse, Cabin Hearth, Glowing Flora & Resonant Crystals
 */

// Procedural Audio Synthesizer (Web Audio API - 100% self-contained)
let audioCtx = null;
let isAudioMuted = false;

export function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioMuted(muted) {
  isAudioMuted = muted;
}

export function isAudioEnabled() {
  return !isAudioMuted;
}

// Play crystal/altar harmonic chime
export function playChime(freqs = [528, 660, 792], duration = 1.8) {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12 / freqs.length, now + idx * 0.06 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + idx * 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.06);
    osc.stop(now + duration + idx * 0.06 + 0.1);
  });
}

// Play warm cabin hearth chord
export function playCabinSound() {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [220, 277.18, 329.63, 440]; // A major cozy warmth
  freqs.forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.8);
  });
}

export function registerInteractions() {
  const AFRAME = window.AFRAME;
  const THREE = window.THREE || AFRAME.THREE;
  if (!AFRAME) return;

  // 1. Altar Controller Component
  if (!AFRAME.components['altar-controller']) {
    AFRAME.registerComponent('altar-controller', {
      init() {
        this.crystalMesh = this.el.object3D.getObjectByName('altar-crystal-mesh');
        this.altarLight = this.el.object3D.getObjectByName('altar-point-light');
        this.pulseRing = this.el.object3D.getObjectByName('altar-pulse-ring');
        this.orbitingGroup = this.el.object3D.getObjectByName('altar-orbiting-group');

        this.isPulsing = false;
        this.pulseTimer = 0;
        this.pulseDuration = 2.4; // seconds

        // Event listener
        this.onClick = this.onClick.bind(this);
        this.el.addEventListener('click', this.onClick);
      },
      remove() {
        this.el.removeEventListener('click', this.onClick);
      },
      onClick() {
        if (this.isPulsing) return;
        this.isPulsing = true;
        this.pulseTimer = 0;

        playChime([432, 540, 648, 864], 2.8);

        window.dispatchEvent(new CustomEvent('island-discovery', {
          detail: {
            title: 'Ancient Sanctuary Altar',
            description: 'The ancient monolith awakens with celestial resonance. Its energy links directly to the luminous moon above.'
          }
        }));
      },
      tick(time, timeDelta) {
        const deltaSec = timeDelta / 1000;
        const t = time / 1000;

        // Base continuous idle hover & spin
        if (this.crystalMesh) {
          this.crystalMesh.rotation.y += deltaSec * 0.6;
          this.crystalMesh.position.y = 2.2 + Math.sin(t * 1.6) * 0.12;
        }

        if (this.orbitingGroup) {
          this.orbitingGroup.rotation.y -= deltaSec * 0.45;
        }

        // Active Pulse Effect Animation
        if (this.isPulsing) {
          this.pulseTimer += deltaSec;
          const prog = this.pulseTimer / this.pulseDuration;

          if (prog < 1.0) {
            // Pulse wave ring expands outward
            if (this.pulseRing) {
              const rScale = 1.0 + prog * 9.5;
              this.pulseRing.scale.set(rScale, rScale, rScale);
              this.pulseRing.material.opacity = (1.0 - prog) * 0.85;
            }

            // Crystal and light intensification
            const intensityMult = 1.0 + Math.sin(prog * Math.PI) * 2.5;
            if (this.altarLight) {
              this.altarLight.intensity = 1.8 * intensityMult;
            }
            if (this.crystalMesh && this.crystalMesh.material) {
              this.crystalMesh.material.emissiveIntensity = 0.65 * intensityMult;
              const bounce = 1.0 + Math.sin(prog * Math.PI) * 0.35;
              this.crystalMesh.scale.set(bounce, bounce, bounce);
            }
          } else {
            // Reset to idle
            this.isPulsing = false;
            if (this.pulseRing) {
              this.pulseRing.scale.set(1, 1, 1);
              this.pulseRing.material.opacity = 0;
            }
            if (this.altarLight) {
              this.altarLight.intensity = 1.8;
            }
            if (this.crystalMesh && this.crystalMesh.material) {
              this.crystalMesh.material.emissiveIntensity = 0.65;
              this.crystalMesh.scale.set(1, 1, 1);
            }
          }
        }
      }
    });
  }

  // 2. Cabin Controller Component
  if (!AFRAME.components['cabin-controller']) {
    AFRAME.registerComponent('cabin-controller', {
      init() {
        this.lanternLight = this.el.object3D.getObjectByName('cabin-lantern-light');
        this.windows = [];
        this.el.object3D.traverse(node => {
          if (node.isMesh && node.name && node.name.startsWith('cabin-window-glass')) {
            this.windows.push(node);
          }
        });

        this.hearthWarmthLevel = 1; // 0 = dimmed slumber, 1 = warm evening, 2 = blazing hearth
        this.onClick = this.onClick.bind(this);

        this.el.addEventListener('click', this.onClick);
      },
      remove() {
        this.el.removeEventListener('click', this.onClick);
      },
      onClick(e) {
        // Toggle hearth warmth level
        this.hearthWarmthLevel = (this.hearthWarmthLevel + 1) % 3;

        playCabinSound();

        const warmthStates = [
          {
            title: 'Hearth Slumber',
            desc: 'The chimney embers cool into a quiet indigo slumber, resting till dawn.',
            emissive: 0.3,
            lightInt: 0.8
          },
          {
            title: 'The Forgotten Cabin',
            desc: 'A forgotten refuge, still holding the warmth of another age. Inside, tea remains warm beside a crackling hearth.',
            emissive: 0.95,
            lightInt: 1.85
          },
          {
            title: 'Blazing Hearthfire',
            desc: 'Golden flames roar in the stone chimney, casting dancing amber shadows through the forest.',
            emissive: 1.6,
            lightInt: 3.2
          }
        ];

        const state = warmthStates[this.hearthWarmthLevel];

        this.windows.forEach(w => {
          if (w.material) {
            w.material.emissiveIntensity = state.emissive;
          }
        });

        if (this.lanternLight) {
          this.lanternLight.intensity = state.lightInt;
        }

        window.dispatchEvent(new CustomEvent('island-discovery', {
          detail: {
            title: state.title,
            description: state.desc
          }
        }));
      },
      tick(time) {
        // Subtle natural lantern flicker
        if (this.lanternLight) {
          const t = time / 1000;
          const flicker = Math.sin(t * 8.5) * 0.08 + Math.cos(t * 13.2) * 0.05;
          const baseInt = [0.8, 1.85, 3.2][this.hearthWarmthLevel];
          this.lanternLight.intensity = baseInt + flicker;
        }
      }
    });
  }

  // 3. Glowing Flora Controller
  if (!AFRAME.components['flora-controller']) {
    AFRAME.registerComponent('flora-controller', {
      schema: { initialColor: { type: 'string', default: '#38bdf8' } },
      init() {
        this.bulbMesh = this.el.object3D.getObjectByName('flora-bulb-mesh');
        this.colorPalette = ['#38bdf8', '#c084fc', '#facc15', '#4ade80', '#fb7185'];
        this.colorIndex = 0;
        this.pulseTimer = 0;

        this.onClick = this.onClick.bind(this);
        this.el.addEventListener('click', this.onClick);
      },
      remove() {
        this.el.removeEventListener('click', this.onClick);
      },
      onClick() {
        this.colorIndex = (this.colorIndex + 1) % this.colorPalette.length;
        const newColor = new THREE.Color(this.colorPalette[this.colorIndex]);

        if (this.bulbMesh && this.bulbMesh.material) {
          this.bulbMesh.material.color = newColor;
          this.bulbMesh.material.emissive = newColor;
          this.pulseTimer = 1.0;
        }

        playChime([660, 880], 1.2);

        window.dispatchEvent(new CustomEvent('island-discovery', {
          detail: {
            title: 'Bioluminescent Star-Lily',
            description: 'Sensitive to gentle touch, the petals shift wavelength, radiating luminescent spores into the mountain air.'
          }
        }));
      },
      tick(time, timeDelta) {
        const t = time / 1000;
        const deltaSec = timeDelta / 1000;

        // Gentle breathing glow
        if (this.bulbMesh) {
          let baseGlow = 0.85 + Math.sin(t * 2.2) * 0.2;
          if (this.pulseTimer > 0) {
            this.pulseTimer -= deltaSec * 2;
            baseGlow += Math.max(0, this.pulseTimer * 1.5);
            const scale = 1.0 + Math.max(0, this.pulseTimer * 0.4);
            this.bulbMesh.scale.set(scale, scale, scale);
          } else {
            this.bulbMesh.scale.set(1, 1, 1);
          }
          if (this.bulbMesh.material) {
            this.bulbMesh.material.emissiveIntensity = baseGlow;
          }
        }
      }
    });
  }

  // 4. Resonant Crystal Controller
  if (!AFRAME.components['crystal-controller']) {
    AFRAME.registerComponent('crystal-controller', {
      schema: {
        color: { type: 'color', default: '#38bdf8' },
        title: { type: 'string', default: 'Resonant Crystal' }
      },
      init() {
        this.group = this.el.object3D.children[0];
        this.pulseTimer = 0;

        this.onClick = this.onClick.bind(this);
        this.el.addEventListener('click', this.onClick);
      },
      remove() {
        this.el.removeEventListener('click', this.onClick);
      },
      onClick() {
        this.pulseTimer = 1.0;
        playChime([528, 792, 1056], 2.2);

        window.dispatchEvent(new CustomEvent('island-discovery', {
          detail: {
            title: this.data.title,
            description: 'A pure harmonic resonance ripples through the crystal lattice, singing back to the eternal stars.'
          }
        }));
      },
      tick(time, timeDelta) {
        const deltaSec = timeDelta / 1000;
        if (this.pulseTimer > 0) {
          this.pulseTimer -= deltaSec * 1.8;
          const boost = Math.max(0, this.pulseTimer);
          const s = 1.0 + Math.sin(boost * Math.PI) * 0.25;

          if (this.group) {
            this.group.scale.set(s, s, s);
            this.group.traverse(node => {
              if (node.isMesh && node.material) {
                node.material.emissiveIntensity = 0.75 + boost * 2.0;
              }
            });
          }
        }
      }
    });
  }
}
