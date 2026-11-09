import { sanitizeCart } from '../domain/cart.js';
import { validLocation } from '../domain/delivery.js';

export const STORAGE_KEY = 'six-preview:v1';

/** Storage failures degrade to session memory, including opaque file-viewer origins. */
export function createStorage(provider = () => globalThis.localStorage) {
  let available = true;
  return {
    read() {
      try { return JSON.parse(provider().getItem(STORAGE_KEY) || 'null'); }
      catch { available = false; return null; }
    },
    write(value) {
      try { provider().setItem(STORAGE_KEY, JSON.stringify(value)); available = true; return true; }
      catch { available = false; return false; }
    },
    get available() { return available; },
  };
}

function sanitizeSummary(value) {
  if (!value || value.demo !== true || !/^SIX-DEMO-[A-Z0-9]{6,16}$/.test(value.id) || !Array.isArray(value.items) || !value.items.length || !validLocation(value.location)) return null;
  if (![value.subtotal, value.fee, value.total].every(number => Number.isSafeInteger(number) && number >= 0)) return null;
  if (value.subtotal + value.fee !== value.total || !value.delivery || !['express', 'scheduled'].includes(value.delivery.kind)) return null;
  if (!value.items.every(item => typeof item.name === 'string' && typeof item.option === 'string' && Number.isSafeInteger(item.quantity) && item.quantity > 0 && Number.isSafeInteger(item.lineTotal) && item.lineTotal >= 0)) return null;
  return value;
}

export function createStore(storage = createStorage()) {
  const saved = storage.read();
  let state = {
    cart: sanitizeCart(saved?.cart),
    location: validLocation(saved?.location) ? { city: saved.location.city, area: saved.location.area } : null,
    lastDemo: sanitizeSummary(saved?.lastDemo),
    storageAvailable: storage.available,
  };
  const listeners = new Set();
  const publish = patch => {
    state = { ...state, ...patch };
    state.storageAvailable = storage.write({ version: 1, cart: state.cart, location: state.location, lastDemo: state.lastDemo });
    listeners.forEach(listener => listener(state));
    return state;
  };
  return {
    getState: () => state,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    setCart(lines) { return publish({ cart: sanitizeCart(lines) }); },
    setLocation(location) { return publish({ location: validLocation(location) ? { city: location.city, area: location.area } : null }); },
    completeDemo(summary) {
      const valid = sanitizeSummary(summary);
      if (!valid) throw new Error('Invalid demo summary.');
      return publish({ lastDemo: valid, cart: [] });
    },
  };
}
