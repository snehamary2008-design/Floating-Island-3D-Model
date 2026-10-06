/**
 * Lighting, Atmospheric Presets, and Fog Management
 */

export function createEnvironment(sceneEl) {
  const envGroup = document.createElement('a-entity');
  envGroup.setAttribute('id', 'environment-lighting');

  // 1. Ambient Hemisphere Light (Sky Indigo / Ground Dark Slate)
  const ambientLight = document.createElement('a-entity');
  ambientLight.setAttribute('id', 'env-ambient-light');
  ambientLight.setAttribute('light', {
    type: 'ambient',
    color: '#312e81',
    intensity: 0.65
  });
  envGroup.appendChild(ambientLight);

  // 2. Directional Moonlight (Positioned high in sky matching the moon)
  const moonLight = document.createElement('a-entity');
  moonLight.setAttribute('id', 'env-moon-light');
  moonLight.setAttribute('position', '50 48 -95');
  moonLight.setAttribute('light', {
    type: 'directional',
    color: '#bfdbfe',
    intensity: 0.85,
    castShadow: true,
    shadowCameraNear: 5,
    shadowCameraFar: 180,
    shadowCameraTop: 45,
    shadowCameraBottom: -45,
    shadowCameraLeft: -45,
    shadowCameraRight: 45,
    shadowMapWidth: 1024,
    shadowMapHeight: 1024
  });
  envGroup.appendChild(moonLight);

  // 3. Set Initial Fog on Scene
  sceneEl.setAttribute('fog', {
    type: 'exponential',
    color: '#16192e',
    density: 0.0068
  });

  sceneEl.appendChild(envGroup);
}

// Preset definitions
export const ATMOSPHERE_PRESETS = {
  midnight: {
    name: 'Midnight Mystique',
    ambientColor: '#312e81',
    ambientIntensity: 0.65,
    moonColor: '#bfdbfe',
    moonIntensity: 0.85,
    fogColor: '#16192e',
    fogDensity: 0.0068
  },
  aurora: {
    name: 'Celestial Aurora',
    ambientColor: '#064e3b',
    ambientIntensity: 0.72,
    moonColor: '#6ee7b7',
    moonIntensity: 0.95,
    fogColor: '#0c2420',
    fogDensity: 0.0072
  },
  dusk: {
    name: 'Golden Twilight',
    ambientColor: '#4a154b',
    ambientIntensity: 0.75,
    moonColor: '#fde68a',
    moonIntensity: 0.92,
    fogColor: '#251528',
    fogDensity: 0.0065
  }
};

export function applyAtmospherePreset(sceneEl, presetKey) {
  const preset = ATMOSPHERE_PRESETS[presetKey];
  if (!preset) return;

  const ambientEl = document.querySelector('#env-ambient-light');
  const moonEl = document.querySelector('#env-moon-light');

  if (ambientEl) {
    ambientEl.setAttribute('light', 'color', preset.ambientColor);
    ambientEl.setAttribute('light', 'intensity', preset.ambientIntensity);
  }

  if (moonEl) {
    moonEl.setAttribute('light', 'color', preset.moonColor);
    moonEl.setAttribute('light', 'intensity', preset.moonIntensity);
  }

  if (sceneEl) {
    sceneEl.setAttribute('fog', 'color', preset.fogColor);
    sceneEl.setAttribute('fog', 'density', preset.fogDensity);
  }
}
