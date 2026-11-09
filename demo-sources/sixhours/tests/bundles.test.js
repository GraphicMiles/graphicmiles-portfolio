import test from 'node:test';
import assert from 'node:assert/strict';
import { products, getProduct, getVariant } from '../src/domain/catalog.js';
import { bundles, bundlePrice, addBundleToCart, bundleAvailability } from '../src/domain/bundles.js';
import { cartTotals, addToCart } from '../src/domain/cart.js';

test('the rebuilt merchandise has 20 products and eight meaningful, unique component-backed sets', () => {
  assert.equal(products.length, 20); assert.equal(bundles.length, 8);
  assert.equal(new Set(bundles.map(bundle => bundle.id)).size, 8);
  const signatures = new Set();
  for (const bundle of bundles) {
    assert.ok(bundle.items.length >= 2);
    assert.equal('stock' in bundle, false);
    let price = 0;
    for (const item of bundle.items) {
      const variant = getVariant(getProduct(item.productId), item.variantId);
      assert.ok(variant); assert.ok(Number.isInteger(item.quantity) && item.quantity > 0);
      price += variant.price * item.quantity;
    }
    assert.equal(bundlePrice(bundle), price);
    signatures.add(bundle.items.map(item => `${item.productId}:${item.variantId}:${item.quantity}`).sort().join('|'));
  }
  assert.equal(signatures.size, 8);
});
test('set addition adds its actual components and computes their real demo prices', () => {
  const result = addBundleToCart([], 'everyday-essentials', 'lagos');
  assert.equal(result.ok, true); assert.equal(result.lines.length, 2);
  assert.equal(cartTotals(result.lines).count, 2);
  assert.equal(cartTotals(result.lines).subtotal, bundlePrice(bundles.find(bundle => bundle.id === 'everyday-essentials')));
});
test('a second component failure is atomic: the first simulated addition is not committed', () => {
  const existing = [{ productId: 'apple-adapter', variantId: '20w', quantity: 9 }];
  const snapshot = structuredClone(existing);
  const result = addBundleToCart(existing, 'everyday-essentials', 'lagos');
  assert.equal(result.ok, false); assert.equal('lines' in result, false);
  assert.deepEqual(existing, snapshot); assert.equal(existing.some(line => line.productId === 'iphone-16'), false);
});
test('sets and individual purchases share component stock, including across variants', () => {
  const first = addBundleToCart([], 'workday-edit', 'abuja'); assert.equal(first.ok, true);
  const second = addBundleToCart(first.lines, 'workday-edit', 'abuja'); assert.equal(second.ok, true);
  assert.equal(addBundleToCart(second.lines, 'workday-edit', 'abuja').ok, false);
  assert.equal(cartTotals(second.lines).count, 4);
  assert.equal(addToCart(second.lines, 'magic-mouse', 'black', 1, 'abuja').ok, false);
});
test('unknown sets and unavailable city components cannot enter the bag', () => {
  assert.equal(addBundleToCart([], 'not-a-set', 'lagos').ok, false);
  assert.equal(addBundleToCart([], 'creative-kit', 'abuja').ok, false);
});

test('set availability predicts the actual add without changing existing lines', () => {
  const bag = [{ productId: 'iphone-16', variantId: '256gb', quantity: 5 }];
  const snapshot = structuredClone(bag);
  assert.equal(bundleAvailability(bag, 'everyday-essentials', 'abuja').available, false);
  assert.equal(bundleAvailability(bag, 'everyday-essentials', 'abuja').reason, 'bag');
  assert.match(bundleAvailability(bag, 'everyday-essentials', 'abuja').message, /iPhone 16/);
  assert.equal(bundleAvailability([], 'creative-kit', 'abuja').reason, 'city');
  assert.equal(bundleAvailability([], 'everyday-essentials', 'abuja').available, true);
  assert.equal(bundleAvailability([], 'missing').available, false);
  assert.deepEqual(bag, snapshot);
});
