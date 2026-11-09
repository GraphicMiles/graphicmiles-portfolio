import { bundlePrice, bundleAvailability, getBundle } from '../domain/bundles.js';
import { escapeHTML, imageMarkup, money } from './utils.js';
import { icon } from './icons.js';
import { sampleRating } from './rating.js';
const buttonLabel = availability => availability.available ? 'View set' : availability.reason === 'city' ? 'Unavailable' : 'Adjust your bag';
export function bundleCard(bundle, { city = null, lines = [] } = {}) {
  const availability = bundleAvailability(lines, bundle.id, city);
  return `<article class="product-card bundle-card" data-bundle-card="${bundle.id}"><div class="product-media"><a class="product-photo" href="#bundle/${bundle.id}" aria-label="Explore ${escapeHTML(bundle.name)}">${imageMarkup(bundle.image, `${bundle.name}, two actual catalogue products`)}</a><button type="button" class="quick-view icon-button" data-action="open-bundle" data-bundle="${bundle.id}" aria-label="Quick view ${escapeHTML(bundle.name)}">${icon('eye', 19)}</button></div><div class="product-info"><h3><a href="#bundle/${bundle.id}">${escapeHTML(bundle.name)}</a></h3>${bundle.sampleStars ? sampleRating() : ''}<p class="product-price">${money(bundlePrice(bundle))}</p></div><button type="button" class="card-add" data-action="open-bundle" data-bundle="${bundle.id}" title="${escapeHTML(availability.message)}" ${!availability.available ? 'disabled' : ''}>${buttonLabel(availability)}</button></article>`;
}

export function updateBundleCards(root, state) {
  root.querySelectorAll('[data-bundle-card]').forEach(card => {
    const bundle = getBundle(card.dataset.bundleCard); if (!bundle) return;
    const availability = bundleAvailability(state.cart, bundle.id, state.location?.city);
    const button = card.querySelector('.card-add');
    button.disabled = !availability.available; button.textContent = buttonLabel(availability); button.title = availability.message;
  });
}
