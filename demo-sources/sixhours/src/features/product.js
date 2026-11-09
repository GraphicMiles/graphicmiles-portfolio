import { getProduct, products, categories } from '../domain/catalog.js';
import { MAX_QUANTITY, productAvailability } from '../domain/cart.js';
import { quoteDelivery, getCity, policyLabels } from '../domain/delivery.js';
import { escapeHTML, money, imageMarkup } from '../ui/utils.js';
import { icon } from '../ui/icons.js';
import { productCard, updateProductCards } from '../ui/product-card.js';
import { createGalleryFeature } from './gallery.js';

export function createProductFeature(context) {
  const { store, overlay } = context;
  const gallery = createGalleryFeature(context);
  function detailsMarkup(product, quick = false) {
    const heading = quick ? 'h2' : 'h1';
    return `<form class="product-config" data-product-config="${product.id}"><${heading}>${escapeHTML(product.name)}</${heading}><p class="detail-price" data-price>${money(product.variants[0].price)}</p><p class="fine-print price-note">Illustrative price. Not a live offer.</p><p class="product-description">${escapeHTML(product.description)}</p><div class="finish-row"><span>Finish</span><span class="finish-swatch" style="--swatch:${product.swatch}"></span><strong>${escapeHTML(product.finish)}</strong></div><fieldset class="variant-fieldset"><legend>${product.variants.length > 1 ? 'Choose your configuration' : 'Configuration'}</legend><div class="variant-options">${product.variants.map((variant, index) => `<label class="variant-chip"><input class="sr-only" type="radio" name="variant" value="${variant.id}" ${index === 0 ? 'checked' : ''}><span>${escapeHTML(variant.label)}</span></label>`).join('')}</div></fieldset><div class="product-purchase-row"><div class="quantity-control"><button type="button" data-product-step="-1" aria-label="Decrease quantity" disabled>${icon('minus', 16)}</button><output data-product-quantity aria-live="polite">1</output><button type="button" data-product-step="1" aria-label="Increase quantity">${icon('plus', 16)}</button></div><button type="submit" class="button button-dark" data-product-add>Add to bag ${icon('plus', 19)}</button></div><p class="fine-print product-stock-note" data-product-stock role="status"></p><div class="product-delivery-note">${icon('truck', 19)}<div><p data-product-window>Choose your area for a delivery window.</p><button type="button" class="text-link" data-action="open-delivery">Check or change your area</button></div></div><p class="fine-print detail-preview-note">Working preview. No real orders, payment, or delivery.</p>${quick ? `<a class="inline-link full-details-link" href="#product/${product.id}">A closer look at the details ${icon('arrow-right', 17)}</a>` : ''}</form>`;
  }
  function mountConfig(root, product) {
    let variant = product.variants[0]; let quantity = 1;
    const form = root.querySelector('form');
    function update() {
      const state = store.getState();
      const stock = productAvailability(state.cart, product.id, state.location?.city);
      quantity = Math.min(quantity, Math.max(1, stock.remaining));
      form.querySelector('[data-price]').textContent = money(variant.price);
      form.querySelector('[data-product-quantity]').textContent = quantity;
      form.querySelector('[data-product-step="-1"]').disabled = quantity <= 1;
      form.querySelector('[data-product-step="1"]').disabled = quantity >= stock.remaining;
      const add = form.querySelector('[data-product-add]');
      add.disabled = stock.remaining === 0;
      add.innerHTML = stock.reason === 'city' ? 'Unavailable' : stock.reason === 'bag' ? 'Bag at limit' : `Add to bag ${icon('plus', 19)}`;
      const quote = quoteDelivery(state.location, state.cart);
      form.querySelector('[data-product-window]').textContent = stock.reason === 'city' ? `No demo stock in ${getCity(state.location.city).label}.` : stock.reason === 'bag' ? `Your bag already contains ${stock.inBag}; the preview limit is ${stock.limit}${state.location ? ' in this city' : ''}.` : quote.kind === 'stock' ? 'Adjust your bag to match the sample city stock.' : quote.eligible ? quote.headline : 'Choose your area for a delivery window.';
      form.querySelector('[data-product-stock]').textContent = stock.inBag && stock.remaining ? `${stock.remaining} more can be added; ${stock.inBag} already in your bag.` : '';

    }
    const change = event => { if (event.target.name === 'variant') { variant = product.variants.find(option => option.id === event.target.value) || product.variants[0]; update(); } };
    const click = event => { const step = event.target.closest('[data-product-step]'); if (step) { quantity = Math.min(MAX_QUANTITY, Math.max(1, quantity + Number(step.dataset.productStep))); update(); } };
    const submit = event => { event.preventDefault(); if (!form.querySelector('[data-product-add]').disabled) context.cart.add(product.id, variant.id, quantity); };
    form.addEventListener('change', change); form.addEventListener('click', click); form.addEventListener('submit', submit);
    const unsubscribe = store.subscribe(update); update();
    return () => { unsubscribe(); form.removeEventListener('change', change); form.removeEventListener('click', click); form.removeEventListener('submit', submit); };
  }
  function openQuickview(button) {
    const product = getProduct(button.dataset.product); if (!product) return;
    overlay.open({ title: 'A closer look.', kind: 'quickview', content: `<div class="quickview-layout"><a class="quickview-image" href="#product/${product.id}" aria-label="View full ${escapeHTML(product.name)} details">${imageMarkup(product.images[0], `${product.name} in ${product.finish}`, '', true)}</a><div class="quickview-details">${detailsMarkup(product, true)}</div></div>`, onMount: root => mountConfig(root, product) });
  }
  function mountProduct(root, id) {
    const product = getProduct(id);
    if (!product) return null;
    const related = products.filter(item => item.category === product.category && item.id !== product.id);
    const suggestions = [...related, ...products.filter(item => item.id !== product.id && !related.includes(item))].slice(0, 4);
    root.innerHTML = `<section class="container product-page"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a>${icon('chevron-right', 13)}<a href="#shop/${product.category}">${escapeHTML(categories.find(category => category.id === product.category)?.label)}</a>${icon('chevron-right', 13)}<span>${escapeHTML(product.name)}</span></nav><div class="product-layout"><div class="product-gallery"><button type="button" class="product-main-image" data-gallery-open aria-label="Enlarge ${escapeHTML(product.name)} photograph">${imageMarkup(product.images[0], `${product.name} in ${product.finish}`, '', true)}</button><div class="product-thumbnails" role="group" aria-label="Product images">${product.images.map((src, index) => `<button type="button" data-gallery-index="${index}" aria-label="Show product view ${index + 1}" aria-pressed="${index === 0}" class="${index === 0 ? 'is-active' : ''}">${imageMarkup(src, '')}</button>`).join('')}</div><p class="fine-print gallery-caption">Product photography. Lifestyle photographs elsewhere are illustrative.</p></div><div class="product-detail-column">${detailsMarkup(product)}<div class="product-accordions faq-list"><details open><summary>A little more detail ${icon('plus', 17)}</summary><dl class="spec-list">${product.specs.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl></details><details><summary>What’s in the box? ${icon('plus', 17)}</summary><p>${escapeHTML(product.inBox)}</p></details><details><summary>Delivery, returns & the preview ${icon('plus', 17)}</summary><p>Supported Lagos and Abuja areas only. Confirmations between ${policyLabels.betweenWindow} are eligible for a six-hour window, subject to illustrative stock. This is not a live store. <button class="text-link" type="button" data-action="open-promise">Read the delivery conditions.</button></p><p>No actual warranty or returns service is attached to this demo. <button class="text-link" type="button" data-action="open-returns">Read the preview policy.</button></p></details></div></div></div></section><section class="container related-section"><div class="section-heading"><div><p class="eyebrow">Good things go together</p><h2>A little more to love.</h2></div><a class="inline-link" href="#shop">Explore all gadgets ${icon('arrow-right', 18)}</a></div><div class="product-grid">${suggestions.map(item => productCard(item, { city: store.getState().location?.city, lines: store.getState().cart })).join('')}</div></section>`;
    const cleanup = mountConfig(root.querySelector('.product-detail-column'), product);
    const unsubscribeCards = store.subscribe(state => updateProductCards(root.querySelector('.related-section'), state));
    let timer; let currentImage = 0;
    const click = event => {
      if (event.target.closest('[data-gallery-open]')) { gallery.open(product, currentImage); return; }
      const button = event.target.closest('[data-gallery-index]'); if (!button) return;
      const index = Number(button.dataset.galleryIndex); currentImage = index; const image = root.querySelector('.product-main-image img');
      root.querySelectorAll('[data-gallery-index]').forEach(item => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
      clearTimeout(timer);
      const replace = () => { image.src = product.images[index]; image.alt = `${product.name}, view ${index + 1}, ${product.finish}`; image.classList.remove('is-changing'); };
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) replace();
      else { image.classList.add('is-changing'); timer = setTimeout(replace, 180); }
    };
    root.addEventListener('click', click);
    return () => { cleanup(); unsubscribeCards(); clearTimeout(timer); root.removeEventListener('click', click); };
  }
  return { mountProduct, openQuickview, actions: { 'open-quickview': openQuickview } };
}
