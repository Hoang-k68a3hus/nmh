import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntroController } from '../src/services/intro-controller.js';

const tick = () => new Promise(setImmediate);
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };

function rig({ reduced = false, loader } = {}) {
  const states = [], timers = new Map();
  let nextTimer = 0, navigations = 0, resets = 0, loads = 0, plays = 0, disposals = 0;
  let completion;
  const animation = { play: () => { plays++; }, dispose: () => { disposals++; } };
  const controller = createIntroController({
    reducedMotion: () => reduced,
    loadAnimation(options) { loads++; completion = options.onComplete; return loader ? loader(options) : animation; },
    onState: (state) => states.push(state), onNavigate: () => { navigations++; }, onReset: () => { resets++; },
    setTimer(fn) { const id = ++nextTimer; timers.set(id, fn); return id; }, clearTimer: (id) => timers.delete(id),
  });
  return { controller, animation, states, timers, complete: () => completion(),
    counters: () => ({ navigations, resets, loads, plays, disposals }) };
}

test('Bấm mở liên tục chỉ tạo và chạy một animation', async () => {
  const state = rig();
  for (let index = 0; index < 20; index++) state.controller.open();
  await tick();
  assert.equal(state.controller.getState(), 'opening');
  assert.equal(state.counters().loads, 1);
  assert.equal(state.counters().plays, 1);
  state.complete();
  assert.deepEqual(state.states, ['intro', 'opening', 'reading']);
  assert.equal(state.counters().navigations, 1);
  assert.equal(state.counters().disposals, 1);
  assert.equal(state.timers.size, 0);
  state.controller.dispose();
});

test('Giảm chuyển động không tải animation, tới nội dung ngay', () => {
  const state = rig({ reduced: true });
  state.controller.open();
  assert.equal(state.controller.getState(), 'reading');
  assert.equal(state.counters().loads, 0);
  assert.equal(state.counters().navigations, 1);
  assert.equal(state.timers.size, 0);
  state.controller.dispose();
});

test('Skip trong lúc tải không cho animation về muộn chạy hoặc kéo focus lần nữa', async () => {
  const pending = deferred();
  const state = rig({ loader: () => pending.promise });
  state.controller.open(); await tick();
  state.controller.read();
  pending.resolve(state.animation); await tick();
  assert.equal(state.controller.getState(), 'reading');
  assert.equal(state.counters().plays, 0);
  assert.equal(state.counters().disposals, 1);
  assert.equal(state.counters().navigations, 1);
  assert.equal(state.timers.size, 0);
  state.controller.dispose();
});

test('Reset lúc tải bỏ kết quả cũ, lượt mới vẫn mở được', async () => {
  const pending = deferred();
  let calls = 0;
  const state = rig({ loader: () => ++calls === 1 ? pending.promise : state.animation });
  state.controller.open(); await tick();
  state.controller.reset();
  pending.resolve(state.animation); await tick();
  assert.equal(state.controller.getState(), 'intro');
  assert.equal(state.counters().plays, 0);
  state.controller.open(); await tick(); state.complete();
  assert.equal(state.controller.getState(), 'reading');
  assert.equal(state.counters().plays, 1);
  assert.equal(state.counters().resets, 1);
  state.controller.dispose();
});

test('Animation lỗi hoặc tải quá chậm đều có đường đọc tiếp', async () => {
  const failed = rig({ loader: () => Promise.reject(new Error('chunk failed')) });
  failed.controller.open(); await tick();
  assert.equal(failed.controller.getState(), 'reading');
  assert.equal(failed.counters().navigations, 1);
  failed.controller.dispose();
  const pending = deferred();
  const slow = rig({ loader: () => pending.promise });
  slow.controller.open(); await tick();
  [...slow.timers.values()][0]();
  assert.equal(slow.controller.getState(), 'reading');
  pending.resolve(slow.animation); await tick();
  assert.equal(slow.counters().plays, 0);
  slow.controller.dispose();
});

test('Đi tới anchor/scroll sớm không kéo người xem về garden khi animation kết thúc', async () => {
  const state = rig();
  state.controller.open(); await tick();
  state.controller.read({ navigate: false }); state.complete();
  assert.equal(state.controller.getState(), 'reading');
  assert.equal(state.counters().navigations, 0);
  state.controller.dispose();
});

test('Dispose lúc tải gỡ timer và không cho callback muộn đổi trạng thái', async () => {
  const pending = deferred();
  const state = rig({ loader: () => pending.promise });
  state.controller.open(); await tick(); state.controller.dispose();
  pending.resolve(state.animation); await tick(); state.complete();
  assert.equal(state.counters().plays, 0);
  assert.equal(state.counters().navigations, 0);
  assert.equal(state.timers.size, 0);
});
