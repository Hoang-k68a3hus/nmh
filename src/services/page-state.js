/** Một nguồn tín hiệu trang; component chỉ subscribe, không tự gắn listener hệ thống. */
export function createPageState({ documentTarget = document, windowTarget = window } = {}) {
  const listeners = new Set();
  const queries = {
    reduced: windowTarget.matchMedia('(prefers-reduced-motion: reduce)'),
    finePointer: windowTarget.matchMedia('(hover: hover) and (pointer: fine)'),
    coarsePointer: windowTarget.matchMedia('(pointer: coarse)'),
  };
  const sections = [...documentTarget.querySelectorAll('main > section')];
  let disposed = false, frame = null;
  const read = () => {
    const point = windowTarget.innerHeight * 0.35;
    const active = sections.find(section => section.getBoundingClientRect().bottom > point) || sections.at(-1);
    return { hidden: Boolean(documentTarget.hidden), reduced: queries.reduced.matches,
      finePointer: queries.finePointer.matches, coarsePointer: queries.coarsePointer.matches,
      width: windowTarget.innerWidth, height: windowTarget.innerHeight, activeSection: active?.id || 'intro' };
  };
  let state = read();
  const publish = () => {
    if (disposed) return;
    const next = read();
    if (Object.keys(next).every(key => next[key] === state[key])) return;
    state = next; listeners.forEach(listener => listener({ ...state }));
  };
  const schedule = () => { if (!disposed && frame == null) frame = windowTarget.requestAnimationFrame(() => { frame = null; publish(); }); };
  documentTarget.addEventListener('visibilitychange', publish);
  Object.values(queries).forEach(query => query.addEventListener('change', publish));
  windowTarget.addEventListener('scroll', schedule, { passive: true });
  windowTarget.addEventListener('resize', schedule);
  return {
    getState: () => ({ ...state }),
    subscribe(listener) {
      if (disposed) return () => {};
      listeners.add(listener); listener({ ...state });
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame != null) windowTarget.cancelAnimationFrame(frame);
      documentTarget.removeEventListener('visibilitychange', publish);
      Object.values(queries).forEach(query => query.removeEventListener('change', publish));
      windowTarget.removeEventListener('scroll', schedule); windowTarget.removeEventListener('resize', schedule);
      listeners.clear();
    },
  };
}

/** Chỉ gọi consumer khi những trường nó sử dụng thay đổi. */
export function subscribePageFields(pageState, fields, listener) {
  let previous;
  return pageState.subscribe(state => {
    if (previous && fields.every(field => state[field] === previous[field])) return;
    previous = state; listener(state);
  });
}

export function observePageVisibility(onChange, pageState, target = globalThis.document) {
  if (pageState) return subscribePageFields(pageState, ['hidden'], state => onChange(state.hidden));
  const change = () => onChange(Boolean(target?.hidden));
  target?.addEventListener('visibilitychange', change); change();
  return () => target?.removeEventListener('visibilitychange', change);
}
