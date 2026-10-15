import test from 'node:test';
import assert from 'node:assert/strict';
import { createGraphicsController } from '../src/services/graphics-controller.js';
import { createRenderLoop } from '../src/graphics/three/render-loop.js';
import { selectQuality } from '../src/graphics/three/quality.js';
const tick = () => new Promise(setImmediate);
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };
function rig(loader) {
  let callbacks, loads = 0, disposals = 0, resets = 0;
  const views = [];
  const scene = { configure(view) { views.push(view); }, dispose() { disposals++; }, reset() { resets++; } };
  const controller = createGraphicsController({ loadScene(options) { loads++; callbacks = options; return loader ? loader(scene) : scene; } });
  return { controller, scene, views, callbacks: () => callbacks, counters: () => ({ loads, disposals, resets }) };
}
test('3D chỉ tải khi thấy cảnh; module về chậm nhận đúng finale và kích thước mới', async () => {
  const pending = deferred(), state = rig(() => pending.promise);
  state.controller.setView({ active: false }); await tick();
  assert.equal(state.counters().loads, 0);
  state.controller.setView({ active: true, layout: 'garden', width: 400 }); await tick();
  state.controller.setView({ active: true, layout: 'bouquet', width: 260, reduced: true });
  pending.resolve(state.scene); await tick();
  assert.equal(state.counters().loads, 1);
  assert.equal(state.views.at(-1).layout, 'bouquet');
  assert.equal(state.views.at(-1).width, 260);
  assert.equal(state.views.at(-1).reduced, true);
  state.callbacks().onReady(); assert.equal(state.controller.getState().status, 'ready');
  state.controller.dispose();
});
test('Dispose lúc tải không gắn scene cũ hoặc nhận callback về muộn', async () => {
  const pending = deferred(), state = rig(() => pending.promise);
  state.controller.setView({ active: true }); await tick(); state.controller.dispose();
  pending.resolve(state.scene); await tick(); state.callbacks().onReady();
  assert.equal(state.counters().disposals, 1); assert.equal(state.views.length, 0);
  assert.notEqual(state.controller.getState().status, 'ready');
});
test('Module lỗi dùng fallback, không tải lặp theo mỗi scroll', async () => {
  const state = rig(() => Promise.reject(new Error('offline')));
  state.controller.setView({ active: true }); await tick();
  assert.equal(state.controller.getState().status, 'fallback');
  state.controller.setView({ active: false }); state.controller.setView({ active: true }); await tick();
  assert.equal(state.counters().loads, 1); state.controller.dispose();
});
test('Mất context/render lỗi dispose scene một lần và bỏ ready cũ', async () => {
  const state = rig(); state.controller.setView({ active: true }); await tick();
  state.callbacks().onReady(); state.callbacks().onError(); state.callbacks().onReady(); state.callbacks().onError();
  assert.equal(state.controller.getState().status, 'fallback'); assert.equal(state.counters().disposals, 1);
  state.controller.dispose(); assert.equal(state.counters().disposals, 1);
});
test('Scroll/tab ẩn trong lúc tải giữ scene inactive; replay dùng lại scene', async () => {
  const pending = deferred(), state = rig(() => pending.promise);
  state.controller.setView({ active: true }); await tick(); state.controller.setView({ active: false });
  pending.resolve(state.scene); await tick();
  assert.equal(state.views.at(-1).active, false);
  state.controller.setView({ active: true }); state.controller.reset();
  assert.equal(state.counters().loads, 1); assert.equal(state.counters().resets, 1); state.controller.dispose();
});
function loopRig() {
  const queue = new Map(), draws = []; let sequence = 0, errors = 0;
  const loop = createRenderLoop({ draw: (frame) => draws.push(frame), onError: () => errors++,
    requestFrame(fn) { const id = ++sequence; queue.set(id, fn); return id; }, cancelFrame: (id) => queue.delete(id) });
  const step = (time) => { const entries = [...queue]; queue.clear(); entries.forEach(([, fn]) => fn(time)); };
  return { loop, queue, draws, step, errors: () => errors };
}
test('Render dừng ngoài viewport/tab ẩn; hiện lại không nhảy thời gian', () => {
  const state = loopRig(); state.loop.configure({ active: true, reduced: false, fps: 30 });
  state.step(0); state.step(40); const elapsed = state.loop.getState().elapsed;
  state.loop.configure({ active: false, reduced: false, fps: 30 });
  assert.equal(state.queue.size, 0); state.step(10000);
  state.loop.configure({ active: true, reduced: false, fps: 30 }); state.step(20000);
  assert.equal(state.loop.getState().elapsed, elapsed); state.loop.dispose(); assert.equal(state.queue.size, 0);
});
test('Reduced motion render một frame hoàn chỉnh, resize chỉ thêm một frame', () => {
  const state = loopRig(); state.loop.configure({ active: true, reduced: true, fps: 30 }); state.step(0);
  assert.equal(state.draws.length, 1); assert.equal(state.queue.size, 0);
  state.loop.invalidate(); state.loop.invalidate(); assert.equal(state.queue.size, 1); state.step(100);
  assert.equal(state.draws.length, 2); assert.equal(state.queue.size, 0); state.loop.dispose();
});
test('Giới hạn FPS và delta khi frame tới chậm', () => {
  const state = loopRig(); state.loop.configure({ active: true, reduced: false, fps: 30 });
  state.step(0); state.step(10); state.step(20); assert.equal(state.draws.length, 1);
  state.step(40); assert.equal(state.draws.length, 2);
  state.step(4000); assert.equal(state.draws.at(-1).delta, 0.05); state.loop.dispose();
});

test('Jitter RAF không tích lũy làm giảm preset 30 FPS; frame trễ không render dồn', () => {
  const state = loopRig(); state.loop.configure({ active: true, reduced: false, fps: 30 });
  for (let index=0;index<=120;index++) state.step(index*1000/60+Math.sin(index*0.83)*1.8);
  assert.ok(state.draws.length>=59&&state.draws.length<=61, String(state.draws.length));
  const before=state.draws.length; state.step(12000); assert.equal(state.draws.length,before+1);
  assert.equal(state.draws.at(-1).delta,0.05);state.step(12001);assert.equal(state.draws.length,before+1);state.loop.dispose();
});
test('Lỗi render hủy lịch frame và gọi fallback', () => {
  const queue = new Map(); let errors = 0;
  const loop = createRenderLoop({ draw() { throw new Error('GPU'); }, onError() { errors++; }, requestFrame(fn) { queue.set(1, fn); return 1; }, cancelFrame: (id) => queue.delete(id) });
  loop.configure({ active: true }); const draw = queue.get(1); queue.clear(); draw(0);
  assert.equal(queue.size, 0); assert.equal(errors, 1); assert.equal(loop.getState().active, false); loop.dispose();
});
test('Quality ưu tiên thiết bị yếu/data saver; mobile giới hạn DPR, low tắt hạt', () => {
  assert.equal(selectQuality({ width: 390 }).dpr, 1.5);
  assert.equal(selectQuality({ width: 844, coarsePointer: true }).dpr, 1.5);
  assert.equal(selectQuality({ width: 1440 }).dpr, 2);
  for (const options of [{ memory: 4 }, { cores: 2 }, { saveData: true }, { preset: 'low' }]) {
    const quality = selectQuality({ width: 1440, ...options }); assert.equal(quality.particles, 0); assert.equal(quality.dpr, 1);
  }
});
