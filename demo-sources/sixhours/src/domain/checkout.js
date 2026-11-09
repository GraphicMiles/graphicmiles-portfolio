import { cartTotals } from './cart.js';
import { quoteDelivery } from './delivery.js';

export function validateCheckout({ customer = {}, location, lines = [], now = new Date() }) {
  const errors = {};
  const clean = Object.fromEntries(['name', 'email', 'phone', 'address', 'note'].map(key => [key, String(customer[key] || '').trim()]));
  if (clean.name.length < 2 || clean.name.length > 80) errors.name = 'Enter your full name, between 2 and 80 characters.';
  if (clean.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) errors.email = 'Enter a valid email address.';
  const phone = clean.phone.replace(/[\s()\-]/g, '');
  if (!/^(?:\+234|234|0)[789]\d{9}$/.test(phone)) errors.phone = 'Use a Nigerian mobile number, such as 08012345678.';
  if (clean.address.length < 10 || clean.address.length > 200) errors.address = 'Enter a street address with a house number or landmark, between 10 and 200 characters.';
  if (clean.note.length > 250) errors.note = 'Keep your delivery note under 250 characters.';
  if (!cartTotals(lines).count) errors.cart = 'Your bag is empty. Add a gadget before checking out.';
  const quote = quoteDelivery(location, lines, now);
  if (!quote.eligible) errors.location = quote.detail;
  return { valid: Object.keys(errors).length === 0, errors, customer: clean, quote };
}

/** Creates a local demo summary only. No payment, API, dispatch, or order service. */
export function createDemoSummary({ lines, location, now = new Date(), id }) {
  const totals = cartTotals(lines);
  const quote = quoteDelivery(location, lines, now);
  if (!totals.count || !quote.eligible) throw new Error('A valid bag and delivery area are required.');
  return {
    id, createdAt: now.toISOString(), location: { city: location.city, area: location.area },
    items: totals.items.map(item => ({ productId: item.productId, variantId: item.variantId, name: item.product.name, option: item.variant.label, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal })),
    subtotal: totals.subtotal, fee: quote.fee, total: totals.subtotal + quote.fee,
    delivery: { kind: quote.kind, headline: quote.headline, startAt: quote.startAt, deadlineAt: quote.deadlineAt },
    demo: true,
  };
}
