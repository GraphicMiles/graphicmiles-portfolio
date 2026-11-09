import { categories, findProducts } from '../domain/catalog.js';
import { productCard, updateProductCards } from '../ui/product-card.js';
import { icon } from '../ui/icons.js';
import { escapeHTML, plural } from '../ui/utils.js';
import { mountSelect } from '../ui/select.js';

export function createCatalogFeature({ store }) {
  function renderHome() {
    const products = findProducts();
    document.querySelector('#home-products').innerHTML = products.map(product => productCard(product, { city: store.getState().location?.city, lines: store.getState().cart })).join('');
    document.querySelector('#home-results-status').textContent = `${plural(products.length, 'gadget')} shown. Prices, stock and stars are illustrative.`;
  }
  store.subscribe(state => updateProductCards(document.querySelector('#home-products'), state));

  function mountShop(root, route) {
    let category = categories.some(item => item.id === route.category) ? route.category : 'all';
    let query = route.query || '';
    let sort = ['featured', 'price-asc', 'price-desc', 'name'].includes(route.sort) ? route.sort : 'featured';
    let maxPrice = ['100000', '300000', '1000000'].includes(String(route.maxPrice)) ? Number(route.maxPrice) : Infinity;
    root.innerHTML = `<section class="shop-intro"><div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a>${icon('chevron-right', 13)}<span>The collection</span></nav><h1>All gadgets</h1><p>Everyday tech, thoughtfully chosen. All prices and stock are illustrative.</p></div></section><section class="shop-section container" aria-label="Gadget collection"><div class="shop-toolbar"><div class="collection-tabs" role="group" aria-label="Product categories">${categories.map(item => `<button type="button" data-shop-category="${item.id}" aria-pressed="${item.id === category}">${escapeHTML(item.label)}</button>`).join('')}</div></div><div class="shop-filter-row"><p class="results-count" aria-live="polite"></p><div class="shop-filters"><button type="button" class="filter-toggle" data-filter-toggle aria-expanded="false" aria-controls="collection-filter-panel">Filter ${icon('filter', 18)}</button><div data-sort-select></div></div></div><div class="collection-filter-panel" id="collection-filter-panel" hidden><form class="shop-search" role="search"><label class="sr-only" for="shop-search-input">Search this collection</label>${icon('search', 20)}<input id="shop-search-input" type="search" value="${escapeHTML(query)}" placeholder="Search the collection" autocomplete="off" maxlength="100"><button class="inline-link" type="submit">Search ${icon('arrow-right', 17)}</button></form><div data-price-select></div></div><div class="product-grid" data-shop-grid></div></section>`;
    const title = root.querySelector('h1');
    const grid = root.querySelector('[data-shop-grid]');
    const input = root.querySelector('input');
    const toggle = root.querySelector('[data-filter-toggle]');
    const panel = root.querySelector('.collection-filter-panel');
    function render() {
      const matches = findProducts({ category, query, sort, maxPrice });
      title.textContent = category === 'all' ? 'All gadgets' : categories.find(item => item.id === category).label;
      root.querySelector('.results-count').textContent = `${plural(matches.length, 'gadget')}${query ? ` for “${query}”` : ''}`;
      root.querySelectorAll('[data-shop-category]').forEach(button => { const selected = button.dataset.shopCategory === category; button.classList.toggle('is-active', selected); button.setAttribute('aria-pressed', String(selected)); });
      grid.innerHTML = matches.length ? matches.map(product => productCard(product, { city: store.getState().location?.city, lines: store.getState().cart })).join('') : `<div class="empty-state">${icon('search', 32)}<h2>No matches, just yet.</h2><p>Try a different search or give your filters a little room.</p><button class="button button-dark" type="button" data-reset-shop>Reset search &amp; filters ${icon('reset', 17)}</button></div>`;
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (sort !== 'featured') params.set('sort', sort);
      if (maxPrice !== Infinity) params.set('maxPrice', String(maxPrice));
      const hash = `#shop${category !== 'all' ? `/${category}` : ''}${params.size ? `?${params}` : ''}`;
      if (location.hash !== hash) { try { history.replaceState(history.state, '', hash); } catch { /* Opaque file viewers may block history replacement. */ } }
    }
    const priceSelect = mountSelect(root.querySelector('[data-price-select]'), { label: 'Filter by price', value: maxPrice === Infinity ? 'all' : String(maxPrice), options: [{ value: 'all', label: 'All prices' }, { value: '100000', label: 'Up to ₦100,000' }, { value: '300000', label: 'Up to ₦300,000' }, { value: '1000000', label: 'Up to ₦1,000,000' }], onChange: value => { maxPrice = value === 'all' ? Infinity : Number(value); render(); } });
    const sortSelect = mountSelect(root.querySelector('[data-sort-select]'), { label: 'Sort products', value: sort, options: [{ value: 'featured', label: 'Default sorting' }, { value: 'price-asc', label: 'Price: low to high' }, { value: 'price-desc', label: 'Price: high to low' }, { value: 'name', label: 'Name: A to Z' }], onChange: value => { sort = value; render(); } });
    const onInput = () => { query = input.value.slice(0, 100); render(); };
    const onSubmit = event => { event.preventDefault(); onInput(); };
    const onClick = event => {
      const categoryButton = event.target.closest('[data-shop-category]');
      if (categoryButton) { category = categoryButton.dataset.shopCategory; render(); }
      if (event.target.closest('[data-filter-toggle]')) { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); }
      if (event.target.closest('[data-reset-shop]')) { category = 'all'; query = ''; input.value = ''; maxPrice = Infinity; sort = 'featured'; priceSelect.setValue('all'); sortSelect.setValue('featured'); panel.hidden = false; toggle.setAttribute('aria-expanded', 'true'); render(); input.focus(); }
    };
    root.querySelector('form').addEventListener('submit', onSubmit); input.addEventListener('input', onInput); root.addEventListener('click', onClick);
    const unsubscribe = store.subscribe(state => updateProductCards(grid, state));
    render();
    return () => { unsubscribe(); priceSelect.destroy(); sortSelect.destroy(); root.removeEventListener('click', onClick); input.removeEventListener('input', onInput); root.querySelector('form')?.removeEventListener('submit', onSubmit); };
  }
  return { renderHome, mountShop, actions: {} };
}
