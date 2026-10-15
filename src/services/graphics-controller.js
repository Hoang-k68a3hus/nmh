/** Module về muộn nhận view mới nhất, kể cả người xem đã tới finale. */
export function createGraphicsController({ loadScene, onState = () => {} }) {
  let view = { active: false, layout: 'garden', reduced: false };
  let status = 'idle', scene, generation = 0, disposed = false;
  const report = (value) => { status = value; onState({ status, view }); };
  function fail() {
    if (disposed || status === 'fallback') return;
    generation++; scene?.dispose(); scene = undefined; report('fallback');
  }
  const apply = () => {
    if (!scene) return;
    try { scene.configure(view); } catch { fail(); }
  };
  function load() {
    const current = ++generation;
    report('loading');
    Promise.resolve().then(() => {
      if (disposed || generation !== current) return null;
      return loadScene({
        onReady() { if (!disposed && generation === current) report('ready'); },
        onError() { if (!disposed && generation === current) fail(); },
      });
    }).then((candidate) => {
      if (!candidate) return;
      if (disposed || generation !== current) { candidate.dispose(); return; }
      scene = candidate; apply();
    }).catch(() => { if (!disposed && generation === current) fail(); });
  }
  report('idle');
  return {
    setView(next) {
      if (disposed) return;
      view = { ...view, ...next };
      if (status === 'idle' && view.active) load(); else if (scene) apply();
      onState({ status, view });
    },
    reset() { if (!disposed) { scene?.reset(); apply(); } },
    getState: () => ({ status, view }),
    getDiagnostics: () => scene?.getDiagnostics(),
    dispose() { if (disposed) return; disposed = true; generation++; scene?.dispose(); scene = undefined; },
  };
}
