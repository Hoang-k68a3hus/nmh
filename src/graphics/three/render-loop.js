/** Thời gian animation chỉ tăng lúc render, không nhảy sau khi hiện lại tab. */
export function createRenderLoop({
  draw, onError = () => {}, onState = () => {}, fps = 30,
  requestFrame = requestAnimationFrame, cancelFrame = cancelAnimationFrame,
}) {
  let active = false, reduced = false, disposed = false;
  let frame = null, previous = null, nextDraw = null, elapsed = 0, frames = 0, dirty = true;
  const state = () => onState(!active || disposed ? 'paused' : reduced ? 'static' : 'running');
  const cancel = () => { if (frame != null) cancelFrame(frame); frame = null; previous = null; nextDraw = null; };
  const schedule = () => {
    if (!disposed && active && frame == null && (!reduced || dirty)) frame = requestFrame(tick);
  };
  function tick(now) {
    frame = null;
    if (disposed || !active) return;
    const difference = previous == null ? 0 : now - previous;
    if (dirty || previous == null || now >= nextDraw - 0.5) {
      const delta = Math.max(0, Math.min(difference / 1000, 0.05));
      const interval = 1000 / fps;
      // Giữ mốc nhịp để jitter RAF không làm preset 30 FPS rơi xuống ~27 FPS.
      // Frame trễ dài bỏ nhịp đã lỡ, không render dồn để đuổi kịp.
      nextDraw = dirty || nextDraw == null || now - nextDraw >= interval ? now + interval : nextDraw + interval;
      previous = now;
      if (!reduced) elapsed += delta;
      dirty = false;
      try { draw({ elapsed, delta, reduced, frames: ++frames }); }
      catch (error) { active = false; cancel(); state(); onError(error); return; }
    }
    schedule();
  }
  return {
    configure(options) {
      if (disposed) return;
      const nextActive = Boolean(options.active), nextReduced = Boolean(options.reduced);
      if (fps !== options.fps || reduced !== nextReduced) dirty = true;
      fps = options.fps || fps; reduced = nextReduced;
      if (active !== nextActive) { cancel(); dirty = true; }
      active = nextActive; state(); schedule();
    },
    invalidate() { if (!disposed) { dirty = true; schedule(); } },
    getState: () => ({ active, reduced, elapsed, frames, pending: frame != null }),
    dispose() { if (disposed) return; disposed = true; active = false; cancel(); state(); },
  };
}
