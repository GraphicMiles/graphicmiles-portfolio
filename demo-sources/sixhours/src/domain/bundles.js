import { bundles } from '../data/bundles.js';
import { getProduct, getVariant } from './catalog.js';
import { addToCart } from './cart.js';
export { bundles };
export const getBundle = id => bundles.find(bundle => bundle.id === id);

export function bundleItems(bundle) {
  return bundle.items.map(item => {
    const product = getProduct(item.productId);
    const variant = getVariant(product, item.variantId);
    return { ...item, product, variant, lineTotal: variant.price * item.quantity };
  });
}
export const bundlePrice = bundle => bundleItems(bundle).reduce((total, item) => total + item.lineTotal, 0);

/** Atomic set addition. Component stock is shared with individual products. */
export function addBundleToCart(lines, bundleId, city = null) {
  const bundle = getBundle(bundleId);
  if (!bundle) return { ok: false, message: 'That set is not available.' };
  let next = lines;
  for (const item of bundle.items) {
    const result = addToCart(next, item.productId, item.variantId, item.quantity, city);
    if (!result.ok) return { ...result, productId: item.productId };
    next = result.lines;
  }
  return { ok: true, lines: next };
}

/** Simulate the same atomic operation used on add, including components already in the bag. */
export function bundleAvailability(lines, bundleId, city = null) {
  const bundle = getBundle(bundleId);
  const result = addBundleToCart(lines, bundleId, city);
  const cityUnavailable = bundle && city && bundleItems(bundle).some(item => item.product.stock[city] < item.quantity);
  const name = getProduct(result.productId)?.name;
  return { available: result.ok, reason: result.ok ? null : !bundle ? 'unknown' : cityUnavailable ? 'city' : 'bag', message: result.ok ? '' : `${name ? `${name}: ` : ''}${result.message}` };
}
