import { gardenMarkup } from '../graphics/svg/illustrations.js';
import { mountPhoto, setText } from '../utils/dom.js';
import { portraitGarlandMarkup, meadowMarkup, gardenAtmosphereMarkup } from '../graphics/svg/garden-botanicals.js';

export function mountGarden(content) {
  const garden = document.getElementById('garden');
  const owner = Symbol.for('a-garden-for-you.garden');
  garden[owner]?.();
  let disposed = false;
  setText('garden-eyebrow', content.hero.eyebrow);
  setText('garden-title', content.hero.title);
  const comma = content.hero.title.indexOf(',');
  if (comma !== -1) {
    const name = document.createElement('span'); name.className = 'garden-title-name';
    name.textContent = content.hero.title.slice(comma + 1).trim();
    document.getElementById('garden-title').replaceChildren(document.createTextNode(content.hero.title.slice(0, comma + 1)), name);
  }
  setText('garden-message', content.hero.message);
  setText('garden-next-label', content.hero.nextLabel);
  document.getElementById('garden-art').innerHTML = gardenMarkup();
  garden.classList.toggle('has-portrait', Boolean(content.hero.photo));
  mountPhoto(document.getElementById('hero-photo'), content.hero.photo, { eager: true, onError() { if (!disposed) garden.classList.remove('has-portrait'); } });
  const decorations = [];
  const decorate = (host, className, markup) => {
    const element = document.createElement('div'); element.className = className;
    element.setAttribute('aria-hidden', 'true'); element.innerHTML = markup;
    host.append(element); decorations.push(element);
  };
  decorate(document.getElementById('hero-photo'), 'portrait-garland', portraitGarlandMarkup());
  decorate(garden.querySelector('.garden-composition'), 'garden-meadow', meadowMarkup());
  decorate(garden, 'garden-atmosphere', gardenAtmosphereMarkup());
  const dispose = () => { disposed = true; decorations.forEach(element => element.remove()); if (garden[owner] === dispose) delete garden[owner]; };
  garden[owner] = dispose;
  return dispose;
}
