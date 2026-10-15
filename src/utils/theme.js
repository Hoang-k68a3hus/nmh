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
