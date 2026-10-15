import { defineConfig, loadEnv } from 'vite';
import { normalizeBasePath } from './src/utils/assets.js';
import { content } from './src/config/content.js';
import { prepareContent } from './src/utils/content-validation.js';
import { inspectContentAssets } from './scripts/lib/content-assets.mjs';
import { injectContentMetadata } from './scripts/lib/content-html.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  let building = false;

  return {
    plugins: [{
      name: 'gift-content',
      configResolved(config) { building = config.command === 'build'; },
      transformIndexHtml(html) {
        const resolved = prepareContent(content);
        // Dev cho xem fallback khi đang thêm ảnh; production bắt file thiếu trước deploy.
        if (building) inspectContentAssets(resolved);
        return injectContentMetadata(html, resolved);
      },
    }],
    base: normalizeBasePath(env.VITE_BASE_PATH || '/'),
    server: { port: 5173, strictPort: true },
    preview: { port: 4173, strictPort: true },
    build: { outDir: 'dist', emptyOutDir: true, target: 'es2022' },
  };
});
