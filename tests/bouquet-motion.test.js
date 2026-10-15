import test from 'node:test';
import assert from 'node:assert/strict';
import { createBouquetMotion, bouquetPose, GARDEN_LAYOUT, BOUQUET_LAYOUT } from '../src/graphics/three/bouquet-motion.js';
const view = { active: true, layout: 'bouquet', reduced: false, delta: 0.05 };
test('Bó hoa tiến triển một lần; rời cảnh/tab ẩn không nhảy thời gian', () => {
  const motion = createBouquetMotion();
  for(let i=0;i<10;i++)motion.update(view);
  const before = motion.getState().progress;
  for(let i=0;i<100;i++)motion.update({ ...view, active: false, delta: 10 });
  assert.equal(motion.getState().progress, before);
  for(let i=0;i<40;i++)motion.update(view);
  assert.equal(motion.getState().complete, true); assert.equal(motion.getState().runs, 1);
  motion.update({ ...view, layout: 'garden' }); motion.update(view);
  assert.equal(motion.getState().progress, 1); assert.equal(motion.getState().runs, 1);
});
test('Reduced motion từ đầu/giữa lượt hiện giấy/nơ và trạng thái cuối ngay', () => {
  const motion = createBouquetMotion(); motion.update(view); motion.update({ ...view, reduced: true });
  assert.equal(motion.getState().progress, 1); assert.equal(motion.getState().paperProgress, 1); assert.equal(motion.getState().stage, 'complete');
  const instant = createBouquetMotion(); instant.update({ ...view, reduced: true }); assert.equal(instant.getState().complete, true);
});
test('Replay tại finale chờ rời cảnh; lượt mới bắt đầu khi quay lại', () => {
  const motion = createBouquetMotion(); motion.update({ ...view, reduced: true }); motion.reset(view);
  motion.update(view); assert.equal(motion.getState().waitingForLeave, true); assert.equal(motion.getState().runs, 0);
  motion.update({ ...view, active: false }); motion.update({ ...view, delta: 0 });
  assert.equal(motion.getState().progress, 0); assert.equal(motion.getState().runs, 1);
  motion.reset({ active: false, layout: 'garden' }); motion.update({ ...view, delta: 0 }); assert.equal(motion.getState().progress, 0);
});
test('Pose hội tụ đúng hai đầu; toàn bộ các trục vẫn hữu hạn giữa animation', () => {
  for(let index=0;index<7;index++) {
    assert.deepEqual(bouquetPose(index, 0), GARDEN_LAYOUT[index]);
    bouquetPose(index, 1).forEach((value, axis) => assert.ok(Math.abs(value-BOUQUET_LAYOUT[index][axis])<1e-10));
    assert.ok(bouquetPose(index, 0.45).every(Number.isFinite));
  }
});
