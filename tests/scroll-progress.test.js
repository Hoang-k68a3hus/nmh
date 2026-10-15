import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneProgress, sceneAnimationProgress, wishBloomProgress, bouquetPresentation, segment } from '../src/motion/scroll-progress.js';

test('scene finishes before sticky release and garden animates on entry', () => {
  assert.equal(sceneAnimationProgress(2240, 1000, 2400, 1200, 800), 1);
  assert.equal(sceneAnimationProgress(2500, 1000, 2400, 1200, 800), 1);
  assert.ok(sceneAnimationProgress(1400, 1000, 2400, 1200, 800, true) > 0);
  assert.equal(sceneAnimationProgress(1400, 1000, 2400, 1200, 800), 0);
});

test('wish blooms fully at photo center on desktop and mobile, including reverse jumps', () => {
  for (const [height, viewport] of [[406, 900], [331, 844], [950, 640]]) {
    const center = 2000 + Math.min(height, viewport) / 2 - viewport / 2;
    assert.equal(wishBloomProgress(center, 2000, height, viewport), 1);
    assert.equal(wishBloomProgress(center + 1000, 2000, height, viewport), 1);
    assert.equal(wishBloomProgress(center - viewport, 2000, height, viewport), 0);
  }
});

test('pinned scenes start after tall content becomes readable and end at release', () => {
  assert.equal(sceneProgress(1100, 1000, 2400, 1200, 800), 0);
  assert.equal(sceneProgress(1400, 1000, 2400, 1200, 800), 0);
  assert.equal(sceneProgress(2000, 1000, 2400, 1200, 800), 0.5);
  assert.equal(sceneProgress(2600, 1000, 2400, 1200, 800), 1);
});
test('scrolling backwards unpacks flowers, paper and ribbon without elapsed time', () => {
  const forward = [0, 0.5, 0.7, 1].map(bouquetPresentation);
  assert.deepEqual(forward.map(value => value.stage), ['idle', 'assembling', 'tying', 'complete']);
  const reverse = [1, 0.7, 0.5, 0].map(bouquetPresentation).reverse();
  assert.deepEqual(reverse, forward);
  assert.equal(forward[0].paperProgress, 0);
  assert.equal(forward[3].paperProgress, 1);
});
test('deep links and rapid scrolling clamp playheads safely', () => {
  assert.equal(segment(-900, 0.04, 0.85), 0);
  assert.equal(segment(900, 0.04, 0.85), 1);
  assert.equal(sceneProgress(9000, 0, 1600, 800, 800), 1);
  assert.ok(Number.isFinite(sceneProgress(0, 0, 0, 0, 800)));
});
