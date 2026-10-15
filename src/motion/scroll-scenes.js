import { observeMotionPreference } from './preferences.js';
import { clamp, segment, sceneAnimationProgress, wishBloomProgress } from './scroll-progress.js';

const easeOutCubic = t => 1 - Math.pow(1 - clamp(t), 3);
const easeInOutSine = t => -(Math.cos(Math.PI * clamp(t)) - 1) / 2;

/** Native scrolling, one frame scheduler and a damped reversible playhead for every scene. */
export function mountScrollScenes({ pageState, envelope, wishes, graphics } = {}) {
  const root = document.documentElement;
  const sections = ['intro', 'garden', 'finale'].map(id => document.getElementById(id));
  const pins = sections.map(section => {
    const pin = document.createElement('div');
    pin.className = `scene-pin ${section.id}-pin`;
    while (section.firstChild) pin.append(section.firstChild);
    section.append(pin); section.classList.add('scroll-scene');
    return pin;
  });
  const cards = [...document.querySelectorAll('.wish-card')];
  const cardSlots = cards.map(card => {
    const slot = document.createElement('div'); slot.className = 'wish-slot';
    card.before(slot); slot.append(card); return slot;
  });
  const letter = document.querySelector('.paper-letter');
  const letterSection = document.getElementById('letter');
  const decor = document.createElement('div'); decor.className = 'scroll-atmosphere'; decor.setAttribute('aria-hidden', 'true');
  decor.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
  const meter = document.createElement('div'); meter.className = 'scroll-meter'; meter.setAttribute('aria-hidden', 'true');
  meter.innerHTML = '<span></span>'; document.body.append(decor, meter);
  root.classList.add('scroll-story');

  let reduced = false, disposed = false, frame = null, geometry = [];
  let cardGeometry = [], letterGeometry, measureNeeded = true;
  let smoothedY = window.scrollY;
  let lastTime = performance.now();

  const initialHash = location.hash;
  let userNavigated = false, anchorFrame;
  const markNavigation = () => { userNavigated = true; };
  for (const event of ['wheel', 'touchstart', 'keydown']) window.addEventListener(event, markNavigation, { passive: true, once: true });

  const measure = () => {
    const viewport = innerHeight;
    sections.forEach((section, i) => {
      const height = Math.ceil(pins[i].getBoundingClientRect().height);
      section.style.setProperty('--pin-height', `${height}px`);
      section.style.setProperty('--pin-top', `${Math.min(0, viewport - height)}px`);
    });
    geometry = sections.map((section, i) => ({
      top: section.getBoundingClientRect().top + scrollY,
      height: section.offsetHeight,
      pinHeight: pins[i].offsetHeight
    }));
    cardGeometry = cardSlots.map((slot, index) => {
      const top = slot.getBoundingClientRect().top + scrollY;
      const art = cards[index].querySelector('.wish-art');
      return { top, height: slot.offsetHeight, artTop: top + art.offsetTop, artHeight: art.offsetHeight };
    });
    letterGeometry = { top: letterSection.getBoundingClientRect().top + scrollY, height: letterSection.offsetHeight };
    measureNeeded = false;
  };

  const render = (now = performance.now()) => {
    frame = null;
    if (disposed || document.hidden) return;
    if (measureNeeded) measure();

    const targetY = scrollY;
    const dt = Math.min(64, Math.max(1, now - lastTime));
    lastTime = now;

    // Frame-rate independent exponential smoothing (tạo quán tính mượt mà khi cuộn)
    if (reduced) {
      smoothedY = targetY;
    } else {
      const alpha = 1 - Math.exp(-dt * 0.014);
      smoothedY += (targetY - smoothedY) * alpha;
      if (Math.abs(targetY - smoothedY) < 0.15) smoothedY = targetY;
    }

    const currentY = smoothedY;
    const viewport = innerHeight;

    const progress = geometry.map(({ top, height, pinHeight }, i) => reduced ? 1
      : sceneAnimationProgress(currentY, top, height, pinHeight, viewport, i === 1));

    graphics.setScrollProgress({ garden: progress[1], bouquet: progress[2] });
    sections.forEach((section, i) => {
      const easedScene = easeInOutSine(progress[i]);
      section.style.setProperty('--scene-progress', easedScene.toFixed(4));
      section.dataset.scrollProgress = easedScene.toFixed(4);
    });

    envelope.setProgress(easeInOutSine(segment(progress[0], 0.04, 0.85)), reduced);

    const blooms = cardGeometry.map(({ top, height, artTop, artHeight }, index) => {
      const p = easeInOutSine(segment(currentY, top - viewport, top + height));
      const rawEnter = segment(currentY, top - viewport * 0.94, top - viewport * 0.18);
      const enter = easeOutCubic(rawEnter);
      const direction = index % 2 ? -1 : 1;
      const tilt = reduced ? 0 : (1 - enter) * direction;

      // Giảm biên độ xoay & dịch chuyển để chuyển động sang trọng, không bị "nhựa"
      cards[index].style.setProperty('--card-y', `${reduced ? 0 : ((1 - enter) * 42).toFixed(2)}px`);
      cards[index].style.setProperty('--card-rotate', `${(tilt * 3.8).toFixed(3)}deg`);
      cards[index].style.setProperty('--photo-rotate', `${reduced ? 0 : ((0.5 - p) * 5.5 * direction).toFixed(3)}deg`);
      cards[index].style.setProperty('--photo-y', `${reduced ? 0 : ((0.5 - p) * 20).toFixed(2)}px`);

      const rawBloom = reduced ? 1 : wishBloomProgress(currentY, artTop, artHeight, viewport);
      return easeInOutSine(rawBloom);
    });

    wishes.setProgress(blooms);

    const rawLetterEnter = segment(currentY, letterGeometry.top - viewport * 0.88, letterGeometry.top - viewport * 0.12);
    const letterEnter = easeOutCubic(rawLetterEnter);
    letter.style.setProperty('--vine-progress', reduced ? '1' : letterEnter.toFixed(4));
    letter.style.transform = reduced
      ? 'none'
      : `perspective(1400px) translate3d(0, ${((1 - letterEnter) * 44).toFixed(2)}px, 0) rotateX(${((1 - letterEnter) * 4.5).toFixed(2)}deg)`;

    const total = clamp(currentY / Math.max(1, root.scrollHeight - viewport));
    meter.firstElementChild.style.transform = `scaleY(${total.toFixed(4)})`;

    decor.style.opacity = reduced ? '0' : '1';
    [...decor.children].forEach((petal, index) => {
      const depth = 0.022 + index * 0.008;
      const y = ((viewport * (index / 6) - currentY * depth) % (viewport + 120) + viewport + 120) % (viewport + 120) - 60;
      const swayX = Math.sin(currentY / 950 + index * 1.4) * 28;
      const rot = currentY * (depth * 0.85) + Math.cos(currentY / 700 + index) * 18 + index * 48;
      petal.style.transform = `translate3d(${swayX.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
    });

    // Tiếp tục render cho đến khi quán tính (smoothedY) hội tụ hoàn toàn với scrollY
    if (!reduced && Math.abs(targetY - smoothedY) >= 0.15) {
      schedule();
    }
  };

  const schedule = () => {
    if (!disposed && frame == null && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(render);
    }
  };
  const resize = () => { measureNeeded = true; schedule(); };
  const visibility = () => { lastTime = performance.now(); schedule(); };
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  [...pins, ...cardSlots, letterSection, document.getElementById('main-content')].forEach(node => observer?.observe(node));
  const unsubscribe = observeMotionPreference(value => { reduced = value; resize(); }, pageState);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', visibility);

  Promise.resolve(document.fonts?.ready).then(() => {
    if (disposed) return;
    resize();
    anchorFrame = requestAnimationFrame(() => {
      if (disposed || userNavigated || !initialHash || location.hash !== initialHash) return;
      try {
        document.getElementById(decodeURIComponent(initialHash.slice(1)))?.scrollIntoView({ behavior: 'instant', block: 'start' });
        smoothedY = window.scrollY;
      } catch { /* A malformed hash should not interrupt the reading experience. */ }
    });
  });
  schedule();

  return () => {
    disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(anchorFrame); observer?.disconnect(); unsubscribe();
    for (const event of ['wheel', 'touchstart', 'keydown']) window.removeEventListener(event, markNavigation);
    window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visibility);
    root.classList.remove('scroll-story'); decor.remove(); meter.remove();
    sections.forEach((section, i) => { pins[i].replaceWith(...pins[i].childNodes); section.classList.remove('scroll-scene'); section.removeAttribute('style'); });
    cardSlots.forEach((slot, i) => { slot.replaceWith(cards[i]); cards[i].removeAttribute('style'); });
    letter.style.removeProperty('transform');
    letter.style.removeProperty('--vine-progress');
  };
}