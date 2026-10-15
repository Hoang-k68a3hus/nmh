import { resolveAssetPath } from './assets.js';
import { resolveContentTemplates } from './content-templates.js';

function requireObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${field} phải là object.`);
}

function requireText(value, field, { empty = false } = {}) {
  if (typeof value !== 'string' || (!empty && !value.trim())) throw new Error(`Thiếu hoặc sai nội dung: ${field}.`);
}

function requireFields(value, field, keys) {
  requireObject(value, field);
  keys.forEach((key) => requireText(value[key], `${field}.${key}`));
}

function requireLiteral(value, field, options) {
  requireText(value, field, options);
  if (/\{\{|\}\}/.test(value)) throw new Error(`${field} phải là giá trị trực tiếp, không phải token.`);
}

function validateAsset(path, field, folder, extensions) {
  requireText(path, field);
  const normalized = resolveAssetPath(path).slice(1);
  if (!normalized.startsWith(`assets/${folder}/`) || !extensions.test(normalized)) {
    throw new Error(`${field} phải nằm trong assets/${folder}/ và có định dạng được hỗ trợ.`);
  }
}

function validatePhoto(photo, field) {
  if (photo == null) return;
  requireObject(photo, field);
  validateAsset(photo.src, `${field}.src`, 'photos', /\.(webp|avif|jpe?g|png)$/i);
  if (photo.decorative != null && typeof photo.decorative !== 'boolean') throw new Error(`${field}.decorative phải là boolean.`);
  requireLiteral(photo.alt, `${field}.alt`, { empty: photo.decorative === true });
  if (photo.decorative && photo.alt !== '') throw new Error(`Ảnh trang trí ${field} cần alt rỗng.`);
  if (!(Number.isInteger(photo.width) && photo.width > 0 && Number.isInteger(photo.height) && photo.height > 0)) {
    throw new Error(`Ảnh ${field} cần width/height là số nguyên dương.`);
  }
  if (photo.caption != null) requireText(photo.caption, `${field}.caption`, { empty: true });
  if (photo.focalPoint != null) {
    const match = typeof photo.focalPoint === 'string' && photo.focalPoint.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
    if (!match || Number(match[1]) > 100 || Number(match[2]) > 100) {
      throw new Error(`${field}.focalPoint cần hai phần trăm từ 0 tới 100, ví dụ 50% 35%.`);
    }
  }
}

function checkPlaceholders(value, field = 'content') {
  if (typeof value === 'string' && /\[(?:Tên em|Tên bạn|Biệt danh|Chữ ký|Mô tả ảnh)\]/iu.test(value)) {
    throw new Error(`Còn nội dung mẫu tại ${field}; hãy thay trước khi đặt isDemo: false.`);
  }
  if (Array.isArray(value)) value.forEach((entry, index) => checkPlaceholders(entry, `${field}[${index}]`));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, entry]) => checkPlaceholders(entry, `${field}.${key}`));
}

export function validateContent(content) {
  requireObject(content, 'content');
  if (typeof content.isDemo !== 'boolean') throw new Error('isDemo phải là true hoặc false.');
  requireFields(content.occasion, 'occasion', ['label', 'displayDate', 'shortDate']);
  for (const field of ['label', 'displayDate', 'shortDate']) requireLiteral(content.occasion[field], `occasion.${field}`);
  requireObject(content.recipient, 'recipient');
  requireLiteral(content.recipient.name, 'recipient.name');
  requireLiteral(content.recipient.nickname, 'recipient.nickname', { empty: true });
  requireFields(content.sender, 'sender', ['name', 'signature']);
  requireLiteral(content.sender.name, 'sender.name');
  requireFields(content.page, 'page', ['title', 'description', 'brand', 'footer']);
  requireObject(content.theme, 'theme');
  for (const key of ['background', 'accent']) {
    if (!/^#[0-9a-f]{6}$/i.test(content.theme[key])) throw new Error(`theme.${key} phải là màu #RRGGBB.`);
  }
  for (const key of ['rose', 'leaf', 'gold']) {
    if (content.theme[key] != null && !/^#[0-9a-f]{6}$/i.test(content.theme[key])) throw new Error(`theme.${key} phải là màu #RRGGBB.`);
  }
  requireLiteral(content.theme.flower, 'theme.flower');
  if (!['stylized', 'rose', 'daisy', 'tulip'].includes(content.theme.flower)) throw new Error('theme.flower cần stylized, rose, daisy hoặc tulip.');
  requireFields(content.intro, 'intro', ['eyebrow', 'title', 'titleTail', 'emphasis', 'recipientLabel', 'message', 'openingLabel', 'skipLabel', 'openedMessage', 'footnote']);
  requireFields(content.hero, 'hero', ['eyebrow', 'title', 'message', 'nextLabel']);
  validatePhoto(content.hero.photo, 'hero.photo');
  requireFields(content.wishSection, 'wishSection', ['eyebrow', 'title', 'emphasis', 'message', 'cardLabel', 'interactionHint', 'bloomLabel', 'bloomedLabel', 'counterLabel', 'flowerUnit', 'completeMessage', 'nextLabel']);
  if (!Array.isArray(content.wishes) || !content.wishes.length) throw new Error('Cần ít nhất một lời chúc.');
  const ids = new Set();
  for (const [index, wish] of content.wishes.entries()) {
    requireFields(wish, `wishes[${index}]`, ['id', 'title', 'message']);
    if (!/^[a-z][a-z0-9-]*$/.test(wish.id)) throw new Error(`ID lời chúc không hợp lệ: ${wish.id}.`);
    if (ids.has(wish.id)) throw new Error(`ID lời chúc trùng: ${wish.id}.`);
    ids.add(wish.id);
    validatePhoto(wish.photo, `wishes.${wish.id}.photo`);
  }
  requireFields(content.letter, 'letter', ['eyebrow', 'title', 'listenLabel', 'pauseLabel', 'resumeLabel', 'loadingLabel', 'listenAgainLabel', 'retryLabel', 'blockedMessage', 'errorMessage', 'finishedMessage']);
  if (!Array.isArray(content.letter.paragraphs) || !content.letter.paragraphs.length) throw new Error('Bức thư chưa có đoạn văn.');
  content.letter.paragraphs.forEach((paragraph, index) => requireText(paragraph, `letter.paragraphs[${index}]`));
  validatePhoto(content.letter.photo, 'letter.photo');
  requireFields(content.finale, 'finale', ['eyebrow', 'title', 'message', 'replayLabel']);
  requireObject(content.audio, 'audio');
  for (const key of ['background', 'narration']) {
    if (content.audio[key] != null) validateAsset(content.audio[key], `audio.${key}`, 'audio', /\.(mp3|m4a|ogg|wav|aac)$/i);
  }
  const resolved = resolveContentTemplates(content);
  if (!content.isDemo) checkPlaceholders(resolved);
  return content;
}

export function prepareContent(content) {
  return resolveContentTemplates(validateContent(content));
}
