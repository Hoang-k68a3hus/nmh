import { subscribePageFields } from '../services/page-state.js';

export function observeMotionPreference(onChange, pageState) {
  if (pageState) return subscribePageFields(pageState, ['reduced'], state => onChange(state.reduced));
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const change = () => onChange(media.matches);
  media.addEventListener('change', change);
  change();
  return () => media.removeEventListener('change', change);
}
