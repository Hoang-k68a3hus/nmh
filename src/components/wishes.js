import { flowerMarkup, FLOWER_VARIANTS } from '../graphics/svg/illustrations.js';
import { createPhoto, setText } from '../utils/dom.js';
import { segment } from '../motion/scroll-progress.js';
import { growingVineMarkup, storyThreadsMarkup, wishFlourishMarkup } from '../graphics/svg/story-botanicals.js';

export function mountWishes(wishes, section, { flower = 'stylized' } = {}) {
  const list = document.getElementById('wish-list');
  setText('wishes-eyebrow', section.eyebrow);
  setText('wishes-title-lead', section.title);
  setText('wishes-title-emphasis', section.emphasis);
  setText('wishes-message', section.message);
  setText('wishes-interaction-hint', section.interactionHint);
  setText('wishes-next-label', section.nextLabel);
  setText('wish-progress-complete', section.completeMessage);
  const complete = document.getElementById('wish-progress-complete');
  // Reserve its height so reaching the last wish never shifts the letter anchor.
  complete.hidden = false; complete.style.visibility = 'hidden';
  const progressHost = document.getElementById('wish-progress');
  const pipsWrap = document.createElement('div');
  pipsWrap.className = 'wish-progress-pips';
  pipsWrap.setAttribute('aria-hidden', 'true');
  const pips = wishes.map(() => {
    const pip = document.createElement('span');
    pip.className = 'wish-pip';
    pipsWrap.append(pip);
    return pip;
  });
  progressHost?.prepend(pipsWrap);
  const records = [];
  let disposed = false;
  const cards = wishes.map((wish, index) => {
    const card = document.createElement('article');
    card.className = 'wish-card'; card.id = `wish-${wish.id}`; card.dataset.wishId = wish.id;
    card.setAttribute('aria-labelledby', `wish-${wish.id}-title`);
    const art = document.createElement('div'); art.className = 'wish-art';
    const backdrop = document.createElement('div'); backdrop.className = 'story-backdrop';
    backdrop.innerHTML = storyThreadsMarkup(index); backdrop.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div'); copy.className = 'wish-copy';
    const number = document.createElement('p'); number.className = 'eyebrow';
    number.textContent = `${section.cardLabel} / ${String(index + 1).padStart(2, '0')}`;
    const heading = document.createElement('h3'); heading.id = `wish-${wish.id}-title`; heading.textContent = wish.title;
    const message = document.createElement('p'); message.className = 'wish-message'; message.textContent = wish.message;
    copy.append(number, heading, message);
    const bloom = document.createElement('div'); bloom.className = 'wish-bloom'; bloom.setAttribute('aria-hidden', 'true');
    bloom.innerHTML = flowerMarkup({ variant: FLOWER_VARIANTS.includes(flower) ? flower : FLOWER_VARIANTS[index % FLOWER_VARIANTS.length] });
    bloom.querySelector('svg').dataset.motionOwner = 'scroll';
    const photo = createPhoto(wish.photo, { onError() {
      if (disposed) return;
      card.dataset.layout = 'illustration'; art.replaceChildren(bloom);
    } });
    if (photo) {
      card.dataset.layout = 'photo';
      const scene = document.createElement('div'); scene.className = 'wish-photo-scene';
      const garland = document.createElement('div'); garland.className = 'wish-vine';
      garland.innerHTML = growingVineMarkup(index); garland.setAttribute('aria-hidden', 'true');
      scene.append(photo, garland); art.append(scene, bloom);
    }
    else { card.dataset.layout = 'illustration'; art.append(bloom); }
    const flourish = document.createElement('div'); flourish.className = 'wish-copy-flourish';
    flourish.setAttribute('aria-hidden', 'true'); flourish.innerHTML = wishFlourishMarkup(index);
    copy.append(flourish);
    card.append(backdrop, art, copy);
    records.push({ card, bloom, progress: -1 });
    return card;
  });
  list.replaceChildren(...cards);
  let lastCount = -1;
  return {
    setProgress(values) {
      records.forEach((record, i) => {
        const progress = values[i];
        if (record.progress === progress) return;
        record.progress = progress;
        const isBloomed = progress >= 0.95;
        record.card.style.setProperty('--vine-progress', progress.toFixed(4));
        record.card.dataset.bloomed = String(isBloomed);
        if (pips[i]) pips[i].dataset.bloomed = String(isBloomed);
        record.bloom.style.setProperty('--bloom', progress.toFixed(4));
        record.bloom.style.setProperty('--stem-growth', segment(progress, 0, 0.52).toFixed(4));
        record.bloom.style.setProperty('--leaf-open', segment(progress, 0.16, 0.72).toFixed(4));
        record.bloom.style.setProperty('--petal-open', segment(progress, 0.3, 0.96).toFixed(4));
        record.bloom.dataset.bloomProgress = progress.toFixed(4);
      });
      const count = values.filter(value => value >= 0.95).length;
      if (count !== lastCount) {
        lastCount = count;
        setText('wish-progress-count', `${count} / ${wishes.length} lời chúc đã nở hoa`);
        complete.style.visibility = count === wishes.length ? 'visible' : 'hidden';
      }
    },
    dispose() { disposed = true; pipsWrap.remove(); list.replaceChildren(); },
  };
}

