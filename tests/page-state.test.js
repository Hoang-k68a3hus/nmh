import test from 'node:test';
import assert from 'node:assert/strict';
import { createPageState, subscribePageFields } from '../src/services/page-state.js';

class Target extends EventTarget {
  listeners = new Set();
  addEventListener(type, fn, options) { super.addEventListener(type, fn, options); this.listeners.add(fn); }
  removeEventListener(type, fn, options) { super.removeEventListener(type, fn, options); this.listeners.delete(fn); }
}
function environment() {
  const windowTarget = new Target(), documentTarget = new Target(), queries = new Map(), frames = new Map();
  let frameId = 0;
  Object.assign(windowTarget, { innerWidth: 390, innerHeight: 800, scrollY: 0,
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; }, cancelAnimationFrame: id => frames.delete(id),
    matchMedia: text => { if (!queries.has(text)) { const query = new Target(); query.matches = false; queries.set(text, query); } return queries.get(text); },
  });
  documentTarget.hidden = false;
  documentTarget.querySelectorAll = () => ['intro', 'garden', 'wishes', 'letter', 'finale'].map((id, index) => ({ id,
    getBoundingClientRect: () => ({ bottom: (index + 1) * 1000 - windowTarget.scrollY }),
  }));
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); };
  const preference = (name, value) => { const query = [...queries].find(([key]) => key.includes(name))[1]; query.matches = value; query.dispatchEvent(new Event('change')); };
  return { windowTarget, documentTarget, queries, frames, flush, preference };
}

test('Một nguồn phân phối motion/visibility; snapshot không sửa được trạng thái chung', () => {
  const env = environment(), page = createPageState(env), updates = [];
  page.subscribe(state => updates.push(state));
  assert.equal(env.documentTarget.listeners.size, 1); assert.equal(env.queries.size, 3);
  env.preference('reduced-motion', true); assert.equal(updates.at(-1).reduced, true);
  env.documentTarget.hidden = true; env.documentTarget.dispatchEvent(new Event('visibilitychange'));
  assert.equal(updates.at(-1).hidden, true);
  updates.at(-1).hidden = false; assert.equal(page.getState().hidden, true); page.dispose();
});
test('Cuộn/resize được gộp trong một frame; activeSection đúng khi cuộn xuôi/ngược', () => {
  const env = environment(), page = createPageState(env), updates = [];
  page.subscribe(state => updates.push(state));
  env.windowTarget.scrollY = 3300;
  for (let i = 0; i < 10; i++) env.windowTarget.dispatchEvent(new Event('scroll'));
  env.windowTarget.innerWidth = 844; env.windowTarget.dispatchEvent(new Event('resize'));
  assert.equal(env.frames.size, 1); env.flush();
  assert.equal(updates.at(-1).activeSection, 'letter'); assert.equal(updates.at(-1).width, 844);
  env.windowTarget.scrollY = 0; env.windowTarget.dispatchEvent(new Event('scroll')); env.flush();
  assert.equal(updates.at(-1).activeSection, 'intro');
  env.windowTarget.dispatchEvent(new Event('resize')); env.flush(); assert.equal(updates.length, 3); page.dispose();
});
test('Consumer motion không nhận cập nhật scroll/pointer không liên quan', () => {
  const env = environment(), page = createPageState(env), motion = [];
  const unsubscribe = subscribePageFields(page, ['reduced'], state => motion.push(state.reduced));
  env.preference('pointer: coarse', true); env.windowTarget.scrollY = 1800;
  env.windowTarget.dispatchEvent(new Event('scroll')); env.flush(); assert.deepEqual(motion, [false]);
  env.preference('reduced-motion', true); assert.deepEqual(motion, [false, true]);
  unsubscribe(); env.preference('reduced-motion', false); assert.equal(motion.length, 2); page.dispose();
});
test('Dispose hủy frame/listener/subscriber, kết quả frame cũ không đổi trạng thái', () => {
  const env = environment(), page = createPageState(env), updates = [];
  page.subscribe(state => updates.push(state)); env.windowTarget.dispatchEvent(new Event('scroll'));
  const old = [...env.frames.values()][0]; page.dispose(); page.dispose();
  assert.equal(env.frames.size, 0); assert.equal(env.windowTarget.listeners.size, 0); assert.equal(env.documentTarget.listeners.size, 0);
  assert.ok([...env.queries.values()].every(query => query.listeners.size === 0)); old();
  env.preference('reduced-motion', true); assert.equal(updates.length, 1); assert.equal(page.getState().reduced, false);
});
