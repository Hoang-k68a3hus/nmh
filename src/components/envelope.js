import { envelopeMarkup } from '../graphics/svg/illustrations.js';
import { setText } from '../utils/dom.js';

/** One reversible timeline; no timer, navigation or focus changes. */
export function mountEnvelope(content) {
  const host = document.getElementById('envelope-art');
  host.innerHTML = envelopeMarkup();
  for (const [id, value] of Object.entries({
    'intro-eyebrow': content.intro.eyebrow, 'intro-title-lead': content.intro.title,
    'intro-title-tail': content.intro.titleTail, 'intro-title-emphasis': content.intro.emphasis,
    'intro-recipient': content.intro.recipientLabel, 'intro-message': content.intro.message,
  })) setText(id, value);
  const svg = host.querySelector('svg');
  svg.dataset.motionOwner = 'scroll';
  const flap = svg.querySelector('[data-part="flap"]');
  svg.querySelector('[data-part="card"]').before(flap);
  let animation, pending, disposed = false, progress = 0, reduced = false;
  const fallback = () => {
    svg.querySelector('[data-part="card"]').setAttribute('transform', `translate(0 ${-58 * progress})`);
    flap.setAttribute('transform', `translate(0 180) scale(1 ${1 - 2 * progress}) translate(0 -180)`);
    for (const part of ['seal', 'ribbon']) svg.querySelector(`[data-part="${part}"]`).style.opacity = String(Math.max(0, 1 - progress * 4));
  };
  return {
    setProgress(value, quiet = false) {
      if (disposed) return;
      reduced = quiet; progress = quiet ? 1 : value;
      document.getElementById('intro').dataset.experience = progress <= 0 ? 'intro' : progress >= 0.999 ? 'reading' : 'opening';
      if (animation) animation.setProgress(progress, reduced);
      else {
        fallback();
        if (!pending && !reduced) pending = import('../motion/timelines.js').then(({ createEnvelopeTimeline }) => {
          if (disposed) return;
          // Restore starting values before GSAP captures its initial pose.
          svg.querySelector('[data-part="card"]').removeAttribute('transform');
          flap.removeAttribute('transform');
          for (const part of ['seal', 'ribbon']) svg.querySelector(`[data-part="${part}"]`).style.removeProperty('opacity');
          animation = createEnvelopeTimeline(svg, { scrollDriven: true });
          animation.setProgress(progress, reduced);
        }).catch(() => { fallback(); });
      }
    },
    dispose() { disposed = true; animation?.dispose(); },
  };
}
