export const GARDEN_LAYOUT = [
  [-2.18, 0.12, -0.08, -0.09], [-1.48, 0.08, -0.22, 0.03], [-0.76, 0.03, 0.18, -0.045],
  [0.05, 0, -0.08, 0.01], [0.88, 0.05, 0.1, 0.035], [1.57, 0.08, -0.15, -0.03], [2.16, 0.1, 0.02, 0.07],
];
export const BOUQUET_LAYOUT = [
  [-0.045, 0.82, 0, 0.49], [-0.03, 0.82, -0.12, 0.28], [-0.015, 0.82, 0.08, 0.15],
  [0, 0.82, -0.1, 0], [0.015, 0.82, 0.08, -0.19], [0.03, 0.82, -0.12, -0.33], [0.045, 0.82, 0, -0.53],
];
export const softEase = value => 1 - (1 - Math.max(0, Math.min(1, value))) ** 3;

/** Chạy một lần theo thời gian render; replay ở finale chờ rời cảnh rồi mới bắt đầu lượt mới. */
export function createBouquetMotion() {
  let elapsed = 0, started = false, complete = false, waitingForLeave = false, runs = 0;
  const snapshot = () => {
    const progress = waitingForLeave ? 1 : complete ? 1 : Math.min(1, elapsed / 2.2);
    return { progress, poseProgress: softEase(progress / 0.7), paperProgress: softEase((progress - 0.4) / 0.4),
      stage: progress >= 1 ? 'complete' : progress >= 0.64 ? 'tying' : progress > 0 ? 'assembling' : 'idle',
      complete, waitingForLeave, runs };
  };
  return {
    update({ active, layout, reduced, delta = 0 }) {
      if (!active || layout !== 'bouquet') waitingForLeave = false;
      if (!active || layout !== 'bouquet' || waitingForLeave || complete) return snapshot();
      if (!started) { started = true; runs++; }
      if (reduced) complete = true;
      else { elapsed += Math.max(0, Math.min(0.05, delta)); complete = elapsed >= 2.2; }
      return snapshot();
    },
    getState: snapshot,
    reset({ active = false, layout } = {}) { elapsed = 0; started = false; complete = false; runs = 0; waitingForLeave = active && layout === 'bouquet'; },
  };
}

export function bouquetPose(index, progress) {
  const t = softEase(progress / 0.7);
  return GARDEN_LAYOUT[index].map((value, axis) => value + (BOUQUET_LAYOUT[index][axis] - value) * t);
}
