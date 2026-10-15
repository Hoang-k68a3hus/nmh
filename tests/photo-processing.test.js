import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { preparePhotos } from '../scripts/lib/photo-processing.mjs';
import { withFixture } from './helpers/fixtures.js';

test('Ảnh web sửa EXIF orientation, giới hạn kích thước và giữ nguyên bản gốc', async () => {
  await withFixture('photo', async (directory) => {
    const inputDirectory = join(directory, 'originals');
    const outputDirectory = join(directory, 'web');
    await mkdir(inputDirectory);
    const original = await sharp({ create: { width: 1600, height: 800, channels: 3, background: '#e8a6b5' } })
      .jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const originalPath = join(inputDirectory, 'camera.jpg');
    await writeFile(originalPath, original);
    const result = await preparePhotos({ inputDirectory, outputDirectory, maxSize: 1200 });
    assert.equal(result[0].name, 'portrait-01.webp');
    assert.equal(result[0].width, 600);
    assert.equal(result[0].height, 1200);
    assert.deepEqual(await readFile(originalPath), original);
    const metadata = await sharp(await readFile(join(outputDirectory, result[0].name))).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.orientation, undefined);
    assert.equal(metadata.exif, undefined);
    await assert.rejects(preparePhotos({ inputDirectory, outputDirectory }), /Đã có portrait-01/);
  });
});

test('Không phóng to ảnh nhỏ, tên batch tiếp theo không đè file cũ', async () => {
  await withFixture('photo-small', async (directory) => {
    const inputDirectory = join(directory, 'originals');
    const outputDirectory = join(directory, 'web');
    await mkdir(inputDirectory);
    await sharp({ create: { width: 120, height: 160, channels: 3, background: '#91a68a' } }).png().toFile(join(inputDirectory, 'small.png'));
    const first = await preparePhotos({ inputDirectory, outputDirectory });
    assert.deepEqual([first[0].width, first[0].height], [120, 160]);
    const second = await preparePhotos({ inputDirectory, outputDirectory, startIndex: 2, format: 'avif' });
    assert.equal(second[0].name, 'portrait-02.avif');
    assert.equal((await sharp(await readFile(join(outputDirectory, second[0].name))).metadata()).width, 120);
  });
});

test('Từ chối ghi vào thư mục gốc hoặc các tham số conversion sai', async () => {
  await withFixture('photo-options', async (directory) => {
    await assert.rejects(preparePhotos({ inputDirectory: directory, outputDirectory: directory }), /tách biệt/);
    await assert.rejects(preparePhotos({ inputDirectory: directory, outputDirectory: join(directory, 'nested') }), /tách biệt/);
    for (const options of [{ maxSize: 0 }, { quality: 101 }, { startIndex: -1 }, { format: 'gif' }]) {
      await assert.rejects(preparePhotos({ inputDirectory: directory, outputDirectory: `${directory}-out`, ...options }));
    }
  });
});
