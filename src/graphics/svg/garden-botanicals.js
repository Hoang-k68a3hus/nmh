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
  const defs = `
    <defs>
      <radialGradient id="garden-aura-warm" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f7dce2" stop-opacity=".55"/>
        <stop offset="55%" stop-color="#f9ebe0" stop-opacity=".22"/>
        <stop offset="100%" stop-color="#fff8f1" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="garden-aura-sage" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#dce6d5" stop-opacity=".42"/>
        <stop offset="60%" stop-color="#f3efe6" stop-opacity=".15"/>
        <stop offset="100%" stop-color="#fff8f1" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="garden-sunbeam" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffdf8" stop-opacity=".5"/>
        <stop offset="50%" stop-color="#fcefe3" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#fff8f1" stop-opacity="0"/>
      </linearGradient>
    </defs>`;

  const auras = `
    <g class="garden-auras" opacity=".85">
      <ellipse cx="980" cy="310" rx="420" ry="290" fill="url(#garden-aura-warm)"/>
      <ellipse cx="290" cy="420" rx="340" ry="240" fill="url(#garden-aura-sage)"/>
      <path d="M-80 -40 L480 -40 L960 690 L320 690 Z" fill="url(#garden-sunbeam)"/>
    </g>`;

  const threads = `
    <g stroke="#dab8b5" stroke-width="1.1" opacity=".46">
      <path d="M-40 179C44-35 192 139 349-58M-18 145C87 3 205 122 354-36"/>
      <path d="M-35 368C133 615 325 635 527 471S807 459 1080 347"/>
      <path d="M-19 394C124 610 286 655 499 502S777 436 1092 376" stroke-width=".75" opacity=".7"/>
      <path d="M847-42C1058-18 951 125 1153 158S1372 323 1428 376"/>
      <path d="M744 132C863 43 1151 81 1160 319S1290 589 1450 571" opacity=".55"/>
      <path d="M180 590C390 460 640 530 890 410S1210 250 1430 290" stroke="#c2cfb8" stroke-width=".85" stroke-dasharray="4 6" opacity=".5"/>
    </g>`;

  const floatingElements = `
    <g class="garden-drifting-leaves">
      ${driftingPetal(78, 185, 35, 1.05, true)}
      ${driftingPetal(22, 285, -25, 0.9, false)}
      ${driftingPetal(645, 340, 48, 0.75, false)}
      ${driftingPetal(1290, 385, -35, 0.95, true)}
      ${driftingPetal(1240, 95, 25, 0.7, false)}
      ${driftingPetal(420, 110, -18, 0.68, false)}
      ${driftingPetal(865, 515, 28, 0.82, true)}
      ${leaf(98, 315, -52, 1.05)}
      ${leaf(562, 198, 32, 1.1)}
      ${leaf(550, 298, 95, .78, true)}
      ${leaf(1265, 460, 48, .72, true)}
      ${leaf(830, 118, -38, .66, true)}
    </g>`;

  const glints = [
    [719,173,2.5],[1219,240,2.8],[1104,489,2.2],[699,379,2.6],[1287,392,3],[1008,94,2.4],
    [480,460,2],[615,120,2.2],[1330,280,2.5],[240,145,2.3],[890,260,1.9]
  ].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffdf3" opacity=".82"/>`).join('');

  const sparkles = `
    ${sparkle(675, 145, 0.65, 0)}
    ${sparkle(1185, 210, 0.8, 0.7)}
    ${sparkle(1310, 420, 0.9, 1.4)}
    ${sparkle(520, 490, 0.6, 2.1)}
    ${sparkle(215, 130, 0.72, 1.1)}
    ${sparkle(945, 115, 0.58, 1.8)}
  `;

  return svg('0 0 1400 650', `${defs}${auras}${threads}${floatingElements}<g class="garden-glints">${glints}${sparkles}</g>`);
}

export function introAtmosphereMarkup() {
  const defs = `
    <defs>
      <radialGradient id="intro-envelope-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f6d8df" stop-opacity=".62"/>
        <stop offset="48%" stop-color="#faeadf" stop-opacity=".28"/>
        <stop offset="100%" stop-color="#fff8f1" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="intro-copy-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f9ebd4" stop-opacity=".42"/>
        <stop offset="60%" stop-color="#fdf4eb" stop-opacity=".16"/>
        <stop offset="100%" stop-color="#fff8f1" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="intro-morning-ray" x1="0%" y1="0%" x2="100%" y2="85%">
        <stop offset="0%" stop-color="#fffefa" stop-opacity=".65"/>
        <stop offset="45%" stop-color="#fceddf" stop-opacity=".2"/>
        <stop offset="100%" stop-color="#fff8f1" stop-opacity="0"/>
      </linearGradient>
    </defs>`;

  const lightPools = `
    <g class="intro-light-pools">
      <path d="M-120 -60 L620 -60 L1180 820 L260 820 Z" fill="url(#intro-morning-ray)"/>
      <ellipse cx="1010" cy="390" rx="390" ry="310" fill="url(#intro-envelope-glow)"/>
      <ellipse cx="340" cy="330" rx="330" ry="250" fill="url(#intro-copy-glow)"/>
    </g>`;

  const silkThreads = `
    <g stroke="#ddb9b8" stroke-width="1" opacity=".38">
      <path d="M-60 620C140 490 360 670 610 540S1020 310 1490 430"/>
      <path d="M-40 648C165 520 370 692 625 562S1035 338 1495 456" stroke-width=".65" opacity=".65"/>
      <path d="M680 -30C790 140 990 85 1170 210S1360 470 1480 510" stroke="#c4d0ba" stroke-width=".85" stroke-dasharray="3 5" opacity=".55"/>
    </g>`;

  const botanicalAccents = `
    <g class="intro-drifting-botanicals">
      ${driftingPetal(690, 148, -22, 0.88, false)}
      ${driftingPetal(1290, 175, 34, 0.96, true)}
      ${driftingPetal(1210, 620, -40, 0.78, false)}
      ${driftingPetal(110, 125, 18, 0.72, false)}
      ${leaf(745, 615, -48, 0.85, true)}
      ${leaf(1320, 320, 62, 0.76, false)}
      ${flower(1260, 138, 0.62, 'white', 15)}
      ${flower(725, 640, 0.54, 'pink', -20)}
    </g>`;

  const sparkles = `
    <g class="intro-glints">
      ${sparkle(760, 170, 0.78, 0.2)}
      ${sparkle(1250, 240, 0.9, 1.1)}
      ${sparkle(830, 560, 0.65, 1.9)}
      ${sparkle(1140, 110, 0.7, 0.6)}
      ${sparkle(180, 165, 0.6, 1.5)}
      <circle cx="810" cy="135" r="2.2" fill="#fffdf4" opacity=".8"/>
      <circle cx="1310" cy="290" r="2.6" fill="#fffdf4" opacity=".75"/>
      <circle cx="715" cy="495" r="2" fill="#fffdf4" opacity=".7"/>
      <circle cx="1180" cy="585" r="2.4" fill="#fffdf4" opacity=".8"/>
    </g>`;

  return svg('0 0 1440 820', `${defs}${lightPools}${silkThreads}${botanicalAccents}${sparkles}`);
}

export function scrollAtmosphereMarkup() {
  const items = [
    { kind: 'petal-soft', variant: 'soft' },
    { kind: 'petal-deep', variant: 'deep' },
    { kind: 'leaf-sage', variant: 'sage' },
    { kind: 'sparkle-gold', variant: 'gold' },
    { kind: 'petal-soft', variant: 'soft' },
    { kind: 'leaf-sage', variant: 'sage' },
    { kind: 'petal-deep', variant: 'deep' },
    { kind: 'sparkle-gold', variant: 'gold' },
  ];
  return items.map(({ kind, variant }) => {
    if (kind === 'leaf-sage') {
      return `<i data-kind="${variant}">${svg('0 0 28 36', `<path d="M14 34C5 22 7 9 20 2 25 16 21 28 14 34Z" fill="#9eb093" opacity=".72"/><path d="M14 33C15 23 17 14 19 6" stroke="#f7f4e8" stroke-width=".7" stroke-linecap="round" opacity=".6"/>`)}</i>`;
    }
    if (kind === 'sparkle-gold') {
      return `<i data-kind="${variant}">${svg('0 0 24 24', `<circle cx="12" cy="12" r="7" fill="#f7e4b5" opacity=".32"/><path d="M12 2C12.8 8.5 15.5 11.2 22 12 15.5 12.8 12.8 15.5 12 22 11.2 15.5 8.5 12.8 2 12 8.5 11.2 11.2 8.5 12 2Z" fill="#ebd094" opacity=".82"/>`)}</i>`;
    }
    const fill = kind === 'petal-deep' ? '#d996a6' : '#ecc5cf';
    const edge = kind === 'petal-deep' ? '#eabec8' : '#fff5f7';
    return `<i data-kind="${variant}">${svg('0 0 26 34', `<path d="M13 32C4 22 3 9 13 2 22 8 23 22 13 32Z" fill="${fill}" opacity=".78"/><path d="M13 29C13.5 20 14 13 13.5 6" stroke="${edge}" stroke-width=".65" stroke-linecap="round" opacity=".55"/>`)}</i>`;
  }).join('');
}

