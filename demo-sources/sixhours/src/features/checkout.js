import { cartTotals } from '../domain/cart.js';
import { getProduct } from '../domain/catalog.js';
import { quoteDelivery, locationLabel, validLocation } from '../domain/delivery.js';
import { validateCheckout, createDemoSummary } from '../domain/checkout.js';
import { cityOptions, areaOptions } from './delivery.js';
import { mountSelect } from '../ui/select.js';
import { escapeHTML, money, imageMarkup, focusHeading } from '../ui/utils.js';
import { icon } from '../ui/icons.js';

const sampleCustomer = { name: 'Ada Example', email: 'ada@example.com', phone: '08012345678', address: '12 Example Street, near the main gate', note: '' };
const textField = (name, label, type, value, placeholder, max = 100) => `<div class="field"><label for="checkout-${name}">${label}</label><input id="checkout-${name}" name="${name}" type="${type}" value="${escapeHTML(value || '')}" placeholder="${placeholder}" maxlength="${max}" ${name === 'phone' ? 'inputmode="tel"' : ''} aria-describedby="checkout-${name}-error"><p class="field-error" id="checkout-${name}-error"></p></div>`;

export function createCheckoutFeature({ store, navigate, toast }) {
  function summaryMarkup(location) {
    const state = store.getState(); const totals = cartTotals(state.cart); const quote = quoteDelivery(location, state.cart);
    return `<div class="checkout-summary-header"><h2>Your good choices.</h2><button type="button" class="text-link" data-action="open-cart">Edit bag</button></div>${totals.count ? `<div class="checkout-items">${totals.items.map(item => `<div class="checkout-item"><div class="checkout-item-image">${imageMarkup(item.product.images[0], item.product.name)}</div><div><h3>${escapeHTML(item.product.name)}</h3><p>${escapeHTML(item.variant.label)} · Qty ${item.quantity}</p><strong>${money(item.lineTotal)}</strong></div></div>`).join('')}</div>` : `<div class="empty-state compact"><p>Your bag is empty.</p><a class="text-link" href="#shop">Find your everyday favourite</a></div>`}<div class="checkout-totals"><div><span>Subtotal</span><span>${money(totals.subtotal)}</span></div><div><span>Sample delivery</span><span>${quote.fee === null ? 'Choose an area' : money(quote.fee)}</span></div><div class="checkout-grand-total"><span>Preview total</span><strong>${money(totals.subtotal + (quote.fee || 0))}</strong></div></div><div class="checkout-window">${icon(quote.eligible ? 'truck' : 'pin', 20)}<div><strong>${escapeHTML(quote.headline)}</strong><p>${escapeHTML(quote.detail)}</p></div></div><p class="fine-print">All amounts are NGN. Prices, stock, fees, and delivery windows are illustrative. No money will be taken.</p>`;
  }
  function mountCheckout(root) {
    if (!cartTotals(store.getState().cart).count) {
      root.innerHTML = `<section class="container checkout-empty empty-state">${icon('bag', 42)}<p class="eyebrow">First, a little good tech</p><h1>Your bag is taking a breather.</h1><p>Add an everyday favourite before trying demo checkout.</p><a class="button button-dark" href="#shop">Explore the collection ${icon('arrow-right', 18)}</a></section>`;
      return () => {};
    }
    let stage = 'delivery'; let customer = {}; let locationDraft = { ...(store.getState().location || { city: '', area: '' }) };
    let selectCleanup = () => {}; let citySelect; let areaSelect; let submitting = false; let reviewedKind = null;
    let lastLocation = JSON.stringify(store.getState().location);
    let notice = ''; let errorsShown = false; let errorSignature = '';
    function render() {
      selectCleanup(); citySelect = null; areaSelect = null; errorsShown = false; errorSignature = '';
      const isReview = stage === 'review';
      root.innerHTML = `<section class="container checkout-page"><a class="back-link" href="#shop">${icon('arrow-left', 17)} Back to the good stuff</a><div class="checkout-heading"><p class="eyebrow">A little closer to yours</p><h1>${isReview ? 'One last look.' : 'Your doorstep, please.'}</h1><ol class="checkout-progress" aria-label="Demo checkout progress"><li ${!isReview ? 'aria-current="step"' : ''}><span>${isReview ? icon('check', 13) : '01'}</span> Delivery</li><li ${isReview ? 'aria-current="step"' : ''}><span>02</span> Review</li><li><span>03</span> Demo complete</li></ol></div><div class="demo-banner">${icon('alert', 20)}<p><strong>This is a demo checkout.</strong> Use example details. No payment is collected, no real order is placed, and no delivery is arranged.</p></div><p class="checkout-notice" role="status">${escapeHTML(notice)}</p><div class="checkout-layout"><div class="checkout-form-column"><div class="error-summary" role="alert" tabindex="-1" hidden></div>${isReview ? reviewMarkup() : formMarkup()}</div><aside class="checkout-summary" aria-label="Preview order summary" data-checkout-summary>${summaryMarkup(locationDraft)}</aside></div></section>`;
      if (!isReview) mountFormSelects();
      updateSummary();
    }
    function formMarkup() {
      return `<form class="checkout-form" autocomplete="off" novalidate><div class="form-heading"><h2>A few details.</h2><button class="text-link" type="button" data-sample-details>Use example details</button></div><p class="form-description">These stay in this tab and are not included in the saved demo summary.</p>${textField('name', 'Full name', 'text', customer.name, 'Ada Example', 80)}<div class="field-row">${textField('email', 'Email address', 'email', customer.email, 'ada@example.com', 254)}${textField('phone', 'Nigerian mobile number', 'tel', customer.phone, '08012345678', 20)}</div><h2 class="form-subheading">Where’s it headed?</h2><div class="field-row"><div class="field"><label for="checkout-city">City</label><div data-checkout-city></div></div><div class="field"><label for="checkout-area">Area</label><div data-checkout-area></div></div></div><p class="field-error" id="checkout-location-error"></p>${textField('address', 'Street address & landmark', 'text', customer.address, '12 Example Street, near the main gate', 200)}<div class="field"><label for="checkout-note">A note for delivery <span class="optional">(optional)</span></label><textarea id="checkout-note" name="note" maxlength="250" rows="3" placeholder="Anything helpful to know?" aria-describedby="checkout-note-error">${escapeHTML(customer.note || '')}</textarea><p class="field-error" id="checkout-note-error"></p></div><button class="button button-dark full-width" type="submit" data-review-order>Review demo order ${icon('arrow-right', 18)}</button><p class="fine-print checkout-form-note">By continuing, you’re trying a local preview, not making a purchase.</p></form>`;
    }
    function reviewMarkup() {
      const quote = quoteDelivery(locationDraft, store.getState().cart); reviewedKind = quote.kind;
      return `<div class="review-details"><div class="form-heading"><h2>Headed to your doorstep.</h2><button type="button" class="text-link" data-edit-delivery>Edit details</button></div><div class="review-address"><strong>${escapeHTML(customer.name)}</strong><p>${escapeHTML(customer.address)}</p><p>${escapeHTML(locationLabel(locationDraft))}</p><p>${escapeHTML(customer.email)}<br>${escapeHTML(customer.phone)}</p>${customer.note ? `<p class="review-note">Note: ${escapeHTML(customer.note)}</p>` : ''}</div><div class="review-payment">${icon('shield', 22)}<div><h3>No payment in this preview.</h3><p>No card details, transfer, or payment provider. The next button creates a demo summary in your browser only.</p></div></div><div class="review-window"><p class="eyebrow">Your illustrative delivery window</p><strong>${escapeHTML(quote.headline)}</strong><p>${escapeHTML(quote.detail)}</p></div><button class="button button-dark full-width" type="button" data-confirm-demo>Confirm demo summary ${icon('check', 18)}</button><p class="fine-print checkout-form-note">Not a real order. Nothing will be charged or dispatched.</p><button class="text-link review-back" type="button" data-edit-delivery>${icon('arrow-left', 15)} Back to delivery details</button></div>`;
    }
    function mountFormSelects() {
      citySelect = mountSelect(root.querySelector('[data-checkout-city]'), { id: 'checkout-city', label: 'Delivery city', name: 'city', placeholder: 'Choose city', value: locationDraft.city, options: cityOptions(), onChange: value => { locationDraft = { city: value, area: '' }; areaSelect.setOptions(areaOptions(value)); areaSelect.button.disabled = false; updateSummary(); refreshErrors(); } });
      areaSelect = mountSelect(root.querySelector('[data-checkout-area]'), { id: 'checkout-area', label: 'Delivery area', name: 'area', placeholder: 'Choose area', value: locationDraft.area, options: areaOptions(locationDraft.city), onChange: value => { locationDraft.area = value; if (validLocation(locationDraft)) store.setLocation(locationDraft); updateSummary(); refreshErrors(); } });
      areaSelect.button.disabled = !locationDraft.city;
      [citySelect.button, areaSelect.button].forEach(button => button.setAttribute('aria-describedby', 'checkout-location-error'));
      selectCleanup = () => { citySelect?.destroy(); areaSelect?.destroy(); };
    }
    function updateSummary() {
      const target = root.querySelector('[data-checkout-summary]'); if (!target) return;
      target.innerHTML = summaryMarkup(locationDraft);
      const state = store.getState(); const quote = quoteDelivery(locationDraft, state.cart); const count = cartTotals(state.cart).count;
      const confirm = root.querySelector('[data-confirm-demo]'); if (confirm) confirm.disabled = submitting || !quote.eligible || !count;
      const review = root.querySelector('[data-review-order]'); if (review) review.disabled = !count;
      const reviewWindow = root.querySelector('.review-window');
      if (reviewWindow) reviewWindow.innerHTML = `<p class="eyebrow">Your illustrative delivery window</p><strong>${escapeHTML(quote.headline)}</strong><p>${escapeHTML(quote.detail)}</p>`;
    }
    function showErrors(errors, focus = true) {
      const signature = JSON.stringify(errors);
      if (!focus && signature === errorSignature) return;
      errorSignature = signature; errorsShown = true;
      root.querySelectorAll('[aria-invalid]').forEach(element => element.removeAttribute('aria-invalid'));
      root.querySelectorAll('.field-error').forEach(element => { element.textContent = ''; });
      for (const [key, message] of Object.entries(errors)) {
        const field = root.querySelector(`#checkout-${key}`); field?.setAttribute('aria-invalid', 'true');
        const error = root.querySelector(`#checkout-${key}-error`); if (error) error.textContent = message;
        if (key === 'location') { citySelect?.button.setAttribute('aria-invalid', 'true'); areaSelect?.button.setAttribute('aria-invalid', 'true'); }
      }
      const summary = root.querySelector('.error-summary');
      if (!Object.keys(errors).length) { summary.hidden = true; summary.replaceChildren(); return; }
      summary.hidden = false; summary.innerHTML = `<h2>A few details need a second look.</h2><ul>${Object.entries(errors).map(([key, message]) => `<li><button class="text-link" type="button" data-error-field="${key}">${escapeHTML(message)}</button></li>`).join('')}</ul>`;
      if (focus) summary.focus();
    }
    function refreshErrors() {
      const form = root.querySelector('.checkout-form');
      if (!errorsShown || !form) return;
      const result = validateCheckout({ customer: Object.fromEntries(new FormData(form)), location: locationDraft, lines: store.getState().cart });
      showErrors(result.errors, false);
    }
    function onSubmit(event) {
      if (!event.target.matches('.checkout-form')) return;
      event.preventDefault(); customer = Object.fromEntries(new FormData(event.target));
      const result = validateCheckout({ customer, location: locationDraft, lines: store.getState().cart });
      if (!result.valid) { showErrors(result.errors); return; }
      customer = result.customer; store.setLocation(locationDraft); stage = 'review'; notice = ''; render(); focusHeading(root); window.scrollTo({ top: 0, behavior: 'instant' });
    }
    function confirmDemo() {
      if (submitting) return;
      const now = new Date(); const state = store.getState();
      const validation = validateCheckout({ customer, location: locationDraft, lines: state.cart, now });
      if (!validation.valid) { stage = 'delivery'; render(); showErrors(validation.errors); return; }
      if (reviewedKind !== validation.quote.kind) { notice = 'The order window has changed. Please review the updated delivery window and confirm again.'; render(); focusHeading(root); return; }
      submitting = true; updateSummary();
      try {
        const suffix = `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
        const summary = createDemoSummary({ lines: state.cart, location: locationDraft, now, id: `SIX-DEMO-${suffix}` });
        store.completeDemo(summary);
        customer = {}; navigate(`#demo/${summary.id}`);
      } catch {
        submitting = false; updateSummary(); toast('The demo summary could not be prepared. Please review your bag and try again.', 'error');
      }
    }
    function onClick(event) {
      if (event.target.closest('[data-sample-details]')) {
        customer = { ...sampleCustomer };
        for (const [name, value] of Object.entries(customer)) { const input = root.querySelector(`[name="${name}"]`); if (input) input.value = value; }
        refreshErrors(); root.querySelector('#checkout-name')?.focus();
      }
      if (event.target.closest('[data-edit-delivery]')) { stage = 'delivery'; notice = ''; render(); focusHeading(root); }
      if (event.target.closest('[data-confirm-demo]')) confirmDemo();
      const errorLink = event.target.closest('[data-error-field]');
      if (errorLink) { const key = errorLink.dataset.errorField; (key === 'location' ? citySelect?.button : root.querySelector(`#checkout-${key}`))?.focus(); }
    }
    root.addEventListener('submit', onSubmit); root.addEventListener('click', onClick); root.addEventListener('input', refreshErrors);
    const unsubscribe = store.subscribe(state => {
      const nextLocation = JSON.stringify(state.location);
      if (nextLocation !== lastLocation) {
        lastLocation = nextLocation; locationDraft = { ...(state.location || { city: '', area: '' }) };
        if (stage === 'review' && !submitting) { stage = 'delivery'; notice = 'Your delivery area changed. Check your street address before reviewing again.'; render(); }
        else if (stage === 'delivery') { citySelect?.setValue(locationDraft.city); areaSelect?.setOptions(areaOptions(locationDraft.city), locationDraft.area); if (areaSelect) areaSelect.button.disabled = !locationDraft.city; }
      }
      updateSummary();
    });
    render();
    return () => { customer = {}; unsubscribe(); selectCleanup(); root.removeEventListener('submit', onSubmit); root.removeEventListener('click', onClick); root.removeEventListener('input', refreshErrors); };
  }
  function mountConfirmation(root, id) {
    const summary = store.getState().lastDemo;
    if (!summary || summary.id !== id) {
      root.innerHTML = `<section class="container empty-state checkout-empty">${icon('bag', 36)}<h1>That demo isn’t here.</h1><p>This browser has no matching demo summary. No real order has been placed.</p><a class="button button-dark" href="#shop">Explore the collection ${icon('arrow-right', 18)}</a></section>`; return () => {};
    }
    root.innerHTML = `<section class="container confirmation-page"><div class="confirmation-heading"><span class="confirmation-check">${icon('check', 30)}</span><p class="eyebrow">Demo complete. Not a real order.</p><h1>A little less waiting.<br>A lot of good tech.</h1><p>You’ve tried the sixhours experience. Your demo summary is below.<br> <strong>No payment was taken. Nothing will be dispatched.</strong></p><p class="demo-reference">${escapeHTML(summary.id)}</p></div><div class="confirmation-summary"><div class="confirmation-topline"><div><p class="eyebrow">Illustrative delivery area</p><strong>${escapeHTML(locationLabel(summary.location))}</strong></div><div><p class="eyebrow">Illustrative window</p><strong>${escapeHTML(summary.delivery.headline)}</strong></div></div><div class="confirmation-items">${summary.items.map(item => { const product = getProduct(item.productId); return `<div class="confirmation-item">${product ? imageMarkup(product.images[0], product.name) : ''}<div><h2>${escapeHTML(item.name)}</h2><p>${escapeHTML(item.option)} · Qty ${item.quantity}</p></div><strong>${money(item.lineTotal)}</strong></div>`; }).join('')}</div><div class="confirmation-total"><div><span>Subtotal</span><span>${money(summary.subtotal)}</span></div><div><span>Sample delivery</span><span>${money(summary.fee)}</span></div><div><strong>Preview total</strong><strong>${money(summary.total)}</strong></div></div></div><p class="fine-print text-center">${store.getState().storageAvailable ? 'This summary is stored in this browser only. It is not a receipt or purchase confirmation.' : 'Browser storage is blocked. This demo summary is available for this session only.'}<br>Your contact details and street address are not saved in it.</p><div class="confirmation-actions"><a class="button button-dark button-lift" href="#shop">Keep exploring ${icon('arrow-right', 18)}</a><button class="inline-link" type="button" data-action="open-promise">Read the six-hour promise ${icon('arrow-up-right', 17)}</button></div></section>`;
    return () => {};
  }
  return { mountCheckout, mountConfirmation };
}
