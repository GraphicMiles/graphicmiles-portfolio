/* orbit.js — Nike Orbit shoe carousel (theme section script, transcribed; local cart) */

(function () {
  'use strict';
  if (window.ShoeOrbit) return;
  var instances = new Map();

  function num(el, a, fb) { var v = parseFloat(el.getAttribute(a)); return isNaN(v) ? fb : v; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function pad2(n) { n = '' + n; return n.length < 2 ? '0' + n : n; }

  function create(sec, opts) {
    opts = opts || {};
    var stage = sec.querySelector('[data-so-stage]');
    var shoes = [].slice.call(sec.querySelectorAll('[data-so-shoe]'));
    var n = shoes.length;
    if (!stage || !n) return null;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mq = window.matchMedia ? window.matchMedia('(max-width: 749.98px)') : null;
    function mob() { return !!(mq && mq.matches); }
    var MIRROR = sec.getAttribute('data-mirror') === 'true';
    var LOOP = sec.getAttribute('data-loop') !== 'false' && n > 2;
    var TILT = clamp(num(sec, 'data-tilt', 55), 0, 100) / 100;
    var FLOAT = sec.getAttribute('data-float') !== 'false' && !reduce;
    var AFTER = sec.getAttribute('data-after') || 'stay';
    var HDR = sec.getAttribute('data-hdr') !== 'false';
    var DEMO = sec.getAttribute('data-demo') === 'true';
    var AUTO = sec.getAttribute('data-autoplay') === 'true' && !reduce;
    var AUTO_MS = clamp(num(sec, 'data-auto-s', 4), 2, 20) * 1000;
    var SIGN = MIRROR ? 1 : -1;     // dragging toward where shoes go advances
    function T(k, fb) { return sec.getAttribute('data-t-' + k) || fb; }
    var STR = { added: T('added', 'added to your bag'), view: T('view', 'View bag'), add: T('add', 'Add to bag'), soldout: T('soldout', 'Sold out'), error: T('error', 'Could not add to bag. Please try again.'),
      select: T('select', 'Select a size'), addbtn: T('addbtn', 'Add to bag'), addedbtn: T('addedbtn', 'Added to bag'), unavailable: T('unavailable', 'Unavailable') };
    var SIZE_NAMES = (sec.getAttribute('data-size-names') || 'Size').split(',').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);

    var dead = false, listeners = [], timers = [];
    function on(t, ty, fn, o) { t.addEventListener(ty, fn, o || false); listeners.push([t, ty, fn, o || false]); }
    function later(fn, ms) { var id = setTimeout(function () { var k = timers.indexOf(id); if (k > -1) timers.splice(k, 1); if (!dead) fn(); }, ms); timers.push(id); return id; }

    var ring = sec.querySelector('[data-so-ring]'), ring2 = sec.querySelector('[data-so-ring2]');
    var wheel = sec.querySelector('[data-so-wheel]'), ridgeBox = sec.querySelector('[data-so-ridges]');
    var info = sec.querySelector('.so-info');
    var elIdx = sec.querySelector('[data-so-idx]'), elTag = sec.querySelector('[data-so-tag]'), elName = sec.querySelector('[data-so-name]');
    var elPrice = sec.querySelector('[data-so-price]'), elCmp = sec.querySelector('[data-so-cmp]'), elSub = sec.querySelector('[data-so-sub]');
    var elView = sec.querySelector('[data-so-view]'), elSizes = sec.querySelector('[data-so-sizes]'), elStatus = sec.querySelector('[data-so-status]');
    var elLast = sec.querySelector('[data-so-last]');
    if (elLast) elLast.textContent = pad2(n);
    if (wheel) wheel.setAttribute('aria-valuemax', n);

    var data = shoes.map(function (el) {
      var j = null, s = el.querySelector('[data-so-json]');
      if (s) { try { j = JSON.parse(s.textContent); } catch (e) { j = null; } }
      return j || { options: [], variants: [] };
    });

    /* ---------- section height (vh, minus the header if asked) ---------- */
    var vhH = 0, vhW = 0;
    function headerH() {
      var h = 0;
      [].forEach.call(document.querySelectorAll('.shopify-section-group-header-group'), function (el) {
        if (!el.contains(sec)) h += el.getBoundingClientRect().height || 0;
      });
      if (!h) { var hd = document.querySelector('header'); if (hd && !hd.contains(sec)) h = hd.getBoundingClientRect().height || 0; }
      return h;
    }
    function sizeSection() {
      var vh = mob() ? num(sec, 'data-vh-m', 90) : num(sec, 'data-vh-d', 100);
      var w = window.innerWidth;
      if (!vhH || !mob() || w !== vhW) { vhH = window.innerHeight; vhW = w; }   // phones: ignore the URL bar
      sec.style.setProperty('--so-sh', Math.round((vhH - (HDR ? headerH() : 0)) * vh / 100) + 'px');
    }

    /* ---------- geometry ---------- */
    var W = 0, H = 0, G = null;
    function measure() {
      sizeSection();
      W = sec.clientWidth; H = sec.clientHeight;
      var m = mob();
      G = m
        ? { cx: W * num(sec, 'data-cxm', 113) / 100, cy: H * num(sec, 'data-cym', 83) / 100, R: W * num(sec, 'data-rm', 95) / 100,
            hero: num(sec, 'data-herom', 128), step: num(sec, 'data-stepm', 24), fade: num(sec, 'data-fadem', 1.5) }
        : { cx: W * num(sec, 'data-cx', 80) / 100, cy: H * num(sec, 'data-cy', 117) / 100, R: H * num(sec, 'data-r', 97) / 100,
            hero: num(sec, 'data-hero', 121), step: num(sec, 'data-step', 21), fade: num(sec, 'data-fade', 2.5) };
      var cx = MIRROR ? W - G.cx : G.cx;
      var rings = sec.querySelector('[data-so-rings]');
      if (rings && wheel) rings.style.setProperty('--so-fy', Math.round(wheel.getBoundingClientRect().top - sec.getBoundingClientRect().top) + 'px');
      if (ring) { ring.style.width = ring.style.height = (G.R * 2) + 'px'; ring.style.transform = 'translate(' + (cx - G.R) + 'px,' + (G.cy - G.R) + 'px)'; }
      if (ring2) {
        var r2 = G.R - (shoes[0].offsetWidth || 300) * 0.32;
        ring2.style.width = ring2.style.height = (r2 * 2) + 'px';
        ring2.style.transform = 'translate(' + (cx - r2) + 'px,' + (G.cy - r2) + 'px)';
      }
      dirty = true; kick();
    }

    /* ---------- state ---------- */
    var START = clamp(Math.round(num(sec, 'data-start', 2)) - 1, 0, n - 1);
    var v = START, target = START, vel = 0, dragging = false, dirty = true, active = -1;
    var SMOOTH = clamp(num(sec, 'data-smooth', 45), 10, 150) / 100;   // seconds to settle (critically damped)
    var dragV = START, lastTs = 0, wheelMode = false;
    var DROP = sec.getAttribute('data-drop') !== 'false' && !reduce && !opts.noDrop && 'IntersectionObserver' in window;
    if (DROP) v = START + (LOOP ? 2.4 : Math.min(2.4, n - 1 - START));   // spins in when it scrolls into view
    function wrapD(d) {
      if (!LOOP) return d;
      d = ((d % n) + n) % n;
      return d > n / 2 ? d - n : d;
    }
    function idxOf(x) { var i = Math.round(x); return LOOP ? ((i % n) + n) % n : clamp(i, 0, n - 1); }

    /* ---------- the wheel's ridges ---------- */
    var RN = 44, ridges = [];
    if (ridgeBox) {
      for (var k = 0; k < RN; k++) { var r = document.createElement('i'); ridgeBox.appendChild(r); ridges.push(r); }
    }
    function drawRidges() {
      if (!ridges.length) return;
      var bw = ridgeBox.clientWidth || 1;
      var off = -SIGN * v * 0.9;
      for (var k = 0; k < RN; k++) {
        var phi = ((k / RN) * Math.PI * 2 + off) % (Math.PI * 2);
        if (phi < 0) phi += Math.PI * 2;
        if (phi > Math.PI) phi -= Math.PI * 2;
        var el = ridges[k];
        if (Math.abs(phi) >= Math.PI / 2) { el.style.opacity = '0'; continue; }
        var c = Math.cos(phi), w = Math.max(1, 5 * c);
        var x = bw * (0.5 + 0.5 * Math.sin(phi)) - w / 2;
        el.style.transform = 'translateX(' + x.toFixed(1) + 'px) scaleX(' + (w / 4).toFixed(3) + ')';
        el.style.opacity = (0.25 + 0.75 * c).toFixed(3);
      }
    }

    /* ---------- render ---------- */
    var tNow = 0;
    function render() {
      if (!G) return;
      var cx = G.cx;
      for (var i = 0; i < n; i++) {
        var el = shoes[i];
        var d = wrapD(i - v), ad = Math.abs(d);
        var ang = G.hero - d * G.step;
        var rad = ang * Math.PI / 180;
        var x = cx + G.R * Math.cos(rad), y = G.cy - G.R * Math.sin(rad);
        var rot = -(ang - G.hero) * TILT;
        if (MIRROR) { x = W - x; rot = -rot; }
        var sc = Math.max(0.3, 1 - 0.36 * ad);
        var op = ad > G.fade + 1.1 ? 0 : clamp(1 - (ad - G.fade) * 0.9, 0, 1);
        var bob = FLOAT && ad < 0.5 ? Math.sin(tNow / 700) * 5 * (1 - ad * 2) : 0;
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (y + bob).toFixed(1) + 'px,0) translate(-50%,-62%) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
        el.style.opacity = op.toFixed(3);
        el.style.zIndex = 100 - Math.round(ad * 10);
        el.style.pointerEvents = op < 0.15 ? 'none' : '';
      }
      drawRidges();
      var a = idxOf(v);
      if (a !== active) setActive(a);
    }

    var raf = 0, visible = true;
    // critically damped spring (no overshoot, no jitter, frame-rate independent)
    function damp(goal, st, dt) {
      var omega = 2 / st, x = omega * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      var ch = v - goal, tmp = (vel + omega * ch) * dt;
      vel = (vel - omega * tmp) * e;
      v = goal + (ch + tmp) * e;
    }
    function tick(ts) {
      raf = 0;
      if (dead) return;
      var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 1 / 60;
      lastTs = ts; tNow = ts;
      var goal = dragging ? dragV : target;
      damp(goal, dragging ? (wheelMode ? 0.16 : 0.08) : SMOOTH, dt);
      var still = !dragging && Math.abs(goal - v) < 0.0004 && Math.abs(vel) < 0.0004;
      if (still) { v = goal; vel = 0; }
      render();
      if (!still || dragging || (FLOAT && visible && !document.hidden)) raf = requestAnimationFrame(tick);
      else lastTs = 0;
    }
    function kick() { if (!raf && !dead) raf = requestAnimationFrame(tick); }

    function goTo(t, instant) {
      if (!LOOP) t = clamp(t, 0, n - 1);
      target = t;
      if (instant) { v = t; vel = 0; }
      kick();
    }
    function step(dir) { goTo(Math.round(target) + dir); pauseAuto(); }
    // shortest way round to shoe i
    function goToIndex(i) {
      if (!LOOP) { goTo(i); return; }
      var d = wrapD(i - target);
      goTo(Math.round(target + d));
    }

    /* ---------- active shoe: info + sizes ---------- */
    function setText(el, t) { if (el) el.textContent = t || ''; }
    function setActive(i) {
      active = i;
      var el = shoes[i];
      shoes.forEach(function (s, k) { s.setAttribute('tabindex', k === i ? '0' : '-1'); s.classList.toggle('so-active', k === i); });
      if (wheel) { wheel.setAttribute('aria-valuenow', i + 1); wheel.setAttribute('aria-valuetext', (el.getAttribute('data-name') || '') + ', ' + (i + 1) + ' / ' + n); }
      var fill = function () {
        setText(elIdx, pad2(i + 1) + ' / ' + pad2(n));
        setText(elTag, el.getAttribute('data-tag'));
        setText(elName, el.getAttribute('data-name'));
        setText(elPrice, el.getAttribute('data-price'));
        setText(elCmp, el.getAttribute('data-cmp'));
        setText(elSub, el.getAttribute('data-sub'));
        if (elView) {
          var u = el.getAttribute('data-url');
          elView.hidden = !u;
          elView.setAttribute('href', u || '#');
        }
        buildSizes(i);
        if (info) info.classList.remove('so-swap');
      };
      if (info && info.getAttribute('data-filled') && !reduce) {
        info.classList.add('so-swap');
        if (info._t) clearTimeout(info._t);
        info._t = later(fill, 140);
      } else { if (info) info.setAttribute('data-filled', '1'); fill(); }
    }

    function sizeIndex(d) {
      if (!d.options || !d.options.length) return -1;
      for (var k = 0; k < d.options.length; k++) {
        var nm = ('' + d.options[k]).toLowerCase();
        if (SIZE_NAMES.indexOf(nm) > -1) return k;
      }
      for (k = 0; k < d.options.length; k++) if (('' + d.options[k]).toLowerCase().indexOf('size') > -1) return k;
      return d.options.length === 1 ? 0 : -1;
    }
    var chosen = {};
    function buildSizes(i) {
      if (!elSizes) return;
      elSizes.innerHTML = '';
      if (elStatus && !elStatus._keep) { elStatus.textContent = ''; elStatus.classList.remove('so-err'); }
      var d = data[i], vs = d.variants || [];
      if (!vs.length) return;
      var si = sizeIndex(d);
      var base = null;
      for (var k = 0; k < vs.length; k++) if (vs[k].av) { base = vs[k]; break; }
      base = base || vs[0];
      var single = si < 0 || (vs.length === 1);
      if (single) {
        var b = mkBtn(STR.add, base, i, true);
        b.classList.add('so-wide');
        if (!base.av) { b.disabled = true; b.textContent = STR.soldout; }
        elSizes.appendChild(b);
        return;
      }
      var seen = [];
      vs.forEach(function (x) { var val = x.opts[si]; if (seen.indexOf(val) < 0) seen.push(val); });
      seen.forEach(function (val) {
        // same colour / other options as the default variant, this size
        var match = null;
        for (var k = 0; k < vs.length; k++) {
          var x = vs[k];
          if (x.opts[si] !== val) continue;
          var same = true;
          for (var o = 0; o < x.opts.length; o++) if (o !== si && x.opts[o] !== base.opts[o]) { same = false; break; }
          if (same) { match = x; break; }
        }
        if (!match) for (k = 0; k < vs.length; k++) if (vs[k].opts[si] === val && vs[k].av) { match = vs[k]; break; }
        var btn = mkBtn(val, match, i, false);
        if (!match || !match.av) { btn.disabled = true; btn.setAttribute('aria-label', val + ' – ' + STR.soldout); }
        if (chosen[i] === val) btn.classList.add('so-on');
        elSizes.appendChild(btn);
      });
    }
    function mkBtn(label, variant, i, single) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'so-size';
      b.textContent = label;
      b.addEventListener('click', function () {
        if (!variant || b.disabled || b.classList.contains('so-busy')) return;
        add(variant, i, single ? '' : label, b);
      });
      return b;
    }

    /* ---------- cart (Horizon storefront events, Dawn drawers, the rest) ---------- */
    function cartRoot() { return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/'; }
    function uniq(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }
    function cartSectionIds() {
      var ids = [];
      [].forEach.call(document.querySelectorAll('cart-items-component[data-section-id]'), function (el) { ids.push(el.getAttribute('data-section-id')); });
      return uniq(ids);
    }
    function dawnDrawer() {
      var d = document.querySelector('cart-drawer');
      return d && typeof d.renderContents === 'function' && typeof d.getSectionsToRender === 'function' ? d : null;
    }
    function openThemeCart() {
      var td = document.querySelector('theme-drawer#cart-drawer');
      if (td && (td.isOpen || td.hasAttribute('open'))) return Promise.resolve(true);
      if (window.Shopify && Shopify.actions && typeof Shopify.actions.openCart === 'function' && document.querySelector('theme-drawer, cart-drawer-component')) {
        return Promise.resolve(Shopify.actions.openCart()).then(function () { return true; }, function () { return false; });
      }
      if (td && typeof td.open === 'function') { td.open(); return Promise.resolve(true); }
      var tags = ['cart-drawer', 'cart-notification', 'side-cart', 'cart-sidebar', 'mini-cart'];
      for (var i = 0; i < tags.length; i++) {
        var el = document.querySelector(tags[i]);
        if (!el) continue;
        var fns = ['open', 'show', 'openDrawer'];
        for (var k = 0; k < fns.length; k++) if (typeof el[fns[k]] === 'function') { try { el[fns[k]](); return Promise.resolve(true); } catch (e) {} }
      }
      return Promise.resolve(false);
    }
    function announceStandard(cart, variantId, res) {
      if (!document.querySelector('cart-items-component')) return Promise.resolve(false);
      return import('@shopify/events').then(function (m) {
        var Ev = m && m.CartLinesUpdateEvent;
        if (!Ev) return false;
        var dfd = typeof Ev.createPromise === 'function' ? Ev.createPromise() : null;
        var resolveNow;
        var promise = dfd ? dfd.promise : new Promise(function (r) { resolveNow = r; });
        sec.dispatchEvent(new Ev({ action: 'add', context: 'product', lines: [{ merchandiseId: String(variantId), quantity: 1 }], promise: promise }));
        var payload = {
          cart: typeof Ev.createCartFromAjaxResponse === 'function' ? Ev.createCartFromAjaxResponse(cart) : cart,
          detail: { items: cart.items, source: 'shoe-orbit', sourceId: sec.id, itemCount: 1, sections: res && res.sections ? res.sections : undefined, didError: false }
        };
        if (dfd) dfd.resolve(payload); else resolveNow(payload);
        return true;
      }).catch(function () { return false; });
    }
    function legacyCartUI(cart, res, variantId) {
      var dawn = dawnDrawer();
      if (AFTER === 'drawer' && dawn && res && res.sections) {
        try {
          dawn.classList.remove('is-empty');
          var inner = dawn.querySelector('.drawer__inner'); if (inner) inner.classList.remove('is-empty');
          dawn.renderContents(Object.assign({ id: variantId }, res));
          return;
        } catch (e) {}
      }
      try {
        var html = res && res.sections && res.sections['cart-icon-bubble'];
        var bubble = document.getElementById('cart-icon-bubble');
        if (html && bubble) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var src = doc.querySelector('.shopify-section') || doc.body;
          bubble.innerHTML = src.innerHTML;
        }
      } catch (e) {}
      [].forEach.call(document.querySelectorAll('[data-cart-count], .cart-count-bubble span[aria-hidden="true"]'), function (el) { el.textContent = cart.item_count; });
      try {
        if (typeof window.publish === 'function' && window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.cartUpdate) {
          window.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'shoe-orbit', cartData: cart });
        }
      } catch (e) {}
      document.dispatchEvent(new CustomEvent('cart:update', { bubbles: true, detail: { resource: cart, sourceId: sec.id, data: { source: 'shoe-orbit', itemCount: cart.item_count, sections: (res && res.sections) || {} } } }));
      if (AFTER === 'drawer') openThemeCart();
    }

    var CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor"/><path d="M4.5 8.2 L7 10.5 L11.5 5.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    function showAdded(i, label) {
      if (!elStatus) return;
      var nm = shoes[i].getAttribute('data-name') || '';
      elStatus.classList.remove('so-err');
      elStatus.innerHTML = '';
      var ic = document.createElement('span'); ic.style.color = 'var(--so-acc)'; ic.innerHTML = CHECK; ic.style.display = 'inline-flex';
      var t = document.createElement('span'); t.textContent = nm + (label ? ', ' + label : '') + ' ' + STR.added;
      var a = document.createElement('a'); a.href = cartRoot() + 'cart'; a.textContent = STR.view;
      elStatus.appendChild(ic); elStatus.appendChild(t); elStatus.appendChild(a);
      elStatus._keep = true;
      later(function () { elStatus._keep = false; }, 4000);
    }
    var flying = [];
    function flyToCart(img) {
      if (reduce || !Element.prototype.animate || !img) return;
      var from = img.getBoundingClientRect();
      if (!from.width) return;
      var target = document.querySelector('#cart-icon-bubble, cart-icon, [data-cart-icon], .header__icon--cart, a[href$="/cart"]');
      var tr = target ? target.getBoundingClientRect() : null;
      if (!tr || !tr.width) tr = { left: window.innerWidth - 48, top: 18, width: 24, height: 24 };
      var f = img.cloneNode(true);
      f.removeAttribute('srcset'); f.removeAttribute('sizes');
      if (img.currentSrc) f.setAttribute('src', img.currentSrc);
      f.removeAttribute('class'); f.classList.add('so-fly');
      f.style.left = from.left + 'px'; f.style.top = from.top + 'px';
      f.style.width = from.width + 'px'; f.style.height = from.height + 'px';
      document.body.appendChild(f);
      flying.push(f);
      var dx = (tr.left + tr.width / 2) - (from.left + from.width / 2);
      var dy = (tr.top + tr.height / 2) - (from.top + from.height / 2);
      var a = f.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + (dx * 0.55) + 'px,' + (dy * 0.55 - 90) + 'px) scale(.4) rotate(-14deg)', opacity: 1, offset: 0.6 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.05) rotate(-24deg)', opacity: 0.3 }
      ], { duration: 820, easing: 'cubic-bezier(.5,0,.3,1)' });
      a.onfinish = function () {
        if (f.parentNode) f.parentNode.removeChild(f);
        flying.splice(flying.indexOf(f), 1);
        if (target && target.animate) target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
      };
    }

    // one add-to-cart for the orbit sizes and the product view
    function cartAdd(variant, i) {
      /* static clone: the Shopify cart endpoint is replaced by the local bag */
      var d = data[i] || {};
      var url = d.url || (shoes[i] && shoes[i].getAttribute('data-url')) || '';
      var handle = url.replace(/^product-/, '').replace(/\.html$/, '');
      var label = chosen[i] || '';
      if (window.Cart && handle) window.Cart.add(handle, label || '40', 1);
      return Promise.resolve({ local: true });
    }

    var busy = false;
    function add(variant, i, label, btn) {
      if (busy) return;
      chosen[i] = label;
      [].forEach.call(elSizes.querySelectorAll('.so-size'), function (b) { b.classList.toggle('so-on', b === btn && !!label); });
      busy = true;
      btn.classList.add('so-busy');
      if (elStatus) { elStatus.textContent = ''; elStatus.classList.remove('so-err'); }
      cartAdd(variant, i).then(function (r) {
        if (dead || (r && r.redirect)) return;
        flyToCart(shoes[i].querySelector('.so-img'));
        showAdded(i, label);
      }).catch(function (err) {
        if (dead || !elStatus) return;
        elStatus.textContent = (err && err.message) || STR.error;
        elStatus.classList.add('so-err');
      }).then(function () { busy = false; btn.classList.remove('so-busy'); });
    }

    /* ================= FULL-PAGE PRODUCT VIEW =================
       Opens from a shoe (the shoe flies into place). The arrows move to the next shoe:
       the image blurs and drifts into the next one, the title morphs letter by letter,
       the background tint melts across. */
    var modal = sec.querySelector('[data-so-modal]');
    if (modal) {
      modal.setAttribute('style', sec.getAttribute('style') || '');
      if (sec.classList.contains('so-blend')) modal.classList.add('so-blend-m');
      document.body.appendChild(modal);
    }
    function mq_(sel) { return modal ? modal.querySelector(sel) : null; }
    var mStage = mq_('[data-so-mstage]'), mThumbs = mq_('[data-so-mthumbs]'), mCount = mq_('[data-so-mcount]');
    var mMeta = mq_('[data-so-mmeta]'), mName = mq_('[data-so-mname]'), mPrice = mq_('[data-so-mprice]'), mCmp = mq_('[data-so-mcmp]');
    var mSub = mq_('[data-so-msub]'), mDesc = mq_('[data-so-mdesc]'), mOpts = mq_('[data-so-mopts]');
    var mAdd = mq_('[data-so-madd]'), mAddLbl = mq_('[data-so-maddlbl]'), mStatus = mq_('[data-so-mstatus]'), mLink = mq_('[data-so-mlink]');
    var mClose = mq_('[data-so-mclose]'), mPrev = mq_('[data-so-mprev]'), mNext = mq_('[data-so-mnext]');
    var MORPH = clamp(num(sec, 'data-morph', 850), 200, 2000);
    var mi = -1, mOpen = false, mSel = [], mImg = 0, lastFocus = null, mBusy = false, mHide = null;

    function srcW(url, w) { return url ? url.replace(/([?&])width=\d+/, '$1width=' + w) : url; }
    function imagesOf(i) {
      if (shoes[i]._imgs) return shoes[i]._imgs;
      var d = data[i], out = [], oi = shoes[i].querySelector('.so-img');
      if (d.images && d.images.length) d.images.forEach(function (u) { if (u) out.push({ url: u }); });
      else if (oi && oi.tagName.toLowerCase() === 'svg') out.push({ svg: oi });
      else if (oi) out.push({ url: oi.currentSrc || oi.src });
      shoes[i]._imgs = out;
      return out;
    }
    function slideFor(i, k, quick) {
      var it = imagesOf(i)[k];
      var wrap = document.createElement('div');
      wrap.className = 'so-m-slide';
      if (!it) return wrap;
      if (it.svg) { var c = it.svg.cloneNode(true); c.removeAttribute('class'); wrap.appendChild(c); }
      else {
        var im = new Image();
        im.alt = shoes[i].getAttribute('data-name') || '';
        im.decoding = 'async';
        var oi = shoes[i].querySelector('img.so-img');
        // the first image is the orbit photo: start from the copy already loaded, then sharpen
        if (quick && k === 0 && oi && (oi.currentSrc || oi.src)) {
          im.src = oi.currentSrc || oi.src;
          var hi = new Image(); hi.onload = function () { im.src = it.url; }; hi.src = it.url;
        } else im.src = it.url;
        wrap.appendChild(im);
      }
      return wrap;
    }
    function showImage(k, dir, instant) {
      var list = imagesOf(mi);
      if (!list.length || !mStage) return;
      k = (k + list.length) % list.length;
      mImg = k;
      var el = slideFor(mi, k, instant);
      var old = [].slice.call(mStage.children);
      mStage.appendChild(el);
      if (!instant && !reduce) {
        el.style.setProperty('--dir', dir || 1);
        el.classList.add('so-m-enter');
        old.forEach(function (o) {
          o.style.setProperty('--dir', dir || 1);
          o.classList.remove('so-m-enter');
          o.classList.add('so-m-leave');
          setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, MORPH);
        });
      } else old.forEach(function (o) { if (o.parentNode) o.parentNode.removeChild(o); });
      if (mThumbs) [].forEach.call(mThumbs.children, function (t, j) { t.setAttribute('aria-current', j === k ? 'true' : 'false'); });
    }
    function buildThumbs() {
      if (!mThumbs) return;
      mThumbs.innerHTML = '';
      var list = imagesOf(mi);
      if (list.length < 2) return;
      list.forEach(function (it, j) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'so-m-thumb';
        b.setAttribute('aria-label', 'Image ' + (j + 1));
        if (it.svg) { var c = it.svg.cloneNode(true); c.removeAttribute('class'); b.appendChild(c); }
        else { var im = new Image(); im.alt = ''; im.src = srcW(it.url, 160); b.appendChild(im); }
        b.style.animation = 'soPillIn .5s cubic-bezier(.2,.8,.3,1) ' + (j * 40) + 'ms both';
        b.addEventListener('click', function () { if (j !== mImg) showImage(j, j > mImg ? 1 : -1); });
        mThumbs.appendChild(b);
      });
    }

    /* letters morph: the old word blurs away while the new one blurs in, letter by letter */
    function charsOf(txt, cls, delay) {
      var out = document.createElement('span'), k = 0;
      out.className = cls;
      out.setAttribute('aria-hidden', 'true');
      txt.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { out.appendChild(document.createTextNode(' ')); return; }
        var ws = document.createElement('span');
        ws.className = 'so-mw';
        Array.from(w).forEach(function (ch) {
          var c = document.createElement('span');
          c.className = 'so-mc';
          c.textContent = ch;
          c.style.animationDelay = (delay + k * 16) + 'ms';
          k++;
          ws.appendChild(c);
        });
        out.appendChild(ws);
      });
      return out;
    }
    function morphText(el, txt, instant) {
      if (!el) return;
      txt = txt || '';
      var cur = el.getAttribute('data-t');
      if (cur === txt) return;
      el.setAttribute('data-t', txt);
      el.setAttribute('aria-label', txt);
      el._mt = {};
      if (instant || reduce || !cur || !txt) { el.classList.remove('so-mt'); el.textContent = txt; return; }
      var tok = el._mt;
      el.classList.add('so-mt');
      el.innerHTML = '';
      el.appendChild(charsOf(cur, 'so-mt-out', 0));
      el.appendChild(charsOf(txt, 'so-mt-in', MORPH * 0.22));
      later(function () { if (el._mt !== tok) return; el.classList.remove('so-mt'); el.textContent = txt; }, MORPH * 1.3 + txt.length * 16);
    }
    function fadeText(el, txt, instant) {
      if (!el) return;
      txt = txt || '';
      if (instant || reduce) { el.textContent = txt; return; }
      if (el.textContent === txt) return;
      el.classList.add('so-fadeout');
      later(function () { el.textContent = txt; el.classList.remove('so-fadeout'); }, 260);
    }

    /* options: colours (with a swatch when the value is a colour name), sizes, anything else */
    function optValues(d, k) {
      if (d.ov && d.ov[k]) return d.ov[k];
      var out = [];
      (d.variants || []).forEach(function (x) { if (out.indexOf(x.opts[k]) < 0) out.push(x.opts[k]); });
      return out;
    }
    function fits(x, sel) { for (var q = 0; q < x.opts.length; q++) if (sel[q] != null && x.opts[q] !== sel[q]) return false; return true; }
    function availWith(sel) { return (data[mi].variants || []).some(function (x) { return x.av && fits(x, sel); }); }
    function existsWith(sel) { return (data[mi].variants || []).some(function (x) { return fits(x, sel); }); }
    function curVariant() {
      if (mSel.some(function (x) { return x == null; })) return null;
      var vs = data[mi].variants || [];
      for (var k = 0; k < vs.length; k++) if (fits(vs[k], mSel)) return vs[k];
      return null;
    }
    function cssColor(val) {
      var c = ('' + val).toLowerCase().replace(/\s+/g, '');
      try { return window.CSS && CSS.supports && CSS.supports('color', c) ? c : ''; } catch (e) { return ''; }
    }
    function buildOpts() {
      if (!mOpts) return;
      mOpts.innerHTML = '';
      var d = data[mi], names = d.options || [], si = sizeIndex(d);
      if (!(d.variants || []).length || (d.variants.length === 1)) return;
      names.forEach(function (nm, k) {
        var vals = optValues(d, k);
        if (vals.length < 2 && k !== si) return;
        var box = document.createElement('div');
        var head = document.createElement('div');
        head.className = 'so-m-optname';
        var hs = document.createElement('span'); hs.textContent = nm;
        var hb = document.createElement('b'); hb.setAttribute('data-k', k);
        head.appendChild(hs); head.appendChild(hb);
        var pills = document.createElement('div');
        pills.className = k === si ? 'so-m-sizes' : 'so-m-pills';
        pills.setAttribute('role', 'group');
        pills.setAttribute('aria-label', nm);
        var isColor = /colou?r|shade/i.test(nm);
        vals.forEach(function (val, j) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'so-m-pill';
          b.setAttribute('data-k', k);
          b.setAttribute('data-val', val);
          b.style.animationDelay = (j * 25) + 'ms';
          if (isColor) {
            var c = cssColor(val);
            if (c) { var sw = document.createElement('span'); sw.className = 'so-sw'; sw.style.background = c; b.appendChild(sw); }
          }
          var t = document.createElement('span'); t.textContent = val; b.appendChild(t);
          b.addEventListener('click', function () {
            if (b.disabled) return;
            mSel[k] = val;
            mAdd.classList.remove('so-done');
            if (mStatus) { mStatus.textContent = ''; mStatus.classList.remove('so-err'); }
            if (k !== si) followVariantImage();
            refreshOpts();
            updateBuy();
          });
          pills.appendChild(b);
        });
        box.appendChild(head);
        box.appendChild(pills);
        mOpts.appendChild(box);
      });
      refreshOpts();
    }
    function refreshOpts() {
      if (!mOpts) return;
      var si = sizeIndex(data[mi]);
      [].forEach.call(mOpts.querySelectorAll('.so-m-pill'), function (b) {
        var k = +b.getAttribute('data-k'), val = b.getAttribute('data-val');
        b.setAttribute('aria-pressed', mSel[k] === val ? 'true' : 'false');
        var test = mSel.slice(); test[k] = val;
        var ok = availWith(test);
        b.classList.toggle('so-na', !ok);
        b.disabled = k === si ? !ok : !existsWith(test);
      });
      [].forEach.call(mOpts.querySelectorAll('.so-m-optname b'), function (h) {
        var k = +h.getAttribute('data-k');
        h.textContent = k === si ? (mSel[k] || '') : (mSel[k] || '');
      });
    }
    function followVariantImage() {
      var vs = data[mi].variants || [], u = '';
      for (var k = 0; k < vs.length; k++) if (vs[k].img && fits(vs[k], mSel.map(function (x, q) { return q === sizeIndex(data[mi]) ? null : x; }))) { u = vs[k].img; break; }
      if (!u) return;
      var list = imagesOf(mi), key = u.split('?')[0], at = -1;
      for (var j = 0; j < list.length; j++) if (list[j].url && list[j].url.split('?')[0] === key) { at = j; break; }
      if (at < 0) { list.push({ url: u }); buildThumbs(); at = list.length - 1; }
      if (at !== mImg) showImage(at, at > mImg ? 1 : -1);
    }
    function updateBuy(instant) {
      if (!mAdd) return;
      var d = data[mi], si = sizeIndex(d), x = curVariant();
      var needSize = si > -1 && (d.variants || []).length > 1 && mSel[si] == null;
      var price = x && x.price ? x.price : shoes[mi].getAttribute('data-price');
      var cmp = x ? (x.cmp || '') : shoes[mi].getAttribute('data-cmp');
      morphText(mPrice, price, instant);
      if (mCmp) mCmp.textContent = cmp || '';
      if (mAdd.classList.contains('so-done')) return;
      mAdd.disabled = needSize || !x || !x.av;
      mAddLbl.textContent = needSize ? STR.select : (!x ? STR.unavailable : (!x.av ? STR.soldout : STR.addbtn));
    }

    function fillModal(i, dir, instant) {
      mi = i;
      var el = shoes[i], d = data[i];
      var tint = el.getAttribute('data-tint');
      if (tint) modal.style.setProperty('--so-tint', tint); else modal.style.removeProperty('--so-tint');
      if (mCount) mCount.textContent = pad2(i + 1) + ' / ' + pad2(n);
      morphText(mName, el.getAttribute('data-name'), instant);
      fadeText(mMeta, el.getAttribute('data-tag'), instant);
      fadeText(mSub, el.getAttribute('data-sub'), instant);
      fadeText(mDesc, d.desc || '', instant);
      var u = el.getAttribute('data-url');
      if (mLink) { mLink.hidden = !u; mLink.setAttribute('href', u || '#'); }
      var vs = d.variants || [], base = null;
      for (var k = 0; k < vs.length; k++) if (vs[k].av) { base = vs[k]; break; }
      base = base || vs[0];
      mSel = base ? base.opts.slice() : [];
      var si = sizeIndex(d);
      if (si > -1 && vs.length > 1) mSel[si] = null;     // the shopper picks the size
      if (mAdd) mAdd.classList.remove('so-done', 'so-busy');
      if (mStatus) { mStatus.textContent = ''; mStatus.classList.remove('so-err'); }
      buildThumbs();
      showImage(0, dir, instant);
      buildOpts();
      updateBuy(instant);
      [].slice.call(imagesOf(i)).slice(0, 3).forEach(function (it) { if (it.url) { var p = new Image(); p.src = it.url; } });
    }
    function stepModal(dir) {
      if (!mOpen) return;
      var i = LOOP ? (mi + dir + n) % n : clamp(mi + dir, 0, n - 1);
      if (i === mi) return;
      goToIndex(i);                 // the orbit turns behind the view
      fillModal(i, dir, false);
    }

    function rotOf(el) { var m = /rotate\((-?[\d.]+)deg\)/.exec(el.style.transform || ''); return m ? parseFloat(m[1]) : 0; }
    function openModal(i) {
      if (!modal || mOpen) return;
      if (mHide) { clearTimeout(mHide); mHide = null; }
      pauseAuto();
      lastFocus = document.activeElement;
      var src = shoes[i], si = src.querySelector('.so-img');
      var from = si ? si.getBoundingClientRect() : null, rot = rotOf(src);
      goToIndex(i);
      modal.classList.add('so-open');
      modal.setAttribute('aria-hidden', 'false');
      modal.scrollTop = 0;
      document.documentElement.classList.add('so-lock');
      [mName, mPrice].forEach(function (x) { if (x) x.removeAttribute('data-t'); });
      fillModal(i, 1, true);
      mOpen = true;
      requestAnimationFrame(function () { modal.classList.add('so-in'); });
      var slide = mStage && mStage.lastElementChild, tgt = slide && slide.firstElementChild;
      if (from && from.width && tgt && !reduce && Element.prototype.animate) {
        var to = tgt.getBoundingClientRect();
        if (to.width && to.height) {
          src.classList.add('so-lifted');
          tgt.animate([
            { transformOrigin: '0 0', transform: 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(' + (from.width / to.width) + ',' + (from.height / to.height) + ') rotate(' + rot + 'deg)' },
            { transformOrigin: '0 0', transform: 'none' }
          ], { duration: 780, easing: 'cubic-bezier(.2,.85,.2,1)' });
          later(function () { src.classList.remove('so-lifted'); }, 800);
        } else if (slide) slide.classList.add('so-m-enter');
      } else if (slide && !reduce) slide.classList.add('so-m-enter');
      if (mClose) { try { mClose.focus({ preventScroll: true }); } catch (e) { mClose.focus(); } }
    }
    function closeModal() {
      if (!mOpen) return;
      mOpen = false;
      modal.classList.remove('so-in');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('so-lock');
      var src = shoes[mi], si = src && src.querySelector('.so-img');
      var slide = mStage && mStage.lastElementChild, img = slide && slide.firstElementChild;
      var done = function () { modal.classList.remove('so-open'); if (mStage) mStage.innerHTML = ''; if (src) src.classList.remove('so-lifted'); mHide = null; };
      // fly back once the orbit has turned to this shoe
      var to = si ? si.getBoundingClientRect() : null, from = img ? img.getBoundingClientRect() : null;
      var land = G ? { x: (MIRROR ? W - (G.cx + G.R * Math.cos(G.hero * Math.PI / 180)) : G.cx + G.R * Math.cos(G.hero * Math.PI / 180)), y: G.cy - G.R * Math.sin(G.hero * Math.PI / 180) } : null;
      if (from && from.width && to && to.width && land && !reduce && Element.prototype.animate) {
        var sr = sec.getBoundingClientRect();
        var w = src.offsetWidth, h = src.offsetHeight;      // where the front shoe sits, at full size
        var tx = sr.left + land.x - w / 2, ty = sr.top + land.y - h * 0.62;
        src.classList.add('so-lifted');
        img.animate([
          { transformOrigin: '0 0', transform: 'none' },
          { transformOrigin: '0 0', transform: 'translate(' + (tx - from.left) + 'px,' + (ty - from.top) + 'px) scale(' + (w / from.width) + ',' + (h / from.height) + ')' }
        ], { duration: 620, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
        mHide = setTimeout(done, 630);
      } else mHide = setTimeout(done, 420);
      if (lastFocus && lastFocus.focus && lastFocus.isConnected) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
    }
    if (mClose) on(mClose, 'click', closeModal);
    if (mPrev) on(mPrev, 'click', function () { stepModal(-1); });
    if (mNext) on(mNext, 'click', function () { stepModal(1); });
    on(document, 'keydown', function (e) {
      if (!mOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      var tg = e.target && e.target.tagName;
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && tg !== 'INPUT' && tg !== 'TEXTAREA') { e.preventDefault(); stepModal(e.key === 'ArrowRight' ? 1 : -1); return; }
      if (e.key === 'Tab') {
        var f = [].filter.call(modal.querySelectorAll('button, a[href]'), function (x) { return !x.disabled && !x.hidden && x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // swipe the big image: next / previous photo
    if (mStage) {
      var sw0 = null;
      on(mStage, 'pointerdown', function (e) { sw0 = { x: e.clientX, y: e.clientY }; });
      on(mStage, 'pointerup', function (e) {
        if (!sw0) return;
        var dx = e.clientX - sw0.x, dy = e.clientY - sw0.y; sw0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && imagesOf(mi).length > 1) showImage(mImg + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      });
    }
    if (mAdd) on(mAdd, 'click', function () {
      var x = curVariant();
      if (!x || !x.av || mBusy) return;
      mBusy = true;
      mAdd.classList.add('so-busy');
      if (mStatus) { mStatus.textContent = ''; mStatus.classList.remove('so-err'); }
      var si = sizeIndex(data[mi]), i = mi;
      cartAdd(x, i).then(function (r) {
        if (dead || (r && r.redirect)) return;
        var slide = mStage && mStage.lastElementChild;
        flyToCart(slide && slide.firstElementChild);
        mAdd.classList.add('so-done');
        mAddLbl.textContent = STR.addedbtn;
        if (mStatus) {
          mStatus.innerHTML = '';
          var a = document.createElement('a'); a.href = cartRoot() + 'cart'; a.textContent = STR.view + ' →';
          mStatus.appendChild(a);
        }
        if (AFTER === 'drawer') later(closeModal, 250);
        later(function () { if (mi === i) { mAdd.classList.remove('so-done'); updateBuy(); } }, 2600);
      }).catch(function (err) {
        if (mStatus) { mStatus.textContent = (err && err.message) || STR.error; mStatus.classList.add('so-err'); }
      }).then(function () { mBusy = false; mAdd.classList.remove('so-busy'); });
    });

    /* ---------- drag: the wheel (fine control) and the stage (swipe the shoes) ---------- */
    var drag = null, moved = false;
    function startDrag(e, src, pps) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragV = v;
      drag = { src: src, x: e.clientX, y: e.clientY, v0: v, pps: pps, lx: e.clientX, lt: performance.now(), vv: 0, id: e.pointerId, live: src === wheel };
      moved = false;
      if (src === wheel) {
        e.preventDefault();
        try { wheel.setPointerCapture(e.pointerId); } catch (er) {}
        dragging = true; pauseAuto(); kick();
      }
    }
    function moveDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.live) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) {
          if (Math.abs(dy) > 10) drag = null;                 // vertical: let the page scroll
          return;
        }
        drag.live = true; dragging = true; drag.v0 = dragV = v; drag.x = e.clientX; pauseAuto();
        stage.classList.add('so-dragging');
        try { stage.setPointerCapture(e.pointerId); } catch (er) {}
      }
      moved = true;
      var now = performance.now(), dt = Math.max(1, now - drag.lt);
      drag.vv = drag.vv * 0.6 + (SIGN * (e.clientX - drag.lx) / drag.pps / dt) * 0.4;   // shoes per ms
      drag.lx = e.clientX; drag.lt = now;
      var nv = drag.v0 + SIGN * dx / drag.pps;
      if (!LOOP) nv = nv < 0 ? nv * 0.35 : (nv > n - 1 ? n - 1 + (nv - n + 1) * 0.35 : nv);   // rubber band
      dragV = nv;
      kick();
    }
    function endDrag(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag; drag = null;
      stage.classList.remove('so-dragging');
      if (!d.live) return;
      dragging = false;
      var fresh = performance.now() - d.lt < 80;
      var proj = dragV + (fresh ? clamp(d.vv * 110, -2.5, 2.5) : 0);        // a flick carries on
      goTo(Math.round(proj));
      if (moved) later(function () { moved = false; }, 0);
    }
    if (wheel) on(wheel, 'pointerdown', function (e) { startDrag(e, wheel, mob() ? 46 : 64); });
    on(stage, 'pointerdown', function (e) { startDrag(e, stage, mob() ? 130 : 220); });
    on(window, 'pointermove', moveDrag);
    on(window, 'pointerup', endDrag);
    on(window, 'pointercancel', endDrag);
    on(stage, 'dragstart', function (e) { e.preventDefault(); });

    // clicks: any shoe opens the full-page view
    shoes.forEach(function (el, i) {
      on(el, 'click', function (e) {
        if (moved) { e.preventDefault(); return; }
        openModal(i);
      });
    });
    if (elView) on(elView, 'click', function (e) { if (!modal) return; e.preventDefault(); openModal(active); });

    // mouse wheel / trackpad: always on the wheel itself; on the stage only sideways swipes
    var wAcc = 0, wTimer = null;
    function wheelMove(delta) {
      pauseAuto();
      if (!wheelMode) { wheelMode = true; dragV = dragging ? dragV : v; }
      dragging = true;
      dragV += delta / 240;
      if (!LOOP) dragV = clamp(dragV, -0.3, n - 0.7);
      kick();
      if (wTimer) clearTimeout(wTimer);
      wTimer = later(function () { dragging = false; wheelMode = false; goTo(Math.round(dragV)); }, 160);
    }
    if (wheel) on(wheel, 'wheel', function (e) {
      e.preventDefault();
      var dlt = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) dlt *= 32;
      wheelMove(dlt);
    }, { passive: false });
    on(stage, 'wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 2) return;
      e.preventDefault();
      wheelMove(-SIGN * e.deltaX);
    }, { passive: false });

    if (wheel) on(wheel, 'keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); step(1); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); step(-1); }
      else if (k === 'Home') { e.preventDefault(); goToIndex(0); }
      else if (k === 'End') { e.preventDefault(); goToIndex(n - 1); }
    });

    /* ---------- autoplay (optional) ---------- */
    var autoHold = 0, autoTimer = null;
    function pauseAuto() { autoHold = Date.now() + 7000; }
    if (AUTO) {
      autoTimer = setInterval(function () {
        if (dead || !visible || document.hidden || dragging || autoHold > Date.now()) return;
        if (sec.matches(':hover') || sec.contains(document.activeElement)) return;
        if (!LOOP && Math.round(target) >= n - 1) goTo(0); else goTo(Math.round(target) + 1);
      }, AUTO_MS);
    }

    /* ---------- visibility, resize, start ---------- */
    var io = null, spun = !DROP;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (en) {
        visible = !!(en[0] && en[0].isIntersecting);
        if (visible) {
          if (!spun && en[0].intersectionRatio > 0.25) { spun = true; goTo(START); }
          kick();
        }
      }, { threshold: [0, 0.25] });
      io.observe(sec);
    }
    if (!spun && !io) { spun = true; v = START; }
    var rq = 0;
    on(window, 'resize', function () { if (!rq) rq = requestAnimationFrame(function () { rq = 0; measure(); }); });
    if (mq) { var mqf = function () { measure(); }; if (mq.addEventListener) on(mq, 'change', mqf); else if (mq.addListener) mq.addListener(mqf); }
    [].forEach.call(sec.querySelectorAll('.so-img'), function (im) {
      if (im.tagName === 'IMG' && !im.complete) on(im, 'load', function () { measure(); }, { once: true });
    });
    on(document, 'visibilitychange', kick);

    measure();
    render();
    sec.classList.add('so-ready');
    kick();

    function select(blockId) {
      for (var i = 0; i < n; i++) if (shoes[i].getAttribute('data-block-id') === blockId) { pauseAuto(); goToIndex(i); return; }
    }
    function destroy() {
      dead = true;
      listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
      if (mq && !mq.addEventListener && mq.removeListener) mq.removeListener(mqf);
      timers.forEach(clearTimeout);
      if (autoTimer) clearInterval(autoTimer);
      if (raf) cancelAnimationFrame(raf);
      if (io) io.disconnect();
      flying.forEach(function (f) { if (f.parentNode) f.parentNode.removeChild(f); });
      if (mHide) clearTimeout(mHide);
      if (mOpen) document.documentElement.classList.remove('so-lock');
      if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    }
    return { select: select, destroy: destroy };
  }

  function init(sec, o) { if (!sec || instances.has(sec)) return; var i = create(sec, o); if (i) instances.set(sec, i); }
  function destroy(sec) { var i = instances.get(sec); if (i) { i.destroy(); instances.delete(sec); } }
  function initAll(root, o) { [].forEach.call((root || document).querySelectorAll('[data-so]'), function (s) { init(s, o); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initAll(); }); else initAll();
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target, { noDrop: true }); });
  document.addEventListener('shopify:section:unload', function (e) { [].forEach.call(e.target.querySelectorAll('[data-so]'), destroy); });
  document.addEventListener('shopify:block:select', function (e) {
    var s = e.target && e.target.closest ? e.target.closest('[data-so]') : null;
    var i = s && instances.get(s);
    if (i && e.detail) i.select(e.detail.blockId);
  });
  window.ShoeOrbit = { init: init, destroy: destroy, initAll: initAll };
})();
