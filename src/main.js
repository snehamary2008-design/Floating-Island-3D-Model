/**
 * The Last Floating Island - Main Application Entrypoint
 */
import 'aframe';
import './style.css';

import { registerAnimations } from './components/animations.js';
import { registerInteractions } from './components/interactions.js';
import { createEnvironment } from './components/environment.js';
import { setupCamera } from './components/cameraControls.js';

import { createSky } from './scene/createSky.js';
import { createClouds } from './scene/createClouds.js';
import { createIsland } from './scene/createIsland.js';
import { createWaterfalls } from './scene/createWaterfalls.js';
import { createRuins } from './scene/createRuins.js';
import { createCabin } from './scene/createCabin.js';
import { createVegetation } from './scene/createVegetation.js';
import { createParticles } from './scene/createParticles.js';
import { createUI } from './ui/interface.js';

function initApp() {
  // 1. Register custom A-Frame components before entities are created
  registerAnimations();
  registerInteractions();

  const sceneEl = document.querySelector('a-scene');
  const appContainer = document.querySelector('#app');

  if (!sceneEl) {
    console.error('A-Frame scene element not found.');
    return;
  }

  // Helper to build 3D world elements
  function buildWorld() {
    // 2. Setup Lighting & Atmosphere
    createEnvironment(sceneEl);

    // 3. Setup Camera & Controls
    setupCamera(sceneEl);

    // 4. Procedural Sky, Monumental Moon, Stars & Distant Islands
    createSky(sceneEl);

    // 5. Cloud Sea & Atmospheric Wisps
    createClouds(sceneEl);

    // 6. Master Floating Island (Upper Terrain & Inverted Rocky Underside)
    const { getElevation } = createIsland(sceneEl);

    // 7. Cascading Waterfalls & Spray Mist
    createWaterfalls(sceneEl);

    // 8. Ancient Sanctuary Ruins, Columns & Interactive Altar
    createRuins(sceneEl);

    // 9. Wooden Cabin, Porch, Glowing Windows & Chimney
    createCabin(sceneEl);

    // 10. Diverse Vegetation, Layered Trees, Glowing Flora & Resonant Crystals
    createVegetation(sceneEl, getElevation);

    // 11. Dynamic Particle Systems (Fireflies, Magical Motes)
    createParticles(sceneEl);

    // 12. Cinematic UI HUD & Navigation Overlay
    createUI(appContainer, sceneEl);
  }

  if (sceneEl.hasLoaded) {
    buildWorld();
  } else {
    sceneEl.addEventListener('loaded', buildWorld);
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
