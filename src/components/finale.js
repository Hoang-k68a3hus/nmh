import { bouquetMarkup, bouquetRibbonMarkup } from '../graphics/svg/illustrations.js';
import { setText } from '../utils/dom.js';

export function mountFinale(content) {
  const host = document.getElementById('bouquet-art');
  const eyebrow = document.getElementById('finale-eyebrow');
  setText('finale-eyebrow', content.finale.eyebrow);
  setText('finale-title', content.finale.title);
  setText('finale-message', content.finale.message);
  setText('finale-signature', content.sender.signature);
  const hiddenEyebrow = eyebrow.classList.contains('sr-only');
  eyebrow.classList.add('sr-only');
  host.innerHTML = `${bouquetMarkup()}<div class="bouquet-ribbon" aria-hidden="true">${bouquetRibbonMarkup()}</div>`;
  host.querySelectorAll('svg').forEach(svg => { svg.dataset.motionOwner = 'scroll'; });
  return {
    dispose() {
      if (!hiddenEyebrow) eyebrow.classList.remove('sr-only');
    },
  };
}
