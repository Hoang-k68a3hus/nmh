import { assetUrl } from './assets.js';

export function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

export function createPhoto(photo, { eager = false, onError } = {}) {
  if (!photo) return null;
  const figure = document.createElement('figure');
  figure.className = 'portrait';
  const image = document.createElement('img');
  image.alt = photo.decorative ? '' : photo.alt;
  image.width = photo.width;
  image.height = photo.height;
  image.loading = eager ? 'eager' : 'lazy';
  image.decoding = 'async';
  if (eager) image.fetchPriority = 'high';
  image.style.objectPosition = photo.focalPoint || '50% 50%';
  image.addEventListener('error', () => {
    figure.remove();
    onError?.();
  }, { once: true });
  figure.append(image);
  if (photo.caption) {
    const caption = document.createElement('figcaption');
    caption.textContent = photo.caption;
    figure.append(caption);
  }
  // Nghe error trước khi gán src, kể cả ảnh lỗi đã có trong cache.
  image.src = assetUrl(photo.src);
  return figure;
}

export function mountPhoto(host, photo, options) {
  const figure = createPhoto(photo, options);
  host.replaceChildren(...(figure ? [figure] : []));
}
