import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { content } from '../src/config/content.js';
import { inspectContentAssets } from '../scripts/lib/content-assets.mjs';
import { withFixture } from './helpers/fixtures.js';

test('Không có ảnh/audio vẫn check được website', () => {
  const raw = structuredClone(content);
  raw.hero.photo = null;
  raw.wishes.forEach((wish) => { wish.photo = null; });
  raw.letter.photo = null;
  assert.deepEqual(inspectContentAssets(raw), { count: 0, uniqueCount: 0 });
});

test('Asset thiếu, rỗng hoặc sai chữ hoa/thường bị phát hiện trước deploy', async () => {
  await withFixture('assets', async (directory) => {
    const photos = join(directory, 'assets/photos');
    await mkdir(photos, { recursive: true });
    const raw = structuredClone(content);
    raw.wishes.forEach((wish) => { wish.photo = null; });
    raw.letter.photo = null;
    raw.audio = { background: null, narration: null };
    raw.hero.photo = { src: 'assets/photos/missing.webp' };
    assert.throws(() => inspectContentAssets(raw, directory), /Không tìm thấy asset hero.photo/);
    await writeFile(join(photos, 'Portrait.webp'), 'fixture');
    raw.hero.photo.src = 'assets/photos/portrait.webp';
    assert.throws(() => inspectContentAssets(raw, directory), /Sai chữ hoa\/thường/);
    raw.hero.photo.src = 'assets/photos/Portrait.webp';
    assert.deepEqual(inspectContentAssets(raw, directory), { count: 1, uniqueCount: 1 });
    await writeFile(join(photos, 'empty.webp'), '');
    raw.hero.photo.src = 'assets/photos/empty.webp';
    assert.throws(() => inspectContentAssets(raw, directory), /file có dữ liệu/);
  });
});

test('Kiểm tra ảnh ở card/thư và cả nhạc/giọng đọc, gom asset dùng lại', async () => {
  await withFixture('asset-refs', async (directory) => {
    await mkdir(join(directory, 'assets/photos'), { recursive: true });
    await mkdir(join(directory, 'assets/audio'), { recursive: true });
    await writeFile(join(directory, 'assets/photos/photo.webp'), 'fixture');
    await writeFile(join(directory, 'assets/audio/music.mp3'), 'fixture');
    const raw = structuredClone(content);
    raw.wishes.forEach((wish) => { wish.photo = null; });
    const photo = { src: 'assets/photos/photo.webp' };
    raw.hero.photo = photo;
    raw.wishes[0].photo = photo;
    raw.letter.photo = photo;
    raw.audio.background = 'assets/audio/music.mp3';
    raw.audio.narration = 'assets/audio/missing.mp3';
    assert.throws(() => inspectContentAssets(raw, directory), /audio.narration/);
    raw.audio.narration = raw.audio.background;
    assert.deepEqual(inspectContentAssets(raw, directory), { count: 5, uniqueCount: 2 });
  });
});
