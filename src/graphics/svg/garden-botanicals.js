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
