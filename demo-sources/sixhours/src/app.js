import { createStore } from './state/store.js';
import { cartTotals } from './domain/cart.js';
import { getProduct } from './domain/catalog.js';
import { getBundle } from './domain/bundles.js';
import { locationLabel, policyLabels } from './domain/delivery.js';
import { createOverlay } from './ui/overlay.js';
import { createNavigationState } from './ui/navigation-state.js';
import { createToast } from './ui/toast.js';
import { hydrateIcons, icon } from './ui/icons.js';
import { focusHeading } from './ui/utils.js';
import { createCatalogFeature } from './features/catalog.js';
import { createSearchFeature } from './features/search.js';
import { createCartFeature } from './features/cart.js';
import { createProductFeature } from './features/product.js';
import { createDeliveryFeature } from './features/delivery.js';
import { createCheckoutFeature } from './features/checkout.js';
import { createPoliciesFeature } from './features/policies.js';
import { createNavigationFeature } from './features/navigation.js';
import { createBundlesFeature } from './features/bundles.js';
import { createNewsletterFeature } from './features/newsletter.js';
import { mountExperienceCarousel } from './features/experience.js';
import { mountInformation } from './features/information.js';

hydrateIcons();
document.querySelectorAll('[data-policy]').forEach(element => { if (policyLabels[element.dataset.policy]) element.textContent = policyLabels[element.dataset.policy]; });
const store = createStore();
const overlay = createOverlay();
const navigationState = createNavigationState();
const toast = createToast();
const home = document.querySelector('#home-view');
const routeRoot = document.querySelector('#route-view');
let routeCleanup = () => {};
let initial = true;

function navigate(hash) {
  navigationState.capture();
  overlay.close({ immediate: true, restoreFocus: false });
  if (location.hash === hash || navigationState.push(hash)) renderRoute();
}
const context = { store, overlay, toast, navigate };
const catalog = createCatalogFeature(context);
const cart = createCartFeature(context); context.cart = cart;
const search = createSearchFeature(context);
const product = createProductFeature(context);
const delivery = createDeliveryFeature(context);
const checkout = createCheckoutFeature(context);
const policies = createPoliciesFeature(context);
const navigation = createNavigationFeature(context);
const bundles = createBundlesFeature(context);
const experience = mountExperienceCarousel();
mountInformation();

const actions = {
  ...catalog.actions, ...cart.actions, ...search.actions, ...product.actions, ...delivery.actions,
  ...policies.actions, ...navigation.actions, ...bundles.actions,
  'back-to-top': () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }),
};
function updateHeader(state) {
  const count = cartTotals(state.cart).count;
  document.querySelectorAll('[data-bag-count]').forEach(element => { element.textContent = count; element.hidden = count === 0; });
  document.querySelector('.bag-button').setAttribute('aria-label', `Open bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  document.querySelectorAll('[data-location-label]').forEach(element => { element.textContent = locationLabel(state.location); });
}
store.subscribe(updateHeader); updateHeader(store.getState());

function notFound() {
  routeRoot.innerHTML = `<section class="container empty-state not-found">${icon('search', 36)}<h1>That page isn’t here.</h1><p>Explore the gadget collection or choose a gift set.</p><a class="button button-dark" href="#shop">Shop everyday tech ${icon('arrow-right', 18)}</a></section>`;
}
function renderRoute() {
  const snapshot = navigationState.arrive();
  toast.clear(); overlay.close({ immediate: true, restoreFocus: false });
  routeCleanup(); routeCleanup = () => {}; routeRoot.replaceChildren();
  const hash = location.hash.slice(1) || 'home';
  const [rawPath, queryString = ''] = hash.split('?');
  const parts = rawPath.split('/'); const page = parts[0]; const params = new URLSearchParams(queryString);
  const isHome = page === 'home' || page === 'main';
  home.hidden = !isHome; routeRoot.hidden = isHome; document.body.dataset.route = isHome ? 'home' : page;
  if (isHome) { document.title = 'sixhours | Everyday tech. Less waiting.'; requestAnimationFrame(experience.refresh); }
  else if (page === 'shop' && parts.length <= 2) {
    document.title = 'The collection | sixhours';
    routeCleanup = catalog.mountShop(routeRoot, { category: parts[1] || 'all', query: (params.get('q') || '').slice(0, 100), sort: params.get('sort'), maxPrice: params.get('maxPrice') });
  } else if (page === 'product' && parts.length === 2 && getProduct(parts[1])) {
    document.title = `${getProduct(parts[1]).name} | sixhours`; routeCleanup = product.mountProduct(routeRoot, parts[1]);
  } else if (page === 'bundles' && parts.length === 1) {
    document.title = 'Gift Items & Bundles | sixhours'; routeCleanup = bundles.mountCollection(routeRoot);
  } else if (page === 'bundle' && parts.length === 2 && getBundle(parts[1])) {
    document.title = `${getBundle(parts[1]).name} | sixhours`; routeCleanup = bundles.mountBundle(routeRoot, parts[1]);
  } else if (page === 'checkout' && parts.length === 1) {
    document.title = 'Demo checkout | sixhours'; routeCleanup = checkout.mountCheckout(routeRoot);
  } else if (page === 'demo' && parts.length === 2) {
    document.title = 'Your demo summary | sixhours'; routeCleanup = checkout.mountConfirmation(routeRoot, parts[1]);
  } else if (page === 'promise' && parts.length === 1) {
    document.title = 'The six-hour promise | sixhours'; routeCleanup = policies.mountPromise(routeRoot);
  } else { document.title = 'Page not found | sixhours'; notFound(); }
  document.querySelectorAll('.primary-nav [aria-current]').forEach(element => element.removeAttribute('aria-current'));
  [...document.querySelectorAll('.primary-nav a')].find(link => link.getAttribute('href') === `#${rawPath}`)?.setAttribute('aria-current', 'page');
  if (!initial && !navigationState.restore(document.body, snapshot)) { window.scrollTo({ top: 0, behavior: 'instant' }); focusHeading(isHome ? home : routeRoot); }
  initial = false;
}

document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]');
  if (action && !action.disabled) {
    const handler = actions[action.dataset.action];
    if (handler) { event.preventDefault(); handler(action, event); }
    return;
  }
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.getAttribute('href') === '#main') { event.preventDefault(); document.querySelector('#main').setAttribute('tabindex', '-1'); document.querySelector('#main').focus(); return; }
  event.preventDefault(); navigate(link.getAttribute('href'));
});
window.addEventListener('hashchange', renderRoute);
window.addEventListener('scroll', () => { document.querySelector('.back-to-top').hidden = window.scrollY < 700; }, { passive: true });
document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search.openSearch(); } });
document.addEventListener('error', event => {
  if (!(event.target instanceof HTMLImageElement)) return;
  const image = event.target;
  if (image.classList.contains('product-alternate')) { image.parentElement.classList.remove('has-alternate'); image.remove(); return; }
  image.hidden = true;
  if (!image.parentElement.querySelector('.image-fallback')) { const fallback = document.createElement('span'); fallback.className = 'image-fallback'; fallback.textContent = 'Image unavailable'; image.parentElement.append(fallback); }
}, true);
document.querySelector('#year').textContent = new Date().getFullYear();
catalog.renderHome(); bundles.renderHome(); renderRoute();
createNewsletterFeature(context);
document.documentElement.dataset.ready = 'true';
