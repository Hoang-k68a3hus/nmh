/** Base URL cùng origin: / hoặc /repository/. */
export function normalizeBasePath(value = '/') {
  if (typeof value !== 'string') throw new TypeError('Base path phải là chuỗi.');
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';
  if (/[?#\\]/.test(trimmed) || trimmed.includes('://') || trimmed.startsWith('//')) {
    throw new Error('Base path phải là đường dẫn, ví dụ / hoặc /ten-repository/.');
  }
  const segments = trimmed.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('Base path không được chứa . hoặc ..');
  }
  return `/${segments.join('/')}/`;
}

/** Tài nguyên public: dùng đường dẫn assets/..., không kèm public/. */
export function resolveAssetPath(path, base = '/') {
  if (typeof path !== 'string' || !path.trim()) {
    throw new TypeError('Asset phải có đường dẫn.');
  }
  const normalized = path.trim().replace(/^\/+/, '');
  if (/[\u0000-\u001f\u007f?#\\:%{}]/.test(normalized) || normalized.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error('Asset phải là đường dẫn local bên trong public/.');
  }
  return `${normalizeBasePath(base)}${normalized}`;
}

export function assetUrl(path) {
  return resolveAssetPath(path, import.meta.env.BASE_URL);
}
