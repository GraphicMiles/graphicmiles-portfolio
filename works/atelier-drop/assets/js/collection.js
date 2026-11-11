/* ==========================================================================
   collection.js — Products page: gallery hover, quick add, filters, sort,
   grid/list toggle.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.querySelector('[data-product-grid]');
  if (!grid) return;

  /* ---------- card galleries: hover walks the media ---------- */
  grid.querySelectorAll('[data-product-card]').forEach(function (card) {
    var count = +card.querySelector('.card-gallery').getAttribute('data-media-count') || 1;
    if (count < 2) return;
    var imgs = card.querySelectorAll('.card-gallery__img');
    var dots = card.querySelectorAll('.card-gallery__dot');
    var i = 0, timer = null;
    function show(n) {
      i = n;
      imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === n); });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === n); });
    }
    card.addEventListener('pointerenter', function () {
      timer = setInterval(function () { show((i + 1) % count); }, 900);
    });
    card.addEventListener('pointerleave', function () {
      clearInterval(timer);
      show(0);
    });
    dots.forEach(function (d, k) {
      d.addEventListener('pointerenter', function (e) { e.stopPropagation(); clearInterval(timer); show(k); });
    });
  });

  /* ---------- quick add ---------- */
  var sizeFor = {};
  grid.querySelectorAll('[data-quick-add]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var handle = btn.getAttribute('data-handle');
      var p = (window.DATA ? DATA.products : []).filter(function (x) { return x.handle === handle; })[0];
      if (!p) return;
      var size = sizeFor[handle] || p.sizes[0];
      sizeFor[handle] = p.sizes[(p.sizes.indexOf(size) + 1) % p.sizes.length];
      if (window.Cart) {
        Cart.add(handle, size, 1);
        Cart.open();
      }
      btn.classList.add('is-added');
      setTimeout(function () { btn.classList.remove('is-added'); }, 1200);
    });
  });

  /* ---------- disclosures ---------- */
  var allDetails = Array.prototype.slice.call(document.querySelectorAll('[data-disclosure]'));
  allDetails.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      allDetails.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-disclosure]')) allDetails.forEach(function (d) { d.open = false; });
  });

  /* ---------- filtering + sorting ---------- */
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-grid__item'));
  var countLabel = document.querySelector('[data-count-label]');
  var empty = document.querySelector('[data-empty]');
  var state = { price: [], inStock: false };

  cards.forEach(function (li) {
    var card = li.querySelector('.product-card');
    li._name = card.querySelector('.product-card__title').textContent.trim();
    li._price = parseFloat(card.querySelector('.product-card__price').textContent.replace(/[^0-9.]/g, '')) || 0;
    li._idx = cards.indexOf(li);
  });

  function apply() {
    var shown = 0;
    cards.forEach(function (li) {
      var ok = true;
      if (state.price.length) {
        ok = state.price.some(function (p) { return Math.round(li._price) === p; });
      }
      if (ok && typeof window.CollFilter === 'function') ok = window.CollFilter(li);
      li.hidden = !ok;
      if (ok) shown++;
    });
    if (countLabel) countLabel.textContent = shown + (shown === 1 ? ' item' : ' items');
    if (empty) empty.hidden = shown !== 0;
  }

  grid.querySelectorAll('[data-filter]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var kind = inp.getAttribute('data-filter');
      if (inp.checked) {
        if (kind === 'in') state.inStock = true;
        else state.price.push(parseInt(kind.replace('p', ''), 10));
      } else {
        if (kind === 'in') state.inStock = false;
        else state.price = state.price.filter(function (p) { return p !== parseInt(kind.replace('p', ''), 10); });
      }
      apply();
    });
  });

  document.querySelectorAll('[data-sort]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-sort');
      document.querySelectorAll('[data-sort]').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      var label = document.querySelector('[data-sort-label]');
      if (label) label.childNodes[0].nodeValue = 'Sort ';
      var sorted = cards.slice().sort(function (a, b) {
        switch (mode) {
          case 'Alphabetically, A-Z': return a._name.localeCompare(b._name);
          case 'Alphabetically, Z-A': return b._name.localeCompare(a._name);
          case 'Price, low to high': return a._price - b._price;
          case 'Price, high to low': return b._price - a._price;
          case 'Date, old to new': return a._idx - b._idx;
          case 'Date, new to old': return b._idx - a._idx;
          default: return a._idx - b._idx;
        }
      });
      sorted.forEach(function (li) { grid.appendChild(li); });
      document.querySelectorAll('[data-disclosure]').forEach(function (d) { d.open = false; });
    });
  });

  window.CollectionApply = apply;

  /* ---------- grid / list ---------- */
  document.querySelectorAll('[data-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-view');
      document.querySelectorAll('[data-view]').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      grid.classList.toggle('product-grid--list', mode === 'list');
    });
  });
})();
