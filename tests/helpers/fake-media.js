export class FakeAudio extends EventTarget {
  constructor() {
    super();
    this.attributes = new Map(); this.paused = true; this.ended = false; this._currentTime = 0;
    this.error = null; this.playCalls = 0; this.pauseCalls = 0; this.loadCalls = 0; this.behaviors = [];
  }
  set src(value) { this.attributes.set('src', value); }
  get src() { return this.attributes.get('src') || ''; }
  set currentTime(value) { this._currentTime = value; if (value === 0) this.ended = false; }
  get currentTime() { return this._currentTime; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  play() {
    this.playCalls++;
    const behavior = this.behaviors.shift();
    if (behavior instanceof Error) return Promise.reject(behavior);
    const start = () => { this.paused = false; this.ended = false; this.dispatchEvent(new Event('playing')); };
    if (behavior?.then) return behavior.then(start);
    start(); return Promise.resolve();
  }
  pause() {
    this.pauseCalls++;
    if (this.paused) return;
    this.paused = true; this.dispatchEvent(new Event('pause'));
  }
  load() { this.loadCalls++; this.error = null; }
  end() { this.paused = true; this.ended = true; this.dispatchEvent(new Event('pause')); this.dispatchEvent(new Event('ended')); }
  fail() { this.error = { code: 4 }; this.dispatchEvent(new Event('error')); }
}

export class FakeVisibility extends EventTarget {
  hidden = false;
  setHidden(value) { this.hidden = value; this.dispatchEvent(new Event('visibilitychange')); }
}
