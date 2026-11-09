import test from 'node:test';
import assert from 'node:assert/strict';
import { products, getProduct, findProducts } from '../src/domain/catalog.js';
import { sanitizeCart, addToCart, changeQuantity, cartTotals, productAvailability } from '../src/domain/cart.js';
import { deliveryWindow, quoteDelivery, validLocation } from '../src/domain/delivery.js';
import { validateCheckout, createDemoSummary } from '../src/domain/checkout.js';
import { createStore, createStorage, STORAGE_KEY } from '../src/state/store.js';

const location = { city: 'lagos', area: 'yaba' };
const lines = [{ productId: 'iphone-16', variantId: '128gb', quantity: 1 }];
const customer = { name: 'Ada Example', email: 'ada@example.com', phone: '08012345678', address: '12 Example Street, near the gate', note: '' };
const clock = new Date('2026-11-09T10:30:00Z');

test('catalogue IDs and variants are unique, prices are safe integer NGN amounts', () => {
  assert.equal(new Set(products.map(product => product.id)).size, products.length);
  for (const product of products) {
    assert.ok(product.images.length);
    assert.equal(new Set(product.variants.map(variant => variant.id)).size, product.variants.length);
    assert.ok(product.variants.every(variant => Number.isSafeInteger(variant.price) && variant.price > 0));
  }
});
test('search is case-insensitive, multi-word, category-aware, and sortable', () => {
  assert.equal(findProducts({ query: 'APPLE iphone' })[0].id, 'iphone-16');
  assert.equal(findProducts({ category: 'laptops', query: 'Samsung' }).length, 0);
  assert.equal(findProducts({ query: 'no-such-product' }).length, 0);
  assert.equal(findProducts({ query: 'wireless earbuds' }).length, 3);
  assert.ok(findProducts({ query: 'charger' }).some(product => product.id === 'apple-adapter'));
  const sorted = findProducts({ sort: 'price-asc', maxPrice: 100000 });
  assert.equal(sorted.length, 3); assert.equal(sorted[0].id, 'apple-adapter');
});
test('persisted cart drops unknown IDs, bad variants, fractional/negative counts and ignores stored prices', () => {
  const cart = sanitizeCart([...lines, { productId: 'unknown', variantId: 'x', quantity: 1 }, { productId: 'airpods-4', variantId: 'anc', quantity: -1 }, { productId: 'airpods-4', variantId: 'anc', quantity: 1.5 }, { productId: 'iphone-16', variantId: 'free', quantity: 1 }, { ...lines[0], quantity: 3, price: 1 }]);
  assert.equal(cart.length, 1); assert.equal(cart[0].quantity, 4); assert.equal(cartTotals(cart).subtotal, 4480000);
});
test('persisted cart caps combined quantities across variants, not each option separately', () => {
  const cart = sanitizeCart([{ ...lines[0], quantity: 8 }, { ...lines[0], variantId: '256gb', quantity: 8 }]);
  assert.equal(cartTotals(cart).count, 9);
});
test('adding, incrementing, removing and totals are derived without mutating inputs', () => {
  const added = addToCart(lines, 'airpods-4', 'anc', 2, 'lagos');
  assert.equal(added.ok, true); assert.equal(lines.length, 1); assert.equal(cartTotals(added.lines).count, 3); assert.equal(cartTotals(added.lines).subtotal, 1740000);
  const increased = changeQuantity(added.lines, 'airpods-4:anc', 3, 'lagos'); assert.equal(cartTotals(increased.lines).count, 4);
  const removed = changeQuantity(increased.lines, 'iphone-16:128gb', 0); assert.equal(removed.lines.length, 1);
});
test('city stock applies across variants and unavailable cities cannot add items', () => {
  const first = addToCart([], 'iphone-16', '128gb', 4, 'abuja'); assert.equal(first.ok, true);
  assert.equal(addToCart(first.lines, 'iphone-16', '256gb', 2, 'abuja').ok, false);
  assert.equal(addToCart([], 'ipad-air', '128gb', 1, 'abuja').ok, false);
  assert.equal(addToCart([], 'unknown', 'x').ok, false);
  assert.equal(addToCart([], 'iphone-16', '128gb', -1).ok, false);
});
test('WAT window opens at exactly 09:00 and closes at exactly 15:00', () => {
  const before = deliveryWindow('2026-11-09T07:59:59Z'); assert.equal(before.kind, 'scheduled'); assert.equal(before.startAt, '2026-11-09T08:00:00.000Z');
  const open = deliveryWindow('2026-11-09T08:00:00Z'); assert.equal(open.kind, 'express'); assert.equal(open.deadlineAt, '2026-11-09T14:00:00.000Z');
  const last = deliveryWindow('2026-11-09T13:59:59Z'); assert.equal(last.kind, 'express'); assert.equal(last.deadlineAt, '2026-11-09T19:59:59.000Z');
  const cutoff = deliveryWindow('2026-11-09T14:00:00Z'); assert.equal(cutoff.kind, 'scheduled'); assert.equal(cutoff.startAt, '2026-11-10T08:00:00.000Z');
});
test('WAT scheduling handles local midnight, year boundaries and an invalid clock', () => {
  assert.equal(deliveryWindow('2026-12-31T22:30:00Z').startAt, '2027-01-01T08:00:00.000Z');
  assert.equal(deliveryWindow('2026-12-31T23:30:00Z').startAt, '2027-01-01T08:00:00.000Z');
  assert.throws(() => deliveryWindow('not-a-date'), TypeError);
});
test('only configured city/area pairs get a quote, and stock issues block eligibility', () => {
  assert.equal(validLocation(location), true); assert.equal(validLocation({ city: 'abuja', area: 'yaba' }), false);
  assert.equal(quoteDelivery(null, lines, clock).eligible, false);
  assert.equal(quoteDelivery({ city: 'lagos', area: 'outside' }, lines, clock).fee, null);
  const quote = quoteDelivery(location, lines, clock); assert.equal(quote.eligible, true); assert.equal(quote.fee, 3500); assert.equal(quote.kind, 'express');
  const unavailable = quoteDelivery({ city: 'abuja', area: 'wuse' }, [{ productId: 'ipad-air', variantId: '128gb', quantity: 1 }], clock); assert.equal(unavailable.eligible, false); assert.equal(unavailable.kind, 'stock');
});
test('checkout accepts valid Nigerian local and international mobile formats', () => {
  for (const phone of ['08012345678', '+2348012345678', '2348012345678', '+234 801 234 5678']) assert.equal(validateCheckout({ customer: { ...customer, phone }, location, lines, now: clock }).valid, true);
});
test('checkout rejects incomplete details, unsupported areas, empty bag and overlong notes', () => {
  const result = validateCheckout({ customer: { name: 'A', email: 'bad', phone: '123', address: 'road', note: 'a'.repeat(251) }, location: null, lines: [] });
  assert.equal(result.valid, false); assert.deepEqual(Object.keys(result.errors).sort(), ['address', 'cart', 'email', 'location', 'name', 'note', 'phone']);
});
test('demo summary recomputes totals, is explicitly not a transaction, and contains no contact PII', () => {
  const summary = createDemoSummary({ lines, location, now: clock, id: 'SIX-DEMO-EXAMPLE1' });
  assert.equal(summary.demo, true); assert.equal(summary.total, 1123500); assert.equal(summary.items[0].unitPrice, getProduct('iphone-16').variants[0].price);
  for (const key of ['customer', 'name', 'email', 'phone', 'address']) assert.equal(key in summary, false);
  assert.throws(() => createDemoSummary({ lines: [], location, now: clock, id: 'SIX-DEMO-EXAMPLE1' }));
});
test('cart and location persist and restore; successful local demo clears the bag only afterward', () => {
  const memory = new Map(); const provider = () => ({ getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) });
  const store = createStore(createStorage(provider)); store.setCart(lines); store.setLocation(location);
  const restored = createStore(createStorage(provider)); assert.equal(cartTotals(restored.getState().cart).count, 1); assert.deepEqual(restored.getState().location, location);
  const summary = createDemoSummary({ lines, location, now: clock, id: 'SIX-DEMO-EXAMPLE1' }); restored.completeDemo(summary);
  assert.equal(restored.getState().cart.length, 0); assert.equal(createStore(createStorage(provider)).getState().lastDemo.id, summary.id);
  assert.ok(memory.get(STORAGE_KEY).includes('SIX-DEMO-EXAMPLE1')); assert.ok(!memory.get(STORAGE_KEY).includes('ada@example.com'));
});
test('malformed JSON, tampered storage, and blocked storage safely degrade', () => {
  const malformed = createStore(createStorage(() => ({ getItem: () => '{bad', setItem() {} }))); assert.deepEqual(malformed.getState().cart, []);
  const tampered = createStore(createStorage(() => ({ getItem: () => JSON.stringify({ cart: [{ productId: 'x', variantId: 'x', quantity: 2 }], location: { city: 'x', area: 'x' }, lastDemo: { demo: true } }), setItem() {} }))); assert.deepEqual(tampered.getState().cart, []); assert.equal(tampered.getState().lastDemo, null);
  const blocked = createStore(createStorage(() => { throw new Error('Blocked'); })); blocked.setCart(lines); assert.equal(cartTotals(blocked.getState().cart).count, 1); assert.equal(blocked.getState().storageAvailable, false);
});

test('purchase availability subtracts every variant already in the bag', () => {
  const bag = [{ ...lines[0], quantity: 3 }, { ...lines[0], variantId: '256gb', quantity: 1 }];
  assert.deepEqual(productAvailability(bag, 'iphone-16', 'abuja'), { limit: 5, inBag: 4, remaining: 1, reason: null });
  assert.equal(productAvailability(bag, 'iphone-16').remaining, 5);
  assert.equal(productAvailability([], 'ipad-air', 'abuja').reason, 'city');
  assert.equal(productAvailability([{ ...lines[0], quantity: 5 }], 'iphone-16', 'abuja').reason, 'bag');
  assert.equal(productAvailability([], 'unknown').remaining, 0);
});
test('after a city change an overstocked bag can be reduced one step at a time', () => {
  let bag = [{ ...lines[0], quantity: 8 }];
  for (const quantity of [7, 6, 5]) {
    const result = changeQuantity(bag, 'iphone-16:128gb', quantity, 'abuja');
    assert.equal(result.ok, true); bag = result.lines;
    assert.equal(quoteDelivery({ city: 'abuja', area: 'wuse' }, bag).eligible, quantity <= 5);
  }
  assert.equal(changeQuantity(bag, 'iphone-16:128gb', 6, 'abuja').ok, false);
  const absent = [{ productId: 'ipad-air', variantId: '128gb', quantity: 2 }];
  assert.equal(changeQuantity(absent, 'ipad-air:128gb', 1, 'abuja').ok, true);
  assert.equal(changeQuantity(absent, 'ipad-air:128gb', 3, 'abuja').ok, false);
});
