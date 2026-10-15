import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { resolveAssetPath } from '../../src/utils/assets.js';

export function inspectContentAssets(content, publicDirectory = resolve('public')) {
  const refs = [];
  if (content.hero.photo) refs.push({ field: 'hero.photo', src: content.hero.photo.src });
  for (const wish of content.wishes) if (wish.photo) refs.push({ field: `wishes.${wish.id}.photo`, src: wish.photo.src });
  if (content.letter.photo) refs.push({ field: 'letter.photo', src: content.letter.photo.src });
  for (const [key, src] of Object.entries(content.audio)) if (src) refs.push({ field: `audio.${key}`, src });

  for (const ref of refs) {
    let directory = publicDirectory;
    const segments = resolveAssetPath(ref.src).slice(1).split('/');
    for (const segment of segments) {
      let entries;
      try { entries = readdirSync(directory); }
      catch { throw new Error(`Không tìm thấy asset ${ref.field}: ${ref.src}.`); }
      if (!entries.includes(segment)) {
        const near = entries.find((name) => name.toLowerCase() === segment.toLowerCase());
        if (near) throw new Error(`Sai chữ hoa/thường tại ${ref.field}: ${segment}; tên file thực tế là ${near}.`);
        throw new Error(`Không tìm thấy asset ${ref.field}: public/${ref.src}.`);
      }
      directory = join(directory, segment);
    }
    const stat = statSync(directory);
    if (!stat.isFile() || stat.size === 0) throw new Error(`Asset ${ref.field} phải là file có dữ liệu: ${ref.src}.`);
  }
  return { count: refs.length, uniqueCount: new Set(refs.map((ref) => resolveAssetPath(ref.src))).size };
}
