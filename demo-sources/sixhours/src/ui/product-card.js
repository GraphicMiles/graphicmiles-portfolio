import { minPrice, getProduct } from '../domain/catalog.js';
import { money, escapeHTML, imageMarkup } from './utils.js';
import { productAvailability } from '../domain/cart.js';
import { icon } from './icons.js';
import { sampleRating } from './rating.js';

function purchaseState(product, lines, city) {
  const stock = productAvailability(lines, product.id, city);
  return { disabled: stock.remaining === 0, label: stock.reason === 'city' ? 'Unavailable' : stock.reason === 'bag' ? 'Bag limit reached' : product.variants.length > 1 ? 'Select options' : 'Add to bag', message: stock.reason === 'city' ? 'No sample stock in your selected city.' : stock.reason === 'bag' ? `Your bag has reached the preview limit of ${stock.limit} for this product.` : '' };
}

export function productCard(product, { city = null, lines = [] } = {}) {
  const purchase = purchaseState(product, lines, city);
  const options = product.variants.length > 1;
  return `<article class="product-card" data-product-card="${product.id}">
    <div class="product-media">
      <a class="product-photo ${product.images.length > 1 ? 'has-alternate' : ''}" href="#product/${product.id}" aria-label="View ${escapeHTML(product.name)}">
        ${imageMarkup(product.images[0], `${product.name} in ${product.finish}`, 'product-primary')}
        ${product.images[1] ? imageMarkup(product.images[1], '', 'product-alternate') : ''}
      </a>
      ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ''}
      <button type="button" class="quick-view icon-button" data-action="open-quickview" data-product="${product.id}" aria-label="Quick view ${escapeHTML(product.name)}">${icon('eye', 19)}</button>
    </div>
    <div class="product-info"><h3><a href="#product/${product.id}">${escapeHTML(product.cardName || product.name)}</a></h3>${sampleRating()}<p class="product-price">${options ? '<span class="from-label">From </span>' : ''}${money(minPrice(product))}</p></div>
    <button type="button" class="card-add" data-action="${options ? 'open-quickview' : 'quick-add'}" data-product="${product.id}" title="${escapeHTML(purchase.message)}" ${purchase.disabled ? 'disabled' : ''}>${purchase.label}</button>
  </article>`;
}

/** Availability updates must not replace images, links or a keyboard user's current card. */
export function updateProductCards(root, state) {
  root.querySelectorAll('[data-product-card]').forEach(card => {
    const product = getProduct(card.dataset.productCard); if (!product) return;
    const purchase = purchaseState(product, state.cart, state.location?.city);
    const button = card.querySelector('.card-add');
    button.disabled = purchase.disabled; button.textContent = purchase.label; button.title = purchase.message;
  });
}
