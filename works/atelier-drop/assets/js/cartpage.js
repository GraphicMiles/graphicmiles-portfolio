/* ==========================================================================
   cartpage.js — /cart rendering: line items, quantity, totals, empty state
   ========================================================================== */
(function () {
  'use strict';

  var page = document.querySelector('[data-cart-page]');
  if (!page) return;

  var filled = page.querySelector('[data-cart-filled]');
  var empty = page.querySelector('[data-cart-empty]');
  var linesEl = page.querySelector('[data-cart-rows]');
  var countEl = page.querySelector('[data-cart-total-count]');
  var totalEl = page.querySelector('[data-cart-total]');

  var TRASH = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5"/>' +
    '<path d="M5 5.5l.8 10a1.6 1.6 0 0 0 1.6 1.5h5.2a1.6 1.6 0 0 0 1.6-1.5l.8-10"/>' +
    '<path d="M8.3 8.5v5.2M11.7 8.5v5.2"/></svg>';

  function money(n) {
    return '$' + n.toFixed(2);
  }

  function lineHTML(line) {
    var p = window.DATA.byHandle(line.handle);
    if (!p) return '';
    var price = p.price;
    return '<div class="cart-row" data-line="' + line.handle + '::' + line.size + '">' +
      '<div class="cart-row__media"><a href="product-' + p.handle + '.html">' +
      '<img src="assets/img/' + p.card + '" alt="' + p.title + '" loading="lazy"></a></div>' +
      '<div class="cart-row__info">' +
      '<p class="cart-row__name"><a href="product-' + p.handle + '.html">' + p.title + '</a></p>' +
      '<p class="cart-row__opt">' + line.size + '</p>' +
      '<p class="cart-row__price">' + money(price) + '</p>' +
      '</div>' +
      '<div class="cart-row__qty">' +
      '<div class="qty-box">' +
      '<button type="button" data-line-dec aria-label="Decrease quantity"' + (line.qty <= 1 ? ' disabled' : '') + '>\u2212</button>' +
      '<input type="number" min="1" max="99" value="' + line.qty + '" inputmode="numeric" aria-label="Quantity" data-line-qty>' +
      '<button type="button" data-line-inc aria-label="Increase quantity">+</button>' +
      '</div>' +
      '<button type="button" class="cart-remove" data-line-remove aria-label="Remove ' + p.title + '">' + TRASH + '</button>' +
      '</div>' +
      '<div class="cart-row__total">' + money(price * line.qty) + '</div>' +
      '</div>';
  }

  function render() {
    var lines = window.Cart.lines();
    var has = lines.length > 0;
    filled.hidden = !has;
    empty.hidden = has;
    if (countEl) countEl.textContent = window.Cart.count();
    if (totalEl) totalEl.textContent = money(window.Cart.total()) + ' USD';
    if (!has) {
      linesEl.innerHTML = '';
      return;
    }
    linesEl.innerHTML = lines.map(lineHTML).join('');

    Array.prototype.forEach.call(linesEl.querySelectorAll('.cart-row'), function (row) {
      var parts = row.getAttribute('data-line').split('::');
      var handle = parts[0];
      var size = parts[1];
      var input = row.querySelector('[data-line-qty]');
      var dec = row.querySelector('[data-line-dec]');
      var inc = row.querySelector('[data-line-inc]');

      dec.addEventListener('click', function () {
        var l = current(handle, size);
        if (l) window.Cart.setQty(handle, size, Math.max(0, l.qty - 1));
      });
      inc.addEventListener('click', function () {
        var l = current(handle, size);
        if (l) window.Cart.setQty(handle, size, Math.min(99, l.qty + 1));
      });
      input.addEventListener('change', function () {
        var n = parseInt(input.value, 10);
        if (isNaN(n) || n < 1) n = 1;
        window.Cart.setQty(handle, size, Math.min(99, n));
      });
      row.querySelector('[data-line-remove]').addEventListener('click', function () {
        window.Cart.remove(handle, size);
      });
    });
  }

  function current(handle, size) {
    var lines = window.Cart.lines();
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].handle === handle && lines[i].size === size) return lines[i];
    }
    return null;
  }

  render();
  if (window.Cart && window.Cart.on) window.Cart.on(render);

  var disc = page.querySelector('[data-discount-form]');
  if (disc) {
    disc.addEventListener('submit', function (e) { e.preventDefault(); });
  }
})();
