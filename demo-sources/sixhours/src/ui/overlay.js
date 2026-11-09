/** One modal owner: transitions, scroll, lifecycle and focus never leak between features. */
export function createOverlay() {
  const dialog = document.querySelector('#overlay');
  const surface = dialog.querySelector('.overlay-surface');
  const body = dialog.querySelector('#overlay-content');
  const title = dialog.querySelector('#overlay-title');
  const closeButton = dialog.querySelector('[data-close-overlay]');
  let cleanup = null;
  let previousFocus = null;
  let closeTimer = null;
  let closePromise = null;
  let finishClose = null;
  let closeRestoreFocus = true;
  let focusFrame = null;
  let revision = 0;

  function cancelFocus() {
    cancelAnimationFrame(focusFrame); focusFrame = null; revision++;
  }
  function setTitle(heading) {
    title.textContent = heading;
    closeButton.setAttribute('aria-label', `Close ${heading.toLowerCase()}`);
  }
  function restorePreviousFocus() {
    const usable = element => element?.isConnected && !element.matches(':disabled') && element.getClientRects().length && !element.closest('[hidden], [inert]');
    let target = previousFocus;
    // Adding the final available unit can disable its opener. Keep focus in the same context.
    if (!usable(target)) {
      const scope = previousFocus?.closest('form, article, [data-focus-scope]');
      target = [...(scope?.querySelectorAll('input:checked, button:not(:disabled), a[href]') || [])].find(usable);
    }
    if (usable(target)) target.focus({ preventScroll: true });
  }
  function close({ immediate = false, restoreFocus = true } = {}) {
    if (!dialog.open) return Promise.resolve();
    cancelFocus();
    if (closePromise) {
      const pending = closePromise;
      closeRestoreFocus &&= restoreFocus;
      if (immediate) finishClose();
      return pending;
    }
    closeRestoreFocus = restoreFocus;
    dialog.classList.remove('is-open');
    let resolveClose;
    closePromise = new Promise(resolve => { resolveClose = resolve; });
    const pending = closePromise;
    finishClose = () => {
      clearTimeout(closeTimer); closeTimer = null; finishClose = null;
      cleanup?.(); cleanup = null;
      dialog.close(); body.replaceChildren();
      document.documentElement.classList.remove('overlay-open');
      dialog.dispatchEvent(new Event('overlaychange'));
      if (closeRestoreFocus) restorePreviousFocus();
      closePromise = null; resolveClose();
    };
    if (immediate || matchMedia('(prefers-reduced-motion: reduce)').matches) finishClose();
    else closeTimer = setTimeout(finishClose, 500);
    return pending;
  }

  function open({ title: heading, content, kind = 'drawer', onMount, onClose, opener = document.activeElement }) {
    dialog.dispatchEvent(new Event('overlaywillopen'));
    cancelFocus();
    const wasClosing = Boolean(finishClose);
    if (wasClosing) { closeRestoreFocus = false; finishClose(); }
    const fresh = !dialog.open;
    if (fresh && !wasClosing) previousFocus = opener;
    cleanup?.(); cleanup = null;
    const enter = fresh || dialog.dataset.kind !== kind;
    // Changing geometry with the old transform still applied produces a diagonal/off-screen panel.
    if (enter) { surface.style.transition = 'none'; dialog.classList.remove('is-open'); }
    setTitle(heading); dialog.dataset.kind = kind;
    body.innerHTML = content;
    if (fresh) {
      dialog.showModal();
      document.documentElement.classList.add('overlay-open');
    }
    const unmount = onMount?.(body);
    cleanup = () => { unmount?.(); onClose?.(); };
    body.scrollTop = 0; surface.scrollTop = 0; dialog.scrollTop = 0;
    if (enter) {
      surface.getBoundingClientRect();
      surface.style.removeProperty('transition');
      surface.getBoundingClientRect();
    }
    dialog.classList.add('is-open');
    dialog.dispatchEvent(new Event('overlaychange'));
    const currentRevision = revision;
    focusFrame = requestAnimationFrame(() => {
      focusFrame = null;
      if (revision !== currentRevision || !dialog.open || !dialog.classList.contains('is-open')) return;
      (body.querySelector('[data-initial-focus]') || closeButton).focus({ preventScroll: true });
    });
  }
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('[data-close-overlay]')) close();
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href], button:not(:disabled), input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
      .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden' && !element.closest('[hidden], [inert]'));
    const first = focusable[0]; const last = focusable.at(-1);
    if (!first) { event.preventDefault(); return; }
    const outside = !dialog.contains(document.activeElement);
    if (event.shiftKey && (document.activeElement === first || outside)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || outside)) { event.preventDefault(); first.focus(); }
  });
  return { open, close, setTitle, body, get isOpen() { return dialog.open; } };
}
