/** Điều phối một lượt mở thư; kết quả async cũ không được sửa lượt mới. */
export function createIntroController({
  loadAnimation, reducedMotion = () => false, onState = () => {}, onNavigate = () => {},
  onReset = () => {}, timeout = 8000, setTimer = setTimeout, clearTimer = clearTimeout,
}) {
  let state = 'intro';
  let generation = 0;
  let animation;
  let timer;
  let disposed = false;
  const clearDeadline = () => { if (timer != null) clearTimer(timer); timer = undefined; };
  const release = () => { animation?.dispose(); animation = undefined; };
  const update = (value) => { state = value; onState(value); };

  function read({ navigate = true } = {}) {
    if (disposed) return false;
    if (state === 'reading') { if (navigate) onNavigate(); return false; }
    generation++;
    clearDeadline();
    release();
    update('reading');
    if (navigate) onNavigate();
    return true;
  }

  function open() {
    if (disposed || state === 'opening') return false;
    if (state === 'reading') { onNavigate(); return false; }
    const current = ++generation;
    update('opening');
    if (reducedMotion()) { read(); return true; }
    timer = setTimer(() => { if (generation === current && state === 'opening') read(); }, timeout);
    Promise.resolve().then(() => {
      if (disposed || generation !== current || state !== 'opening') return null;
      return loadAnimation({ onComplete: () => {
        if (!disposed && generation === current && state === 'opening') read();
      } });
    }).then((candidate) => {
      if (!candidate) return;
      if (disposed || generation !== current || state !== 'opening') { candidate.dispose(); return; }
      animation = candidate;
      candidate.play();
    }).catch(() => {
      if (!disposed && generation === current && state === 'opening') read();
    });
    return true;
  }

  function reset({ navigate = true } = {}) {
    if (disposed) return;
    generation++;
    clearDeadline();
    release();
    update('intro');
    onReset({ navigate });
  }

  onState(state);
  return {
    getState: () => state,
    open, read, reset,
    dispose() { if (disposed) return; disposed = true; generation++; clearDeadline(); release(); },
  };
}
