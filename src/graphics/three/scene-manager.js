import { createGraphicsController } from '../../services/graphics-controller.js';
import { selectQuality } from './quality.js';
import { createPageState, subscribePageFields } from '../../services/page-state.js';
// Giữ một chủ sở hữu trên host, kể cả khi Vite đổi URL module trong HMR.
const owner = Symbol.for('a-garden-for-you.graphics');

/** Một canvas chuyển giữa hai host; SVG chỉ ẩn sau frame 3D đầu tiên. */
export function mountGardenGraphics(content, { quality = 'auto', loadModule = () => import('./garden.js'), pageState } = {}) {
  const hosts = { garden: document.getElementById('garden-art'), bouquet: document.getElementById('bouquet-art') };
  hosts.garden[owner]?.dispose();
  const ownsPageState = !pageState;
  pageState ||= createPageState();
  const canvas = document.createElement('canvas'); canvas.className = 'garden-canvas';
  canvas.setAttribute('aria-hidden', 'true'); canvas.setAttribute('tabindex', '-1');
  let disposed = false, frame = null, forcedLayout = null, bouquetPresentation, appliedRibbon;
  let layout = 'garden', pointer = { x: 0, y: 0 };
  let scrollProgress = { garden: 0, bouquet: 0 };
  const visible = (host) => {
    const rect = host.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  };
  const applyRibbon = () => {
    if (disposed || canvas.parentNode !== hosts.bouquet || !bouquetPresentation) return;
    const { stage, x, y, width, progress = 1 } = bouquetPresentation;
    const value = `${stage}:${x.toFixed(3)}:${y.toFixed(3)}:${width.toFixed(3)}:${progress.toFixed(4)}`;
    if (value === appliedRibbon) return;
    appliedRibbon = value;
    const host = hosts.bouquet; host.dataset.bouquetStage = stage;
    host.style.setProperty('--ribbon-progress', String(Math.max(0, Math.min(1, (progress - 0.64) / 0.3))));
    const ribbon = host.querySelector('.bouquet-ribbon svg');
    if (ribbon) ribbon.dataset.bowState = stage === 'tying' ? 'tying' : stage === 'complete' ? 'complete' : 'idle';
    host.style.setProperty('--ribbon-x', `${x.toFixed(3)}%`);
    host.style.setProperty('--ribbon-y', `${y.toFixed(3)}%`);
    host.style.setProperty('--ribbon-width', `${width.toFixed(3)}%`);
  };
  const controller = createGraphicsController({
    async loadScene(callbacks) {
      const { createGardenScene } = await loadModule();
      if (disposed) return null;
      return createGardenScene(canvas, { theme: content.theme, ...callbacks, onBouquetFrame(presentation) {
        bouquetPresentation = presentation; applyRibbon();
      } });
    },
    onState({ status, view }) {
      if (disposed) return;
      Object.entries(hosts).forEach(([key, host]) => {
        const state = status === 'fallback' ? 'fallback' : key === view.layout ? status : 'idle';
        if (host.dataset.graphics !== state) host.dataset.graphics = state;
      });
      if (status === 'fallback') canvas.remove();
      else if (status === 'loading' || status === 'ready') {
        if (canvas.parentNode !== hosts[view.layout]) hosts[view.layout].append(canvas);
        applyRibbon();
      }
    },
  });
  const synchronize = () => {
    if (disposed) return;
    const state = pageState.getState();
    const nextLayout = forcedLayout || Object.entries(hosts).find(([, host]) => visible(host))?.[0];
    if (nextLayout && nextLayout !== layout) { layout = nextLayout; pointer = { x: 0, y: 0 }; }
    const rect = hosts[layout].getBoundingClientRect();
    controller.setView({
      layout, active: Boolean(nextLayout) && visible(hosts[layout]) && !state.hidden,
      width: Math.round(rect.width), height: Math.round(rect.height), dpr: devicePixelRatio || 1,
      reduced: state.reduced, pointerEnabled: false, pointer,
      scrollProgress: scrollProgress[layout],
      quality: selectQuality({ width: innerWidth, memory: navigator.deviceMemory, cores: navigator.hardwareConcurrency, saveData: navigator.connection?.saveData, coarsePointer: state.coarsePointer, preset: quality }),
    });
  };
  const schedule = () => { if (!disposed && frame == null) frame = requestAnimationFrame(() => { frame = null; synchronize(); }); };
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(synchronize, { threshold: [0, 0.01, 0.25, 0.5, 1] }) : null;
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  Object.values(hosts).forEach((host) => {
    observer?.observe(host); resizeObserver?.observe(host);
  });
  if (!observer) window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  const unsubscribePage = subscribePageFields(pageState, ['hidden', 'reduced', 'finePointer', 'coarsePointer'], synchronize);
  const api = {
    setScrollProgress(value) { scrollProgress = value; synchronize(); },
    setLayout(value) { if (!Object.hasOwn(hosts, value)) throw new Error('Layout cần garden hoặc bouquet.'); forcedLayout = value; synchronize(); },
    useVisibleLayout() { forcedLayout = null; synchronize(); },
    reset() { forcedLayout = null; controller.reset(); synchronize(); },
    getDiagnostics: () => ({ ...controller.getState(), scene: controller.getDiagnostics() }),
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame != null) cancelAnimationFrame(frame);
      observer?.disconnect(); resizeObserver?.disconnect();
      if (!observer) window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule); unsubscribePage();
      if (ownsPageState) pageState.dispose();
      Object.values(hosts).forEach((host) => {
        delete host.dataset.graphics;
        delete host.dataset.bouquetStage;
        for (const property of ['--ribbon-x', '--ribbon-y', '--ribbon-width', '--ribbon-progress']) host.style.removeProperty(property);
      });
      controller.dispose(); canvas.remove();
      if (hosts.garden[owner] === api) delete hosts.garden[owner];
    },
  };
  hosts.garden[owner] = api;
  return api;
}
