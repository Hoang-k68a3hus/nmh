import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBasePath, resolveAssetPath } from '../src/utils/assets.js';

test('Vercel/root hosting giữ URL tài nguyên ở root', () => {
  assert.equal(normalizeBasePath(''), '/');
  assert.equal(resolveAssetPath('assets/photos/photo.webp', '/'), '/assets/photos/photo.webp');
});

test('GitHub Pages thêm base của repository vào URL ảnh và audio', () => {
  assert.equal(resolveAssetPath('assets/photos/photo.webp', '/2010/'), '/2010/assets/photos/photo.webp');
  assert.equal(resolveAssetPath('assets/audio/music.mp3', '/2010'), '/2010/assets/audio/music.mp3');
});

test('Base nhiều cấp và dấu slash đầu asset không làm mất repository', () => {
  assert.equal(resolveAssetPath('/assets/images/favicon.svg', 'gifts/2010'), '/gifts/2010/assets/images/favicon.svg');
});

test('Từ chối base là URL ngoài hoặc directory traversal', () => {
  for (const value of ['https://example.com', '//example.com', '/a/../b', '/a?b=1']) {
    assert.throws(() => normalizeBasePath(value));
  }
});

test('Từ chối asset sai cấu trúc hoặc thoát thư mục public', () => {
  for (const value of ['', '../photo.webp', 'https://example.com/a.jpg', 'assets\\photo.webp']) {
    assert.throws(() => resolveAssetPath(value));
  }
});
