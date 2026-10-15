import * as THREE from 'three';
import { createFlowerFactory } from './flower-factory.js';
import { createParticles } from './particles.js';
import { createRenderLoop } from './render-loop.js';
import { createThemeTokens } from '../../utils/theme.js';
import { createBouquetWrapping } from './bouquet.js';
import { createBouquetMotion, bouquetPose, GARDEN_LAYOUT, softEase } from './bouquet-motion.js';
import { bouquetPresentation, segment } from '../../motion/scroll-progress.js';

const ease = (value) => { const t = Math.max(0, Math.min(1, value)); return 1 - (1 - t) ** 3; };

export function createGardenScene(canvas, { theme, onReady, onError, onBouquetFrame = () => {} }) {
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!context) throw new Error('WebGL2 unavailable');
  let renderer, factory, particles, wrapping, shadowGeometry, shadowMaterial, loop;
  const bouquetMotion = createBouquetMotion();
  let disposed = false, ready = false, bloomFinished = false, bloomStart = null;
  let view = {}, parallaxX = 0, parallaxY = 0, bouquetStage;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  const cluster = new THREE.Group(); scene.add(cluster);
  const center = new THREE.Vector3(0, 2.25, 0);
  const ribbonCamera = camera.clone();
  let gardenDistance = 12, bouquetDistance = 12;
  const publishBouquet = (presentation, force = false) => {
    if (view.layout !== 'bouquet' || (!force && bouquetStage === presentation.stage)) return;
    bouquetStage = presentation.stage;
    ribbonCamera.aspect = camera.aspect; ribbonCamera.updateProjectionMatrix();
    ribbonCamera.position.copy(camera.position); ribbonCamera.quaternion.copy(camera.quaternion); ribbonCamera.updateMatrixWorld();
    const anchor = wrapping.ribbonAnchor.clone().project(ribbonCamera);
    const left = wrapping.ribbonLeft.clone().project(ribbonCamera), right = wrapping.ribbonRight.clone().project(ribbonCamera);
    canvas.dataset.bouquetState = presentation.stage;
    canvas.dataset.bouquetProgress = presentation.progress.toFixed(3); canvas.dataset.bouquetRuns = String(presentation.runs);
    onBouquetFrame({ stage: presentation.stage, progress: presentation.progress, x: (anchor.x + 1) * 50, y: (1 - anchor.y) * 50, width: (right.x - left.x) * 50 });
  };
  const lost = (event) => { event.preventDefault(); if (!disposed) onError(); };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    canvas.removeEventListener('webglcontextlost', lost);
    loop?.dispose(); factory?.dispose(); particles?.dispose(); wrapping?.dispose(); shadowGeometry?.dispose(); shadowMaterial?.dispose();
    scene.clear(); renderer?.dispose();
    if (!context.isContextLost()) context.getExtension('WEBGL_lose_context')?.loseContext();
  };
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0); renderer.shadowMap.enabled = false;
    const tokens = createThemeTokens(theme);
    const palette = Object.fromEntries(['rose', 'rose-soft', 'rose-deep', 'paper', 'leaf', 'leaf-soft', 'gold'].map((key) => [
      key.replace(/-([a-z])/g, (_, character) => character.toUpperCase()), tokens[`--color-${key}`],
    ]));
    factory = createFlowerFactory(palette);
    const variants = theme.flower && theme.flower !== 'stylized' ? Array(7).fill(theme.flower)
      : ['tulip', 'daisy', 'rose', 'rose', 'daisy', 'tulip', 'rose'];
    const heights = [2.45, 3.2, 2.75, 3.8, 3.1, 2.7, 2.85];
    const flowers = variants.map((variant, index) => {
      const flower = factory.createFlower({ variant, height: heights[index], phase: index * 0.9 });
      cluster.add(flower.root); return flower;
    });
    scene.add(new THREE.HemisphereLight(palette.paper, palette.leaf, 2.25));
    const light = new THREE.DirectionalLight(0xffffff, 2.3); light.position.set(-3, 6, 7); scene.add(light);
    const fill = new THREE.DirectionalLight(palette.roseSoft, 0.7); fill.position.set(4, 2, -3); scene.add(fill);
    shadowGeometry = new THREE.CircleGeometry(1, 40);
    shadowMaterial = new THREE.MeshBasicMaterial({ color: palette.leaf, transparent: true, opacity: 0.12, depthWrite: false });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.position.set(0, 0.03, -0.6); shadow.scale.set(2.8, 0.13, 1); scene.add(shadow);
    particles = createParticles(palette.gold); scene.add(particles.object);
    wrapping = createBouquetWrapping(palette); scene.add(wrapping.object);
    loop = createRenderLoop({
      onError,
      onState: (state) => { if (canvas.dataset.renderState !== state) canvas.dataset.renderState = state; },
      draw({ elapsed, delta, reduced }) {
        if (bloomStart == null) bloomStart = elapsed;
        const bloomingTime = elapsed - bloomStart;
        if (view.reduced) bloomFinished = true;
        const scrubbing = Number.isFinite(view.scrollProgress);
        const scroll = view.reduced ? 1 : view.scrollProgress;
        const presentation = scrubbing ? bouquetPresentation(scroll) : bouquetMotion.update({ ...view, delta });
        const quiet = scrubbing || view.reduced || view.layout === 'bouquet';
        const arrangement = view.layout === 'bouquet' ? softEase(presentation.progress / .7) : 0;
        flowers.forEach((flower, index) => {
          flower.setArrangement(arrangement);
          const progress = scrubbing ? (view.layout === 'bouquet' || view.reduced ? 1 : ease(segment(scroll, index * 0.035, 0.46 + index * 0.035)))
            : bloomFinished || view.layout === 'bouquet' ? 1 : ease((bloomingTime - index * 0.14) / 1.35);
          flower.setBloom(progress);
          const [x, y, z, angle] = view.layout === 'bouquet' ? bouquetPose(index, presentation.progress) : GARDEN_LAYOUT[index];
          flower.root.position.set(x, y, z);
          flower.root.rotation.z = angle + (quiet ? 0 : Math.sin(elapsed * 0.65 + flower.phase) * 0.012);
        });
        if (bloomingTime >= 2.2) bloomFinished = true;
        const pointer = view.pointerEnabled && !quiet ? view.pointer : null;
        const factor = quiet ? 1 : Math.min(1, delta * 5);
        parallaxX += ((pointer?.x || 0) * 0.24 - parallaxX) * factor;
        parallaxY += ((pointer?.y || 0) * 0.12 - parallaxY) * factor;
        const cameraDistance = view.layout === 'bouquet' ? gardenDistance + (bouquetDistance - gardenDistance) * ease(presentation.progress / 0.6) : gardenDistance;
        const orbit = scrubbing && !view.reduced ? (view.layout === 'garden' ? (scroll - 0.5) * 1.05 : (1 - scroll) * -0.28) : 0;
        const distance = cameraDistance * (scrubbing && view.layout === 'garden' ? 1.08 - Math.sin(scroll * Math.PI) * 0.1 : 1);
        camera.position.set(Math.sin(orbit) * distance + parallaxX, 2.85 + parallaxY + (scrubbing && !view.reduced ? Math.sin(scroll * Math.PI) * 0.55 : 0), Math.cos(orbit) * distance); camera.lookAt(center);
        canvas.dataset.scrollProgress = scrubbing ? scroll.toFixed(4) : '';
        canvas.dataset.cameraOrbit = orbit.toFixed(4);
        wrapping.setProgress(view.layout === 'bouquet' ? presentation.paperProgress : 0);
        if (scrubbing) particles.update(scroll * 10);
        else if (!reduced) particles.update(elapsed);
        renderer.render(scene, camera);
        if (!ready || (view.layout === 'bouquet' && presentation.complete && bouquetStage !== presentation.stage)) {
          canvas.dataset.drawCalls = String(renderer.info.render.calls);
          canvas.dataset.triangles = String(renderer.info.render.triangles);
        }
        if (view.layout === 'bouquet') {
          publishBouquet(presentation, scrubbing);
          if (!scrubbing && (presentation.complete || presentation.waitingForLeave)) loop.configure({ active: view.active, reduced: true, fps: view.quality.fps });
        }
        if (!ready) {
          ready = true;
          onReady();
        }
      },
    });
    canvas.addEventListener('webglcontextlost', lost);
    return {
      configure(next) {
        if (disposed) return;
        const geometryChanged = view.width !== next.width || view.height !== next.height || view.quality?.dpr !== next.quality.dpr || view.dpr !== next.dpr;
        const layoutChanged = view.layout !== next.layout;
        const progressChanged = view.scrollProgress !== next.scrollProgress || view.reduced !== next.reduced;
        view = next;
        const scrubbing = Number.isFinite(view.scrollProgress);
        const presentation = scrubbing ? bouquetPresentation(view.reduced ? 1 : view.scrollProgress) : bouquetMotion.update({ ...view, delta: 0 });
        if (layoutChanged) {
          shadow.visible = view.layout === 'garden'; canvas.dataset.layout = view.layout;
        }
        if (geometryChanged && view.width > 0 && view.height > 0) {
          renderer.setPixelRatio(Math.min(view.dpr || 1, view.quality.dpr));
          renderer.setSize(view.width, view.height, false);
          camera.aspect = view.width / view.height;
          const divisor = Math.tan(camera.fov / 2 * Math.PI / 180);
          gardenDistance = Math.max(2.9, 3.5 / camera.aspect) / divisor;
          bouquetDistance = Math.max(2.7, 2.65 / camera.aspect) / divisor;
          camera.updateProjectionMatrix(); canvas.dataset.dpr = String(renderer.getPixelRatio());
        }
        particles.configure(view.reduced || view.layout === 'bouquet' ? 0 : view.quality.particles);
        canvas.dataset.quality = view.quality.name;
        canvas.dataset.particles = String(particles.object.visible ? view.quality.particles : 0);
        canvas.dataset.parallax = String(Boolean(view.pointerEnabled && !view.reduced && view.layout === 'garden'));
        loop.configure({ active: view.active && view.width > 0 && view.height > 0,
          reduced: scrubbing || view.reduced || (view.layout === 'bouquet' && (presentation.complete || presentation.waitingForLeave)), fps: view.quality.fps });
        if (geometryChanged || layoutChanged || progressChanged) loop.invalidate();
        if (geometryChanged || layoutChanged) publishBouquet(presentation, true);
      },
      reset() { bloomFinished = false; bloomStart = null; bouquetStage = undefined; bouquetMotion.reset(view); loop.invalidate(); },
      getDiagnostics: () => ({ ...loop.getState(), bouquet: bouquetMotion.getState(), calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles, memory: { ...renderer.info.memory }, programs: renderer.info.programs.length }),
      dispose,
    };
  } catch (error) { dispose(); throw error; }
}
