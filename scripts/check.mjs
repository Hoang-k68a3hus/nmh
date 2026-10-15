import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { content } from '../src/config/content.js';
import { validateContent } from '../src/utils/content-validation.js';
import { inspectContentAssets } from './lib/content-assets.mjs';

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(js|mjs)$/.test(entry.name) ? [path] : [];
  });
}

const files = ['vite.config.js', ...sourceFiles('src'), ...sourceFiles('scripts'), ...sourceFiles('tests')];
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
validateContent(content);
const assets = inspectContentAssets(content);
console.log(`PASS: cú pháp ${files.length} file, cấu hình nội dung và ${assets.uniqueCount} asset được tham chiếu.`);
if (content.isDemo) console.log('DEMO: chờ thay tên và nội dung thật; bản build vẫn có nhãn mẫu.');
