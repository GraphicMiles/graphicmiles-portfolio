import { findProducts, minPrice } from '../domain/catalog.js';
import { icon } from '../ui/icons.js';
import { escapeHTML, money, imageMarkup, plural } from '../ui/utils.js';

export function createSearchFeature({ overlay, navigate }) {
  function openSearch() {
    overlay.open({ title: 'Find your everyday favourite.', kind: 'search', content: `<form class="drawer-search-form" role="search"><label for="drawer-search" class="sr-only">Search all gadgets</label><div class="search-input-wrap">${icon('search', 21)}<input id="drawer-search" name="query" type="search" maxlength="100" placeholder="What are you looking for?" autocomplete="off" data-initial-focus><button type="submit" class="icon-button" aria-label="See all search results">${icon('arrow-right', 21)}</button></div></form><div class="search-suggestions"><p class="eyebrow">A few good places to start</p><div class="suggestion-chips"><button type="button" data-suggestion="iPhone">iPhone</button><button type="button" data-suggestion="MacBook">MacBook</button><button type="button" data-suggestion="AirPods">AirPods</button><button type="button" data-suggestion="Belkin">Belkin</button></div></div><p class="search-status fine-print" aria-live="polite"></p><div class="search-results"></div>`, onMount: root => {
      const input = root.querySelector('input');
      const results = root.querySelector('.search-results');
      const status = root.querySelector('.search-status');
      const render = () => {
        const query = input.value.trim();
        const matches = findProducts({ query });
        status.textContent = query ? `${plural(matches.length, 'match', 'matches')}${matches.length > 6 ? ', showing the first 6' : ''}` : 'A few everyday favourites';
        results.innerHTML = matches.length ? matches.slice(0, 6).map(product => `<a class="search-result" href="#product/${product.id}"><span class="search-result-image">${imageMarkup(product.images[0], product.name)}</span><span><span class="product-brand">${escapeHTML(product.brand)}</span><strong>${escapeHTML(product.name)}</strong><span class="fine-print">${product.variants.length > 1 ? 'From ' : ''}${money(minPrice(product))}</span></span>${icon('arrow-up-right', 17)}</a>`).join('') : `<div class="empty-state compact">${icon('search', 28)}<h3>Nothing here just yet.</h3><p>Try “Samsung”, “audio”, or “charger”.</p><button class="text-link" type="button" data-clear-search>Clear search</button></div>`;
      };
      const submit = event => { event.preventDefault(); navigate(`#shop${input.value.trim() ? `?q=${encodeURIComponent(input.value.trim())}` : ''}`); };
      const click = event => {
        const suggestion = event.target.closest('[data-suggestion]');
        if (suggestion) { input.value = suggestion.dataset.suggestion; render(); input.focus(); }
        if (event.target.closest('[data-clear-search]')) { input.value = ''; render(); input.focus(); }
      };
      input.addEventListener('input', render); root.querySelector('form').addEventListener('submit', submit); root.addEventListener('click', click); render();
      return () => { input.removeEventListener('input', render); root.removeEventListener('click', click); };
    } });
  }
  return { openSearch, actions: { 'open-search': openSearch } };
}
