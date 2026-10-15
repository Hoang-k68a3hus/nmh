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
