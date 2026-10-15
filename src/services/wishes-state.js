/** ID lời chúc là nguồn đếm; snapshot không cho caller sửa Set bên trong. */
export function createWishState(ids) {
  const known = new Set(ids), opened = new Set(), listeners = new Set();
  let disposed = false;
  const getState = () => ({
    openedWishIds: new Set(opened), count: opened.size, total: known.size,
    complete: known.size > 0 && opened.size === known.size,
  });
  const emit = () => { if (!disposed) listeners.forEach((listener) => listener(getState())); };
  return {
    getState,
    has: (id) => opened.has(id),
    open(id) {
      if (disposed || !known.has(id) || opened.has(id)) return false;
      opened.add(id); emit(); return true;
    },
    reset() { if (disposed) return; opened.clear(); emit(); },
    subscribe(listener) {
      if (disposed) return () => {};
      listeners.add(listener); listener(getState()); return () => listeners.delete(listener);
    },
    dispose() { disposed = true; listeners.clear(); },
  };
}
