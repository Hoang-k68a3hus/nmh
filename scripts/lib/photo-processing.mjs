import { readdir, mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
import sharp from 'sharp';

export async function preparePhotos({ inputDirectory, outputDirectory, maxSize = 1200, quality = 82, startIndex = 1, format = 'webp' }) {
  const input = resolve(inputDirectory);
  const output = resolve(outputDirectory);
  if (input === output || output.startsWith(`${input}${sep}`) || input.startsWith(`${output}${sep}`)) {
    throw new Error('Thư mục ảnh gốc và đầu ra phải tách biệt.');
  }
  if (!Number.isInteger(maxSize) || maxSize < 64 || maxSize > 4096) throw new Error('size cần số nguyên từ 64 tới 4096.');
  if (!Number.isInteger(quality) || quality < 1 || quality > 100) throw new Error('quality cần số nguyên từ 1 tới 100.');
  if (!Number.isInteger(startIndex) || startIndex < 1) throw new Error('start cần số nguyên dương.');
  if (!['webp', 'avif'].includes(format)) throw new Error('format chỉ hỗ trợ webp hoặc avif.');
  let entries;
  try { entries = await readdir(input, { withFileTypes: true }); }
  catch { throw new Error('Chưa có thư mục ảnh gốc. Tạo .originals/photos và đặt ảnh vào trước.'); }
  const sources = entries.filter((entry) => entry.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(entry.name))
    .map((entry) => entry.name).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  if (!sources.length) throw new Error('Không tìm thấy ảnh JPG, PNG, WebP hoặc AVIF trong thư mục gốc.');
  const destinations = sources.map((_, index) => `portrait-${String(startIndex + index).padStart(2, '0')}.${format}`);
  await mkdir(output, { recursive: true });
  for (const name of destinations) {
    try { await access(join(output, name)); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    throw new Error(`Đã có ${name}; dùng --start khác để giữ các file hiện tại.`);
  }
  const manifest = [];
  for (const [index, source] of sources.entries()) {
    // Đọc từng file vào buffer để không giữ file handle của ảnh gốc trên Windows.
    let pipeline = sharp(await readFile(join(input, source))).autoOrient()
      .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true });
    pipeline = format === 'webp' ? pipeline.webp({ quality }) : pipeline.avif({ quality });
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    await writeFile(join(output, destinations[index]), data, { flag: 'wx' });
    manifest.push({ name: destinations[index], width: info.width, height: info.height, bytes: info.size });
  }
  return manifest;
}
