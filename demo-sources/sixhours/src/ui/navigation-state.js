const STATE_KEY = 'sixhoursEntry';

/** Per-history-entry view state. Only scroll and a focus locator are kept in tab memory. */
export function createNavigationState() {
  const entries = new Map();
  const fallbackKeys = new Map();
  let serial = 0;
  let persistentKeys = false;
  let currentKey = null;
  let currentHash = location.hash;
  let pendingKey = null;
  const newKey = () => `${Date.now().toString(36)}-${++serial}`;
  const readKey = () => history.state?.[STATE_KEY];
  const writeKey = key => {
    try { history.replaceState({ ...history.state, [STATE_KEY]: key }, ''); persistentKeys = true; } catch { /* Opaque file viewers retain in-memory state. */ }
  };
  try { history.scrollRestoration = 'manual'; } catch { /* Optional in restricted viewers. */ }

  function focusLocator(element) {
    if (!(element instanceof Element) || element === document.body) return null;
    if (element.id) return { id: element.id };
    const link = element.closest('a[href]');
    return link ? { href: link.getAttribute('href'), text: link.textContent.trim() } : null;
  }
  function capture({ focus = true } = {}) {
    if (!currentKey) return;
    if (readKey() === currentKey) currentHash = location.hash;
    const previous = entries.get(currentKey);
    entries.set(currentKey, { x: scrollX, y: scrollY, focus: (focus && focusLocator(document.activeElement)) || previous?.focus || null });
    fallbackKeys.set(currentHash, currentKey);
  }
  function arrive() {
    capture();
    const key = pendingKey || readKey() || (!persistentKeys && fallbackKeys.get(location.hash)) || newKey();
    pendingKey = null;
    const snapshot = key !== currentKey ? entries.get(key) : null;
    currentKey = key; currentHash = location.hash; writeKey(key);
    return snapshot || null;
  }
  function push(hash) {
    capture();
    const key = newKey();
    try {
      const url = new URL(location.href); url.hash = hash;
      history.pushState({ ...history.state, [STATE_KEY]: key }, '', url.href);
      return true; // pushState does not dispatch hashchange; the composition root renders now.
    } catch {
      pendingKey = key; location.hash = hash;
      return false;
    }
  }
  function restore(root, snapshot) {
    if (!snapshot) return false;
    scrollTo({ left: snapshot.x, top: snapshot.y, behavior: 'instant' });
    const visible = element => {
      if (!element || element.closest('[hidden], [inert]') || element.matches(':disabled')) return false;
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight;
    };
    const locator = snapshot.focus;
    let target = locator?.id ? document.getElementById(locator.id) : null;
    if (!target && locator?.href) target = [...root.querySelectorAll('a[href]')].find(link => link.getAttribute('href') === locator.href && link.textContent.trim() === locator.text && visible(link));
    if (!visible(target)) target = [...root.querySelectorAll('a[href], button:not(:disabled), input:not([type="hidden"])')].find(visible);
    target?.focus({ preventScroll: true });
    return true;
  }
  window.addEventListener('scroll', () => capture({ focus: false }), { passive: true });
  return { arrive, capture, push, restore };
}
