/**
 * Cinematic HUD, Viewpoint Navigation, Atmosphere Controls & Audio Ambience
 */
import { resetCamera, transitionToViewpoint, CAMERA_VIEWPOINTS } from '../components/cameraControls.js';
import { applyAtmospherePreset, ATMOSPHERE_PRESETS } from '../components/environment.js';
import { getAudioContext, setAudioMuted, isAudioEnabled } from '../components/interactions.js';

// Ambient Soundscape Generator (Web Audio API - Procedural Atmospheric Wind & Waterfall Drone)
let ambientNodes = null;

function initAmbientSoundscape() {
  const ctx = getAudioContext();
  if (!ctx || ambientNodes) return;

  try {
    // 1. Wind Ambience: Filtered White/Pink Noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    // Gentle bandpass filter for ethereal mountain wind
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 380;
    windFilter.Q.value = 1.4;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.07;

    // 2. Distant Waterfall Rushing Drone
    const waterFilter = ctx.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.value = 240;

    const waterGain = ctx.createGain();
    waterGain.gain.value = 0.05;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(ctx.destination);

    windSource.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(ctx.destination);

    windSource.start(0);

    ambientNodes = { windSource, windGain, waterGain, masterGain: ctx.destination };
  } catch (err) {
    console.warn('Ambient audio could not initialize:', err);
  }
}

export function createUI(containerEl, sceneEl) {
  // Build HUD DOM
  const overlay = document.createElement('div');
  overlay.className = 'ui-overlay';

  overlay.innerHTML = `
    <!-- Top Navigation Bar -->
    <header class="top-bar">
      <div class="brand-section">
        <h1 class="site-title">The Last Floating Island</h1>
        <div class="site-subtitle">
          <span class="status-dot"></span>
          <span>Suspended Sanctuary · Procedural 3D World</span>
        </div>
      </div>

      <div class="controls-group interactive-ui">
        <!-- Atmosphere Preset Selector -->
        <div class="select-wrapper">
          <select id="preset-select" class="preset-select" aria-label="Atmospheric Presets">
            <option value="midnight">Midnight Mystique</option>
            <option value="aurora">Celestial Aurora</option>
            <option value="dusk">Golden Twilight</option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        <!-- Ambient Sound Toggle -->
        <button id="audio-toggle-btn" class="ctrl-btn" title="Toggle Ethereal Audio Ambience">
          <div class="audio-waves" id="audio-wave-icon">
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
          </div>
          <span id="audio-btn-label">Ambience</span>
        </button>

        <!-- Reset Camera -->
        <button id="reset-cam-btn" class="ctrl-btn" title="Reset to Cinematic Establishing Shot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          <span>Reset</span>
        </button>

        <!-- Guide / About Dialog Button -->
        <button id="guide-modal-btn" class="ctrl-btn" title="Exploration Guide & Controls">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Guide</span>
        </button>
      </div>
    </header>

    <!-- Center Reticle / Interactive Hover Indicator -->
    <div id="center-reticle" class="center-reticle" aria-hidden="true"></div>

    <!-- Discovery Narrative Toast -->
    <div id="discovery-toast" class="discovery-toast" role="status" aria-live="polite">
      <h2 id="toast-title" class="discovery-title"></h2>
      <p id="toast-desc" class="discovery-desc"></p>
    </div>

    <!-- Bottom Bar: Exploration Viewpoints & Controls -->
    <footer class="bottom-bar">
      <div class="hint-bar interactive-ui">
        <span class="hint-item"><span class="hint-key">WASD</span> Fly / Move</span>
        <span class="hint-item"><span class="hint-key">Drag</span> Look Around</span>
        <span class="hint-item"><span class="hint-key">Scroll</span> Zoom</span>
        <span class="hint-item"><span class="hint-key">Click</span> Interact with Altar, Cabin & Flora</span>
      </div>

      <nav class="viewpoints-group interactive-ui" aria-label="Cinematic Viewpoints">
        <button class="view-btn active" data-view="overview">Overview</button>
        <button class="view-btn" data-view="sanctuary">Sanctuary</button>
        <button class="view-btn" data-view="cabin">Cabin</button>
        <button class="view-btn" data-view="waterfall">Waterfall</button>
        <button class="view-btn" data-view="abyss">Abyss</button>
      </nav>
    </footer>

    <!-- Exploration Guide Modal -->
    <div id="guide-modal" class="modal-backdrop">
      <div class="modal-card interactive-ui" role="dialog" aria-labelledby="modal-heading">
        <div class="modal-header">
          <h2 id="modal-heading" class="modal-title">Exploration Guide</h2>
          <button id="modal-close-btn" class="modal-close-btn" aria-label="Close Guide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>
            Welcome to <strong>The Last Floating Island</strong>, an ancient landmass suspended above an eternal sea of clouds.
            Discover its lost magic through procedural geometry, dynamic atmospheric lighting, and interactive landmarks.
          </p>

          <div class="modal-grid">
            <div class="modal-item">
              <div class="modal-item-title">Ancient Altar</div>
              <div class="modal-item-desc">Click the central sanctuary crystal to trigger a resonant celestial pulse and harmonic chime.</div>
            </div>
            <div class="modal-item">
              <div class="modal-item-title">The Cozy Cabin</div>
              <div class="modal-item-desc">Click the wooden door or glowing windows to toggle hearthfire warmth levels and chimney embers.</div>
            </div>
            <div class="modal-item">
              <div class="modal-item-title">Bioluminescent Flora</div>
              <div class="modal-item-desc">Click glowing night-lilies and mushrooms to shift their chromatic wavelengths and spore burst.</div>
            </div>
            <div class="modal-item">
              <div class="modal-item-title">Resonant Crystals</div>
              <div class="modal-item-desc">Click embedded crystals along the ridge for harmonic acoustic chords and radiant flashes.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  containerEl.appendChild(overlay);

  // Setup Event Listeners
  setupUIEventListeners(overlay, sceneEl);
}

function setupUIEventListeners(overlay, sceneEl) {
  // 1. Atmosphere Preset Selector
  const presetSelect = overlay.querySelector('#preset-select');
  presetSelect.addEventListener('change', (e) => {
    applyAtmospherePreset(sceneEl, e.target.value);
  });

  // 2. Ambient Sound Toggle
  const audioBtn = overlay.querySelector('#audio-toggle-btn');
  const audioWave = overlay.querySelector('#audio-wave-icon');
  let audioPlaying = false;

  audioBtn.addEventListener('click', () => {
    if (!audioPlaying) {
      initAmbientSoundscape();
      setAudioMuted(false);
      audioPlaying = true;
      audioBtn.classList.add('active');
      audioWave.classList.add('audio-active');
    } else {
      setAudioMuted(true);
      audioPlaying = false;
      audioBtn.classList.remove('active');
      audioWave.classList.remove('audio-active');
    }
  });

  // 3. Reset Camera
  const resetBtn = overlay.querySelector('#reset-cam-btn');
  resetBtn.addEventListener('click', () => {
    resetCamera();
    updateActiveViewButton(overlay, 'overview');
  });

  // 4. Viewpoint Buttons
  const viewBtns = overlay.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewKey = btn.getAttribute('data-view');
      transitionToViewpoint(viewKey);
      updateActiveViewButton(overlay, viewKey);
    });
  });

  // 5. Guide Modal
  const guideBtn = overlay.querySelector('#guide-modal-btn');
  const guideModal = overlay.querySelector('#guide-modal');
  const closeBtn = overlay.querySelector('#modal-close-btn');

  guideBtn.addEventListener('click', () => {
    guideModal.classList.add('open');
  });

  closeBtn.addEventListener('click', () => {
    guideModal.classList.remove('open');
  });

  guideModal.addEventListener('click', (e) => {
    if (e.target === guideModal) {
      guideModal.classList.remove('open');
    }
  });

  // 6. Discovery Toast Notification Handler
  let toastTimeout = null;
  const toastEl = overlay.querySelector('#discovery-toast');
  const toastTitle = overlay.querySelector('#toast-title');
  const toastDesc = overlay.querySelector('#toast-desc');

  window.addEventListener('island-discovery', (e) => {
    const { title, description } = e.detail;
    toastTitle.textContent = title;
    toastDesc.textContent = description;

    toastEl.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('visible');
    }, 4500);
  });

  // 7. Reticle feedback on cursor hover over clickable 3D objects
  const reticle = overlay.querySelector('#center-reticle');
  sceneEl.addEventListener('mouseenter', (e) => {
    if (e.detail && e.detail.intersectedEl && e.detail.intersectedEl.classList.contains('clickable')) {
      reticle.classList.add('active');
      document.body.style.cursor = 'pointer';
    }
  });

  sceneEl.addEventListener('mouseleave', () => {
    reticle.classList.remove('active');
    document.body.style.cursor = 'default';
  });
}

function updateActiveViewButton(overlay, activeView) {
  const btns = overlay.querySelectorAll('.view-btn');
  btns.forEach(b => {
    if (b.getAttribute('data-view') === activeView) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
}
