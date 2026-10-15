# Toàn bộ code phần kết: Một bó hoa dành cho em

Đây là code của section trong website hiện có. Các module cuộn, canvas và trang trí dùng chung với các section khác nên được giữ nguyên toàn bộ, gồm cả hàm phụ thuộc. Không phải một file HTML độc lập.

## Thư viện

```json
{
  "@fontsource/be-vietnam-pro": "5.3.0",
  "@fontsource/cormorant-garamond": "5.3.0",
  "gsap": "3.15.0",
  "three": "0.186.1"
}
```

## HTML trong index.html

```html
      <section id="finale" class="finale section shell" aria-labelledby="finale-title">
        <p class="eyebrow" id="finale-eyebrow">Với tất cả yêu thương</p>
        <div class="bouquet-art" id="bouquet-art" aria-hidden="true"></div>
        <h2 id="finale-title" tabindex="-1">Một bó hoa dành cho em.</h2>
        <p class="lead" id="finale-message">Thương em, hôm nay và những ngày sau.</p>
        <p class="signature finale-signature" id="finale-signature"></p>
      </section>
```

## Cấu hình liên quan từ src/config/content.js

```js
export const finaleContent = {
  "theme": {
    "background": "#FFF8F1",
    "accent": "#883F56",
    "rose": "#E8A6B5",
    "leaf": "#91A68A",
    "gold": "#E8C98E",
    "flower": "stylized"
  },
  "finale": {
    "eyebrow": "Với tất cả yêu thương",
    "title": "Một bó hoa dành cho em.",
    "message": "Thương em, hôm nay và những ngày sau.",
    "replayLabel": "Xem lại từ đầu"
  },
  "sender": {
    "name": "[Tên bạn]",
    "signature": "Thương em,\n[Tên bạn]"
  }
};
```

## Ghép vào init() trong src/main.js

```js
import { mountFinale } from './components/finale.js';
import { mountStoryBotanicals } from './components/story-botanicals.js';
import { mountGardenGraphics } from './graphics/three/scene-manager.js';
import { mountScrollScenes } from './motion/scroll-scenes.js';

// content đã qua prepareContent(); pageState, envelope và wishExperience đã có trong init().
const finaleExperience = mountFinale(content);
cleanup.push(() => finaleExperience.dispose());
const graphics = mountGardenGraphics(content, { pageState });
cleanup.push(() => graphics.dispose());
cleanup.push(mountStoryBotanicals());
cleanup.push(mountScrollScenes({ pageState, envelope, wishes: wishExperience, graphics }));
```

## Thứ tự import CSS trong src/main.js

```js
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/motion.css';
import './styles/scroll-experience.css';
import './styles/garden-botanicals.css';
import './styles/story-botanicals.css';
```

## src/components/finale.js

```js
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
```

## src/graphics/svg/illustrations.js

```js
// SVG do dự án kiểm soát. Dùng class/data-part thay ID để các instance không xung đột.
let bouquetIllustrationId = 0;
export const FLOWER_VARIANTS = ['rose', 'daisy', 'tulip'];
const svgStart = (kind, viewBox, extra = '') => `<svg class="illustration illustration-${kind}" data-illustration="${kind}" viewBox="${viewBox}" fill="none" aria-hidden="true" focusable="false" ${extra}>`;

function flowerHead(variant = 'rose') {
  if (variant === 'daisy') {
    const petals = Array.from({ length: 10 }, (_, index) => `<g transform="rotate(${index * 36} 60 60)"><ellipse cx="60" cy="38" rx="9" ry="23"/></g>`).join('');
    return `<g class="svg-head svg-head-daisy"><g class="svg-petals" data-part="petals">${petals}</g><g class="svg-center" data-part="center"><circle cx="60" cy="60" r="13"/><circle cx="56" cy="56" r="2" class="svg-center-detail"/><circle cx="64" cy="63" r="2" class="svg-center-detail"/></g></g>`;
  }
  if (variant === 'tulip') {
    return `<g class="svg-head svg-head-tulip"><g class="svg-petals" data-part="petals">
      <path d="M34 40c10 3 18 8 26 18 8-10 16-15 26-18 5 32-5 56-26 56S29 72 34 40Z"/>
      <path d="M60 26C45 41 42 65 60 88c18-23 15-47 0-62Z" class="svg-petal-light"/>
      <path d="M36 44c0 25 7 39 24 47 17-8 24-22 24-47" fill="none"/>
    </g></g>`;
  }
  return `<g class="svg-head svg-head-rose"><g class="svg-petals" data-part="petals">
    <path d="M60 20c11-7 23 2 25 12 14 0 23 15 17 26 8 11 0 26-12 29-4 13-21 19-31 11-12 8-29 1-32-12-14-4-20-21-11-31-5-13 5-26 19-25 3-11 16-17 25-10Z"/>
    <path d="M60 32c19-6 35 10 31 27 9 20-8 35-28 31-21 8-38-8-33-27-5-17 12-35 30-31Z" class="svg-petal-light"/>
    <path d="M60 43c15-5 26 8 22 19 3 14-11 23-24 18-16 2-24-14-17-24 2-9 11-16 19-13Z"/>
    <path d="M48 63c1-12 17-15 24-5 7 11-6 19-13 13-7-5-1-12 4-9" class="svg-petal-line" fill="none"/>
  </g></g>`;
}

export function flowerMarkup({ variant = 'rose' } = {}) {
  const kind = FLOWER_VARIANTS.includes(variant) ? variant : 'rose';
  return `${svgStart('flower', '0 0 140 210', `data-variant="${kind}"`)}
    <g class="svg-stems" data-part="stem"><path class="svg-stem" pathLength="1" d="M70 85c-5 43 5 67-1 105"/></g>
    <g class="svg-leaves" data-part="leaves"><path d="M68 140c-28-1-41-17-41-35 26 1 41 14 41 35Z"/><path d="M70 162c28-2 43-19 42-35-25 1-42 14-42 35Z"/></g>
    <g transform="translate(10 0)">${flowerHead(kind)}</g>
    <path class="svg-ground" d="M43 191c18 5 39 5 55 0"/>
  </svg>`;
}

export function envelopeMarkup() {
  return `${svgStart('envelope', '0 0 540 460')}
    <ellipse class="svg-shadow" cx="280" cy="392" rx="172" ry="15"/>
    <g class="svg-botanical-branch">
      <path class="svg-stem" pathLength="1" d="M394 182c10-38 29-72 62-104"/>
      <g class="svg-leaves" data-part="leaves">
        <path d="M406 162c-28-6-35-24-25-36 16 1 27 14 25 36Z"/>
        <path d="M422 140c3-28 19-42 32-35 4 17-11 30-32 35Z"/>
        <path d="M435 116c-22-9-26-25-17-35 14 3 21 15 17 35Z"/>
        <path d="M452 94c5-21 17-31 28-25 2 14-10 23-28 25Z"/>
      </g>
    </g>
    <g class="svg-envelope-float"><g transform="rotate(-8 270 230)">
      <rect class="svg-envelope-back" x="77" y="180" width="386" height="188" rx="6"/>
      <path class="svg-envelope-flap svg-envelope-flap-lining" data-part="flap" d="M77 180 258 302c7 4 17 4 24 0l181-122Z"/>
      <g data-part="card">
        <rect class="svg-paper" x="112" y="114" width="316" height="240" rx="8"/>
        <rect class="svg-paper-border" x="124" y="126" width="292" height="216" rx="4" stroke="#E9C787" stroke-width="1.2" opacity="0.7"/>
        <path class="svg-paper-lines" d="M156 162h136M156 182h196M156 202h164"/>
      </g>
      <path class="svg-envelope-side-left" d="M77 180v188l148-96-148-92Z" fill="#EAD9C3"/>
      <path class="svg-envelope-side-right" d="M463 180v188l-148-96 148-92Z" fill="#E6D4BC"/>
      <path class="svg-paper-lines" d="m77 368 137-100m249 100-137-100"/>
      <path class="svg-envelope-front" d="M77 368h386L282 248c-7-4-17-4-24 0L77 368Z"/>
      <g data-part="ribbon"><path class="svg-thread" pathLength="1" d="M77 279c50-13 137-4 193-20 68-20 125-19 193-29"/></g>
      <g class="svg-seal" data-part="seal"><path d="M270 230c9-5 17 1 21 8 10 0 15 9 13 17 6 8 1 19-7 22-1 10-11 16-20 13-8 7-19 2-22-6-10 0-17-9-14-18-6-8-2-19 6-22 2-9 14-16 23-14Z"/>
        <g transform="translate(250 239) scale(.34)">${flowerHead('daisy')}</g>
      </g>
      <g class="svg-flying-petal" data-part="flying-petal"><path d="M288 114c15 4 18 17 6 31-15-5-21-19-6-31Z"/></g>
    </g></g>
    <g class="svg-sparkle"><path d="m105 91 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z"/></g>
  </svg>`;
}

export function gardenMarkup() {
  return `${svgStart('garden', '0 0 500 500')}
    <ellipse class="svg-halo" cx="260" cy="252" rx="188" ry="184"/>
    <g class="svg-stems" data-part="stem"><path class="svg-stem" pathLength="1" d="M194 426c10-117 48-193 71-262"/><path class="svg-stem" pathLength="1" d="M251 426c28-89 65-138 99-177"/><path class="svg-stem" pathLength="1" d="M231 426c-16-69-40-116-79-144"/></g>
    <g class="svg-leaves" data-part="leaves"><path d="M222 308c-66-6-85-37-80-65 42-1 77 27 80 65Z"/><path d="M251 337c55-1 79-28 76-56-38-2-69 22-76 56Z"/><path d="M214 390c-48-4-71-27-65-51 34-3 62 17 65 51Z"/><path d="M263 397c47-3 70-25 71-48-34-3-65 17-71 48Z"/></g>
    <g transform="translate(205 91)">${flowerHead('rose')}</g>
    <g transform="translate(296 190) scale(.9)">${flowerHead('daisy')}</g>
    <g transform="translate(94 217) scale(.85)">${flowerHead('tulip')}</g>
    <path class="svg-ground" d="M133 430c85 13 154 11 232-3"/>
    <g class="svg-sparkle"><path d="m137 132 3 10 10 3-10 3-3 10-3-10-10-3 10-3 3-10Z"/><circle cx="374" cy="150" r="3"/><circle cx="107" cy="350" r="2"/></g>
  </svg>`;
}

export function bouquetMarkup() {
  const prefix = `bouquet-${++bouquetIllustrationId}`;
  return `${svgStart('bouquet', '0 0 300 350')}
    <defs>
      <linearGradient id="${prefix}-wrap-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF9"/>
        <stop offset="55%" stop-color="#F7E4DC"/>
        <stop offset="100%" stop-color="#E8C5B8"/>
      </linearGradient>
      <linearGradient id="${prefix}-wrap-grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F6D5DC"/>
        <stop offset="100%" stop-color="#DFA5B3"/>
      </linearGradient>
      <radialGradient id="${prefix}-hydrangea-grad" cx="40%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#F3E6F5"/>
        <stop offset="60%" stop-color="#D5B8DF"/>
        <stop offset="100%" stop-color="#B695C4"/>
      </radialGradient>
    </defs>
    <g class="svg-stems" data-part="stem">
      <path class="svg-stem" pathLength="1" d="M150 95v205M105 125l45 175M195 120l-45 180"/>
    </g>
    <g class="svg-leaves" data-part="leaves" transform="translate(0 -32)">
      <path d="M112 182c-38-6-54-26-48-46 28 1 48 19 48 46Z"/>
      <path d="M188 180c34-3 52-21 48-42-28-1-47 17-48 42Z"/>
      <path d="M135 198c-26 8-44 2-52-14 20-10 38-6 52 14Z"/>
    </g>
    <!-- Cụm hoa đầy đặn: Hoa hồng, Cẩm tú cầu tím pastel, Cúc họa mi -->
    <g transform="translate(88 22) scale(1.02)">${flowerHead('rose')}</g>
    <g transform="translate(138 42) scale(.82)">${flowerHead('daisy')}</g>
    <g transform="translate(46 58) scale(.78)">${flowerHead('daisy')}</g>
    <!-- Cụm cẩm tú cầu tím phấn bên trái -->
    <g class="svg-hydrangea" transform="translate(112 128)">
      <circle cx="0" cy="0" r="32" fill="url(#${prefix}-hydrangea-grad)"/>
      <circle cx="-12" cy="-10" r="12" fill="#EFE3F4" opacity=".8"/>
      <circle cx="10" cy="-12" r="11" fill="#E5D1EC" opacity=".8"/>
      <circle cx="-8" cy="12" r="11" fill="#DEC6E8" opacity=".85"/>
      <circle cx="12" cy="8" r="12" fill="#F5ECF8" opacity=".85"/>
    </g>
    <g transform="translate(148 92) scale(.88)">${flowerHead('daisy')}</g>
    <g transform="translate(96 86) scale(.82)">${flowerHead('rose')}</g>
    <!-- Giấy gói uốn cong mềm mại -->
    <g data-part="paper">
      <path class="svg-bouquet-wrap" style="fill:url(#${prefix}-wrap-grad-main)" d="M72 156 C92 215 118 248 132 262 L168 262 C182 248 208 215 228 156 Q190 185 150 188 Q110 185 72 156 Z"/>
      <path class="svg-bouquet-wrap" style="fill:url(#${prefix}-wrap-grad-pink)" opacity=".88" d="M72 156 C96 208 122 244 134 262 L156 262 C148 225 122 184 72 156 Z"/>
      <path class="svg-bouquet-wrap" style="fill:url(#${prefix}-wrap-grad-main)" d="M132 260 C122 285 118 308 124 322 Q150 328 176 322 C182 308 178 285 168 260 Z"/>
      <path class="svg-paper-lines" d="M134 260 C130 284 128 304 132 323 M166 260 C170 284 172 304 168 323"/>
    </g>
    <g data-part="ribbon">${bouquetRibbonMarkup().replace('<svg ', '<svg x="69" y="226" width="162" height="103.5" ')}</g>
  </svg>`;
}

export function threadMarkup({ reverse = false } = {}) {
  return `${svgStart('thread', '0 0 300 76')}
    <g ${reverse ? 'transform="translate(300 0) scale(-1 1)"' : ''}><path class="svg-thread" pathLength="1" d="M8 55c44-44 73-44 92-22s-10 42-28 25c-16-17 9-40 34-25 26 16 66 30 124 3"/><g class="svg-leaves" data-part="leaves"><path d="M229 35c13-22 27-26 35-19-7 13-19 17-35 19Z"/><path d="M231 36c19-1 33 5 32 15-14 1-25-3-32-15Z"/></g></g>
  </svg>`;
}

export function bouquetRibbonMarkup() {
  const prefix = `bouquet-${++bouquetIllustrationId}`;
  return `${svgStart('bouquet-ribbon', '0 0 180 115')}
    <defs>
      <linearGradient id="${prefix}-silk-ribbon-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F7D9D4"/>
        <stop offset="50%" stop-color="#E6B3AC"/>
        <stop offset="100%" stop-color="#C98A86"/>
      </linearGradient>
      <linearGradient id="${prefix}-silk-ribbon-dark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#B87674"/>
        <stop offset="100%" stop-color="#DDA29C"/>
      </linearGradient>
    </defs>
    <!-- Phần nơ lụa bản to đầy đặn -->
    <g class="svg-silk-bow">
      <!-- Hai dải đuôi nơ rủ xuống -->
      <path d="M84 44 C75 68 62 88 54 106 L72 103 C78 86 84 66 89 46 Z" fill="url(#${prefix}-silk-ribbon-dark)"/>
      <path d="M96 44 C105 68 118 88 126 106 L108 103 C102 86 96 66 91 46 Z" fill="url(#${prefix}-silk-ribbon-body)"/>
      <!-- Dải đai ngang ôm eo bó hoa -->
      <rect x="52" y="34" width="76" height="12" rx="6" fill="url(#${prefix}-silk-ribbon-dark)"/>
      <!-- Hai cánh nơ phồng hai bên -->
      <path d="M88 40 C66 16 28 18 32 42 C35 60 68 54 88 43 Z" fill="url(#${prefix}-silk-ribbon-body)" stroke="#C48783" stroke-width=".8"/>
      <path d="M92 40 C114 16 152 18 148 42 C145 60 112 54 92 43 Z" fill="url(#${prefix}-silk-ribbon-body)" stroke="#C48783" stroke-width=".8"/>
      <!-- Hốc tối tạo chiều sâu bên trong cánh nơ -->
      <path d="M84 40 C68 30 46 32 46 41 C46 47 68 46 84 42 Z" fill="#B57472" opacity=".45"/>
      <path d="M96 40 C112 30 134 32 134 41 C134 47 112 46 96 42 Z" fill="#B57472" opacity=".45"/>
      <!-- Nút thắt chính giữa -->
      <rect x="81" y="31" width="18" height="19" rx="5" fill="url(#${prefix}-silk-ribbon-body)" stroke="#C0827E" stroke-width=".9"/>
    </g>
    <!-- Đường nét vẽ hiệu ứng thắt nơ khi cuộn -->
    <path class="svg-ribbon" data-part="ribbon" pathLength="1" d="M90 40C72 16 34 18 34 41c0 16 37 14 56 2 19-25 56-23 56 0 0 16-38 14-56 0Zm0 2L62 102m28-60 28 60" opacity=".45"/>
  </svg>`;
}
```

## src/utils/dom.js

```js
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
```

## src/utils/assets.js

```js
/** Base URL cùng origin: / hoặc /repository/. */
export function normalizeBasePath(value = '/') {
  if (typeof value !== 'string') throw new TypeError('Base path phải là chuỗi.');
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';
  if (/[?#\\]/.test(trimmed) || trimmed.includes('://') || trimmed.startsWith('//')) {
    throw new Error('Base path phải là đường dẫn, ví dụ / hoặc /ten-repository/.');
  }
  const segments = trimmed.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('Base path không được chứa . hoặc ..');
  }
  return `/${segments.join('/')}/`;
}

/** Tài nguyên public: dùng đường dẫn assets/..., không kèm public/. */
export function resolveAssetPath(path, base = '/') {
  if (typeof path !== 'string' || !path.trim()) {
    throw new TypeError('Asset phải có đường dẫn.');
  }
  const normalized = path.trim().replace(/^\/+/, '');
  if (/[\u0000-\u001f\u007f?#\\:%{}]/.test(normalized) || normalized.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error('Asset phải là đường dẫn local bên trong public/.');
  }
  return `${normalizeBasePath(base)}${normalized}`;
}

export function assetUrl(path) {
  return resolveAssetPath(path, import.meta.env.BASE_URL);
}
```

## src/components/story-botanicals.js

```js
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
```

## src/graphics/svg/story-botanicals.js

```js
import { botanicalFlower, botanicalLeaf } from './garden-botanicals.js';

let storyRibbonId = 0;
const svg = (box, content) => `<svg viewBox="${box}" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

// Sample the same curves used by the stem. Bud thresholds follow travelled
// distance, so a blossom never opens before its branch has reached it.
function branchGeometry(curves) {
  const points = [];
  let distance = 0;
  curves.forEach(([a, b, c, d]) => {
    for (let i = points.length ? 1 : 0; i <= 40; i++) {
      const t = i / 40, u = 1 - t;
      const x = u ** 3 * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t ** 3 * d[0];
      const y = u ** 3 * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t ** 3 * d[1];
      const previous = points.at(-1);
      if (previous) distance += Math.hypot(x - previous.x, y - previous.y);
      points.push({ x, y, distance });
    }
  });
  return {
    path: `M${curves[0][0].join(' ')}${curves.map(([, b, c, d]) => `C${b.join(' ')} ${c.join(' ')}${d.join(' ')}`).join(' ')}`,
    pointAt: t => points.find(point => point.distance >= distance * t) || points.at(-1)
  };
}

export function growingVineMarkup(variant = 0) {
  const branch = branchGeometry([
    [[80, 446], [190, 485], [350, 463], [354, 378]],
    [[354, 378], [380, 286], [321, 234], [354, 153]],
    [[354, 153], [395, 48], [283, 3], [210, 23]],
    [[210, 23], [141, 40], [55, -2], [28, 75]],
  ]);
  const buds = Array.from({ length: 13 }, (_, i) => {
    const t = .04 + i * .076;
    const { x, y } = branch.pointAt(t);
    const size = .56 + (i % 3) * .16;
    const color = (i + variant) % 3 === 0 ? 'white' : (i + variant) % 4 === 0 ? 'deep' : 'pink';
    // Đặt ngưỡng --bud-at sát với tiến độ thực của thân dây leo để hoa nở ngay khi ngọn dây vươn tới
    return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">
      <g class="vine-bud" style="--bud-at:${(t * .88).toFixed(4)}">
        ${botanicalLeaf(0, 0, i % 2 ? -58 : 92, .52, i % 2 === 0)}
        ${botanicalFlower(0, 0, size, color, i * 37)}
      </g></g>`;
  }).join('');
  return svg('0 0 380 480', `<g class="vine-composition${variant % 2 ? ' vine-composition-mirrored' : ''}">
    <path class="vine-guide" d="${branch.path}"/>
    <path class="vine-stem" pathLength="1" d="${branch.path}"/>
    ${buds}</g>`);
}

export function storyThreadsMarkup(variant = 0, { silk = false } = {}) {
  const ribbonId = `story-silk-${++storyRibbonId}`;
  const curves = variant % 2
    ? 'M-80 120C140 35 260 485 555 435S885 450 1250 365 M-60 138C140 55 262 502 558 452S890 468 1260 382'
    : 'M-80 390C175 565 310 470 555 435S895 455 1260 375 M-60 408C178 582 315 486 558 452S898 470 1260 392';

  // Dải ruy băng lụa mềm có đuôi én cho trang Finale (variant === 1)
  const silkRibbonBanner = silk ? `
    <defs>
      <linearGradient id="${ribbonId}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#E5B0BA" stop-opacity="0.55"/>
        <stop offset="35%" stop-color="#ECAEC0" stop-opacity="0.48"/>
        <stop offset="70%" stop-color="#E5B0BA" stop-opacity="0.52"/>
        <stop offset="100%" stop-color="#D998A7" stop-opacity="0.6"/>
      </linearGradient>
    </defs>
    <path class="story-silk-ribbon" fill="url(#${ribbonId})"
      d="M 15 112
         C 175 88, 285 435, 585 415
         C 825 398, 985 415, 1185 352
         L 1172 363
         L 1188 370
         C 985 433, 825 416, 585 431
         C 280 451, 170 106, 12 130
         L 28 120 Z" />
  ` : '';

  const branch = branchGeometry(variant % 2
    ? [[[-80, 120], [140, 35], [260, 485], [555, 435]], [[555, 435], [850, 385], [885, 450], [1250, 365]]]
    : [[[-80, 390], [175, 565], [310, 470], [555, 435]], [[555, 435], [800, 400], [895, 455], [1260, 375]]]);

  const buds = [.09, .18, .28, .42, .84, .93].map((t, i) => {
    const { x, y } = branch.pointAt(t);
    return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><g class="vine-bud" style="--bud-at:${(t * .86).toFixed(4)}">
      ${botanicalLeaf(0, 0, i % 2 ? -65 : 80, .45, true)}${botanicalFlower(0, 0, .48 + i % 2 * .15, i % 2 ? 'white' : 'pink', i * 30)}</g></g>`;
  }).join('');

  return svg('0 0 1200 560', `
    ${silkRibbonBanner}
    <path class="story-thread" d="${curves}"/>
    <g class="story-growing-branch"><path class="vine-stem" pathLength="1" d="${branch.path}"/>${buds}</g>
    <path class="story-orbit" d="M215 490C-10 370 140 8 351 55S620 466 355 500"/>
    <g class="story-floating">
      ${botanicalLeaf(112, 137, -32, .66, true)}
      ${botanicalLeaf(1022, 125, 40, .65)}
      ${botanicalLeaf(245, 472, 18, .58, true)}
      <!-- Các cánh hoa hồng rơi mềm mại xung quanh bó hoa -->
      <path d="M475 74C462 63 466 50 478 53 488 57 486 70 475 74Z" fill="#e8b4c0" opacity=".85"/>
      <path d="M468 228C456 238 462 252 475 247 485 240 480 225 468 228Z" fill="#d4889a" opacity=".88"/>
      <path d="M718 242C706 232 712 220 724 224 735 230 730 245 718 242Z" fill="#e59FB0" opacity=".85"/>
      <path d="M975 399C955 385 961 374 971 376 984 380 984 393 975 399Z" fill="#ebc9cf"/>
      <path d="M91 400l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z M1100 335l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#fffefa"/>
    </g>`);
}

export function cornerVineMarkup(variant = 0) {
  const branch = branchGeometry([[[8, 153], [95, 182], [65, 45], [165, 20]]]);
  const buds = Array.from({ length: 7 }, (_, i) => {
    const t = .08 + i * .14, { x, y } = branch.pointAt(t);
    return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><g class="vine-bud" style="--bud-at:${(t * .86).toFixed(4)}">
      ${botanicalLeaf(0, 0, i % 2 ? -75 : 85, .6, true)}${botanicalFlower(0, 0, .58 + i % 2 * .2, (i + variant) % 3 ? 'pink' : 'white', i * 45)}</g></g>`;
  }).join('');
  return svg('0 0 180 180', `<path class="vine-guide" d="${branch.path}"/><path class="vine-stem" pathLength="1" d="${branch.path}"/>${buds}`);
}

export function wishFlourishMarkup(variant = 0) {
  return svg('0 0 180 36', `<path class="vine-stem" pathLength="1" d="M2 21C45 29 92 11 151 20"/>
    <g class="vine-bud" style="--bud-at:.65">${botanicalFlower(151, 20, .45, variant % 2 ? 'pink' : 'white')}${botanicalLeaf(129, 20, 70, .35, true)}</g>`);
}
```

## src/graphics/svg/garden-botanicals.js

```js
// Decorative SVG stays separate from the Three.js canvas and never covers the face.
const svg = (viewBox, content) => `<svg viewBox="${viewBox}" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

const leaf = (x, y, angle, scale = 1, light = false) => 
  `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">
    <path d="M0 0C-6-13 2-26 14-32 18-17 11-4 0 0Z" fill="${light ? '#c5d0b8' : '#96a88b'}"/>
    <path d="M0 0C4-10 8-19 11-26" stroke="#f4f2df" stroke-width=".65" stroke-linecap="round" opacity=".65"/>
  </g>`;

const driftingPetal = (x, y, angle, scale = 1, deep = false) =>
  `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">
    <path d="M0 0C-7-9-5-22 3-26 11-21 12-8 0 0Z" fill="${deep ? '#d89aa7' : '#ecc7cf'}" opacity=".88"/>
    <path d="M1-3C2-11 3-17 3-22" stroke="#fff6f8" stroke-width=".5" stroke-linecap="round" opacity=".5"/>
  </g>`;

const sparkle = (x, y, scale = 1, delay = 0) =>
  `<path class="botanical-sparkle" style="--delay: ${delay}s" transform="translate(${x} ${y}) scale(${scale})" d="M0-12C1-4 4-1 12 0 4 1 1 4 0 12-1 4-4 1-12 0-4-1-1-4 0-12Z" fill="#fffdf7" opacity=".85"/>`;

// Bông hoa nâng cấp với cánh hoa uốn lượn tự nhiên và 3 bảng màu: 'pink', 'white', 'deep'
const flower = (x, y, scale = 1, variant = 'pink', angle = 0) => {
  const isWhite = variant === true || variant === 'white';
  const isDeep = variant === 'deep';
  const count = isWhite ? 8 : 6;

  const palette = isWhite
    ? { p1: '#fffef7', p2: '#f4f0de', stroke: '#dfd9c3', center: '#d8be75', ring: '#e8d396' }
    : isDeep
    ? { p1: '#cf8e9d', p2: '#bc7788', stroke: '#a96576', center: '#8c4f60', ring: '#ebcdd4' }
    : { p1: '#edd0d7', p2: '#dfb2be', stroke: '#cfa0ad', center: '#b87b8e', ring: '#f7e6ea' };

  const petals = Array.from({ length: count }, (_, i) => {
    const rot = (i * 360) / count;
    const fill = i % 2 ? palette.p1 : palette.p2;
    const path = isWhite
      ? 'M0 0 C-3.2 -5 -4.2 -12 -1.5 -15.5 C0 -17 1.5 -15.5 0 -15.5 C1.5 -15.5 0 -17 1.5 -15.5 C4.2 -12 3.2 -5 0 0Z'
      : 'M0 0 C-5.5 -4 -7 -11.5 -2.5 -15 C-0.8 -16.2 0 -14.8 0 -14.8 C0 -14.8 0.8 -16.2 2.5 -15 C7 -11.5 5.5 -4 0 0Z';
    return `<path d="${path}" transform="rotate(${rot})" fill="${fill}" stroke="${palette.stroke}" stroke-width=".4" stroke-linejoin="round"/>`;
  }).join('');

  const innerPetals = !isWhite
    ? Array.from({ length: 3 }, (_, i) =>
        `<path d="M0 0 C-3 -3 -3.5 -8 0 -10.5 C3.5 -8 3 -3 0 0Z" transform="rotate(${i * 120 + 30})" fill="${palette.p1}" opacity=".85"/>`
      ).join('')
    : '';

  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">
    <g class="botanical-flower">
      ${petals}
      ${innerPetals}
      <circle r="${isWhite ? 4.2 : 3.5}" fill="${palette.ring}"/>
      <circle r="${isWhite ? 3.2 : 2.5}" fill="${palette.center}"/>
      <circle cx="-1" cy="-1" r="1" fill="#fff9e6" opacity=".85"/>
    </g>
  </g>`;
};

export { flower as botanicalFlower, leaf as botanicalLeaf };

// Hoa dạng cúp / tulip cho tiền cảnh giống ảnh mẫu
const tulipBud = (x, y, scale = 1, angle = 0, deep = true) => {
  const c1 = deep ? '#bf7b8b' : '#e3b5c1';
  const c2 = deep ? '#a86475' : '#d19ca9';
  const c3 = deep ? '#cf8e9d' : '#edd0d7';
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">
    <g class="botanical-flower">
      <path d="M0 2 C-9 -2 -11 -15 -4 -22 C-1 -16 1 -16 4 -22 C11 -15 9 -2 0 2Z" fill="${c1}"/>
      <path d="M0 2 C-6 -4 -6 -16 0 -24 C6 -16 6 -4 0 2Z" fill="${c3}"/>
      <path d="M0 2 C-10 0 -13 -11 -8 -19 C-4 -12 -2 -5 0 2Z" fill="${c2}" opacity=".9"/>
      <path d="M0 2 C10 0 13 -11 8 -19 C4 -12 2 -5 0 2Z" fill="${c2}" opacity=".9"/>
    </g>
  </g>`;
};

export function portraitGarlandMarkup() {
  const points = [
    [30,412,-42],[22,362,-62],[24,312,-72],[22,260,-58],[24,208,-65],
    [29,154,-48],[44,105,-28],[76,65,-8],[120,35,16],[168,22,42],
    [220,30,66],[263,53,76],[300,90,96],[320,136,115],[327,185,120],
    [329,235,125],[329,290,125],[328,345,125],[325,400,130],
    [58,425,25],[88,430,45] // Nhánh hoa vươn nhẹ vào góc dưới bên trái khung ảnh
  ];
  const greenery = points.map(([x,y,angle], i) => 
    `${leaf(x,y,angle,.66 + (i % 3) * .12, i % 2 === 0)}${i % 2 ? leaf(x,y+6,angle+125,.48,true) : ''}`
  ).join('');

  const blooms = [
    [40,420,1.05,'white'], [68,428,.68,'pink'], [25,340,.82,'pink'], [26,282,.68,'white'],
    [22,222,.8,'deep'], [34,132,1.05,'pink'], [64,76,.75,'white'], [104,42,.72,'pink'],
    [146,24,.6,'white'], [199,25,.92,'pink'], [242,42,.62,'deep'], [268,60,.85,'pink'],
    [314,124,.7,'white'], [329,186,.98,'pink'], [332,258,.74,'white'], [327,324,.76,'deep'],
    [316,408,.88,'white'], [295,422,.62,'pink']
  ].map(([x,y,size,variant], i) => flower(x,y,size,variant,i*29)).join('');

  return svg('0 0 350 460', `
    <g class="garland-vine">
      <path d="M95 432C55 432 38 426 35 415 18 362 23 263 24 180 25 86 83 23 173 23S327 88 327 180L326 415" stroke="#9dad90" stroke-width="1.25" stroke-linecap="round"/>
      <path d="M37 422C12 340 32 257 19 181 12 92 89 15 174 19S337 88 333 182" stroke="#c1c9b0" stroke-width=".7" stroke-dasharray="3 2"/>
      ${greenery}
      ${blooms}
    </g>
  `);
}

export function meadowMarkup() {
  const grasses = Array.from({ length: 28 }, (_, i) => {
    const x = 115 + i * 11;
    const tipX = x + Math.sin(i * 1.5) * 48;
    const tipY = 115 + (i * 41 % 125);
    const baseY = 282 + Math.sin(i * 2.1) * 6;
    return `<path d="M${x} ${baseY}Q${x + (tipX - x) * .35} ${baseY - 55} ${tipX} ${tipY}Q${x + (tipX - x) * .55 + 5} ${baseY - 45} ${x + 3.5} ${baseY}Z" fill="${i % 3 === 0 ? '#8fa382' : i % 2 ? '#a3b596' : '#c0cdb4'}" opacity="${i % 2 ? '.88' : '.68'}"/>`;
  }).join('');

  const stems = `<path d="M185 282Q145 230 132 178 M235 284Q228 215 245 148 M287 284Q315 215 312 135 M341 282Q398 195 408 68 M369 282Q427 194 480 124 M405 282Q425 235 462 205" stroke="#94a689" stroke-width="1.8" stroke-linecap="round"/>`;
  
  const branches = 
    leaf(401,131,30,.88) + leaf(399,160,105,.9,true) + leaf(418,185,55,.86) +
    leaf(445,154,100,.76) + leaf(433,238,40,.75) + leaf(144,240,-65,.86) +
    leaf(125,214,75,.75,true) + leaf(312,215,85,.72) + leaf(238,210,-45,.78,true);

  const tallBlossoms = 
    tulipBud(132,178,.95,-18,true) +
    flower(245,148,1.1,'white',10) +
    flower(312,135,1.22,'deep',-8) +
    flower(408,68,.88,'white',15) +
    flower(480,124,.92,'pink',25) +
    flower(462,205,.72,'white',30) +
    flower(365,172,1.08,'white',5);

  const ground = `
    <path d="M45 288Q125 335 231 289T415 280" stroke="#a6b599" stroke-width="1.4" stroke-linecap="round"/>
    ${leaf(85,298,-65,.85)}${leaf(118,302,-45,.92)}${leaf(158,306,40,.78,true)}
    ${leaf(215,294,-65,.76)}${leaf(337,292,75,.82,true)}${leaf(388,288,55,.72)}
    ${flower(58,286,.78,'pink',-15)}
    ${flower(135,296,.95,'white',8)}
    ${flower(195,302,1.02,'pink',-5)}
    ${flower(252,292,1.15,'deep',12)}
    ${flower(288,296,.9,'pink',20)}
    ${flower(334,289,.95,'white',-10)}
    ${flower(372,285,.78,'pink',18)}
    ${sparkle(468, 258, 1.35, 0.2)}
    ${sparkle(495, 220, 0.7, 1.1)}
  `;

  return svg('0 0 520 330', `<g class="meadow-grasses">${grasses}${stems}${branches}${tallBlossoms}</g><g class="meadow-trailing">${ground}</g>`);
}

export function gardenAtmosphereMarkup() {
  const threads = `
    <g stroke="#dab8b5" stroke-width="1.1" opacity=".42">
      <path d="M-40 179C44-35 192 139 349-58M-18 145C87 3 205 122 354-36"/>
      <path d="M-35 368C133 615 325 635 527 471S807 459 1080 347"/>
      <path d="M-19 394C124 610 286 655 499 502S777 436 1092 376" stroke-width=".75" opacity=".7"/>
      <path d="M847-42C1058-18 951 125 1153 158S1372 323 1428 376"/>
      <path d="M744 132C863 43 1151 81 1160 319S1290 589 1450 571" opacity=".55"/>
    </g>`;

  const floatingElements = `
    <g class="garden-drifting-leaves">
      ${driftingPetal(78, 185, 35, 1.05, true)}
      ${driftingPetal(22, 285, -25, 0.9, false)}
      ${driftingPetal(645, 340, 48, 0.75, false)}
      ${driftingPetal(1290, 385, -35, 0.95, true)}
      ${driftingPetal(1240, 95, 25, 0.7, false)}
      ${leaf(98, 315, -52, 1.05)}
      ${leaf(562, 198, 32, 1.1)}
      ${leaf(550, 298, 95, .78, true)}
      ${leaf(1265, 460, 48, .72, true)}
    </g>`;

  const glints = [
    [719,173,2.5],[1219,240,2.8],[1104,489,2.2],[699,379,2.6],[1287,392,3],[1008,94,2.4],
    [480,460,2],[615,120,2.2],[1330,280,2.5]
  ].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffdf3" opacity=".8"/>`).join('');

  const sparkles = `
    ${sparkle(675, 145, 0.65, 0)}
    ${sparkle(1185, 210, 0.8, 0.7)}
    ${sparkle(1310, 420, 0.9, 1.4)}
    ${sparkle(520, 490, 0.6, 2.1)}
  `;

  return svg('0 0 1400 650', `${threads}${floatingElements}<g class="garden-glints">${glints}${sparkles}</g>`);
}
```

## src/graphics/three/scene-manager.js

```js
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
```

## src/services/graphics-controller.js

```js
/** Module về muộn nhận view mới nhất, kể cả người xem đã tới finale. */
export function createGraphicsController({ loadScene, onState = () => {} }) {
  let view = { active: false, layout: 'garden', reduced: false };
  let status = 'idle', scene, generation = 0, disposed = false;
  const report = (value) => { status = value; onState({ status, view }); };
  function fail() {
    if (disposed || status === 'fallback') return;
    generation++; scene?.dispose(); scene = undefined; report('fallback');
  }
  const apply = () => {
    if (!scene) return;
    try { scene.configure(view); } catch { fail(); }
  };
  function load() {
    const current = ++generation;
    report('loading');
    Promise.resolve().then(() => {
      if (disposed || generation !== current) return null;
      return loadScene({
        onReady() { if (!disposed && generation === current) report('ready'); },
        onError() { if (!disposed && generation === current) fail(); },
      });
    }).then((candidate) => {
      if (!candidate) return;
      if (disposed || generation !== current) { candidate.dispose(); return; }
      scene = candidate; apply();
    }).catch(() => { if (!disposed && generation === current) fail(); });
  }
  report('idle');
  return {
    setView(next) {
      if (disposed) return;
      view = { ...view, ...next };
      if (status === 'idle' && view.active) load(); else if (scene) apply();
      onState({ status, view });
    },
    reset() { if (!disposed) { scene?.reset(); apply(); } },
    getState: () => ({ status, view }),
    getDiagnostics: () => scene?.getDiagnostics(),
    dispose() { if (disposed) return; disposed = true; generation++; scene?.dispose(); scene = undefined; },
  };
}
```

## src/graphics/three/quality.js

```js
export const qualityPresets = {
  low: { dpr: 1, particles: 0, fps: 24 },
  mobile: { dpr: 1.5, particles: 8, fps: 30 },
  desktop: { dpr: 2, particles: 14, fps: 45 },
};

export function selectQuality({ width, memory, cores, saveData = false, coarsePointer = false, preset = 'auto' }) {
  if (Object.hasOwn(qualityPresets, preset)) return { name: preset, ...qualityPresets[preset] };
  const name = saveData || (memory > 0 && memory <= 4) || (cores > 0 && cores <= 4)
    ? 'low' : coarsePointer || width <= 700 ? 'mobile' : 'desktop';
  return { name, ...qualityPresets[name] };
}
```

## src/services/page-state.js

```js
/** Một nguồn tín hiệu trang; component chỉ subscribe, không tự gắn listener hệ thống. */
export function createPageState({ documentTarget = document, windowTarget = window } = {}) {
  const listeners = new Set();
  const queries = {
    reduced: windowTarget.matchMedia('(prefers-reduced-motion: reduce)'),
    finePointer: windowTarget.matchMedia('(hover: hover) and (pointer: fine)'),
    coarsePointer: windowTarget.matchMedia('(pointer: coarse)'),
  };
  const sections = [...documentTarget.querySelectorAll('main > section')];
  let disposed = false, frame = null;
  const read = () => {
    const point = windowTarget.innerHeight * 0.35;
    const active = sections.find(section => section.getBoundingClientRect().bottom > point) || sections.at(-1);
    return { hidden: Boolean(documentTarget.hidden), reduced: queries.reduced.matches,
      finePointer: queries.finePointer.matches, coarsePointer: queries.coarsePointer.matches,
      width: windowTarget.innerWidth, height: windowTarget.innerHeight, activeSection: active?.id || 'intro' };
  };
  let state = read();
  const publish = () => {
    if (disposed) return;
    const next = read();
    if (Object.keys(next).every(key => next[key] === state[key])) return;
    state = next; listeners.forEach(listener => listener({ ...state }));
  };
  const schedule = () => { if (!disposed && frame == null) frame = windowTarget.requestAnimationFrame(() => { frame = null; publish(); }); };
  documentTarget.addEventListener('visibilitychange', publish);
  Object.values(queries).forEach(query => query.addEventListener('change', publish));
  windowTarget.addEventListener('scroll', schedule, { passive: true });
  windowTarget.addEventListener('resize', schedule);
  return {
    getState: () => ({ ...state }),
    subscribe(listener) {
      if (disposed) return () => {};
      listeners.add(listener); listener({ ...state });
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame != null) windowTarget.cancelAnimationFrame(frame);
      documentTarget.removeEventListener('visibilitychange', publish);
      Object.values(queries).forEach(query => query.removeEventListener('change', publish));
      windowTarget.removeEventListener('scroll', schedule); windowTarget.removeEventListener('resize', schedule);
      listeners.clear();
    },
  };
}

/** Chỉ gọi consumer khi những trường nó sử dụng thay đổi. */
export function subscribePageFields(pageState, fields, listener) {
  let previous;
  return pageState.subscribe(state => {
    if (previous && fields.every(field => state[field] === previous[field])) return;
    previous = state; listener(state);
  });
}

export function observePageVisibility(onChange, pageState, target = globalThis.document) {
  if (pageState) return subscribePageFields(pageState, ['hidden'], state => onChange(state.hidden));
  const change = () => onChange(Boolean(target?.hidden));
  target?.addEventListener('visibilitychange', change); change();
  return () => target?.removeEventListener('visibilitychange', change);
}
```

## src/graphics/three/garden.js

```js
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
```

## src/graphics/three/flower-factory.js

```js
import * as THREE from 'three';

/** Factory sở hữu geometry/material, các bông hoa chỉ mượn cùng tài nguyên. */
export function createFlowerFactory(palette) {
  const geometries = new Set(), materials = new Set(), instances = new Set();
  const makeInstances = (geometry, surface, count) => {
    const mesh = new THREE.InstancedMesh(geometry, surface, count); instances.add(mesh); return mesh;
  };
  const own = (geometry) => { geometries.add(geometry); return geometry; };
  const material = (color) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
    materials.add(value); return value;
  };
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-0.12, 0.1, -0.28, 0.5, 0, 0.68);
  shape.bezierCurveTo(0.28, 0.5, 0.12, 0.1, 0, 0);
  const petal = own(new THREE.ExtrudeGeometry(shape, {
    depth: 0.025, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 6, steps: 1,
  }));
  const stem = own(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(), new THREE.Vector3(0.08, 0.55, 0), new THREE.Vector3(0, 1, 0),
  ), 10, 0.028, 5, false));
  const center = own(new THREE.SphereGeometry(1, 12, 8));
  const colors = {
    rose: material(palette.rose), light: material(palette.roseSoft), deep: material(palette.roseDeep),
    paper: material(palette.paper), leaf: material(palette.leaf), leafSoft: material(palette.leafSoft), gold: material(palette.gold),
  };
  let disposed = false;
  function createFlower({ variant = 'rose', height = 3.2, phase = 0 }) {
    const root = new THREE.Group(); root.name = `flower-${variant}`;
    const stalk = new THREE.Mesh(stem, colors.leaf); stalk.scale.y = height; root.add(stalk);
    const leaves = [makeInstances(petal, colors.leaf, 2), makeInstances(petal, colors.leafSoft, 1)];
    const leaf = new THREE.Object3D();
    leaves.forEach(batch => root.add(batch));
    const head = new THREE.Group(); head.position.y = height;
    head.rotation.set(-0.08, phase * 0.025, 0); root.add(head);
    let arrangement = -1;
    function setArrangement(value) {
      const next = THREE.MathUtils.clamp(value, 0, 1);
      if (arrangement === next) return;
      arrangement = next;
      const stalkHeight = height * (1 - .2 * next);
      stalk.scale.y = stalkHeight; head.position.y = stalkHeight;
      for (let index = 0; index < 3; index++) {
        const sign = index % 2 ? -1 : 1;
        const gardenY = height * (.24 + index * .16);
        // Foliage belongs above the mouth of the wrapper. The stalks fan out
        // from the ribbon, so low garden leaves would protrude through its sides.
        const bouquetY = Math.max(1.6, height * .8 * (.58 + index * .1));
        leaf.position.set(0, THREE.MathUtils.lerp(gardenY, bouquetY, next), -.02);
        leaf.rotation.set(-.2, sign * .25, sign * .95);
        leaf.scale.set(.52 - .1 * next, .95 - .27 * next, .6); leaf.updateMatrix();
        leaves[index % 2].setMatrixAt(Math.floor(index / 2), leaf.matrix);
      }
      leaves.forEach(batch => {
        batch.instanceMatrix.needsUpdate = true; batch.boundingBox = null; batch.boundingSphere = null;
      });
    }
    setArrangement(0);
    const petals = [];
    const add = (angle, size, surface, tilt, y = 0) => {
      const pivot = new THREE.Object3D(); pivot.rotation.z = angle; pivot.position.set(0, y, 0);
      const mesh = new THREE.Object3D(); pivot.add(mesh); petals.push({ pivot, mesh, size, tilt, surface });
    };
    if (variant === 'tulip') {
      for (let index = 0; index < 5; index++) add((index - 2) * 0.3, index % 2 ? 0.92 : 1.05, index % 2 ? colors.rose : colors.deep, 0.08 + index * 0.06, -0.22);
    } else {
      const count = variant === 'daisy' ? 10 : 9;
      for (let index = 0; index < count; index++) add(index / count * Math.PI * 2, variant === 'daisy' ? 0.86 : 0.91,
        variant === 'daisy' ? colors.paper : index % 2 ? colors.rose : colors.light, variant === 'daisy' ? 0.12 : 0.32);
      if (variant === 'rose') for (let index = 0; index < 5; index++) add((index + 0.5) / 5 * Math.PI * 2, 0.57, colors.rose, 0.53);
      const core = new THREE.Mesh(center, variant === 'daisy' ? colors.gold : colors.deep);
      core.position.z = 0.11; core.scale.setScalar(variant === 'daisy' ? 0.17 : 0.1); core.scale.z *= 0.55; head.add(core);
    }
    const batches = new Map();
    petals.forEach(entry => {
      if (!batches.has(entry.surface)) batches.set(entry.surface, []);
      batches.get(entry.surface).push(entry);
    });
    const petalsByBatch = [...batches].map(([surface, entries]) => {
      const batch = makeInstances(petal, surface, entries.length);
      batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage); head.add(batch);
      return { batch, entries };
    });
    let bloom = -1;
    return {
      root, head, phase, setArrangement,
      setBloom(value) {
        const next = Math.max(0, Math.min(1, value)); if (next === bloom) return; bloom = next;
        petalsByBatch.forEach(({ batch, entries }) => {
          entries.forEach(({ pivot, mesh, size, tilt }, index) => {
            mesh.scale.set(size * (0.25 + next * 0.75), size * (0.35 + next * 0.65), 1);
            mesh.rotation.x = tilt + (1 - next) * 1.05;
            pivot.updateMatrixWorld(true); batch.setMatrixAt(index, mesh.matrixWorld);
          });
          batch.instanceMatrix.needsUpdate = true; batch.boundingBox = null; batch.boundingSphere = null;
        });
      },
    };
  }
  return {
    createFlower,
    getResources: () => ({ geometries: [...geometries], materials: [...materials] }),
    dispose() { if (disposed) return; disposed = true; instances.forEach(value => value.dispose()); geometries.forEach((value) => value.dispose()); materials.forEach((value) => value.dispose()); },
  };
}
```

## src/graphics/three/particles.js

```js
import * as THREE from 'three';

export function createParticles(color) {
  const positions = new Float32Array(14 * 3);
  for (let index = 0; index < 14; index++) {
    const phase = index * 2.39996;
    positions.set([Math.sin(phase) * 2.65, 0.6 + (index * 0.73 % 4.2), -0.7 - (index % 3) * 0.18], index * 3);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color, size: 0.045, transparent: true, opacity: 0.65, depthWrite: false });
  const object = new THREE.Points(geometry, material); object.name = 'garden-sparkles';
  return {
    object,
    configure(count) { object.visible = count > 0; geometry.setDrawRange(0, count); },
    update(time) { object.rotation.z = Math.sin(time * 0.2) * 0.018; material.opacity = 0.58 + Math.sin(time * 0.65) * 0.12; },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}
```

## src/graphics/three/render-loop.js

```js
/** Thời gian animation chỉ tăng lúc render, không nhảy sau khi hiện lại tab. */
export function createRenderLoop({
  draw, onError = () => {}, onState = () => {}, fps = 30,
  requestFrame = requestAnimationFrame, cancelFrame = cancelAnimationFrame,
}) {
  let active = false, reduced = false, disposed = false;
  let frame = null, previous = null, nextDraw = null, elapsed = 0, frames = 0, dirty = true;
  const state = () => onState(!active || disposed ? 'paused' : reduced ? 'static' : 'running');
  const cancel = () => { if (frame != null) cancelFrame(frame); frame = null; previous = null; nextDraw = null; };
  const schedule = () => {
    if (!disposed && active && frame == null && (!reduced || dirty)) frame = requestFrame(tick);
  };
  function tick(now) {
    frame = null;
    if (disposed || !active) return;
    const difference = previous == null ? 0 : now - previous;
    if (dirty || previous == null || now >= nextDraw - 0.5) {
      const delta = Math.max(0, Math.min(difference / 1000, 0.05));
      const interval = 1000 / fps;
      // Giữ mốc nhịp để jitter RAF không làm preset 30 FPS rơi xuống ~27 FPS.
      // Frame trễ dài bỏ nhịp đã lỡ, không render dồn để đuổi kịp.
      nextDraw = dirty || nextDraw == null || now - nextDraw >= interval ? now + interval : nextDraw + interval;
      previous = now;
      if (!reduced) elapsed += delta;
      dirty = false;
      try { draw({ elapsed, delta, reduced, frames: ++frames }); }
      catch (error) { active = false; cancel(); state(); onError(error); return; }
    }
    schedule();
  }
  return {
    configure(options) {
      if (disposed) return;
      const nextActive = Boolean(options.active), nextReduced = Boolean(options.reduced);
      if (fps !== options.fps || reduced !== nextReduced) dirty = true;
      fps = options.fps || fps; reduced = nextReduced;
      if (active !== nextActive) { cancel(); dirty = true; }
      active = nextActive; state(); schedule();
    },
    invalidate() { if (!disposed) { dirty = true; schedule(); } },
    getState: () => ({ active, reduced, elapsed, frames, pending: frame != null }),
    dispose() { if (disposed) return; disposed = true; active = false; cancel(); state(); },
  };
}
```

## src/utils/theme.js

```js
const defaults = {
  background: '#fff8f1', accent: '#883f56', rose: '#e8a6b5', leaf: '#91a68a', gold: '#e8c98e',
};

function rgb(color) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Theme cần màu #RRGGBB.');
  return [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
}

function luminance(color) {
  const channels = rgb(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(first, second) {
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function readable(background, preferred) {
  if (contrastRatio(background, preferred) >= 4.5) return preferred;
  return contrastRatio(background, '#000000') >= contrastRatio(background, '#ffffff') ? '#000000' : '#ffffff';
}

function mix(first, second, amount) {
  const a = rgb(first), b = rgb(second);
  return `#${a.map((channel, index) => Math.round(channel * (1 - amount) + b[index] * amount).toString(16).padStart(2, '0')).join('')}`;
}

export function createThemeTokens(theme) {
  const palette = Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, theme[key] ?? value]));
  const paper = '#fffdf8';
  const surface = mix(palette.background, '#dcc3af', 0.12);
  return {
    '--color-background': palette.background,
    '--color-accent': palette.accent,
    '--color-on-accent': readable(palette.accent, paper),
    '--color-text': readable(palette.background, '#382b30'),
    '--color-muted': readable(palette.background, '#766269'),
    '--color-accent-ink': readable(palette.background, palette.accent),
    '--color-paper': paper,
    '--color-paper-text': '#382b30',
    '--color-paper-muted': '#766269',
    '--color-paper-accent-ink': readable(paper, palette.accent),
    '--color-surface': surface,
    '--color-surface-text': readable(surface, '#382b30'),
    '--color-surface-muted': readable(surface, '#766269'),
    '--color-surface-accent-ink': readable(surface, palette.accent),
    '--color-rose': palette.rose,
    '--color-rose-soft': mix(palette.rose, paper, 0.4),
    '--color-rose-deep': mix(palette.rose, palette.accent, 0.3),
    '--color-leaf': palette.leaf,
    '--color-leaf-soft': mix(palette.leaf, paper, 0.58),
    '--color-gold': palette.gold,
    '--color-glow': mix(palette.rose, paper, 0.72),
  };
}

export function applyTheme(theme, target = document.documentElement) {
  const values = createThemeTokens(theme);
  const previous = new Map(Object.keys(values).map((key) => [key, target.style.getPropertyValue(key)]));
  Object.entries(values).forEach(([key, value]) => target.style.setProperty(key, value));
  return () => previous.forEach((value, key) => {
    if (value) target.style.setProperty(key, value);
    else target.style.removeProperty(key);
  });
}
```

## src/graphics/three/bouquet.js

```js
import * as THREE from 'three';

/** Soft layered paper, with separate ownership of its GPU resources. */
export function createBouquetWrapping(palette) {
  const object = new THREE.Group();
  object.name = 'bouquet-wrapping';
  object.position.z = 0.45;
  const geometries = [], materials = [];

  function addCurvedPanel(draw, color, z, roughness = .85, depth = .026) {
    const shape = new THREE.Shape();
    draw(shape); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: true, bevelSize: .016, bevelThickness: .016,
      bevelSegments: 2, curveSegments: 20, steps: 1,
    });
    // Give the face a gentle bow in depth as well as a curved outline.
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i);
      positions.setZ(i, positions.getZ(i) + Math.sin((y - .1) / 2.5 * Math.PI) * (.065 + .04 * x * x));
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color, roughness, metalness: .02, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z; object.add(mesh);
    geometries.push(geometry); materials.push(material);
  }

  addCurvedPanel(s => {
    s.moveTo(-1.18, 2.08);
    s.quadraticCurveTo(-.6, 2.55, 0, 2.52);
    s.quadraticCurveTo(.6, 2.55, 1.18, 2.08);
    s.quadraticCurveTo(.68, 1.25, .22, .72);
    s.lineTo(-.22, .72);
    s.quadraticCurveTo(-.68, 1.25, -1.18, 2.08);
  }, palette.paper, -.95, .92, .02);
  addCurvedPanel(s => {
    s.moveTo(-1.15, 2.06);
    s.bezierCurveTo(-.92, 1.38, -.45, .98, -.18, .78);
    s.lineTo(.18, .78);
    s.bezierCurveTo(.32, 1.12, .22, 1.4, .08, 1.61);
    s.quadraticCurveTo(-.45, 1.72, -.75, 1.91);
    s.quadraticCurveTo(-.78, 1.98, -1.15, 2.06);
  }, palette.roseSoft, .04, .82);
  addCurvedPanel(s => {
    s.moveTo(1.15, 2.06);
    s.bezierCurveTo(.92, 1.38, .45, .98, .18, .78);
    s.lineTo(-.15, .78);
    s.bezierCurveTo(-.28, 1.06, -.2, 1.4, -.16, 1.57);
    s.quadraticCurveTo(.47, 1.72, .77, 1.91);
    s.quadraticCurveTo(.85, 1.96, 1.15, 2.06);
  }, palette.paper, .08);
  addCurvedPanel(s => {
    s.moveTo(-.2, .82);
    s.bezierCurveTo(-.34, .55, -.38, .28, -.26, .14);
    s.quadraticCurveTo(0, .06, .26, .14);
    s.bezierCurveTo(.38, .28, .34, .55, .2, .82);
  }, palette.paper, .02, .88, .03);
  addCurvedPanel(s => {
    s.moveTo(-.14, .8);
    s.quadraticCurveTo(-.24, .45, -.12, .13);
    s.quadraticCurveTo(.02, .11, .1, .15);
    s.quadraticCurveTo(.05, .48, .08, .8);
  }, palette.roseSoft, .06, .84, .022);

  let disposed = false;
  return {
    object,
    ribbonAnchor: new THREE.Vector3(0, .82, .62),
    ribbonLeft: new THREE.Vector3(-.68, .82, .62),
    ribbonRight: new THREE.Vector3(.68, .82, .62),
    setProgress(value) {
      const p = THREE.MathUtils.clamp(value, 0, 1);
      object.visible = p > 0;
      object.scale.set(.9 + p * .1, Math.max(.01, p), 1);
    },
    getResources: () => ({ geometries, materials }),
    dispose() {
      if (disposed) return;
      disposed = true;
      geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose());
    },
  };
}
```

## src/graphics/three/bouquet-motion.js

```js
export const GARDEN_LAYOUT = [
  [-2.18, 0.12, -0.08, -0.09], [-1.48, 0.08, -0.22, 0.03], [-0.76, 0.03, 0.18, -0.045],
  [0.05, 0, -0.08, 0.01], [0.88, 0.05, 0.1, 0.035], [1.57, 0.08, -0.15, -0.03], [2.16, 0.1, 0.02, 0.07],
];
export const BOUQUET_LAYOUT = [
  [-0.045, 0.82, 0, 0.49], [-0.03, 0.82, -0.12, 0.28], [-0.015, 0.82, 0.08, 0.15],
  [0, 0.82, -0.1, 0], [0.015, 0.82, 0.08, -0.19], [0.03, 0.82, -0.12, -0.33], [0.045, 0.82, 0, -0.53],
];
export const softEase = value => 1 - (1 - Math.max(0, Math.min(1, value))) ** 3;

/** Chạy một lần theo thời gian render; replay ở finale chờ rời cảnh rồi mới bắt đầu lượt mới. */
export function createBouquetMotion() {
  let elapsed = 0, started = false, complete = false, waitingForLeave = false, runs = 0;
  const snapshot = () => {
    const progress = waitingForLeave ? 1 : complete ? 1 : Math.min(1, elapsed / 2.2);
    return { progress, poseProgress: softEase(progress / 0.7), paperProgress: softEase((progress - 0.4) / 0.4),
      stage: progress >= 1 ? 'complete' : progress >= 0.64 ? 'tying' : progress > 0 ? 'assembling' : 'idle',
      complete, waitingForLeave, runs };
  };
  return {
    update({ active, layout, reduced, delta = 0 }) {
      if (!active || layout !== 'bouquet') waitingForLeave = false;
      if (!active || layout !== 'bouquet' || waitingForLeave || complete) return snapshot();
      if (!started) { started = true; runs++; }
      if (reduced) complete = true;
      else { elapsed += Math.max(0, Math.min(0.05, delta)); complete = elapsed >= 2.2; }
      return snapshot();
    },
    getState: snapshot,
    reset({ active = false, layout } = {}) { elapsed = 0; started = false; complete = false; runs = 0; waitingForLeave = active && layout === 'bouquet'; },
  };
}

export function bouquetPose(index, progress) {
  const t = softEase(progress / 0.7);
  return GARDEN_LAYOUT[index].map((value, axis) => value + (BOUQUET_LAYOUT[index][axis] - value) * t);
}
```

## src/motion/scroll-progress.js

```js
export const clamp = (value) => Math.max(0, Math.min(1, value));
export const segment = (value, start, end) => clamp((value - start) / Math.max(0.001, end - start));

/** Tall content scrolls into view before the sticky scene begins. */
export function sceneProgress(scrollY, top, height, pinHeight, viewport) {
  return segment(scrollY, top + Math.max(0, pinHeight - viewport), top + height - viewport);
}

/** Finish while the scene is still held, leaving room to see the final pose. */
export function sceneAnimationProgress(scrollY, top, height, pinHeight, viewport, entrance = false) {
  const holdStart = top + Math.max(0, pinHeight - viewport);
  const holdEnd = top + height - viewport;
  return segment(scrollY, entrance ? holdStart - viewport * 0.45 : holdStart,
    holdStart + Math.max(1, holdEnd - holdStart) * 0.7);
}

/** The flower is open by the time its photo reaches the reading position. */
export function wishBloomProgress(scrollY, artTop, artHeight, viewport) {
  const end = artTop + Math.min(artHeight, viewport) * 0.5 - viewport * 0.5;
  return segment(scrollY, end - viewport * 0.45, end);
}

export function bouquetPresentation(progress) {
  const p = clamp(progress);
  return { progress: p, paperProgress: 1 - (1 - segment(p, 0.4, 0.8)) ** 3,
    stage: p >= 1 ? 'complete' : p >= 0.64 ? 'tying' : p > 0 ? 'assembling' : 'idle',
    complete: p >= 1, runs: 1 };
}
```

## src/motion/scroll-scenes.js

```js
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
```

## src/motion/preferences.js

```js
import { subscribePageFields } from '../services/page-state.js';

export function observeMotionPreference(onChange, pageState) {
  if (pageState) return subscribePageFields(pageState, ['reduced'], state => onChange(state.reduced));
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const change = () => onChange(media.matches);
  media.addEventListener('change', change);
  change();
  return () => media.removeEventListener('change', change);
}
```

## src/styles/fonts.css

```css
/* Fontsource 5.3.0: WOFF2 Latin + Vietnamese; unicode-range giữ đúng dấu tiếng Việt. */
@font-face {
  font-family: 'Be Vietnam Pro'; font-style: normal; font-weight: 400; font-display: swap;
  src: url('@fontsource/be-vietnam-pro/files/be-vietnam-pro-latin-400-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: 'Be Vietnam Pro'; font-style: normal; font-weight: 400; font-display: swap;
  src: url('@fontsource/be-vietnam-pro/files/be-vietnam-pro-vietnamese-400-normal.woff2') format('woff2');
  unicode-range: U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;
}
@font-face {
  font-family: 'Be Vietnam Pro'; font-style: normal; font-weight: 600; font-display: swap;
  src: url('@fontsource/be-vietnam-pro/files/be-vietnam-pro-latin-600-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: 'Be Vietnam Pro'; font-style: normal; font-weight: 600; font-display: swap;
  src: url('@fontsource/be-vietnam-pro/files/be-vietnam-pro-vietnamese-600-normal.woff2') format('woff2');
  unicode-range: U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;
}
@font-face {
  font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 500; font-display: swap;
  src: url('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 500; font-display: swap;
  src: url('@fontsource/cormorant-garamond/files/cormorant-garamond-vietnamese-500-normal.woff2') format('woff2');
  unicode-range: U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;
}
@font-face {
  font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 500; font-display: swap;
  src: url('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2') format('woff2');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 500; font-display: swap;
  src: url('@fontsource/cormorant-garamond/files/cormorant-garamond-vietnamese-500-italic.woff2') format('woff2');
  unicode-range: U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;
}
```

## src/styles/tokens.css

```css
:root {
  --color-background: #fff8f1;
  --color-paper: #fffdf8;
  --color-accent: #883f56;
  --color-accent-ink: #883f56;
  --color-on-accent: #fffdf8;
  --color-text: #382b30;
  --color-muted: #766269;
  --color-paper-text: #382b30;
  --color-paper-muted: #766269;
  --color-paper-accent-ink: #883f56;
  --color-surface: #fbf2e9;
  --color-surface-text: #382b30;
  --color-surface-muted: #766269;
  --color-surface-accent-ink: #883f56;
  --color-rose: #e8a6b5;
  --color-rose-soft: #f1c9d0;
  --color-rose-deep: #cb8799;
  --color-leaf: #91a68a;
  --color-leaf-soft: #d1d9ca;
  --color-gold: #e8c98e;
  --color-glow: #f9e5e5;
  --color-border: #e7d9cd;
  --color-envelope: #f3e4d4;
  --color-envelope-front: #efdbc6;
  --color-envelope-flap: #f8ebdd;
  --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --font-body: 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif;
  --font-size-body: 1rem;
  --font-size-small: 0.8rem;
  --font-size-label: 0.75rem;
  --font-size-h1: clamp(3.25rem, 7.2vw, 6.5rem);
  --font-size-h2: clamp(2.4rem, 4.8vw, 4.25rem);
  --font-size-h3: clamp(1.9rem, 3vw, 2.55rem);
  --line-height-body: 1.8;
  --line-height-heading: 1.13;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --page-gutter: clamp(1rem, 4vw, 3rem);
  --section-space: clamp(4rem, 9vw, 7rem);
  --radius-card: 0.75rem;
  --radius-photo: 0.25rem;
  --radius-pill: 999px;
  --shadow-paper: 0 14px 46px #382b3008;
  --shadow-photo: 0 8px 24px #382b300a;
  --duration-ui: 180ms;
  --duration-reveal: 600ms;
  --duration-draw: 900ms;
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --touch-target: 44px;
  --content-width: 1140px;
  --letter-width: 860px;
  --text-measure: 64ch;
}
```

## src/styles/base.css

```css
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: var(--space-8); }
body { margin: 0; color: var(--color-text); background: var(--color-background); font-family: var(--font-body); font-size: var(--font-size-body); font-weight: 400; line-height: var(--line-height-body); -webkit-font-smoothing: antialiased; }
button, input { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
a { color: inherit; }
button { cursor: pointer; }
img, svg { display: block; max-width: 100%; }
img { height: auto; }
h1, h2, h3, p, figure { margin: 0; }
h1, h2, h3 { font-family: var(--font-display); font-weight: 500; line-height: var(--line-height-heading); text-wrap: balance; overflow-wrap: break-word; padding-block: 0.06em; }
h1 { font-size: var(--font-size-h1); letter-spacing: -0.035em; }
h2 { font-size: var(--font-size-h2); letter-spacing: -0.025em; }
h3 { font-size: var(--font-size-h3); letter-spacing: -0.015em; }
em { color: var(--color-accent-ink); }
::selection { background: #efc4cf; color: #382b30; }
:focus-visible { outline: 3px solid var(--color-accent-ink); outline-offset: 5px; }
[hidden] { display: none !important; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.skip-link { position: fixed; top: -120px; left: var(--space-4); padding: var(--space-3) var(--space-4); background: var(--color-paper); color: var(--color-paper-text); z-index: 10; min-height: var(--touch-target); }
.skip-link:focus { top: var(--space-4); outline-color: var(--color-paper-accent-ink); }
.noscript-message, .setup-error { margin: var(--space-4) auto; padding: var(--space-4); border: 1px solid var(--color-border); }
```

## src/styles/layout.css

```css
.shell { --gutter-start: max(var(--page-gutter), env(safe-area-inset-left)); --gutter-end: max(var(--page-gutter), env(safe-area-inset-right)); width: min(calc(var(--content-width) + var(--gutter-start) + var(--gutter-end)), 100%); padding-inline: var(--gutter-start) var(--gutter-end); margin-inline: auto; }
.section { padding-block: var(--section-space); }
.intro { position: relative; display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; column-gap: var(--space-4); min-height: min(760px, 94svh); }
.intro-copy, .section-copy, .wish-copy { min-width: 0; }
.intro-copy { position: relative; z-index: 1; }
.intro-footnote { grid-column: 1 / -1; align-self: end; margin-top: var(--space-12); color: var(--color-muted); font-size: var(--font-size-small); }
.garden { --color-text: var(--color-surface-text); --color-muted: var(--color-surface-muted); --color-accent-ink: var(--color-surface-accent-ink); background: var(--color-surface); color: var(--color-text); }
.garden-layout { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: center; }
.section-copy { max-width: 520px; }
.section-heading { max-width: 720px; margin-bottom: var(--space-12); }
.wish-list { display: grid; gap: var(--space-6); }
.wish-card, .paper-letter { --color-text: var(--color-paper-text); --color-muted: var(--color-paper-muted); --color-accent-ink: var(--color-paper-accent-ink); color: var(--color-text); background: var(--color-paper); }
.wish-card { display: grid; grid-template-columns: 0.7fr 1.3fr; grid-template-areas: 'art copy'; gap: var(--space-8); align-items: center; padding: clamp(var(--space-6), 4vw, var(--space-12)); border: 1px solid var(--color-border); border-radius: var(--radius-card); }
.wish-card[data-layout="photo"] { grid-template-columns: 0.9fr 1.1fr; }
.wish-card:nth-child(even) { grid-template-columns: 1.3fr 0.7fr; grid-template-areas: 'copy art'; }
.wish-card[data-layout="photo"]:nth-child(even) { grid-template-columns: 1.1fr 0.9fr; }
.wish-art { grid-area: art; }
.wish-copy { grid-area: copy; }
.letter-section { max-width: calc(var(--letter-width) + var(--gutter-start) + var(--gutter-end)); }
.letter-section.has-portrait { max-width: calc(1040px + var(--gutter-start) + var(--gutter-end)); }
.finale { max-width: calc(800px + var(--gutter-start) + var(--gutter-end)); text-align: center; }
@media (max-width: 700px) {
  :root { --page-gutter: var(--space-4); }
  .intro { grid-template-columns: 1fr; min-height: auto; padding-block: var(--space-12); }
  .envelope-frame { width: min(100%, 390px); margin: var(--space-4) auto 0; }
  .intro-footnote { margin-top: var(--space-2); }
  .garden-layout { grid-template-columns: 1fr; gap: var(--space-4); }
  .garden-art { max-width: 420px; margin-inline: auto; }
  .wish-card, .wish-card[data-layout="photo"] { grid-template-columns: 1fr; gap: var(--space-4); }
  .wish-card:nth-child(even), .wish-card[data-layout="photo"]:nth-child(even) { grid-template-columns: 1fr; }
  .wish-card, .wish-card:nth-child(even) { grid-template-areas: 'copy' 'art'; }
  .wish-card[data-layout="photo"], .wish-card[data-layout="photo"]:nth-child(even) { grid-template-areas: 'art' 'copy'; }
}
@media (max-width: 420px) {
}
```

## src/styles/components.css

```css
.brand { display: inline-flex; align-items: center; gap: var(--space-3); min-width: 0; max-width: 100%; min-height: var(--touch-target); text-decoration: none; font-size: var(--font-size-small); overflow-wrap: anywhere; }
.brand > span:first-child { font-size: 1.75rem; color: var(--color-accent-ink); }
.eyebrow { color: var(--color-accent-ink); font-size: var(--font-size-label); text-transform: uppercase; letter-spacing: 0.13em; margin-bottom: var(--space-6); font-weight: 600; }
.lead { font-size: clamp(var(--font-size-body), 1.5vw, 1.1rem); color: var(--color-muted); max-width: 470px; margin-top: var(--space-6); overflow-wrap: anywhere; }
.button { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-6); min-height: 48px; padding: var(--space-3) var(--space-6); margin-top: var(--space-8); border: 1px solid var(--color-accent); border-radius: var(--radius-pill); background: var(--color-accent); color: var(--color-on-accent); text-decoration: none; font-size: 0.875rem; font-weight: 600; transition: transform var(--duration-ui) var(--ease-soft), box-shadow var(--duration-ui) var(--ease-soft); }
.button-outline { background: transparent; color: var(--color-accent-ink); border-color: currentColor; }
.text-link { display: inline-flex; align-items: center; gap: var(--space-4); min-height: var(--touch-target); margin-top: var(--space-8); color: var(--color-accent-ink); text-decoration-thickness: 1px; text-underline-offset: 0.4rem; }
.recipient-label { color: var(--color-accent-ink); margin-top: var(--space-4); font-family: var(--font-display); font-weight: 500; font-style: italic; font-size: 1.5rem; overflow-wrap: anywhere; }
.envelope-frame { position: relative; min-width: 0; }
.envelope-frame::before { content: ''; position: absolute; inset: 9% 5%; border-radius: 50%; background: radial-gradient(ellipse, var(--color-glow), transparent 68%); opacity: 0.4; z-index: -1; }
.envelope-frame svg, .garden-art svg { width: 100%; }
.garden-art, .bouquet-art { position: relative; isolation: isolate; }
.garden-art { width: 100%; aspect-ratio: 1.06; }
.garden-art::before { content: ''; position: absolute; z-index: -1; inset: 5% 1% 8%; border-radius: 50%; background: radial-gradient(ellipse, var(--color-glow), transparent 72%); opacity: 0.9; }
.garden-art > svg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.bouquet-art { aspect-ratio: 0.8; }
.bouquet-art > svg { width: 100%; height: 100%; }
.garden-canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; pointer-events: none; opacity: 0; }
[data-graphics="ready"] > .garden-canvas { opacity: 1; }
[data-graphics="ready"] > svg { visibility: hidden; }
.garden.has-portrait .garden-art { max-height: 390px; }
.section-heading > p:last-child { margin-top: var(--space-4); color: var(--color-muted); }
.section-heading > #wishes-message { margin-top: var(--space-4); color: var(--color-muted); }
.wish-art { display: grid; place-items: center; min-width: 0; }
.wish-copy .eyebrow { margin-bottom: var(--space-2); }
.wish-copy .wish-message { color: var(--color-muted); margin-top: var(--space-4); max-width: 460px; white-space: pre-line; overflow-wrap: anywhere; }
.wish-copy h3 { overflow-wrap: anywhere; }
.wish-interaction-hint { font-size: var(--font-size-small); max-width: 48ch; }
.wish-progress { margin-block: calc(var(--space-6) * -1) var(--space-6); border-left: 2px solid var(--color-border); padding-left: var(--space-4); }
.wish-count { font-size: var(--font-size-small); color: var(--color-accent-ink); }
.wish-complete { font-size: var(--font-size-small); color: var(--color-muted); margin-top: var(--space-2); }
.wish-flower-action { display: flex; justify-content: center; min-width: 0; }
.wish-flower-button { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-3); min-height: var(--touch-target); max-width: 100%; border: 1px solid transparent; border-radius: var(--radius-card); background: transparent; color: var(--color-paper-accent-ink); }
.wish-flower-button > svg { width: 132px; max-width: 100%; height: auto; }
.wish-flower-label { font-size: var(--font-size-small); overflow-wrap: anywhere; }
.wish-flower-button[aria-disabled="true"] { cursor: default; }
.wish-copy .wish-flower-action { justify-content: flex-start; margin-top: var(--space-6); }
.wish-copy .wish-flower-button { flex-direction: row; gap: var(--space-3); border-color: var(--color-border); border-radius: var(--radius-pill); padding: var(--space-2) var(--space-4); }
.wish-copy .wish-flower-button > svg { width: 44px; flex-shrink: 0; }
.portrait { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); background: var(--color-paper); box-shadow: var(--shadow-photo); }
.portrait img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; border-radius: var(--radius-photo); background: var(--color-glow); }
.portrait figcaption { font-size: var(--font-size-small); color: var(--color-paper-muted); padding-top: var(--space-2); overflow-wrap: anywhere; }
#hero-photo .portrait, #letter-photo .portrait { max-width: 250px; margin-top: var(--space-6); }
.paper-letter { padding: clamp(var(--space-6), 5vw, var(--space-16)); border: 1px solid var(--color-border); box-shadow: var(--shadow-paper); background-image: repeating-linear-gradient(0deg, transparent 0 5px, #382b3001 5px 6px); }
.paper-letter h2 { font-size: clamp(2.1rem, 4vw, 3.25rem); }
.letter-reading { margin-top: var(--space-8); }
.letter-body { max-width: var(--text-measure); line-height: 1.9; overflow-wrap: anywhere; }
.letter-body p { white-space: pre-line; }
.letter-reading.has-photo { display: grid; grid-template-columns: minmax(180px, 240px) minmax(0, 1fr); align-items: start; gap: var(--space-8); }
.letter-reading #letter-photo .portrait { width: 100%; max-width: none; margin-top: 0; }
#letter-photo:empty, .letter-audio-controls:empty { display: none; }
.letter-audio-controls { margin-top: var(--space-6); }
.narration-button { min-height: var(--touch-target); max-width: 100%; padding: var(--space-2) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-pill); background: transparent; color: var(--color-paper-accent-ink); font-size: var(--font-size-small); }
.narration-message { margin-top: var(--space-2); color: var(--color-paper-muted); font-size: var(--font-size-small); max-width: 50ch; }
.narration-message:empty { display: none; }
.letter-body p + p { margin-top: var(--space-6); }
.signature { white-space: pre-line; margin-top: var(--space-8); font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 1.9rem; color: var(--color-accent-ink); }
.bouquet-art { width: min(100%, 340px); max-width: 340px; margin: 0 auto var(--space-6); }
.bouquet-ribbon { position: absolute; z-index: 1; left: var(--ribbon-x, 50%); top: var(--ribbon-y, 70%); width: var(--ribbon-width, 26%); transform: translate(-50%, -34.7%); pointer-events: none; visibility: hidden; }
[data-graphics="ready"][data-bouquet-stage="tying"] .bouquet-ribbon, [data-graphics="ready"][data-bouquet-stage="complete"] .bouquet-ribbon { visibility: visible; }
.bouquet-ribbon > svg { width: 100%; height: auto; }
.finale-signature { font-size: 1.5rem; margin-top: var(--space-4); }
.finale .lead { margin-inline: auto; }
.audio-button { background: transparent; border: 1px solid currentColor; border-radius: var(--radius-pill); padding: var(--space-2) var(--space-3); min-height: var(--touch-target); color: var(--color-accent-ink); font-size: var(--font-size-small); }
.intro-actions { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-8); }
.intro-actions:has(.skip-animation[hidden]):not(:has(.audio-button)) { display: none; }
.skip-animation { min-height: var(--touch-target); padding: var(--space-2) var(--space-3); border: 0; background: transparent; color: var(--color-accent-ink); text-decoration: underline; text-underline-offset: 0.3rem; font-size: var(--font-size-small); }
.button[aria-disabled="true"] { cursor: progress; }
.audio-controls { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-1); max-width: 100%; }
.audio-message { max-width: 28ch; font-size: var(--font-size-label); color: var(--color-muted); letter-spacing: normal; text-align: right; }
.audio-message:empty { display: none; }
.section-thread { width: 240px; max-width: 100%; margin-bottom: var(--space-6); }
.section-thread-centered { margin-inline: auto; margin-bottom: var(--space-8); }
@media (hover: hover) and (pointer: fine) {
  .button:hover { transform: translateY(-2px); box-shadow: var(--shadow-photo); }
  .wish-flower-button:hover:not([aria-disabled="true"]) { background: var(--color-glow); border-color: var(--color-border); }
}
@media (max-width: 700px) {
  .letter-reading.has-photo { grid-template-columns: 1fr; gap: var(--space-6); }
  .letter-reading #letter-photo .portrait { max-width: 250px; margin-inline: auto; }
  .wish-art .wish-flower-button > svg { width: 92px; }
  .garden.has-portrait .garden-art { max-width: 330px; }
  .wish-art .portrait { max-width: 350px; }
  .section-thread { width: 200px; }
  .intro[data-experience="opening"] .skip-animation { background: var(--color-paper); color: var(--color-paper-accent-ink); border: 1px solid currentColor; border-radius: var(--radius-pill); }
}
/* Tích hợp vùng hiển thị 3D Paper Envelope hòa quyện với Hero Section */
.illustration-envelope {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 540 / 460;
  overflow: visible;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.envelope-3d-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: visible;
}

.envelope-3d-stage canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
  outline: none;
  background: transparent;
}

/* Responsive tinh chỉnh trên Tablet & Mobile Portrait */
@media (max-width: 768px) {
  .illustration-envelope {
    max-width: min(100%, 440px);
    margin-inline: auto;
  }
}
```

## src/styles/motion.css

```css
.illustration { overflow: visible; }
.svg-stem { stroke: var(--color-leaf); stroke-width: 2.5; stroke-linecap: round; }
.svg-leaves { fill: var(--color-leaf-soft); stroke: var(--color-leaf); stroke-width: 1.2; stroke-linejoin: round; }
.svg-petals { fill: var(--color-rose); stroke: var(--color-rose-deep); stroke-width: 1; stroke-linejoin: round; }
.svg-petal-light { fill: var(--color-rose-soft); }
.svg-petal-line { fill: none; stroke: var(--color-rose-deep); stroke-width: 1.4; }
.svg-head-daisy .svg-petals { fill: var(--color-paper); stroke: var(--color-rose-deep); }
.svg-head-tulip .svg-petals { fill: var(--color-rose-deep); }
.svg-center { fill: var(--color-gold); }
.svg-center-detail { fill: var(--color-rose-deep); opacity: 0.65; }
.svg-ground, .svg-paper-lines { stroke: var(--color-border); stroke-width: 1.5; stroke-linecap: round; }
.svg-shadow { fill: var(--color-accent); opacity: 0.06; }
.svg-paper { fill: var(--color-paper); stroke: var(--color-border); }
.svg-envelope-back { fill: var(--color-envelope); stroke: var(--color-border); }
.svg-envelope-flap { fill: var(--color-envelope-flap); stroke: var(--color-border); }
.svg-envelope-front { fill: var(--color-envelope-front); stroke: var(--color-border); }
.svg-seal > path { fill: var(--color-accent); }
.svg-seal .svg-petals { stroke: none; }
.svg-halo { fill: var(--color-glow); opacity: 0.7; }
.svg-sparkle { fill: var(--color-gold); }
.svg-bouquet-wrap { fill: var(--color-envelope-front); stroke: var(--color-border); stroke-width: 1.2; }
.svg-ribbon { stroke: var(--color-accent); stroke-width: 3; stroke-linecap: round; }
.svg-thread { stroke: var(--color-accent); stroke-width: 1.5; stroke-linecap: round; opacity: 0.55; }
.svg-flying-petal { fill: var(--color-rose); stroke: var(--color-rose-deep); opacity: 0; }
.svg-petals, .svg-leaves, .svg-sparkle { transform-box: fill-box; transform-origin: center; }
.illustration[data-motion-owner="wish"][data-bloom-state="closed"] .svg-stem { stroke-dasharray: 1; stroke-dashoffset: 0.35; }
.illustration[data-motion-owner="wish"][data-bloom-state="closed"] .svg-petals { transform: scale(0.4) rotate(-9deg); opacity: 0.75; }
.illustration[data-motion-owner="wish"][data-bloom-state="closed"] .svg-leaves { transform: scale(0.75); opacity: 0.65; }
.illustration[data-motion-owner="wish"][data-bloom-state="blooming"] .svg-stem { animation: wish-draw-stem 550ms var(--ease-soft) both; }
.illustration[data-motion-owner="wish"][data-bloom-state="blooming"] .svg-leaves { animation: unfold-leaves 700ms var(--ease-soft) 80ms both; }
.illustration[data-motion-owner="wish"][data-bloom-state="blooming"] .svg-petals { animation: wish-bloom-petals 900ms var(--ease-soft) 120ms both; }
@keyframes wish-draw-stem { from { stroke-dasharray: 1; stroke-dashoffset: 0.35; } to { stroke-dasharray: 1; stroke-dashoffset: 0; } }
@keyframes wish-bloom-petals { from { transform: scale(0.4) rotate(-9deg); opacity: 0.75; } to { transform: scale(1) rotate(0); opacity: 1; } }
.illustration[data-motion-state="revealed"] .svg-stem { animation: draw-stem var(--duration-draw) var(--ease-soft) both; }
.illustration[data-motion-state="revealed"] .svg-petals { animation: bloom-petals 1s var(--ease-soft) 120ms both; }
.illustration[data-motion-state="revealed"] .svg-leaves { animation: unfold-leaves 900ms var(--ease-soft) 200ms both; }
.illustration[data-motion-state="revealed"] .svg-ribbon { animation: tie-ribbon 1.3s var(--ease-soft) 400ms both; }
.illustration[data-motion-state="revealed"] .svg-thread { animation: tie-ribbon 1.2s var(--ease-soft) both; }
.illustration[data-motion-state="revealed"] .svg-envelope-float { animation: settle-envelope 1.6s var(--ease-soft) both; }
.illustration[data-motion-state="revealed"] .svg-sparkle { animation: bloom-petals 1.1s var(--ease-soft) 400ms both; }
:root[data-decorations-paused="true"] .illustration * { animation-play-state: paused; }
@keyframes draw-stem {
  from { stroke-dasharray: 1; stroke-dashoffset: 1; }
  to { stroke-dasharray: 1; stroke-dashoffset: 0; }
}
@keyframes tie-ribbon {
  from { stroke-dasharray: 1; stroke-dashoffset: 1; }
  to { stroke-dasharray: 1; stroke-dashoffset: 0; }
}
@keyframes bloom-petals {
  from { transform: scale(0.65); opacity: 0.35; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes unfold-leaves {
  from { transform: scale(0.85); opacity: 0.3; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes settle-envelope {
  from { transform: translateY(10px); }
  to { transform: translateY(0); }
}
.letter-body p[data-reading-reveal="visible"] { animation: letter-ink 350ms ease-out both; }
.wish-card[data-card-reveal="visible"] { animation: card-arrive 450ms var(--ease-soft) both; }
@keyframes card-arrive { from { transform: translateY(12px); } to { transform: translateY(0); } }
@keyframes letter-ink { from { opacity: 0.88; } to { opacity: 1; } }
.illustration-bouquet[data-finale-state="assembling"] { animation: bouquet-arrive 1.7s var(--ease-soft) both; }
.illustration-bouquet[data-finale-state="assembling"] .svg-ribbon { animation: tie-ribbon 900ms var(--ease-soft) 700ms both; }
.bouquet-ribbon svg[data-bow-state="tying"] .svg-ribbon { animation: tie-ribbon 750ms var(--ease-soft) both; }
@keyframes bouquet-arrive { from { opacity: 0.65; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .illustration *, .button { animation: none !important; transition: none !important; }
  .illustration, .letter-body p, .wish-card { animation: none !important; }
  .button:hover { transform: none; }
}
```

## src/styles/scroll-experience.css

```css
/* Each scene keeps its natural document position; the browser owns scrolling. */
.scroll-story { scroll-behavior: auto; overflow-x: clip; }
body { overflow-x: clip; }
.scroll-story main { position: relative; }
:root { --content-width: 1060px; --font-size-h2: clamp(2.3rem, 4vw, 3.25rem); }
.scroll-story .eyebrow { font-size: .68rem; letter-spacing: .16em; margin-bottom: 20px; }
.scroll-scene { --scene-progress: 0; --scene-travel: 110svh; position: relative; height: calc(var(--pin-height, 100svh) + var(--scene-travel)); padding-block: 0; }
.scene-pin { position: sticky; top: var(--pin-top, 0px); min-height: 100svh; padding-block: clamp(32px, 6svh, 72px); }
.intro.scroll-scene { display: block; max-width: none; width: 100%; padding-inline: 0; --scene-travel: 85svh; }
.intro-pin { display: grid; grid-template-columns: 1.1fr 1fr; align-content: center; align-items: center; column-gap: 8px; row-gap: 32px; padding-inline: max(var(--page-gutter), calc((100% - var(--content-width)) / 2)); }
.intro-pin h1 { font-size: clamp(2.75rem, 4.8vw, 4.25rem); line-height: 1.09; text-wrap: initial; letter-spacing: -.035em; }
.intro-title-ending { display: inline-block; }
.intro-pin .lead { max-width: 365px; font-size: .95rem; margin-top: 22px; line-height: 1.85; }
.intro-pin .recipient-label { font-size: 1.3rem; margin-top: 24px; }
.intro-pin .intro-copy { transform: translate3d(0, calc(var(--scene-progress) * -22px), 0); }
.intro-pin .envelope-frame { width: 100%; transform: scale(calc(1 + var(--scene-progress) * .08)); }
.intro-pin .intro-footnote { margin-top: 0; padding-top: 22px; border-top: 1px solid var(--color-border); font-size: .7rem; opacity: .7; }
.scroll-cue { display: flex; align-items: center; gap: 14px; margin-top: 28px; color: var(--color-accent-ink); font-size: .78rem; letter-spacing: .025em; }
.scroll-cue-line { display: inline-block; width: 1px; height: 40px; background: linear-gradient(transparent, var(--color-accent)); transform-origin: top; transform: scaleY(calc(1 - var(--scene-progress, 0) * .5)); }
.garden.scroll-scene { --scene-travel: 65svh; background: linear-gradient(180deg, var(--color-background), var(--color-surface) 18%, var(--color-surface) 78%, var(--color-background)); }
.garden-pin { display: grid; align-items: center; }
.garden-pin .garden-layout { width: min(calc(var(--content-width) + var(--gutter-start) + var(--gutter-end)), 100%); grid-template-columns: .9fr 1.1fr; gap: 64px; }
.garden-pin .section-copy { position: relative; max-width: 390px; }
.garden-pin h2 { font-size: clamp(2.5rem, 4vw, 3.4rem); line-height: 1.12; text-wrap: initial; }
.garden-pin .lead { font-size: .95rem; max-width: 335px; line-height: 1.9; }
.garden-composition { position: relative; width: 100%; height: 490px; isolation: isolate; }
.garden-composition::before { content: ''; position: absolute; inset: 25px 5px 25px 20px; border: 1px solid var(--color-border); border-radius: 48% 48% 45% 45%; transform: rotate(12deg); z-index: -1; }
.garden-pin #hero-photo { position: absolute; top: 16px; left: 20px; width: 300px; }
.garden-pin #hero-photo .portrait { width: 100%; max-width: none; margin: 0; padding: 9px; border-radius: 150px 150px 4px 4px; transform: perspective(900px) rotateY(calc(-7deg + var(--scene-progress) * 14deg)) rotateZ(-3deg); box-shadow: 0 18px 45px #573a3015; }
.garden-pin #hero-photo img { max-height: none; border-radius: 140px 140px 2px 2px; aspect-ratio: 3 / 4; }
.garden-pin .garden-art { position: absolute; width: 340px; max-width: none; max-height: none; aspect-ratio: 1; bottom: -26px; right: -32px; z-index: 1; }
.garden:not(.has-portrait) .garden-art { inset: 0; width: 100%; }
.garden:not(.has-portrait) .garden-composition::before { display: none; }
.wishes .section-heading { max-width: 590px; text-align: center; margin: 0 auto 40px; }
.wishes .section-thread { width: 160px; margin-inline: auto; opacity: .65; }
.wishes .section-heading > p { max-width: 44ch; margin-inline: auto; }
.wishes .wish-interaction-hint { font-size: .75rem; }
.wish-progress { text-align: center; border: 0; padding: 0; margin: 0 auto 56px; }
.wish-count, .wish-complete { font-size: .7rem; }
.wish-list { gap: clamp(72px, 10svh, 110px); max-width: 920px; margin-inline: auto; }
.wish-slot { perspective: 1400px; }
.wish-slot .wish-card { grid-template-columns: 1fr 1fr; gap: 88px; min-height: 420px; padding: 0; border: 0; border-radius: 0; transform: translate3d(0, var(--card-y, 0px), 0) rotateY(var(--card-rotate, 0deg)); transform-origin: center; background: transparent; box-shadow: none; }
.wish-slot:nth-child(even) .wish-card { grid-template-columns: 1fr 1fr; grid-template-areas: 'copy art'; }
.wish-slot .wish-copy { max-width: 340px; }
.wish-slot .wish-copy h3 { font-size: clamp(2rem, 3vw, 2.65rem); line-height: 1.16; }
.wish-slot .wish-message { font-size: .95rem; line-height: 1.95; }
.wish-slot .wish-copy::before { content: ''; display: block; width: 38px; height: 1px; background: var(--color-accent); opacity: .35; margin-bottom: 24px; }
.wish-art { position: relative; perspective: 1100px; }
.wish-art .portrait { width: min(100%, 325px); padding: 8px; border: 0; box-shadow: 0 14px 38px #573a3014; transform: translate3d(0, var(--photo-y, 0px), 24px) rotateY(var(--photo-rotate, 0deg)) rotateZ(-2deg); }
.wish-slot:nth-child(even) .portrait { transform: translate3d(0, var(--photo-y, 0px), 24px) rotateY(var(--photo-rotate, 0deg)) rotateZ(2deg); }
.wish-card[data-layout='photo'] .wish-bloom { position: absolute; width: 105px; bottom: -22px; right: -4px; transform: rotate(12deg); filter: drop-shadow(0 3px 2px #fff8f1); }
.wish-slot:nth-child(even) .wish-bloom { right: auto; left: -4px; transform: rotate(-12deg); }
.wish-card[data-layout='illustration'] .wish-art { min-height: 260px; background: radial-gradient(ellipse, var(--color-glow), transparent 68%); }
.wishes-next { justify-content: center; margin-top: 64px; }
.wish-art .portrait img { aspect-ratio: 4 / 5; object-fit: cover; }
.wish-bloom { width: 150px; --bloom: 1; --stem-growth: 1; --leaf-open: 1; --petal-open: 1; }
.wish-copy .wish-bloom { width: 64px; margin-top: 22px; }
.wish-bloom > svg { transform-origin: 50% 90%; transform: perspective(500px) rotateY(calc(24deg - var(--bloom) * 32deg)) rotate(calc(-6deg + var(--bloom) * 12deg)); }
.wish-bloom .svg-stems { transform-box: view-box; transform-origin: 70px 190px; transform: scaleY(calc(.12 + var(--stem-growth) * .88)); }
.wish-bloom .svg-head { transform-box: fill-box; transform-origin: 50% 85%; transform: translateY(calc(90px - var(--stem-growth) * 90px)) scale(calc(.24 + var(--petal-open) * .76)); }
.wish-bloom .svg-petals { opacity: calc(.65 + var(--petal-open) * .35); transform: scaleX(calc(.5 + var(--petal-open) * .5)) rotate(calc(-28deg + var(--petal-open) * 28deg)); }
.wish-bloom .svg-petal-light { opacity: calc(.25 + var(--petal-open) * .75); }
.wish-bloom .svg-leaves { transform-origin: 50% 85%; opacity: calc(.15 + var(--leaf-open) * .85); transform: scale(calc(.08 + var(--leaf-open) * .92)) rotate(calc(-35deg + var(--leaf-open) * 35deg)); }
.wish-bloom .svg-center { transform-box: fill-box; transform-origin: center; transform: scale(calc(.25 + var(--petal-open) * .75)); opacity: var(--petal-open); }
.wish-bloom .svg-ground { opacity: calc(.2 + var(--stem-growth) * .8); }
.letter-section { padding-top: 12svh; padding-bottom: 16svh; }
.paper-letter { transform-origin: center top; }
.paper-letter { border: 0; border-top: 1px solid var(--color-border); box-shadow: 0 20px 60px #573a3008; }
.finale.scroll-scene { --scene-travel: 75svh; max-width: none; width: 100%; background: radial-gradient(ellipse at 50% 45%, var(--color-glow), transparent 65%); }
.finale-pin { display: flex; flex-direction: column; justify-content: center; align-items: center; }
.finale-pin > .eyebrow { margin-bottom: 8px; }
.finale-pin .bouquet-art { width: min(44svh, 370px, 85vw); margin-bottom: 6px; }
.finale-pin h2 { font-size: clamp(2rem, 4.5vw, 3.5rem); }
.finale-pin .lead { margin-top: 12px; }
.scroll-story .bouquet-ribbon .svg-ribbon { animation: none; stroke-dasharray: 1; stroke-dashoffset: calc(1 - var(--ribbon-progress, 0)); }
.scroll-story .bouquet-art > svg { transform: scale(calc(.8 + var(--scene-progress) * .2)) rotate(calc(-8deg + var(--scene-progress) * 8deg)); }
.scroll-story .letter-body p { animation: none; }
.scroll-atmosphere { position: fixed; inset: 0; pointer-events: none; overflow: clip; z-index: 4; }
.scroll-atmosphere i { position: absolute; top: 0; left: 4%; width: 13px; height: 23px; opacity: .5; border-radius: 80% 5% 80% 5%; background: linear-gradient(140deg, #db9aab88, #efd3d733); }
.scroll-atmosphere i:nth-child(2) { left: 95%; width: 20px; height: 32px; }
.scroll-atmosphere i:nth-child(3) { left: 88%; width: 9px; height: 15px; }
.scroll-atmosphere i:nth-child(4) { left: 8%; width: 7px; height: 12px; }
.scroll-atmosphere i:nth-child(5) { left: 2%; }
.scroll-atmosphere i:nth-child(6) { left: 98%; width: 8px; height: 16px; }
.scroll-meter { position: fixed; z-index: 5; right: max(8px, env(safe-area-inset-right)); top: 25%; height: 50%; width: 2px; background: #b077851c; pointer-events: none; }
.scroll-meter span { display: block; width: 100%; height: 100%; background: var(--color-accent); transform-origin: top; transform: scaleY(0); opacity: .65; }
@media (max-width: 700px) {
  .intro-pin { grid-template-columns: 1fr; gap: 12px; padding-block: 32px; text-align: center; }
  .intro-pin h1 { font-size: clamp(2.4rem, 10vw, 3.4rem); }
  .intro-pin .intro-copy { max-width: 430px; margin-inline: auto; }
  .intro-pin .lead { margin-inline: auto; max-width: 310px; }
  .intro-pin .eyebrow { margin-bottom: 14px; font-size: .65rem; }
  .intro-pin .lead { margin-top: 12px; font-size: .9rem; }
  .intro-pin .recipient-label { margin-top: 8px; font-size: 1.2rem; }
  .intro-pin .envelope-frame { width: min(76vw, 300px); margin: 0 auto; }
  .intro-pin .scroll-cue { margin-top: 14px; font-size: .7rem; justify-content: center; }
  .intro-pin .scroll-cue-line { height: 24px; }
  .intro-pin .intro-footnote { font-size: .65rem; padding-top: 14px; }
  .garden-pin { padding-block: 36px; }
  .garden-pin .garden-layout { grid-template-columns: 1fr; gap: 24px; }
  .garden-pin .section-copy { text-align: center; margin-inline: auto; }
  .garden-pin .eyebrow { margin-bottom: 12px; }
  .garden-pin h2 { font-size: 2.4rem; text-wrap: balance; }
  .garden-pin .lead { margin-top: 12px; margin-inline: auto; font-size: .88rem; }
  .garden-pin .garden-composition { height: 355px; max-width: 355px; margin-inline: auto; }
  .garden-pin #hero-photo { width: 220px; left: 28px; top: 0; }
  .garden-pin .garden-art { width: 245px; right: -14px; bottom: -12px; margin: 0; }
  .garden-pin .scroll-cue { margin-top: 16px; justify-content: center; font-size: .7rem; }
  .wish-slot .wish-card, .wish-slot:nth-child(even) .wish-card { grid-template-columns: 1fr; grid-template-areas: 'art' 'copy'; min-height: auto; padding: 0 14px; gap: 36px; }
  .wish-art { width: min(100%, 290px); margin-inline: auto; }
  .wish-art .portrait { max-width: 265px; }
  .wish-slot .wish-copy { text-align: center; margin-inline: auto; }
  .wish-slot .wish-copy::before { margin: 0 auto 18px; }
  .wish-slot .wish-copy .eyebrow { font-size: .62rem; }
  .wish-slot .wish-message { font-size: .9rem; margin-top: 12px; }
  .wish-card[data-layout='photo'] .wish-bloom { width: 80px; right: -12px; bottom: -14px; }
  .wish-slot:nth-child(even) .wish-bloom { right: auto; left: -12px; }
  .wish-slot { perspective: 1800px; }
  .wish-copy .wish-bloom { width: 48px; margin-top: 12px; }
  .finale-pin { padding-block: 28px; }
  .finale-pin .bouquet-art { width: min(43svh, 300px); }
}
@media (prefers-reduced-motion: reduce) {
  .scroll-scene { height: auto; }
  .scene-pin { position: relative; top: auto; min-height: auto; padding-block: 56px; }
  .scroll-story .intro-copy, .scroll-story .envelope-frame, .scroll-story #hero-photo .portrait,
  .scroll-story .wish-card, .scroll-story .portrait, .scroll-story .bouquet-art > svg { transform: none; }
  .scroll-atmosphere { display: none; }
  .wish-bloom > svg { transform: none; }
}
```

## src/styles/garden-botanicals.css

```css
/* A floral border, foreground meadow and background threads share one scroll pose. */
.garden-pin { isolation: isolate; }
.garden-pin .garden-layout { position: relative; z-index: 1; }
.garden-title-name { display: block; }
.garden-composition::before { display: none; }

.garden-pin #hero-photo {
  transform: perspective(1000px) rotateY(calc(-4.5deg + var(--scene-progress, 0.5) * 9deg)) rotateZ(calc(-2.8deg + var(--scene-progress, 0.5) * 1.2deg));
  will-change: transform;
}

.garden-pin #hero-photo .portrait {
  transform: none;
  box-shadow: 0 18px 42px rgba(87, 58, 48, 0.08), 0 4px 12px rgba(87, 58, 48, 0.04);
}

.portrait-garland {
  position: absolute;
  inset: -26px;
  z-index: 2;
  pointer-events: none;
  filter: drop-shadow(0 6px 14px rgba(92, 64, 53, 0.07));
}

.portrait-garland > svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  animation: garland-breathe 6.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.botanical-flower {
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(calc(.74 + var(--scene-progress, 1) * .26)) rotate(calc(-7deg + var(--scene-progress, 1) * 7deg));
}

.garden-meadow {
  position: absolute;
  width: 475px;
  height: auto;
  bottom: -32px;
  right: -88px;
  z-index: 2;
  pointer-events: none;
  filter: drop-shadow(0 10px 20px rgba(87, 58, 48, 0.06));
}

/* Tách riêng chuyển động gió đung đưa ra thẻ SVG để không xung đột với --scene-progress */
.garden-meadow > svg {
  width: 100%;
  height: auto;
  overflow: visible;
  transform-origin: 50% 100%;
  animation: meadow-breeze 5.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.meadow-grasses {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  transform: skewX(calc(-2.5deg + var(--scene-progress, 1) * 5deg)) scaleY(calc(.82 + var(--scene-progress, 1) * .18));
}

.meadow-trailing {
  transform: translate3d(0, calc(7px - var(--scene-progress, 1) * 7px), 0);
}

.garden-atmosphere {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: clip;
  pointer-events: none;
}

.garden-atmosphere > svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: atmosphere-drift 8.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.garden-drifting-leaves {
  transform: translate3d(calc(12px - var(--scene-progress, 0) * 24px), calc(18px - var(--scene-progress, 0) * 36px), 0);
}

.garden-glints {
  opacity: calc(.45 + var(--scene-progress, 0) * .55);
}

.botanical-sparkle {
  transform-box: fill-box;
  transform-origin: center;
  animation: sparkle-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: var(--delay, 0s);
}

/* Làm mượt chuyển động mọc dây leo và nở hoa của trang Wishes */
.vine-stem {
  transition: stroke-dashoffset 0.12s linear;
}

.vine-bud {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out;
}

.story-floating {
  animation: atmosphere-drift 7.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

@keyframes garland-breathe {
  0% { transform: rotate(-0.35deg) scale(0.997); }
  100% { transform: rotate(0.35deg) scale(1.003); }
}

@keyframes meadow-breeze {
  0% { transform: rotate(-0.8deg) skewX(-1.2deg); }
  100% { transform: rotate(0.6deg) skewX(1.4deg); }
}

@keyframes atmosphere-drift {
  0% { transform: translate3d(-4px, 3px, 0); }
  100% { transform: translate3d(4px, -5px, 0); }
}

@keyframes sparkle-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.72) rotate(0deg); }
  50% { opacity: 0.95; transform: scale(1.08) rotate(15deg); }
}

.garden:not(.has-portrait) .portrait-garland { display: none; }

@media (min-width: 701px) and (max-width: 1100px) {
  .garden-pin .garden-layout { width: 84%; padding-inline: 0; gap: 48px; }
  .garden-pin .garden-composition { height: 410px; }
  .garden-pin #hero-photo { width: 240px; left: 8px; }
  .portrait-garland { inset: -20px; }
  .garden-meadow { right: -43px; width: 350px; bottom: -29px; }
  .garden-pin .garden-art { width: 285px; right: -16px; bottom: -18px; }
}

@media (max-width: 700px) {
  .portrait-garland { inset: -18px; }
  .garden-meadow { width: 315px; right: -12px; bottom: -16px; }
  .garden-atmosphere > svg { width: 180%; max-width: none; margin-left: -40%; }
  .garden-drifting-leaves { opacity: .65; }
}

@media (prefers-reduced-motion: reduce) {
  .garden-pin #hero-photo,
  .portrait-garland > svg,
  .botanical-flower,
  .garden-meadow > svg,
  .meadow-grasses,
  .meadow-trailing,
  .garden-atmosphere > svg,
  .garden-drifting-leaves,
  .botanical-sparkle,
  .story-floating {
    transform: none;
    animation: none;
    transition: none;
  }
  .garden-glints { opacity: 1; }
}
```

## src/styles/story-botanicals.css

```css
/* The same paper, ink and botanical shapes continue from the opening garden. */
.wish-slot { position: relative; isolation: isolate; }
.wish-slot .wish-card { position: relative; isolation: isolate; }
.story-backdrop { position: absolute; inset: -65px -160px; z-index: -1; pointer-events: none; }
.story-backdrop > svg { width: 100%; height: 100%; overflow: visible; }
.story-thread { stroke: #d8aaa9; stroke-width: .8; opacity: .3; }
.story-orbit { stroke: #d7b4aa; stroke-width: .8; opacity: .28; }
.story-growing-branch { opacity: .65; }
.story-growing-branch .vine-stem { stroke: #c7a99d; stroke-width: .9; }
.story-floating { transform: translateY(calc(14px - var(--vine-progress, 0) * 28px)); }
.wish-slot:nth-child(3n + 2) .story-backdrop { transform: scaleX(-1); }
.wish-slot:nth-child(3n) .story-orbit { stroke-dasharray: 2 5; }
.wish-slot .wish-art { width: min(100%, 325px); margin-inline: auto; }
.wish-photo-scene { position: relative; transform: translate3d(0, var(--photo-y, 0px), 24px) rotateY(var(--photo-rotate, 0deg)) rotateZ(-2deg); }
.wish-slot:nth-child(even) .wish-photo-scene { transform: translate3d(0, var(--photo-y, 0px), 24px) rotateY(var(--photo-rotate, 0deg)) rotateZ(2deg); }
.wish-slot .wish-art .portrait { width: 100%; max-width: none; transform: none; padding-bottom: 15px; }
.wish-photo-scene::after { content: ''; position: absolute; width: 78px; height: 23px; left: 42%; top: -9px; background: #dfb0bd75; border-inline: 1px dashed #fff8; transform: rotate(-6deg); }
.wish-slot:nth-child(3n + 2) .wish-photo-scene::after { background: #b7c3a66b; left: 22%; transform: rotate(7deg); }
.wish-slot:nth-child(3n) .wish-photo-scene::after { background: #e7d6af80; left: 50%; }
.wish-vine { position: absolute; inset: -26px -25px -29px; pointer-events: none; }
.wish-vine > svg { width: 100%; height: 100%; overflow: visible; }
.vine-composition-mirrored { transform: translateX(380px) scaleX(-1); }
.vine-guide { stroke: #c8bdab; stroke-width: .65; opacity: .25; }
.vine-stem { stroke: #9dac8f; stroke-width: 1.1; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: calc(1 - clamp(0, var(--vine-progress, 0) / .78, 1)); }
.vine-bud { --bud-open: clamp(0, (var(--vine-progress, 0) - var(--bud-at, 0)) / .18, 1); transform-box: fill-box; transform-origin: center; opacity: var(--bud-open); transform: scale(calc(.15 + var(--bud-open) * .85)) rotate(calc(-24deg + var(--bud-open) * 24deg)); }
.vine-bud .botanical-flower { transform: none; }
.wish-slot .wish-card[data-layout='photo'] .wish-bloom { width: 67px; right: -27px; bottom: -18px; }
.wish-slot:nth-child(even) .wish-card[data-layout='photo'] .wish-bloom { right: auto; left: -27px; }
.wish-copy-flourish { width: 145px; margin-top: 22px; }
.wish-copy-flourish > svg { width: 100%; overflow: visible; }
.wish-copy-flourish .vine-stem { stroke: #d4aaa9; }
.wish-slot .wish-copy::before { display: none; }
.wish-slot .wish-copy { position: relative; }
.wish-slot .wish-card[data-layout='illustration'] .wish-art { min-height: 310px; border: 1px solid #dbbdb44d; border-radius: 48% 52% 47% 53%; background: radial-gradient(ellipse, #efd8dd4d, transparent 72%); }
.wish-card[data-layout='illustration'] .wish-bloom { width: 165px; }
.paper-letter { position: relative; isolation: isolate; border: 1px solid #dfc8ba70; border-radius: 3px; background: linear-gradient(135deg, #fffdf9, #fff9f2); }
.closing-botanicals { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.closing-vine { position: absolute; width: 155px; height: 195px; opacity: .9; }
.closing-vine > svg { width: 100%; height: 100%; overflow: visible; }
.closing-vine-left { top: -30px; left: -42px; transform: rotate(-18deg); }
.closing-vine-right { bottom: -30px; right: -42px; transform: rotate(162deg); }
.paper-letter .closing-vine { width: 105px; height: 135px; }
.paper-letter .story-backdrop { opacity: .4; }
.paper-letter .closing-vine-left { left: -49px; }
.paper-letter .closing-vine-right { right: -49px; }
.finale-pin { position: sticky; isolation: isolate; --vine-progress: var(--scene-progress, 0); }
.finale-pin .closing-botanicals { max-width: 850px; margin-inline: auto; }
.finale-pin .closing-vine-left { top: 18%; left: 0; }
.finale-pin .closing-vine-right { top: 38%; bottom: auto; right: 0; }
.finale-pin .story-backdrop { inset: 0 -150px; }
@media (max-width: 700px) {
  .wish-slot .wish-art { width: min(100%, 265px); }
  .wish-slot .wish-card { row-gap: 44px; }
  .wish-vine { inset: -22px -21px -25px; }
  .wish-photo-scene::after { width: 62px; height: 20px; }
  .story-backdrop { inset: -35px -15px; }
  .story-backdrop > svg { object-fit: cover; }
  .wish-copy-flourish { margin: 18px auto 0; width: 120px; }
  .wish-slot .wish-card[data-layout='photo'] .wish-bloom { width: 58px; right: -18px; }
  .wish-slot:nth-child(even) .wish-card[data-layout='photo'] .wish-bloom { left: -18px; }
  .paper-letter .closing-vine { width: 64px; height: 85px; }
  .paper-letter .closing-vine-left { left: -18px; top: -35px; }
  .paper-letter .closing-vine-right { right: -18px; bottom: -35px; }
  .finale-pin .closing-vine { width: 85px; height: 110px; opacity: .65; }
  .finale-pin .closing-vine-left { left: 10px; top: 22%; }
  .finale-pin .closing-vine-right { right: 6px; top: 34%; bottom: auto; }
  .finale-pin .story-backdrop { inset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .wish-slot .wish-photo-scene, .story-floating { transform: none; }
  .vine-stem { stroke-dashoffset: 0; }
  .vine-bud { opacity: 1; transform: none; }
  .finale-pin { position: relative; }
}

/* The finished bouquet and message stay together, including at document end. */
.finale.scroll-scene {
  --scene-travel: 65svh;
  background: radial-gradient(ellipse at 50% 40%, #f8e1e3 0%, #fdf0eb 43%, var(--color-background) 77%);
}
.finale-pin {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100svh;
  padding: clamp(36px, 6svh, 64px) 20px;
}
.finale-pin .bouquet-art {
  flex: 0 0 auto;
  width: min(32svh, 280px, 66vw);
  margin: 0 0 clamp(12px, 2.5svh, 24px);
  filter: drop-shadow(0 12px 28px #883f5615);
}
.finale-pin .bouquet-art::before {
  content: ''; position: absolute; inset: 8% 0 15%; border-radius: 50%; z-index: -1;
  background: radial-gradient(ellipse, #f3cbd36b, transparent 70%);
  pointer-events: none;
}
.finale-pin .bouquet-ribbon {
  width: var(--ribbon-width, 34%); transform: translate(-50%, -34.783%);
  filter: drop-shadow(0 4px 8px #783a481c);
}
.bouquet-ribbon .svg-silk-bow {
  transform-box: view-box; transform-origin: 90px 40px;
  opacity: var(--ribbon-progress, 1);
  transform: scale(calc(.72 + var(--ribbon-progress, 1) * .28));
}
.finale-pin h2 {
  max-width: 26ch; font-size: clamp(2.2rem, 3.7vw, 3.45rem);
  line-height: 1.18; letter-spacing: -.025em; color: #3a2b30;
}
.finale-pin .lead {
  max-width: 42ch; font-size: clamp(.95rem, 1.3vw, 1.1rem);
  line-height: 1.8; color: #766269; margin-top: 16px;
}
.finale-pin .finale-signature {
  font-size: 1.6rem; line-height: 1.55; margin-top: clamp(20px, 3svh, 30px);
  color: var(--color-accent-ink);
}
.finale-pin .closing-botanicals { max-width: 1100px; }
.finale-pin .story-backdrop { opacity: .4; }
.finale-pin .story-silk-ribbon { display: none; }
.finale-pin .closing-vine { opacity: .65; }
.finale-pin .closing-vine-left { left: 8%; top: 18%; }
.finale-pin .closing-vine-right { right: 8%; top: 35%; bottom: auto; }
@media (max-width: 700px) {
  .finale-pin { padding: 36px 20px 44px; }
  .finale-pin h2 { max-width: 17ch; font-size: clamp(2rem, 8vw, 2.65rem); }
  .finale-pin .lead { max-width: 30ch; font-size: .94rem; margin-top: 14px; }
  .finale-pin .finale-signature { font-size: 1.5rem; margin-top: 22px; }
  .finale-pin .closing-vine-left { left: 4px; top: 19%; }
  .finale-pin .closing-vine-right { right: 4px; top: 35%; }
  .finale-pin .story-backdrop { opacity: .25; }
}
@media (max-height: 520px) and (min-width: 701px) {
  .finale-pin {
    display: grid; grid-template-columns: .8fr 1.2fr; gap: 12px 32px;
    align-content: center; justify-items: center; padding: 28px max(32px, 7vw);
  }
  .finale-pin .bouquet-art { grid-column: 1; grid-row: 1 / 4; width: min(52svh, 220px); margin: 0; }
  .finale-pin h2, .finale-pin .lead, .finale-pin .finale-signature { grid-column: 2; margin: 0; }
  .finale-pin h2 { font-size: 2.1rem; }
  .finale-pin .finale-signature { font-size: 1.4rem; }
}
```

