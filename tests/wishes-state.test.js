import test from 'node:test';
import assert from 'node:assert/strict';
import { createWishState } from '../src/services/wishes-state.js';

test('Bấm lặp một ID chỉ đếm một lần; tổng lấy từ danh sách lời chúc', () => {
  const state = createWishState(['joy', 'peace', 'dreams']);
  for (let index = 0; index < 20; index++) state.open('peace');
  assert.equal(state.getState().count, 1); assert.equal(state.getState().total, 3);
  assert.deepEqual(state.getState().openedWishIds, new Set(['peace'])); state.dispose();
});
test('ID không có trong nội dung không thay đổi bộ đếm hoặc phát thông báo', () => {
  const state = createWishState(['joy']); let updates = 0;
  state.subscribe(() => updates++);
  assert.equal(state.open('unknown'), false); assert.equal(state.getState().count, 0); assert.equal(updates, 1); state.dispose();
});
test('Chỉ hoàn thành khi đủ ID; reset về 0 và mở lại được', () => {
  const state = createWishState(['joy', 'peace']); state.open('peace');
  assert.equal(state.getState().complete, false); state.open('joy'); assert.equal(state.getState().complete, true);
  state.reset(); assert.equal(state.getState().count, 0); assert.equal(state.getState().complete, false);
  assert.equal(state.open('peace'), true); state.dispose();
  assert.equal(createWishState([]).getState().complete, false);
});
test('Sửa Set trong snapshot không làm mất ID đã mở hoặc thêm ID giả', () => {
  const state = createWishState(['joy', 'peace']); state.open('joy');
  const snapshot = state.getState(); snapshot.openedWishIds.clear(); snapshot.openedWishIds.add('unknown');
  assert.deepEqual(state.getState().openedWishIds, new Set(['joy'])); state.dispose();
});
test('Unsubscribe/dispose bỏ cập nhật cũ; store đã hủy không mở/reset nữa', () => {
  const state = createWishState(['joy', 'peace']); let updates = 0;
  const unsubscribe = state.subscribe(() => updates++); state.open('joy'); unsubscribe(); state.open('peace');
  assert.equal(updates, 2); state.dispose(); state.reset();
  assert.equal(state.open('joy'), false); assert.equal(state.getState().count, 2); assert.equal(updates, 2);
});
