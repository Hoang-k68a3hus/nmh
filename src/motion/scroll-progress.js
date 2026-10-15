export const clamp = (value) => Math.max(0, Math.min(1, value));
export const segment = (value, start, end) => clamp((value - start) / Math.max(0.001, end - start));

/** Tall content scrolls into view before the sticky scene begins. */
export function sceneProgress(scrollY, top, height, pinHeight, viewport) {
  return segment(scrollY, top + Math.max(0, pinHeight - viewport), top + height - viewport);
}

/** Finish while the scene is still held, leaving room to see the final pose. */
export function sceneAnimationProgress(scrollY, top, height, pinHeight, viewport, entrance = false) {
  const holdStart = top + Math.max(0, pinHeight - viewport);
  const holdEnd = top + height - viewport;
  return segment(scrollY, entrance ? holdStart - viewport * 0.45 : holdStart,
    holdStart + Math.max(1, holdEnd - holdStart) * 0.7);
}

/** The flower is open by the time its photo reaches the reading position. */
export function wishBloomProgress(scrollY, artTop, artHeight, viewport) {
  const end = artTop + Math.min(artHeight, viewport) * 0.5 - viewport * 0.5;
  return segment(scrollY, end - viewport * 0.45, end);
}

export function bouquetPresentation(progress) {
  const p = clamp(progress);
  return { progress: p, paperProgress: 1 - (1 - segment(p, 0.4, 0.8)) ** 3,
    stage: p >= 1 ? 'complete' : p >= 0.64 ? 'tying' : p > 0 ? 'assembling' : 'idle',
    complete: p >= 1, runs: 1 };
}
