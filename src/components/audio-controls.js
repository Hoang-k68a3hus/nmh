import { createAudioManager } from '../services/audio-manager.js';

export function mountAudioControls(source) {
  const host = document.getElementById('audio-controls');
  const ownsManager = !source?.getState;
  const manager = ownsManager ? createAudioManager(source) : source;
  host.replaceChildren();
  host.classList.add('audio-controls');
  if (!manager.getState().background.available) {
    if (ownsManager) manager.dispose();
    return () => {};
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'audio-button';
  button.setAttribute('aria-describedby', 'audio-message');
  const message = document.createElement('p');
  message.id = 'audio-message';
  message.className = 'audio-message';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.setAttribute('aria-atomic', 'true');
  const sync = ({ background }) => {
    const labels = { off: 'Bật nhạc ♫', loading: 'Dừng tải nhạc ♫', playing: 'Tắt nhạc ♫', paused: 'Bật lại nhạc ♫', error: 'Thử bật nhạc ♫' };
    button.textContent = background.suspended ? 'Bỏ nhạc nền ♫' : labels[background.status];
    button.dataset.audioState = background.status;
    button.setAttribute('aria-pressed', String(background.status === 'playing'));
    button.setAttribute('aria-busy', String(background.status === 'loading'));
    message.textContent = background.suspended ? 'Nhạc đang tạm dừng khi nghe thư.'
      : background.error === 'blocked' ? 'Chạm lại để thử bật nhạc nhé.'
      : background.status === 'error' ? 'Nhạc chưa mở được. Em vẫn có thể đọc tiếp nhé.' : '';
  };
  const toggle = () => { void manager.toggleBackground(); };
  button.addEventListener('click', toggle);
  host.replaceChildren(button, message);
  const unsubscribe = manager.subscribe(sync);
  return () => {
    button.removeEventListener('click', toggle);
    unsubscribe();
    if (ownsManager) manager.dispose();
    host.replaceChildren();
  };
}
