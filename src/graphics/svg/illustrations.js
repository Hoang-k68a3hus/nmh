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
