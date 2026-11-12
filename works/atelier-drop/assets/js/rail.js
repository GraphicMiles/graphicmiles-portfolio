/* ==========================================================================
   rail.js — hero scene rail: looping drag rail, hover/tap garment turn,
   swing tags, progress, focus overlay.
   Faithful to the reference behaviour: hover widens the piece & blends its
   front view in; click opens a closable focus view that can be dragged.
   ========================================================================== */
(function () {
  'use strict';

  var HOVER_MS = 650;
  var HOVER_GAP = 18;
  var TURN_MS = 700;
  var SWING = 0.6;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function build(section) {
    var deep = section.hasAttribute('data-sr-deep');
    var pieces = deep && DATA.railPiecesDeep ? DATA.railPiecesDeep : DATA.heroPieces;
    section.innerHTML =
      '<div class="sr-wrap">' +
      '<div class="sr-top"><div class="sr-railcap">' +
      '<span>NEW COLLECTION</span>' +
      '<span aria-hidden="true" class="sr-railcap-sep"></span>' +
      '<span class="sr-railcap-dim">PREMIUM STREETWEAR</span>' +
      '</div></div>' +
      '<div class="sr-stage">' +
      rodSVG(section) +
      '<div class="sr-rack sr-looping" data-rail-rack></div>' +
      '</div>' +
      '<div class="sr-foot">' +
      '<div class="sr-peek" aria-live="polite">' +
      '<span class="sr-peek-hint sr-hint-d">Hover a piece · click to look closer</span>' +
      '<span class="sr-peek-hint sr-hint-m">Tap a piece to turn it · tap again to look closer</span>' +
      '<span class="sr-peek-info"><span class="sr-peek-name" data-peek-name></span>' +
      '<span class="sr-peek-price" data-peek-price></span></span>' +
      '</div>' +
      '<div class="sr-prog" role="presentation"><i></i></div>' +
      '<div class="sr-corner">' +
      '<div class="sr-corner-h">Crafted in heavyweight fleece. Cut oversized. Made to last.</div>' +
      '<div class="sr-cta-w">' +
      '<a class="sr-cta-link" href="collection.html"><span>Shop the Collection</span>' +
      '<svg class="sr-cta-ar" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 5h13M10 1l4 4-4 4"></path></svg></a>' +
      '</div></div>' +
      '</div></div>';

    var rack = section.querySelector('[data-rail-rack]');
    pieces.forEach(function (p, i) {
      rack.appendChild(itemEl(p, i));
    });

    measure(section, rack);
    initDrag(section, rack);
    initHover(section, rack);
    window.addEventListener('resize', function () {
      measure(section, rack);
    });
  }

  function deepRod(section) {
    return !!(section && section.hasAttribute('data-sr-deep'));
  }

  function rodSVG(section) {
    var deep = deepRod(section);
    var d = deep ? window.ROD_PATH_DEEP : window.ROD_PATH;
    var hh = deep ? 403 : 394;
    return (
      '<svg class="sr-rodsvg" viewBox="0 0 1440 ' + hh + '" preserveAspectRatio="none" height="' + hh + '" aria-hidden="true">' +
      '<defs><linearGradient id="sr-grad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#f6f7f8"></stop>' +
      '<stop offset=".5" stop-color="#b3b8be"></stop>' +
      '<stop offset="1" stop-color="#5f656c"></stop>' +
      '</linearGradient></defs>' +
      '<path class="sr-rod-shadow" d="' + d + '" transform="translate(0 4)"></path>' +
      '<path class="sr-rod-bar" d="' + d + '"></path>' +
      '</svg>'
    );
  }

  function itemEl(p, i) {
    var node = el('div', 'sr-item');
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', p.title);
    node.setAttribute('data-idx', i);
    node.setAttribute('data-name', p.title);
    node.setAttribute('data-price', DATA.money(p.price));
    node.setAttribute('data-w', String(p.w));
    node.setAttribute('data-sw', String(p.sw));
    node.style.setProperty('--sr-sw', p.sw.toFixed(2) + 'deg');

    var views = '';
    // side (rest), front, back
    views += '<div class="sr-view" data-pos="0"><img alt="' + p.title + ' – side" loading="lazy" src="' + DATA.img + p.views[0] + '"></div>';
    views += '<div class="sr-view" data-pos="1"><img alt="' + p.title + ' – front" loading="lazy" src="' + DATA.img + p.views[1] + '"></div>';
    if (p.views[2]) {
      views += '<div class="sr-view" data-pos="-1"><img alt="' + p.title + ' – back" loading="lazy" src="' + DATA.img + p.views[2] + '"></div>';
    }

    node.innerHTML =
      '<div class="sr-garment">' + views + '</div>' +
      '<div class="sr-tag" aria-hidden="true"><div class="sr-tag-inner">' +
      '<span class="sr-tag-face">$' + p.price + '</span>' +
      '</div></div>';
    return node;
  }

  /* the rail is wider than the viewport and loops by duplicating the set
     either side; we simply let it scroll and measure the natural set */
  function railHeight(section) {
    var probe = section.querySelector('.sr-rack');
    var v = probe ? parseFloat(getComputedStyle(probe).getPropertyValue('--sr-h')) : 0;
    return v || 320;
  }

  function applyWidths(section, rack) {
    var h = railHeight(section);
    rack.querySelectorAll('.sr-item').forEach(function (it) {
      var w = parseFloat(it.getAttribute('data-w')) || 0.33;
      it.style.width = (h * w).toFixed(2) + 'px';
    });
  }

  /* garments hang off the catenary: translate each piece down by the rod's
     sag at its centre, exactly like the reference. */
  function rodY(centerX, deep) {
    var pts = (deep ? window.ROD_PTS_DEEP : window.ROD_PTS) || [];
    var vw = document.documentElement.clientWidth || 1440;
    var x = (centerX / vw) * 1440;
    for (var i = 1; i < pts.length; i++) {
      if (pts[i][0] >= x) {
        var a = pts[i - 1];
        var b = pts[i];
        var t = (x - a[0]) / (b[0] - a[0] || 1);
        return a[1] + (b[1] - a[1]) * t - 17;
      }
    }
    return 0;
  }
  function applyCurve(rack, deep) {
    var rackRect = rack.getBoundingClientRect();
    rack.querySelectorAll('.sr-item').forEach(function (it) {
      var r = it.getBoundingClientRect();
      var cy = rodY(r.left + r.width / 2 - rackRect.left + 0, deep);
      it.style.translate = '0px ' + cy.toFixed(1) + 'px';
    });
  }

  var gapCache = {};
  function trimTop(img) {
    var src = img.currentSrc || img.src;
    if (!src) return;
    if (gapCache[src] !== undefined) {
      applyGap(img, gapCache[src]);
      return;
    }
    gapCache[src] = 0;
    (window.requestIdleCallback || function (f) { return setTimeout(f, 60); })(function () {
      var frac = 0;
      try {
        var nw = img.naturalWidth || 1;
        var nh = img.naturalHeight || 1;
        var w = Math.min(160, nw, 512 * nw / nh);
        var h = Math.max(1, Math.round(nh * (w / nw)));
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        var rows = Math.ceil(h * 0.35);
        var data = ctx.getImageData(0, 0, w, rows).data;
        var row = 0;
        var found = false;
        for (; row < rows && !found; row++) {
          for (var i = row * w * 4 + 3; i < (row + 1) * w * 4; i += 4) {
            if (data[i] > 12) { found = true; break; }
          }
        }
        if (found) frac = (row - 1) / h;
      } catch (e) { frac = 0; }
      gapCache[src] = Math.max(0, frac);
      document.querySelectorAll('.sr-view img').forEach(function (el) {
        if ((el.currentSrc || el.src) === src) applyGap(el, gapCache[src]);
      });
    });
  }

  function applyGap(img, frac) {
    if (frac > 0.004) img.style.transform = 'translateY(-' + (frac * 100).toFixed(2) + '%)';
  }

  function watchImages(root) {
    root.querySelectorAll('.sr-view img').forEach(function (img) {
      if (img.complete && img.naturalWidth) trimTop(img);
      else img.addEventListener('load', function () { trimTop(img); }, { once: true });
    });
  }

  function measure(section, rack) {
    var vw = document.documentElement.clientWidth;
    applyWidths(section, rack);
    var contentW = 0;
    var items = rack.querySelectorAll('.sr-item');
    for (var i = 0; i < items.length; i++) contentW += items[i].offsetWidth;
    contentW += (items.length - 1) * 10;

    // fill the rail to approximately 2x viewport width by cloning
    var clones = rack.querySelectorAll('[data-clone]');
    clones.forEach(function (c) {
      c.parentNode.removeChild(c);
    });
    var set = Array.prototype.slice.call(items);
    var guard = 0;
    var loop = !section.hasAttribute('data-sr-deep');
    while (loop && contentW < vw * 2.4 && guard < 8) {
      set.forEach(function (it) {
        var c = it.cloneNode(true);
        c.setAttribute('data-clone', '1');
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('tabindex', '-1');
        rack.appendChild(c);
      });
      contentW *= 2;
      guard++;
    }
    // the strip starts on the first live piece, at the page margin; on the
    // standalone page the theme's scroll snap is off, so width the lead-in
    rack.scrollLeft = 0;
    applyWidths(section, rack);
    applyCurve(rack, deepRod(section));
    watchImages(rack);
    updateProgress(section, rack);
  }

  function updateProgress(section, rack) {
    var prog = section.querySelector('.sr-prog');
    if (!prog) return;
    var max = rack.scrollWidth - rack.clientWidth;
    var frac = max > 0 ? rack.scrollLeft / max : 0;
    var w = 24;
    prog.style.setProperty('--sr-pl', (frac * (100 - w)).toFixed(2) + '%');
    prog.style.setProperty('--sr-pw', w + '%');
  }

  function initDrag(section, rack) {
    var down = false;
    var startX = 0;
    var startScroll = 0;
    var moved = 0;

    rack.addEventListener('pointerdown', function (ev) {
      if (ev.button !== 0) return;
      down = true;
      moved = 0;
      startX = ev.clientX;
      startScroll = rack.scrollLeft;
    });
    window.addEventListener('pointermove', function (ev) {
      if (!down) return;
      var dx = ev.clientX - startX;
      if (Math.abs(dx) > 4) {
        rack.classList.add('sr-dragging');
        moved = Math.abs(dx);
      }
      rack.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', function () {
      down = false;
      rack.classList.remove('sr-dragging');
      setTimeout(function () {
        moved = 0;
      }, 30);
    });
    rack.addEventListener(
      'click',
      function (ev) {
        if (moved > 8) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      },
      true
    );
    var rafPending = false;
    rack.addEventListener('scroll', function () {
      updateProgress(section, rack);
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(function () {
          rafPending = false;
          applyCurve(rack, deepRod(section));
        });
      }
    });

    var prog = section.querySelector('.sr-prog');
    if (prog) {
      prog.addEventListener('click', function (ev) {
        var r = prog.getBoundingClientRect();
        var f = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
        rack.scrollTo({ left: f * (rack.scrollWidth - rack.clientWidth), behavior: 'smooth' });
      });
    }
  }

  function blend(item, target) {
    var views = item.querySelectorAll('.sr-view');
    views.forEach(function (v) {
      var pos = parseInt(v.getAttribute('data-pos'), 10);
      var on = pos === target;
      v.style.opacity = on ? '1' : '0';
      v.style.transition = 'opacity ' + TURN_MS + 'ms ease';
    });
  }

  function initHover(section, rack) {
    var live = null;
    var peekName = section.querySelector('[data-peek-name]');
    var peekPrice = section.querySelector('[data-peek-price]');
    var peek = section.querySelector('.sr-peek');
    var fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function setLive(item) {
      if (live === item) return;
      if (live) {
        live.classList.remove('sr-live');
        live.style.width = '';
        blend(live, 0);
      }
      live = item;
      if (item) {
        item.classList.add('sr-live');
        var h = parseFloat(getComputedStyle(section.querySelector('.sr-rack')).getPropertyValue('--sr-h')) || 320;
        // widen to fit the front view (aspect ratio of the widest view)
        var img = item.querySelector('.sr-view[data-pos="1"] img');
        var w = h * 0.42;
        if (img && img.naturalWidth && img.naturalHeight) w = h * (img.naturalWidth / img.naturalHeight);
        item.style.width = Math.round(w) + 'px';
        item.style.transition = 'width ' + HOVER_MS + 'ms cubic-bezier(.25,.46,.45,.94), margin ' + HOVER_MS + 'ms cubic-bezier(.25,.46,.45,.94)';
        blend(item, 1);
        peekName.textContent = item.getAttribute('data-name');
        peekPrice.textContent = item.getAttribute('data-price');
        peek.classList.add('sr-peek-on');
      } else {
        peek.classList.remove('sr-peek-on');
      }
    }

    function closestItem(t) {
      return t && t.closest ? t.closest('.sr-item') : null;
    }

    rack.addEventListener('pointerover', function (ev) {
      if (!fineHover) return;
      var it = closestItem(ev.target);
      if (it && rack.contains(it)) setLive(it);
    });
    rack.addEventListener('pointerout', function (ev) {
      if (!fineHover) return;
      var it = closestItem(ev.target);
      if (it && !it.contains(ev.relatedTarget)) setLive(null);
    });
    rack.addEventListener('pointerleave', function () {
      if (fineHover) setLive(null);
    });

    /* tap: first tap turns, second opens */
    var tapped = null;
    rack.addEventListener('click', function (ev) {
      var it = closestItem(ev.target);
      if (!it) return;
      if (fineHover) {
        openFocus(section, it.getAttribute('data-idx'));
        return;
      }
      if (tapped === it) {
        openFocus(section, it.getAttribute('data-idx'));
        tapped = null;
        return;
      }
      if (tapped && tapped !== it) blend(tapped, 0);
      tapped = it;
      setLive(it);
    });

    rack.addEventListener('keydown', function (ev) {
      var it = closestItem(ev.target);
      if (!it) return;
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        openFocus(section, it.getAttribute('data-idx'));
      }
    });
    rack.addEventListener('focusin', function (ev) {
      var it = closestItem(ev.target);
      if (it && fineHover) setLive(it);
    });
  }

  /* ---------- focus overlay ---------- */
  function openFocus(section, idx) {
    var pieces = DATA.heroPieces;
    var p = pieces[parseInt(idx, 10) % pieces.length];
    if (!p) return;
    var host = document.querySelector('[data-focus-host]');
    host.innerHTML =
      '<div class="sr-focus sr-open" role="dialog" aria-modal="true" aria-label="' + p.title + '">' +
      '<button class="sr-focus-close" type="button" data-focus-close><span>Close</span><span class="sr-x"></span></button>' +
      '<div class="sr-focus-inner">' +
      '<div class="sr-focus-stage"><div class="sr-garment">' +
      '<div class="sr-view" data-pos="1"><img alt="' + p.title + ' – front" src="' + DATA.img + p.views[1] + '"></div>' +
      (p.views[2]
        ? '<div class="sr-view" data-pos="-1"><img alt="' + p.title + ' – back" src="' + DATA.img + p.views[2] + '"></div>'
        : '') +
      '</div></div>' +
      '<div class="sr-focus-meta">' +
      '<div class="sr-focus-idx">' + (parseInt(idx, 10) % pieces.length + 1) + ' / ' + pieces.length + '</div>' +
      '<div class="sr-focus-name">' + p.title + '</div>' +
      '<div class="sr-focus-price">' + DATA.money(p.price) + '</div>' +
      '</div>' +
      (p.views[2]
        ? '<div class="sr-focus-tabs"><button type="button" class="sr-tab sr-tab-on" data-face="1" aria-pressed="true">Front</button>' +
          '<button type="button" class="sr-tab" data-face="-1" aria-pressed="false">Back</button></div>'
        : '') +
      '<a class="sr-focus-cta" href="' + DATA.productUrl(p.handle) + '">View in the shop' +
      '<svg width="15" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 5h13M10 1l4 4-4 4"></path></svg></a>' +
      '</div></div>';

    var layer = host.querySelector('.sr-focus');
    var stage = layer.querySelector('.sr-focus-stage');
    var garment = layer.querySelector('.sr-garment');
    var angle = 0;
    var dragging = false;
    var startX = 0;

    function apply() {
      garment.style.transform = 'rotateY(' + angle + 'deg)';
      garment.style.transformStyle = 'preserve-3d';
    }
    apply();

    layer.addEventListener('click', function (ev) {
      if (ev.target === layer || ev.target.closest('[data-focus-close]')) close();
      var tab = ev.target.closest('[data-face]');
      if (tab) {
        var face = parseInt(tab.getAttribute('data-face'), 10);
        angle = face === 1 ? 0 : 180;
        garment.style.transition = 'transform 520ms cubic-bezier(.3,.7,.2,1)';
        apply();
        layer.querySelectorAll('[data-face]').forEach(function (b) {
          var on = b === tab;
          b.classList.toggle('sr-tab-on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
    });

    stage.addEventListener('pointerdown', function (ev) {
      dragging = true;
      startX = ev.clientX;
      stage.setPointerCapture && stage.setPointerCapture(ev.pointerId);
      garment.style.transition = 'none';
    });
    stage.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      angle += (ev.clientX - startX) * 0.6;
      startX = ev.clientX;
      apply();
    });
    stage.addEventListener('pointerup', function () {
      dragging = false;
      angle = Math.round(angle / 180) * 180;
      garment.style.transition = 'transform 480ms cubic-bezier(.3,.7,.2,1)';
      apply();
    });

    function onKey(ev) {
      if (ev.key === 'Escape') close();
    }
    function close() {
      document.removeEventListener('keydown', onKey);
      host.innerHTML = '';
    }
    document.addEventListener('keydown', onKey);
  }

  function init(section) {
    build(section);
  }

  window.SceneRail = { init: init };
  document.addEventListener('DOMContentLoaded', function () {
    var s = document.querySelector('[data-rail]');
    if (s) init(s);
  });
})();
