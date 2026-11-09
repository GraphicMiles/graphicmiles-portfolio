import { cartTotals, addToCart, changeQuantity, productAvailability } from '../domain/cart.js';
import { getProduct } from '../domain/catalog.js';
import { quoteDelivery, locationLabel } from '../domain/delivery.js';
import { money, escapeHTML, imageMarkup } from '../ui/utils.js';
import { icon } from '../ui/icons.js';

export function createCartFeature(context) {
  const { store, overlay, toast, navigate } = context;
  function markup() {
    const state = store.getState(); const totals = cartTotals(state.cart);
    if (!totals.count) return `<div class="empty-state empty-bag">${icon('bag', 40)}<p class="eyebrow">A little room for good tech</p><h3>Something good<br>belongs in here.</h3><p>Your bag is taking a breather.<br>Let’s find your next everyday favourite.</p><a class="button button-dark" href="#shop">Explore the collection ${icon('arrow-right', 18)}</a></div>`;
    const quote = quoteDelivery(state.location, state.cart);
    return `<div class="cart-body"><p class="cart-intro">Good choices. One step closer.</p><div class="cart-items">${totals.items.map(item => `<article class="cart-item" data-cart-line="${item.key}"><a class="cart-item-image" href="#product/${item.product.id}">${imageMarkup(item.product.images[0], item.product.name)}</a><div class="cart-item-info"><p class="product-brand">${escapeHTML(item.product.brand)}</p><h3><a href="#product/${item.product.id}">${escapeHTML(item.product.name)}</a></h3><p class="fine-print">${escapeHTML(item.variant.label)} · ${escapeHTML(item.product.finish)}</p><strong>${money(item.unitPrice)}</strong><div class="cart-item-controls"><div class="quantity-control"><button type="button" data-action="cart-minus" data-key="${item.key}" aria-label="Decrease ${escapeHTML(item.product.name)} quantity" ${item.quantity <= 1 ? 'disabled' : ''}>${icon('minus', 14)}</button><span aria-label="Quantity ${item.quantity}">${item.quantity}</span><button type="button" data-action="cart-plus" data-key="${item.key}" aria-label="Increase ${escapeHTML(item.product.name)} quantity" ${productAvailability(state.cart, item.product.id, state.location?.city).remaining === 0 ? 'disabled' : ''}>${icon('plus', 14)}</button></div><button type="button" class="remove-item" data-action="cart-remove" data-key="${item.key}">Remove<span class="sr-only"> ${escapeHTML(item.product.name)}</span></button></div></div></article>`).join('')}</div><div class="cart-delivery"><span>${icon('truck', 19)}</span><div><p>${state.location ? escapeHTML(locationLabel(state.location)) : 'Good tech is getting closer.'}</p><p class="fine-print">${escapeHTML(quote.eligible ? quote.headline : quote.kind === 'stock' ? quote.detail : 'Choose your area to see the delivery window and fee.')}</p><button class="text-link" type="button" data-action="open-delivery">${state.location ? 'Change area' : 'Check your area'}</button></div></div><div class="cart-summary"><div><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div><div><span>Delivery</span><span>${quote.fee !== null ? money(quote.fee) : 'Calculated by area'}</span></div>${quote.fee !== null ? `<div class="cart-total"><span>Preview total</span><strong>${money(totals.subtotal + quote.fee)}</strong></div>` : ''}<button class="button button-dark full-width" type="button" data-action="begin-checkout" ${quote.kind === 'stock' ? 'disabled' : ''}>Try demo checkout ${icon('arrow-right', 18)}</button><p class="fine-print text-center">No payment. No dispatch. Just a preview.</p><button class="text-link continue-shopping" type="button" data-close-overlay>Keep exploring</button></div></div>`;
  }
  function openCart(opener = document.activeElement) {
    overlay.open({ title: `Your bag (${cartTotals(store.getState().cart).count})`, kind: 'cart', content: markup(), opener, onMount: root => {
      const unsubscribe = store.subscribe(() => {
        const active = root.contains(document.activeElement) ? document.activeElement : null;
        const line = active?.closest('[data-cart-line]');
        const previousKeys = [...root.querySelectorAll('[data-cart-line]')].map(item => item.dataset.cartLine);
        const focused = active ? { action: active.dataset.action, key: line?.dataset.cartLine, href: active.getAttribute('href'), index: previousKeys.indexOf(line?.dataset.cartLine) } : null;
        const scrollTop = root.scrollTop;
        root.innerHTML = markup();
        overlay.setTitle(`Your bag (${cartTotals(store.getState().cart).count})`);
        root.scrollTop = scrollTop;
        if (!focused) return;
        const enabled = element => !element.disabled;
        const controls = [...root.querySelectorAll('[data-action]')];
        let target = controls.find(button => enabled(button) && button.dataset.action === focused.action && button.dataset.key === focused.key);
        if (!target && focused.href) target = [...root.querySelectorAll('a[href]')].find(link => link.getAttribute('href') === focused.href);
        const rows = [...root.querySelectorAll('[data-cart-line]')];
        const currentRow = rows.find(item => item.dataset.cartLine === focused.key);
        if (!target && currentRow) target = [...currentRow.querySelectorAll('button')].find(enabled);
        if (!target && focused.key && rows.length) target = rows[Math.min(Math.max(0, focused.index), rows.length - 1)].querySelector('[data-action="cart-remove"]');
        target ||= root.querySelector('.empty-bag .button') || root.querySelector('button:not(:disabled), a[href]');
        target?.focus({ preventScroll: true });
      });
      return unsubscribe;
    } });
  }
  function add(productId, variantId, quantity = 1) {
    const state = store.getState();
    const result = addToCart(state.cart, productId, variantId, quantity, state.location?.city);
    if (!result.ok) { toast(result.message, 'error'); return false; }
    const opener = document.activeElement;
    store.setCart(result.lines); openCart(opener); toast(`${getProduct(productId).name} added to your bag.`); return true;
  }
  function update(button, delta) {
    const state = store.getState();
    const item = cartTotals(state.cart).items.find(item => item.key === button.dataset.key);
    if (!item) return;
    const result = changeQuantity(state.cart, item.key, item.quantity + delta, state.location?.city);
    if (!result.ok) toast(result.message, 'error'); else store.setCart(result.lines);
  }
  function remove(button) {
    const result = changeQuantity(store.getState().cart, button.dataset.key, 0);
    if (result.ok) { store.setCart(result.lines); toast('Item removed from your bag.'); }
  }
  return { openCart, add, actions: {
    'open-cart': openCart,
    'quick-add': button => { const product = getProduct(button.dataset.product); if (product) add(product.id, product.variants[0].id); },
    'cart-plus': button => update(button, 1), 'cart-minus': button => update(button, -1), 'cart-remove': remove,
    'begin-checkout': () => { if (cartTotals(store.getState().cart).count) navigate('#checkout'); },
  } };
}
