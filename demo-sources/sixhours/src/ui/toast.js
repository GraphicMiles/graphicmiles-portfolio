import { icon } from './icons.js';
import { escapeHTML } from './utils.js';

export function createToast() {
  const root = document.querySelector('#toast');
  const dialog = document.querySelector('#overlay');
  let timer;
  const clear = () => { clearTimeout(timer); root.hidden = true; };
  // Native dialogs occupy the top layer. Status feedback belongs in that layer too.
  const syncHost = () => { (dialog.open ? dialog : document.body).append(root); };
  dialog.addEventListener('overlaychange', syncHost);
  dialog.addEventListener('overlaywillopen', clear);
  const notify = (message, type = 'success') => {
    clearTimeout(timer); syncHost();
    root.setAttribute('role', type === 'error' ? 'alert' : 'status');
    root.innerHTML = `${icon(type === 'error' ? 'alert' : 'check', 19)}<span>${escapeHTML(message)}</span><button type="button" aria-label="Dismiss notification">${icon('x', 16)}</button>`;
    root.hidden = false;
    root.querySelector('button').onclick = clear;
    timer = setTimeout(() => { if (!root.contains(document.activeElement)) root.hidden = true; }, type === 'error' ? 6500 : 4200);
  };
  notify.clear = clear;
  return notify;
}
