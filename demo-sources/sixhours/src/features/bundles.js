import { bundles, getBundle, bundleItems, bundlePrice, addBundleToCart, bundleAvailability } from '../domain/bundles.js';
import { bundleCard, updateBundleCards } from '../ui/bundle-card.js';
import { escapeHTML, imageMarkup, money, uniqueId } from '../ui/utils.js';
import { icon } from '../ui/icons.js';

export function createBundlesFeature(context) {
  const { store, overlay, toast } = context;
  function renderHome() {
    document.querySelector('#home-bundles').innerHTML = bundles.map(bundle => bundleCard(bundle, { city: store.getState().location?.city, lines: store.getState().cart })).join('');
  }
  store.subscribe(state => updateBundleCards(document.querySelector('#home-bundles'), state));
  function details(bundle, heading = 'h2') {
    const statusId = uniqueId('bundle-availability');
    return `<div class="bundle-details" data-focus-scope><${heading}>${escapeHTML(bundle.name)}</${heading}><p class="bundle-description">${escapeHTML(bundle.description)}</p><ul class="bundle-components">${bundleItems(bundle).map(item => `<li><a href="#product/${item.product.id}">${escapeHTML(item.product.name)}</a><span>${item.quantity} × ${escapeHTML(item.variant.label)} · ${money(item.lineTotal)}</span></li>`).join('')}</ul><p class="bundle-total"><span>Set total</span><strong>${money(bundlePrice(bundle))}</strong></p><button class="button button-dark full-width" type="button" data-action="add-bundle" data-bundle="${bundle.id}" data-bundle-add aria-describedby="${statusId}">Add set to bag ${icon('plus', 19)}</button><p class="fine-print bundle-availability" id="${statusId}" data-bundle-status role="status"></p><p class="fine-print bundle-details-note">Sample prices. The total is the sum of these products; there is no additional discount or separate set inventory. Components are added together or not at all.</p>${bundle.id === 'creative-kit' ? '<p class="fine-print bundle-details-note">Apple Pencil Pro requires a compatible iPad. Confirm the exact model and compatibility before a real purchase.</p>' : ''}</div>`;
  }
  function mountAvailability(root, bundle) {
    const update = () => {
      const state = store.getState();
      const availability = bundleAvailability(state.cart, bundle.id, state.location?.city);
      const button = root.querySelector('[data-bundle-add]');
      button.disabled = !availability.available; button.innerHTML = availability.available ? `Add set to bag ${icon('plus', 19)}` : availability.reason === 'city' ? 'Unavailable in your city' : 'Adjust bag quantities';
      root.querySelector('[data-bundle-status]').textContent = availability.message;
    };
    update(); return store.subscribe(update);
  }
  function openBundle(button) {
    const bundle = getBundle(button.dataset.bundle); if (!bundle) return;
    overlay.open({ title: 'A considered set.', kind: 'bundle', content: `<div class="quickview-layout"><a class="quickview-image" href="#bundle/${bundle.id}" aria-label="View full set details">${imageMarkup(bundle.image, bundle.name, 'bundle-preview-image', true)}</a><div class="quickview-details">${details(bundle)}</div></div>`, onMount: root => mountAvailability(root, bundle) });
  }
  function addBundle(button) {
    const state = store.getState();
    const result = addBundleToCart(state.cart, button.dataset.bundle, state.location?.city);
    if (!result.ok) { toast(result.message, 'error'); return; }
    const opener = document.activeElement;
    store.setCart(result.lines); context.cart.openCart(opener); toast(`${getBundle(button.dataset.bundle).name} added as its component products.`);
  }
  function mountCollection(root) {
    root.innerHTML = `<section class="shop-intro"><div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a>${icon('chevron-right', 13)}<span>Gift Sets</span></nav><h1>Gift Items &amp; Bundles</h1><p>Thoughtful pairs, made from the actual products in the collection. Sample prices.</p></div></section><section class="merch-container shop-section"><h2 class="sr-only">Gift sets in this collection</h2><div class="product-grid" data-bundle-collection></div></section>`;
    const render = () => { root.querySelector('[data-bundle-collection]').innerHTML = bundles.map(bundle => bundleCard(bundle, { city: store.getState().location?.city, lines: store.getState().cart })).join(''); };
    render(); return store.subscribe(state => updateBundleCards(root, state));
  }
  function mountBundle(root, id) {
    const bundle = getBundle(id); if (!bundle) return () => {};
    root.innerHTML = `<section class="container bundle-page"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a>${icon('chevron-right', 13)}<a href="#bundles">Gift Items &amp; Bundles</a>${icon('chevron-right', 13)}<span>${escapeHTML(bundle.name)}</span></nav><div class="product-layout"><div class="product-main-image">${imageMarkup(bundle.image, bundle.name, 'bundle-preview-image', true)}</div><div>${details(bundle, 'h1')}</div></div></section>`;
    return mountAvailability(root, bundle);
  }
  function openBusiness() {
    overlay.open({ title: 'Thoughtful business gifting.', kind: 'policy', content: `<div class="business-body"><h3 class="business-lead">Useful tech.<br>A thoughtful gesture.</h3><p>Explore the eight curated sets or build a bag from the individual catalogue products. Every set lists its exact components and sample total before you add it.</p><p>This is a working design preview. Bulk quantities are limited by the same illustrative city stock as individual products. No live quote, customization, corporate account or sales team is connected.</p><a class="button button-dark" href="#bundles">Explore gift sets ${icon('arrow-right', 18)}</a><p><button type="button" class="text-link" data-action="open-delivery">Check the proposed delivery areas and fees</button></p></div>` });
  }
  return { renderHome, mountCollection, mountBundle, actions: { 'open-bundle': openBundle, 'add-bundle': addBundle, 'open-business': openBusiness } };
}
