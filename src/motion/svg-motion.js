import { observeMotionPreference } from './preferences.js';
import { observePageVisibility } from '../services/page-state.js';

/** Motion chỉ trang trí: SVG luôn có trạng thái hoàn chỉnh nếu module/observer không chạy. */
export function mountSvgMotion(root = document, { pageState } = {}) {
  let reduced;
  const seen = new WeakSet();
  const elements = new Set();
  let observer;
  const finish = (element) => { element.dataset.motionState = 'complete'; seen.add(element); };
  const register = (element) => {
    if (['wish', 'finale'].includes(element.dataset.motionOwner)) return;
    elements.add(element);
    if (reduced || typeof IntersectionObserver !== 'function' || ['opening', 'reading'].includes(element.dataset.envelopeState)) finish(element);
    else if (!seen.has(element)) observer?.observe(element);
  };
  const scan = (node) => {
    if (node.nodeType === 1 && node.matches('[data-illustration]')) register(node);
    node.querySelectorAll?.('[data-illustration]').forEach(register);
  };
  const configure = () => {
    observer?.disconnect();
    if (!reduced && typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting || seen.has(target)) return;
          if (['opening', 'reading'].includes(target.dataset.envelopeState)) { finish(target); observer.unobserve(target); return; }
          target.dataset.motionState = 'revealed';
          seen.add(target);
          observer.unobserve(target);
        });
      }, { threshold: 0.08 });
    }
    elements.forEach((element) => {
      if (!element.isConnected) elements.delete(element);
      else register(element);
    });
  };
  const unsubscribeMotion = observeMotionPreference(value => { reduced = value; configure(); }, pageState);
  scan(root);
  const mutations = new MutationObserver((records) => {
    elements.forEach((element) => { if (!element.isConnected) { observer?.unobserve(element); elements.delete(element); } });
    records.forEach((record) => record.addedNodes.forEach(scan));
  });
  mutations.observe(root === document ? document.body : root, { childList: true, subtree: true });
  const unsubscribeVisibility = observePageVisibility(hidden => { document.documentElement.dataset.decorationsPaused = String(hidden); }, pageState);
  return () => {
    observer?.disconnect();
    mutations.disconnect();
    unsubscribeMotion(); unsubscribeVisibility();
    elements.forEach(finish);
    elements.clear();
    delete document.documentElement.dataset.decorationsPaused;
  };
}
