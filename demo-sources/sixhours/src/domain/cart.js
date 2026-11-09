import { getProduct, getVariant } from './catalog.js';

export const MAX_QUANTITY = 9;
export const lineKey = (productId, variantId) => `${productId}:${variantId}`;

/** Validate persisted input and derive current prices exclusively from the catalogue. */
export function sanitizeCart(value) {
  if (!Array.isArray(value)) return [];
  const combined = new Map();
  for (const raw of value.slice(0, 100)) {
    if (!raw || typeof raw !== 'object') continue;
    const product = getProduct(raw.productId);
    if (!getVariant(product, raw.variantId) || !Number.isInteger(raw.quantity) || raw.quantity < 1) continue;
    const key = lineKey(raw.productId, raw.variantId);
    const existing = combined.get(key);
    const otherQty = [...combined.values()].filter(line => line.productId === product.id && line.variantId !== raw.variantId).reduce((sum, line) => sum + line.quantity, 0);
    const quantity = Math.min(MAX_QUANTITY - otherQty, (existing?.quantity || 0) + raw.quantity);
    if (quantity > 0) combined.set(key, { productId: product.id, variantId: raw.variantId, quantity });
  }
  return [...combined.values()];
}

export function hydrateCart(lines) {
  return sanitizeCart(lines).map(line => {
    const product = getProduct(line.productId);
    const variant = getVariant(product, line.variantId);
    return { ...line, key: lineKey(line.productId, line.variantId), product, variant, unitPrice: variant.price, lineTotal: variant.price * line.quantity };
  });
}

export function cartTotals(lines) {
  const items = hydrateCart(lines);
  return { items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0) };
}

export function productQuantity(lines, productId) {
  return lines.filter(line => line.productId === productId).reduce((sum, line) => sum + line.quantity, 0);
}

/** One stock/preview cap, shared by purchase controls and cart mutations. */
export function productAvailability(lines, productId, city = null) {
  const product = getProduct(productId);
  const limit = !product ? 0 : city && city in product.stock ? Math.min(MAX_QUANTITY, product.stock[city]) : MAX_QUANTITY;
  const inBag = productQuantity(lines, productId);
  const remaining = Math.max(0, limit - inBag);
  return { limit, inBag, remaining, reason: !product ? 'unknown' : limit === 0 ? 'city' : remaining === 0 ? 'bag' : null };
}

export function changeQuantity(lines, key, quantity, city = null) {
  const current = lines.find(line => lineKey(line.productId, line.variantId) === key);
  if (!current) return { ok: false, message: 'That item is no longer in your bag.' };
  if (!Number.isInteger(quantity) || quantity < 0) return { ok: false, message: 'Please choose a whole quantity.' };
  if (quantity === 0) return { ok: true, lines: lines.filter(line => line !== current) };
  const product = getProduct(current.productId);
  const { limit } = productAvailability(lines, product.id, city);
  const others = productQuantity(lines, product.id) - current.quantity;
  // A city change can leave an existing bag over stock. Reductions must still work.
  if (quantity + others > limit && quantity >= current.quantity) return { ok: false, message: limit === 0 ? 'This item is unavailable in your selected city in the preview.' : `The preview allows up to ${limit} of this product${city ? ' in your selected city' : ''}.` };
  return { ok: true, lines: lines.map(line => line === current ? { ...line, quantity } : line) };
}

export function addToCart(lines, productId, variantId, quantity = 1, city = null) {
  const product = getProduct(productId);
  if (!product || !getVariant(product, variantId)) return { ok: false, message: 'Please choose an available product option.' };
  if (!Number.isInteger(quantity) || quantity < 1) return { ok: false, message: 'Please choose a valid quantity.' };
  const key = lineKey(productId, variantId);
  const current = lines.find(line => lineKey(line.productId, line.variantId) === key);
  const working = current ? lines : [...lines, { productId, variantId, quantity: 0 }];
  return changeQuantity(working, key, (current?.quantity || 0) + quantity, city);
}
