import { parseArgs } from 'node:util';
import { resolve, relative } from 'node:path';
import { preparePhotos } from './lib/photo-processing.mjs';

try {
  const { values } = parseArgs({
    options: {
      input: { type: 'string', default: '.originals/photos' },
      output: { type: 'string', default: 'public/assets/photos' },
      size: { type: 'string', default: '1200' },
      quality: { type: 'string', default: '82' },
      start: { type: 'string', default: '1' },
      format: { type: 'string', default: 'webp' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log('npm run prepare:photos -- --input .originals/photos --output public/assets/photos --size 1200 --quality 82 --start 1 --format webp');
    console.log('Giữ nguyên ảnh gốc; tự sửa hướng, thu nhỏ, bỏ metadata và tạo file tên portrait-XX. Không ghi đè file đã có.');
  } else {
    const manifest = await preparePhotos({
      inputDirectory: values.input, outputDirectory: values.output,
      maxSize: Number(values.size), quality: Number(values.quality), startIndex: Number(values.start), format: values.format,
    });
    const publicRelative = relative(resolve('public'), resolve(values.output)).replaceAll('\\', '/');
    const inPublic = publicRelative !== '..' && !publicRelative.startsWith('../') && !publicRelative.includes(':');
    console.log(`Đã tạo ${manifest.length} ảnh, giữ nguyên bản gốc. Kích thước dưới đây là của bản web.`);
    console.log(JSON.stringify(manifest.map(({ name, width, height, bytes }) => ({
      ...(inPublic ? { src: [publicRelative, name].filter(Boolean).join('/') } : { file: name }),
      alt: '[Mô tả ảnh]', width, height, focalPoint: '50% 50%', caption: '', bytes,
    })), null, 2));
  }
} catch (error) {
  console.error(`Không thể chuẩn bị ảnh: ${error.message}`);
  process.exitCode = 1;
}
