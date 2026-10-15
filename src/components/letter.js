import { createPhoto, setText } from '../utils/dom.js';
import { observeMotionPreference } from '../motion/preferences.js';
const owner = Symbol.for('a-garden-for-you.letter');

export function mountLetter(content, { audio, pageState } = {}) {
  const section = document.getElementById('letter');
  section[owner]?.dispose();
  let disposed = false;
  setText('letter-eyebrow', content.letter.eyebrow);
  setText('letter-title', content.letter.title);
  setText('letter-signature', content.sender.signature);
  const paragraphs = content.letter.paragraphs.map((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  });
  document.getElementById('letter-body').replaceChildren(...paragraphs);
  const reading = document.getElementById('letter-reading');
  reading.classList.toggle('has-photo', Boolean(content.letter.photo));
  section.classList.toggle('has-portrait', Boolean(content.letter.photo));
  const photo = createPhoto(content.letter.photo, { onError() {
    if (disposed) return;
    reading.classList.remove('has-photo'); section.classList.remove('has-portrait');
  } });
  document.getElementById('letter-photo').replaceChildren(...(photo ? [photo] : []));
  const host = document.getElementById('letter-audio-controls');
  host.replaceChildren();
  let unsubscribe = () => {}, button;
  const toggle = () => { void audio.toggleNarration(); };
  if (audio?.getState().narration.available) {
    button = document.createElement('button');
    button.id = 'listen-letter'; button.type = 'button'; button.className = 'narration-button';
    const message = document.createElement('p');
    message.id = 'narration-message'; message.className = 'narration-message';
    message.setAttribute('role', 'status'); message.setAttribute('aria-live', 'polite'); message.setAttribute('aria-atomic', 'true');
    button.setAttribute('aria-describedby', message.id);
    host.append(button, message);
    unsubscribe = audio.subscribe(({ narration }) => {
      const labels = { off: narration.ended ? content.letter.listenAgainLabel : content.letter.listenLabel,
        loading: content.letter.loadingLabel, playing: content.letter.pauseLabel, paused: content.letter.resumeLabel, error: content.letter.retryLabel };
      button.textContent = labels[narration.status]; button.dataset.audioState = narration.status;
      button.setAttribute('aria-pressed', String(narration.status === 'playing'));
      button.setAttribute('aria-busy', String(narration.status === 'loading'));
      message.textContent = narration.error === 'blocked' ? content.letter.blockedMessage
        : narration.status === 'error' ? content.letter.errorMessage
        : narration.status === 'off' && narration.ended ? content.letter.finishedMessage : '';
    });
    button.addEventListener('click', toggle);
  }
  let reduced;
  const seen = new WeakSet();
  let observer;
  const configureMotion = () => {
    observer?.disconnect();
    if (reduced || typeof IntersectionObserver !== 'function') {
      paragraphs.forEach((paragraph) => { paragraph.dataset.readingReveal = 'complete'; seen.add(paragraph); });
      return;
    }
    observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (disposed || !isIntersecting || seen.has(target)) return;
        target.dataset.readingReveal = 'visible'; seen.add(target); observer.unobserve(target);
      });
    }, { threshold: 0.08 });
    paragraphs.forEach((paragraph) => { if (!seen.has(paragraph)) observer.observe(paragraph); });
  };
  const unsubscribeMotion = observeMotionPreference(value => { reduced = value; configureMotion(); }, pageState);
  const api = {
    dispose() {
      if (disposed) return;
      disposed = true; unsubscribe(); button?.removeEventListener('click', toggle);
      observer?.disconnect(); unsubscribeMotion();
      paragraphs.forEach((paragraph) => { paragraph.dataset.readingReveal = 'complete'; });
      if (section[owner] === api) { delete section[owner]; host.replaceChildren(); }
    },
  };
  section[owner] = api;
  return api;
}
