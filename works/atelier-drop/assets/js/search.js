/* ==========================================================================
   search.js — /search?q=… : query filtering on top of the product grid
   ========================================================================== */
(function () {
  'use strict';

  var page = document.querySelector('[data-search-page]');
  if (!page) return;

  var input = page.querySelector('[data-search-input]');
  var note = page.querySelector('[data-search-note]');
  var allHead = page.querySelector('[data-search-all]');
  var grid = page.querySelector('[data-product-grid]');
  var reset = page.querySelector('[data-search-reset]');

  /* terms per handle, so a query like "hoodie" also finds the sweatshirts,
     mirroring the storefront's tag-based search */
  var TERMS = {
    'tatum-5-orbit-copy': 'air jordan 12 retro shoe sneaker basketball',
    'air-jordan-12-retro-copy': 'luka 5 shoe sneaker basketball',
    'tatum-5-orbit': 'tatum 5 orbit shoe sneaker basketball',
    'blazzer': 'blazzer blazer jacket coat tailoring',
    'hoodie': 'hoodie hoodies sweatshirt sweater pullover grafik',
    'hoodie-black': 'hoodie hoodies sweatshirt sweater pullover black cryptic',
    'sweatshirt': 'hoodie sweatshirt sweater crewneck ecru',
    'sweatshirt-plus': 'hoodie sweatshirt sweater verde green',
    'tshirt': 'tshirt tee shirt reign black'
  };

  var q = (new URLSearchParams(window.location.search).get('q') || '').trim();
  if (input) input.value = q;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-grid__item'));

  function termsOf(li) {
    var card = li.querySelector('.product-card');
    var handle = card ? card.getAttribute('data-handle') : '';
    var name = (card && card.querySelector('.product-card__title').textContent) || '';
    return (name + ' ' + (TERMS[handle] || '')).toLowerCase();
  }

  cards.forEach(function (li) {
    li._terms = termsOf(li);
    li._title = li.querySelector('.product-card__title').textContent.trim();
  });

  var words = q.toLowerCase().split(/\s+/).filter(Boolean);

  function matches(li) {
    if (!words.length) return true;
    return words.every(function (w) { return li._terms.indexOf(w) !== -1; });
  }

  /* relevance: title hits first (catalogue order), then keyword hits by the
     specificity of the title (longer titles first, as the storefront does) */
  function rank(li) {
    var titleHit = words.length && words.every(function (w) { return li._title.toLowerCase().indexOf(w) !== -1; });
    return titleHit ? 0 : 1;
  }

  var order = cards.slice();
  if (words.length) {
    order = cards.slice().sort(function (a, b) {
      var ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      if (ra === 1) return b._title.length - a._title.length;
      return cards.indexOf(a) - cards.indexOf(b);
    });
    order.forEach(function (li) { grid.appendChild(li); });
  }

  window.CollFilter = function (li) { return matches(li); };

  /* keep <title>/canonical/og in step with the query, like the live store */
  var SITE_TITLE = 'Nikey | Password: 1';
  function syncHead(n) {
    var label = words.length
      ? 'Search: ' + n + (n === 1 ? ' result' : ' results') + ' found for "' + q + '"'
      : 'Search';
    document.title = label + ' \u2013 ' + SITE_TITLE;
    var canon = document.querySelector('link[rel="canonical"]');
    var base = 'https://nike-makknzjs.myshopify.com/search';
    var href = words.length ? base + '?q=' + encodeURIComponent(q) : base;
    if (canon) canon.setAttribute('href', href);
    ['og:title', 'twitter:title'].forEach(function (k) {
      var m = document.querySelector('meta[property="' + k + '"],meta[name="' + k + '"]');
      if (m) m.setAttribute('content', label);
    });
    ['og:url'].forEach(function (k) {
      var m = document.querySelector('meta[property="' + k + '"]');
      if (m) m.setAttribute('content', href);
    });
  }

  function sync() {
    var shown = cards.filter(matches).length;
    syncHead(shown);
    var isEmpty = words.length > 0 && shown === 0;
    page.classList.toggle('search-page--empty', isEmpty);
    if (note) {
      note.hidden = !isEmpty;
      note.textContent = 'No results found for "' + q + '". Check the spelling or use a different word or phrase.';
    }
    if (allHead) allHead.hidden = !isEmpty;
    if (typeof window.CollectionApply === 'function') window.CollectionApply();
  }

  sync();

  /* typing in the field filters instantly and keeps the URL in sync */
  if (input) {
    var t = null;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        q = input.value.trim();
        words = q.toLowerCase().split(/\s+/).filter(Boolean);
        var url = q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html';
        history.replaceState(null, '', url);
        sync();
      }, 160);
    });
    var form = page.querySelector('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        q = input.value.trim();
        words = q.toLowerCase().split(/\s+/).filter(Boolean);
        history.replaceState(null, '', q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html');
        sync();
      });
    }
  }

  if (reset) {
    reset.addEventListener('click', function (e) {
      e.preventDefault();
      if (input) input.value = '';
      q = '';
      words = [];
      history.replaceState(null, '', 'search.html');
      sync();
    });
  }
})();
