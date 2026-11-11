/* ==========================================================================
   cart.js — local bag (localStorage), drawer rendering, header badge
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'nikey.cart.v1';
  var listeners = [];

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function write(lines) {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch (e) {}
    listeners.forEach(function (fn) {
      fn(lines);
    });
  }

  function keyOf(l) {
    return l.handle + '::' + l.size;
  }

  function add(handle, size, qty, opts) {
    opts = opts || {};
    var lines = read();
    var k = handle + '::' + size;
    var found = null;
    for (var i = 0; i < lines.length; i++) if (keyOf(lines[i]) === k) found = lines[i];
    if (found) {
      found.qty += qty || 1;
    } else {
      lines.push({ handle: handle, size: size, qty: qty || 1, bundle: opts.bundle || false });
    }
    write(lines);
    document.dispatchEvent(new CustomEvent('cart:add', { detail: { handle: handle, size: size, qty: qty || 1 } }));
  }

  function addMany(items) {
    var lines = read();
    items.forEach(function (it) {
      var k = it.handle + '::' + it.size;
      var found = null;
      for (var i = 0; i < lines.length; i++) if (keyOf(lines[i]) === k) found = lines[i];
      if (found) found.qty += it.qty || 1;
      else lines.push({ handle: it.handle, size: it.size, qty: it.qty || 1, bundle: !!it.bundle });
    });
    write(lines);
    document.dispatchEvent(new CustomEvent('cart:add', { detail: { bundle: true } }));
  }

  function setQty(handle, size, qty) {
    var lines = read();
    for (var i = 0; i < lines.length; i++) {
      if (keyOf(lines[i]) === handle + '::' + size) {
        if (qty <= 0) lines.splice(i, 1);
        else lines[i].qty = qty;
        break;
      }
    }
    write(lines);
  }

  function remove(handle, size) {
    setQty(handle, size, 0);
  }

  function count() {
    return read().reduce(function (n, l) {
      return n + l.qty;
    }, 0);
  }

  function total() {
    return read().reduce(function (n, l) {
      var p = DATA.byHandle(l.handle);
      return n + (p ? p.price * l.qty : 0);
    }, 0);
  }

  /* ---------- drawer ---------- */
  function buildDrawer() {
    var el = document.querySelector('[data-cart-drawer]');
    if (!el) return;
    el.innerHTML =
      '<div class="cart-drawer__backdrop" data-cart-close></div>' +
      '<aside class="cart-drawer__panel" role="dialog" aria-modal="true" aria-label="Shopping bag">' +
      '<button class="cart-drawer__close" type="button" aria-label="Close bag" data-cart-close>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<div class="cart-drawer__body" data-cart-body></div>' +
      '<div class="cart-foot" data-cart-foot hidden></div>' +
      '</aside>';
  }

  function renderDrawer() {
    var body = document.querySelector('[data-cart-body]');
    var foot = document.querySelector('[data-cart-foot]');
    if (!body || !foot) return;
    var lines = read();
    if (!lines.length) {
      body.innerHTML =
        '<div class="cart-empty">' +
        '<div class="cart-empty__title">Your cart is empty</div>' +
        '<p class="cart-empty__note">Have an account? <a href="#" data-noop>Log in</a> to check out faster.</p>' +
        '<a class="cart-empty__cta" href="collections.html">Continue shopping</a>' +
        '</div>';
      foot.hidden = true;
      foot.innerHTML = '';
      return;
    }
    var html = '<ul class="cart-lines">';
    lines.forEach(function (l) {
      var p = DATA.byHandle(l.handle);
      if (!p) return;
      html +=
        '<li class="cart-line">' +
        '<a class="cart-line__media" href="' + DATA.productUrl(p.handle) + '">' +
        '<img src="' + DATA.img + p.card + '" alt="' + p.title + '" width="76" height="76" loading="lazy">' +
        '</a>' +
        '<div>' +
        '<a class="cart-line__name" href="' + DATA.productUrl(p.handle) + '">' + p.title + '</a>' +
        '<div class="cart-line__meta">' + p.option + ': ' + l.size + (l.bundle ? ' · bundle' : '') + '</div>' +
        '<div class="cart-line__qty">' +
        '<button type="button" aria-label="Decrease quantity" data-qty="-1" data-handle="' + p.handle + '" data-size="' + l.size + '">&minus;</button>' +
        '<span>' + l.qty + '</span>' +
        '<button type="button" aria-label="Increase quantity" data-qty="1" data-handle="' + p.handle + '" data-size="' + l.size + '">+</button>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div class="cart-line__price">' + DATA.money(p.price * l.qty) + '</div>' +
        '<button type="button" class="cart-line__remove" data-remove data-handle="' + p.handle + '" data-size="' + l.size + '">Remove</button>' +
        '</div>' +
        '</li>';
    });
    html += '</ul>';
    body.innerHTML = html;

    foot.hidden = false;
    foot.innerHTML =
      '<div class="cart-foot__row"><span>Subtotal</span><strong>' + DATA.money(total()) + '</strong></div>' +
      '<button type="button" class="cart-foot__btn" data-checkout>Checkout' +
      '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 5h13M10 1l4 4-4 4"/></svg>' +
      '</button>' +
      '<p class="cart-foot__note">Taxes and shipping calculated at checkout.</p>';
  }

  function syncBadge() {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      var n = count();
      el.setAttribute('data-count', String(n));
      el.textContent = n;
    });
  }

  function open() {
    var el = document.querySelector('[data-cart-drawer]');
    if (!el) return;
    el.setAttribute('open', '');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var c = el.querySelector('.cart-drawer__close');
    if (c) c.focus();
  }

  function close() {
    var el = document.querySelector('[data-cart-drawer]');
    if (!el) return;
    el.removeAttribute('open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function init() {
    buildDrawer();
    renderDrawer();
    syncBadge();

    listeners.push(function () {
      renderDrawer();
      syncBadge();
    });

    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t.closest) return;
      if (t.closest('[data-cart-open]')) {
        ev.preventDefault();
        open();
        return;
      }
      if (t.closest('[data-cart-close]')) {
        close();
        return;
      }
      if (t.closest('[data-checkout]')) {
        ev.preventDefault();
        var btn = t.closest('[data-checkout]');
        btn.textContent = 'Redirecting to checkout...';
        setTimeout(function () {
          btn.textContent = 'Checkout';
        }, 1600);
        return;
      }
      var q = t.closest('[data-qty]');
      if (q) {
        var lines = read();
        var line = lines.filter(function (l) {
          return l.handle === q.getAttribute('data-handle') && l.size === q.getAttribute('data-size');
        })[0];
        if (line) setQty(line.handle, line.size, line.qty + parseInt(q.getAttribute('data-qty'), 10));
        return;
      }
      var rm = t.closest('[data-remove]');
      if (rm) {
        remove(rm.getAttribute('data-handle'), rm.getAttribute('data-size'));
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') close();
    });
  }

  window.Cart = {
    add: add,
    addMany: addMany,
    setQty: setQty,
    remove: remove,
    count: count,
    total: total,
    lines: read,
    open: open,
    close: close,
    init: init,
    on: function (fn) {
      listeners.push(fn);
    }
  };
})();
