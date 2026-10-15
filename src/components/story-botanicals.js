import { cornerVineMarkup, storyThreadsMarkup } from '../graphics/svg/story-botanicals.js';

export function mountStoryBotanicals() {
  const nodes = [];
  for (const [index, selector] of ['.paper-letter', '#finale'].entries()) {
    const host = document.querySelector(selector);
    const decor = document.createElement('div');
    decor.className = 'closing-botanicals'; decor.setAttribute('aria-hidden', 'true');
    decor.innerHTML = `<div class="story-backdrop">${storyThreadsMarkup(index)}</div>
      <div class="closing-vine closing-vine-left">${cornerVineMarkup(index)}</div>
      <div class="closing-vine closing-vine-right">${cornerVineMarkup(index + 1)}</div>`;
    host.prepend(decor); nodes.push(decor);
  }
  return () => nodes.forEach(node => node.remove());
}
