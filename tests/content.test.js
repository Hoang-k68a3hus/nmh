import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/config/content.js';
import { prepareContent, validateContent } from '../src/utils/content-validation.js';
import { injectContentMetadata } from '../scripts/lib/content-html.mjs';

const examplePhoto = { src: 'assets/photos/portrait-01.webp', alt: 'Ảnh chân dung', width: 960, height: 1200, focalPoint: '50% 35%', caption: '' };
const sample = () => structuredClone(content);

test('Nội dung mẫu có đủ 5 chủ đề, thư 180–300 từ và ảnh đã gắn đúng vị trí', () => {
  const resolved = prepareContent(sample());
  assert.equal(resolved.isDemo, true);
  assert.equal(resolved.wishes.length, 5);
  const count = resolved.letter.paragraphs.join(' ').trim().split(/\s+/u).length;
  assert.ok(count >= 180 && count <= 300, `Thư mẫu: ${count} từ`);
  assert.equal(resolved.hero.photo.src, 'assets/photos/portrait-05.webp');
  assert.equal(resolved.letter.photo, null);
  assert.deepEqual(resolved.wishes.map((wish) => wish.photo?.src ?? null), [
    'assets/photos/portrait-02.webp', 'assets/photos/portrait-01.webp',
    'assets/photos/portrait-04.webp', 'assets/photos/portrait-03.webp', null,
  ]);
});

test('Tên/biệt danh và chữ ký cập nhật xuyên suốt mà không sửa câu mẫu', () => {
  const raw = sample();
  raw.recipient = { name: 'Ngọc Anh', nickname: 'Mây' };
  raw.sender.name = 'Minh';
  raw.isDemo = false;
  const resolved = prepareContent(raw);
  assert.equal(resolved.hero.title, 'Chúc mừng 20/10, Mây.');
  assert.equal(resolved.intro.recipientLabel, 'Gửi Mây');
  assert.equal(resolved.letter.paragraphs[0], 'Gửi Mây,');
  assert.equal(resolved.sender.signature, 'Thương em,\nMinh');
  assert.ok(resolved.page.title.includes('Mây'));
  assert.equal(raw.hero.title, content.hero.title, 'Không mutate cấu hình nguồn');
});

test('Không có biệt danh thì dùng tên người nhận', () => {
  const raw = sample();
  raw.recipient.name = 'Ngọc Anh';
  assert.ok(prepareContent(raw).hero.title.includes('Ngọc Anh'));
  raw.recipient.nickname = '  ';
  assert.ok(prepareContent(raw).hero.title.includes('Ngọc Anh'));
});

test('Chặn ID trùng và ID không dùng được làm định danh ổn định', () => {
  const raw = sample();
  raw.wishes[1].id = raw.wishes[0].id;
  assert.throws(() => validateContent(raw), /ID lời chúc trùng/);
  raw.wishes[1].id = 'hai từ';
  assert.throws(() => validateContent(raw), /ID lời chúc không hợp lệ/);
});

test('Cấu hình sai object, boolean hoặc thiếu nội dung báo đúng trường', () => {
  for (const [mutate, message] of [
    [(raw) => { raw.theme = null; }, /theme phải là object/],
    [(raw) => { raw.audio = []; }, /audio phải là object/],
    [(raw) => { raw.isDemo = 'false'; }, /isDemo/],
    [(raw) => { raw.sender.name = ''; }, /sender.name/],
    [(raw) => { raw.wishes[0].message = 3; }, /message/],
    [(raw) => { raw.theme.accent = 'pink'; }, /theme.accent/],
  ]) {
    const raw = sample(); mutate(raw); assert.throws(() => validateContent(raw), message);
  }
});

test('Token viết sai hoặc chưa đóng không bị phát hành thành chữ thô', () => {
  const raw = sample();
  raw.hero.title = 'Gửi {{recipient.nmae}}';
  assert.throws(() => prepareContent(raw), /Token không hợp lệ/);
  raw.hero.title = 'Gửi {{recipient.name';
  assert.throws(() => prepareContent(raw), /Token chưa hoàn chỉnh/);
});

test('Production từ chối placeholder; demo giữ nhãn và nội dung mẫu', () => {
  const raw = sample();
  raw.isDemo = false;
  assert.throws(() => validateContent(raw), /Còn nội dung mẫu/);
  raw.isDemo = true;
  assert.equal(validateContent(raw).isDemo, true);
});

test('Ảnh có nội dung cần alt, kích thước và vị trí crop hợp lệ', () => {
  const raw = sample();
  raw.wishes[0].photo = { ...examplePhoto };
  assert.doesNotThrow(() => validateContent(raw));
  for (const [override, message] of [
    [{ alt: '' }, /alt/], [{ width: 0 }, /width\/height/], [{ height: 12.5 }, /width\/height/],
    [{ focalPoint: '50% 101%' }, /focalPoint/], [{ focalPoint: 'center top' }, /focalPoint/],
    [{ src: 'public/assets/photos/photo.webp' }, /assets\/photos/],
  ]) {
    raw.wishes[0].photo = { ...examplePhoto, ...override };
    assert.throws(() => validateContent(raw), message);
  }
});

test('Ảnh trang trí có thể dùng alt rỗng, không dùng alt rỗng cho chân dung', () => {
  const raw = sample();
  raw.hero.photo = { ...examplePhoto, decorative: true, alt: '' };
  assert.doesNotThrow(() => validateContent(raw));
  raw.hero.photo.alt = 'Ảnh chân dung';
  assert.throws(() => validateContent(raw), /alt rỗng/);
});

test('Audio nhận path local hoặc null; không nhận URL ngoài và kiểu dữ liệu khác', () => {
  const raw = sample();
  raw.audio = { background: 'assets/audio/background.mp3', narration: 'assets/audio/letter.m4a' };
  assert.doesNotThrow(() => validateContent(raw));
  for (const invalid of [false, '', 'https://example.com/music.mp3', 'assets/photos/music.mp3']) {
    raw.audio.background = invalid;
    assert.throws(() => validateContent(raw));
  }
});

test('Metadata HTML escape tên có ký tự đặc biệt và giữ chuỗi nội dung nguyên dạng', () => {
  const raw = sample();
  raw.recipient.name = 'Anh & "Em" <3';
  const resolved = prepareContent(raw);
  const html = injectContentMetadata('<title>__CONTENT_TITLE__</title><meta content="__CONTENT_DESCRIPTION__">', resolved);
  assert.ok(html.includes('Anh &amp; &quot;Em&quot; &lt;3'));
  assert.ok(!html.includes('__CONTENT_'));
  assert.ok(resolved.page.title.includes('Anh & "Em" <3'));
});
