import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/config/content.js';
import { contrastRatio, createThemeTokens } from '../src/utils/theme.js';

function verifyReadable(tokens) {
  for (const [foreground, background] of [
    ['--color-text', '--color-background'], ['--color-muted', '--color-background'],
    ['--color-accent-ink', '--color-background'], ['--color-on-accent', '--color-accent'],
    ['--color-paper-text', '--color-paper'], ['--color-paper-muted', '--color-paper'],
    ['--color-paper-accent-ink', '--color-paper'], ['--color-surface-text', '--color-surface'],
    ['--color-surface-muted', '--color-surface'], ['--color-surface-accent-ink', '--color-surface'],
  ]) {
    assert.ok(contrastRatio(tokens[foreground], tokens[background]) >= 4.5, `${foreground} trên ${background}`);
  }
}

test('Palette mặc định có màu chữ và nút đọc được trên các nền', () => {
  verifyReadable(createThemeTokens(content.theme));
});

test('Màu nhấn sáng hoặc nền tối vẫn chọn màu chữ đọc được, giữ màu hoa', () => {
  for (const theme of [
    { background: '#FFF8F1', accent: '#F5DDDE' },
    { background: '#281E27', accent: '#D9A7B4', rose: '#B56F8A' },
    { background: '#777777', accent: '#888888', leaf: undefined },
  ]) {
    const tokens = createThemeTokens(theme);
    verifyReadable(tokens);
    assert.equal(tokens['--color-accent'], theme.accent);
    if (theme.rose) assert.equal(tokens['--color-rose'], theme.rose);
  }
});
