import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioManager } from '../src/services/audio-manager.js';
import { FakeAudio, FakeVisibility } from './helpers/fake-media.js';

const tick = () => new Promise(setImmediate);
test('Event media lặp không phát lại cùng trạng thái cho vùng thông báo', async () => {
  const { manager, background } = rig(), states = [];
  manager.subscribe(state => states.push(state.background.status));
  await manager.toggleBackground();
  background.dispatchEvent(new Event('playing')); background.dispatchEvent(new Event('playing'));
  assert.deepEqual(states, ['off', 'loading', 'playing']);
  background.dispatchEvent(new Event('waiting')); background.dispatchEvent(new Event('waiting'));
  assert.deepEqual(states, ['off', 'loading', 'playing', 'loading']); manager.dispose();
});
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };
function rig(paths = { background: 'assets/audio/music.wav', narration: 'assets/audio/letter.wav' }) {
  const players = [], visibility = new FakeVisibility();
  const manager = createAudioManager(paths, {
    createAudio: () => { const player = new FakeAudio(); players.push(player); return player; },
    visibilityTarget: visibility, resolveSource: (path) => `/2010/${path}`,
  });
  return { manager, players, visibility, background: manager.audio, narration: manager.narrationAudio };
}

test('Không có file không tạo player; có file vẫn không preload/autoplay hoặc gán src', () => {
  const empty = rig({ background: null, narration: null });
  assert.equal(empty.players.length, 0);
  assert.equal(empty.manager.getState().background.status, 'unavailable');
  empty.manager.dispose();
  const state = rig();
  assert.equal(state.players.length, 2);
  for (const player of state.players) {
    assert.equal(player.hasAttribute('src'), false);
    assert.equal(player.preload, 'none');
    assert.equal(player.autoplay, false);
    assert.equal(player.playCalls, 0);
  }
  state.manager.dispose();
});

test('Bật/tắt dùng lại một player và URL giữ base path', async () => {
  const state = rig({ background: 'assets/audio/music.wav' });
  await state.manager.toggleBackground();
  assert.equal(state.manager.getState().background.status, 'playing');
  assert.equal(state.background.src, '/2010/assets/audio/music.wav');
  await state.manager.toggleBackground();
  assert.equal(state.background.paused, true);
  assert.equal(state.manager.getState().background.status, 'off');
  await state.manager.toggleBackground();
  assert.equal(state.players.length, 1);
  assert.equal(state.background.playCalls, 2);
  state.manager.dispose();
});

test('Play bị chặn có trạng thái error đúng và có thể thử lại', async () => {
  const state = rig();
  state.background.behaviors.push(new DOMException('blocked', 'NotAllowedError'));
  assert.equal(await state.manager.toggleBackground(), false);
  assert.equal(state.manager.getState().background.status, 'error');
  assert.equal(state.manager.getState().background.error, 'blocked');
  assert.equal(state.background.paused, true);
  assert.equal(await state.manager.toggleBackground(), true);
  assert.equal(state.manager.getState().background.error, null);
  state.manager.dispose();
});

test('Lỗi file giữa khi phát giữ error và retry reload source', async () => {
  const state = rig();
  await state.manager.toggleBackground(); state.background.fail();
  assert.equal(state.manager.getState().background.status, 'error');
  assert.equal(state.manager.getState().background.error, 'file');
  await state.manager.toggleBackground();
  assert.equal(state.background.loadCalls, 1);
  assert.equal(state.manager.getState().background.status, 'playing');
  state.manager.dispose();
});

test('Hủy lúc play đang chờ không bị Promise cũ bật lại nhạc', async () => {
  const state = rig(), pending = deferred();
  state.background.behaviors.push(pending.promise);
  const first = state.manager.toggleBackground();
  assert.equal(state.manager.getState().background.status, 'loading');
  await state.manager.toggleBackground(); pending.resolve(); await first;
  assert.equal(state.manager.getState().background.status, 'off');
  assert.equal(state.background.paused, true);
  assert.equal(state.background.playCalls, 1);
  state.manager.dispose();
});

test('Bật/tắt/bật nhanh giữ lựa chọn cuối và không tạo player mới', async () => {
  const state = rig(), old = deferred(), latest = deferred();
  state.background.behaviors.push(old.promise, latest.promise);
  const first = state.manager.toggleBackground(); await state.manager.toggleBackground();
  const second = state.manager.toggleBackground();
  old.resolve(); latest.resolve(); await Promise.all([first, second]);
  assert.equal(state.manager.getState().background.status, 'playing');
  assert.equal(state.background.paused, false);
  assert.equal(state.players.length, 2);
  state.manager.dispose();
});

test('Sự kiện pause/ended/error cũ không ghi đè một lượt phát mới', async () => {
  const state = rig();
  await state.manager.toggleBackground(); await state.manager.toggleBackground(); await state.manager.toggleBackground();
  state.background.dispatchEvent(new Event('pause'));
  state.background.dispatchEvent(new Event('ended'));
  state.background.dispatchEvent(new Event('error'));
  assert.equal(state.background.paused, false);
  assert.equal(state.manager.getState().background.status, 'playing');
  assert.equal(state.manager.getState().background.error, null);
  state.manager.dispose();
});

test('Giọng đọc tạm dừng nhạc, kết thúc chỉ khôi phục nhạc đã bật trước', async () => {
  const state = rig();
  await state.manager.toggleBackground();
  await state.manager.playNarration();
  assert.equal(state.background.paused, true);
  assert.equal(state.narration.paused, false);
  assert.equal(state.manager.getState().background.suspended, true);
  state.narration.end(); await tick();
  assert.equal(state.background.paused, false);
  assert.equal(state.manager.getState().narration.status, 'off');
  state.manager.dispose();
  const silent = rig();
  await silent.manager.playNarration(); silent.narration.end(); await tick();
  assert.equal(silent.background.playCalls, 0);
  assert.equal(silent.background.hasAttribute('src'), false);
  silent.manager.dispose();
});

test('Tắt nhạc trong lúc nghe thư không tự bật lại sau thư', async () => {
  const state = rig();
  await state.manager.toggleBackground(); await state.manager.playNarration();
  await state.manager.toggleBackground(); state.narration.end(); await tick();
  assert.equal(state.manager.getState().backgroundEnabled, false);
  assert.equal(state.background.playCalls, 1);
  assert.equal(state.background.paused, true);
  state.manager.dispose();
});

test('Giọng đọc lỗi không giữ nhạc ở trạng thái suspended', async () => {
  const state = rig();
  await state.manager.toggleBackground();
  state.narration.behaviors.push(new DOMException('unsupported', 'NotSupportedError'));
  assert.equal(await state.manager.playNarration(), false);
  await tick();
  assert.equal(state.manager.getState().narration.error, 'file');
  assert.equal(state.manager.getState().background.suspended, false);
  assert.equal(state.background.paused, false);
  state.manager.dispose();
});

test('Ẩn tab tạm dừng, quay lại không auto resume kể cả giọng đọc kết thúc muộn', async () => {
  const state = rig();
  await state.manager.toggleBackground(); await state.manager.playNarration();
  state.visibility.setHidden(true);
  assert.equal(state.background.paused, true); assert.equal(state.narration.paused, true);
  state.visibility.setHidden(false); state.narration.end(); await tick();
  assert.equal(state.background.playCalls, 1);
  await state.manager.playNarration(); state.narration.end(); await tick();
  assert.equal(state.background.playCalls, 1);
  await state.manager.toggleBackground();
  assert.equal(state.background.playCalls, 2);
  state.manager.dispose();
});

test('Pause/stop giọng đọc giữ nhạc được chọn và stop tua về đầu', async () => {
  const state = rig();
  await state.manager.toggleBackground(); await state.manager.playNarration();
  await state.manager.pauseNarration();
  assert.equal(state.background.paused, false); assert.equal(state.narration.paused, true);
  await state.manager.playNarration(); state.narration.currentTime = 2;
  await state.manager.stopNarration();
  assert.equal(state.narration.currentTime, 0);
  assert.equal(state.manager.getState().narration.status, 'off');
  assert.equal(state.background.paused, false);
  state.manager.dispose();
});

test('Dispose gỡ subscriber/listener/source, bỏ mọi playback hoàn tất muộn', async () => {
  const state = rig(), pending = deferred();
  let notifications = 0;
  const unsubscribe = state.manager.subscribe(() => { notifications++; });
  state.background.behaviors.push(pending.promise);
  const playing = state.manager.toggleBackground();
  unsubscribe(); const previous = notifications;
  state.manager.dispose(); pending.resolve(); await playing;
  state.visibility.setHidden(true); state.background.fail();
  assert.equal(notifications, previous);
  assert.equal(state.background.hasAttribute('src'), false);
  assert.equal(state.background.paused, true);
  assert.equal(await state.manager.toggleBackground(), false);
});

test('Nút giọng đọc toggle play/pause/resume dùng cùng player', async () => {
  const state = rig();
  await state.manager.toggleNarration(); assert.equal(state.manager.getState().narration.status, 'playing');
  await state.manager.toggleNarration(); assert.equal(state.manager.getState().narration.status, 'paused');
  await state.manager.toggleNarration(); assert.equal(state.narration.playCalls, 2); assert.equal(state.players.length, 2);
  state.manager.dispose();
});
test('Toggle hủy giọng đọc đang tải, Promise cũ không bật lại hoặc chồng nhạc', async () => {
  const state = rig(), pending = deferred();
  await state.manager.toggleBackground(); state.narration.behaviors.push(pending.promise);
  const play = state.manager.toggleNarration(); await state.manager.toggleNarration();
  pending.resolve(); await play;
  assert.equal(state.narration.paused, true); assert.equal(state.background.paused, false);
  assert.equal(state.manager.getState().narration.status, 'paused'); state.manager.dispose();
});
test('Xem lại khi nhạc đang phát không gọi play lần nữa; dừng giọng đọc khôi phục nhạc một lần', async () => {
  const state = rig(); await state.manager.toggleBackground();
  await state.manager.stopNarration(); await state.manager.stopNarration(); assert.equal(state.background.playCalls, 1);
  await state.manager.playNarration(); await state.manager.stopNarration();
  assert.equal(state.background.playCalls, 2); await state.manager.stopNarration(); assert.equal(state.background.playCalls, 2);
  state.manager.dispose();
});
test('Kết thúc giọng đọc có ended, nghe lại/reset tua về đầu và xóa ended', async () => {
  const state = rig(); await state.manager.playNarration(); state.narration.end(); await tick();
  assert.equal(state.manager.getState().narration.ended, true);
  await state.manager.playNarration(); assert.equal(state.manager.getState().narration.ended, false);
  state.narration.end(); await state.manager.stopNarration();
  assert.equal(state.narration.currentTime, 0); assert.equal(state.manager.getState().narration.ended, false); state.manager.dispose();
});
