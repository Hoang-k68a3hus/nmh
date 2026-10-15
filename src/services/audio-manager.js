import { assetUrl } from '../utils/assets.js';
import { observePageVisibility } from './page-state.js';

/** Hai channel dùng chung một chủ sở hữu; source chỉ được gán sau yêu cầu phát. */
export function createAudioManager(input, {
  createAudio = () => new Audio(), resolveSource = assetUrl, visibilityTarget = globalThis.document, pageState,
} = {}) {
  const paths = typeof input === 'string' ? { background: input, narration: null } : {
    background: input?.background ?? null, narration: input?.narration ?? null,
  };
  const tracks = new Map();
  const listeners = new Set();
  let disposed = false;
  let backgroundEnabled = false;
  let resumeAllowed = false;
  let narrationExclusive = false;
  let lastEmission;
  const hidden = () => pageState ? pageState.getState().hidden : Boolean(visibilityTarget?.hidden);
  const snapshotTrack = (key) => {
    const track = tracks.get(key);
    return {
      available: Boolean(track), status: track?.status ?? 'unavailable', error: track?.error ?? null,
      ended: Boolean(track?.audio.ended),
      suspended: key === 'background' && backgroundEnabled && narrationExclusive && track?.status === 'paused',
    };
  };
  const getState = () => ({ background: snapshotTrack('background'), narration: snapshotTrack('narration'), backgroundEnabled });
  const emit = () => {
    if (disposed) return;
    const key = JSON.stringify(getState());
    if (key === lastEmission) return;
    lastEmission = key; listeners.forEach(listener => listener(getState()));
  };
  const allowed = (track) => !disposed && !hidden() && track.want && !(track.key === 'background' && narrationExclusive);
  const pauseTrack = (track, status = 'paused') => {
    if (!track) return;
    track.generation++;
    track.want = false;
    track.status = status;
    track.audio.pause();
    emit();
  };
  const classify = (error, audio) => error?.name === 'NotAllowedError' ? 'blocked'
    : error?.name === 'NotSupportedError' || audio.error ? 'file' : 'playback';
  const resumeBackground = () => {
    const track = tracks.get('background');
    if (!disposed && backgroundEnabled && resumeAllowed && !hidden() && !narrationExclusive && track && track.status !== 'error') {
      if (track.want || !track.audio.paused) return Promise.resolve(track.status === 'playing');
      return request(track);
    }
    return Promise.resolve(false);
  };
  const finishNarration = () => {
    narrationExclusive = false;
    return resumeBackground();
  };

  async function request(track) {
    if (disposed || hidden()) return false;
    const generation = ++track.generation;
    const retryFile = track.error === 'file';
    track.want = true;
    track.status = 'loading';
    track.error = null;
    emit();
    try {
      if (!track.audio.hasAttribute('src')) track.audio.src = resolveSource(track.path);
      else if (retryFile) track.audio.load();
      // Không await bước khác trước play(): giữ thao tác trực tiếp từ click của người xem.
      await track.audio.play();
      if (disposed || generation !== track.generation || !allowed(track)) {
        if (!allowed(track)) track.audio.pause();
        return false;
      }
      track.status = 'playing';
      emit();
      return true;
    } catch (error) {
      if (disposed || generation !== track.generation || !track.want) return false;
      track.want = false;
      track.status = 'error';
      track.error = classify(error, track.audio);
      track.audio.pause();
      emit();
      if (track.key === 'narration') void finishNarration();
      return false;
    }
  }

  for (const [key, path] of Object.entries(paths)) {
    if (!path) continue;
    const audio = createAudio();
    audio.preload = 'none';
    audio.autoplay = false;
    audio.loop = key === 'background';
    audio.volume = key === 'background' ? 0.25 : 1;
    const track = { key, path, audio, want: false, generation: 0, status: 'off', error: null, events: [] };
    tracks.set(key, track);
    const listen = (event, listener) => { audio.addEventListener(event, listener); track.events.push([event, listener]); };
    listen('playing', () => {
      if (!allowed(track)) { audio.pause(); return; }
      if (audio.paused) return;
      track.status = 'playing'; track.error = null; emit();
    });
    listen('pause', () => {
      if (disposed || !track.want) return;
      if (!audio.paused) return; // Pause cũ có thể tới sau một yêu cầu phát mới.
      // Media native phát pause trước ended khi hết file. Để ended hoàn tất lượt đọc.
      if (audio.ended) return;
      track.generation++; track.want = false; track.status = 'paused'; emit();
      if (key === 'narration') void finishNarration();
    });
    const buffering = () => { if (allowed(track)) { track.status = 'loading'; emit(); } };
    listen('waiting', buffering);
    listen('stalled', buffering);
    listen('error', () => {
      if (disposed || !audio.error) return;
      track.generation++; track.want = false; track.status = 'error'; track.error = 'file';
      audio.pause(); emit();
      if (key === 'narration') void finishNarration();
    });
    listen('ended', () => {
      if (disposed || !track.want || !audio.ended) return;
      track.generation++; track.want = false; track.status = 'off';
      if (key === 'background') { backgroundEnabled = false; resumeAllowed = false; }
      emit();
      if (key === 'narration') void finishNarration();
    });
  }

  const toggleBackground = () => {
    const track = tracks.get('background');
    if (disposed || !track || hidden()) return Promise.resolve(false);
    if (track.status === 'playing' || track.status === 'loading' || (backgroundEnabled && narrationExclusive)) {
      backgroundEnabled = false; resumeAllowed = false; track.error = null;
      pauseTrack(track, 'off');
      return Promise.resolve(false);
    }
    backgroundEnabled = true; resumeAllowed = true;
    if (narrationExclusive) { pauseTrack(track); return Promise.resolve(false); }
    return request(track);
  };
  const playNarration = () => {
    const track = tracks.get('narration');
    if (disposed || !track || hidden()) return Promise.resolve(false);
    if (track.want) return Promise.resolve(track.status === 'playing');
    narrationExclusive = true;
    const background = tracks.get('background');
    if (background?.want || (background && !background.audio.paused)) pauseTrack(background);
    if (track.audio.ended) track.audio.currentTime = 0;
    return request(track);
  };
  const pauseNarration = () => {
    if (disposed || !tracks.has('narration')) return Promise.resolve(false);
    pauseTrack(tracks.get('narration'));
    return finishNarration();
  };
  const stopNarration = () => {
    const track = tracks.get('narration');
    if (disposed || !track) return Promise.resolve(false);
    pauseTrack(track, 'off');
    try { track.audio.currentTime = 0; } catch { /* Source chưa có timeline thì không cần tua. */ }
    return finishNarration();
  };
  const toggleNarration = () => {
    const track = tracks.get('narration');
    if (disposed || !track || hidden()) return Promise.resolve(false);
    return track.want ? pauseNarration() : playNarration();
  };
  const pauseWhenHidden = () => {
    if (!hidden() || disposed) return;
    resumeAllowed = false;
    narrationExclusive = false;
    tracks.forEach((track) => { if (track.want || !track.audio.paused) pauseTrack(track); });
  };
  const unsubscribeVisibility = observePageVisibility(pauseWhenHidden, pageState, visibilityTarget);

  return {
    get audio() { return tracks.get('background')?.audio ?? null; },
    get narrationAudio() { return tracks.get('narration')?.audio ?? null; },
    getState,
    subscribe(listener) { if (disposed) return () => {}; listeners.add(listener); listener(getState()); return () => listeners.delete(listener); },
    toggle: toggleBackground, toggleBackground, toggleNarration, playNarration, pauseNarration, stopNarration,
    dispose() {
      if (disposed) return;
      disposed = true;
      listeners.clear();
      tracks.forEach((track) => {
        track.generation++; track.want = false;
        track.events.forEach(([event, listener]) => track.audio.removeEventListener(event, listener));
        track.audio.pause(); track.audio.removeAttribute('src'); track.audio.load();
      });
      unsubscribeVisibility();
    },
  };
}
