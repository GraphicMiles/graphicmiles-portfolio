/* ==========================================================================
   product.js — buy box, accordions, mobile gallery dots, Size Advisor drawer
   ========================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-product]');
  if (!root) return;

  var HANDLE = root.getAttribute('data-handle');
  var TITLE = root.getAttribute('data-title');
  var PRICE = parseFloat(root.getAttribute('data-price') || '0');
  var SIZES = (root.getAttribute('data-sizes') || '').split(',').filter(Boolean);
  var THUMB = root.getAttribute('data-thumb');
  var TYPE = root.getAttribute('data-type') || 'apparel';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var money = function (n) { return '$' + n.toFixed(2); };

  /* ------------------------------------------------------------- sizing */
  var state = {
    size: SIZES[0] || '',
    qty: 1,
    height: 165,
    weight: 60,
    garment: 'mens',
    shape: { bust: 1, stomach: 1, hips: 1 },
    fit: 'designed'
  };

  var pills = $$('.opt-pill');
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      if (p.disabled) return;
      setSize(p.getAttribute('data-size'));
    });
  });

  function setSize(size) {
    state.size = size;
    pills.forEach(function (p) {
      var on = p.getAttribute('data-size') === size;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    var live = $('[data-live-size]');
    if (live) live.textContent = size;
  }

  /* ----------------------------------------------------------- quantity */
  var qtyInput = $('[data-qty-input]');
  $$('[data-qty-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = state.qty + parseInt(b.getAttribute('data-qty-step'), 10);
      state.qty = Math.max(1, Math.min(99, next));
      qtyInput.value = state.qty;
      syncQty();
    });
  });
  if (qtyInput) {
    qtyInput.addEventListener('change', function () {
      var n = parseInt(qtyInput.value, 10);
      state.qty = isNaN(n) ? 1 : Math.max(1, Math.min(99, n));
      qtyInput.value = state.qty;
      syncQty();
    });
  }
  function syncQty() {
    var minus = $('[data-qty-step="-1"]');
    if (minus) minus.disabled = state.qty <= 1;
  }
  syncQty();

  /* --------------------------------------------------------- add to bag */
  function addToBag(open) {
    if (window.Cart) window.Cart.add(HANDLE, state.size, state.qty);
    var btn = $('[data-add]');
    if (btn) {
      btn.classList.add('is-added');
      var label = $('[data-add-label]', btn);
      if (label) {
        var old = label.textContent;
        label.textContent = 'Added';
        setTimeout(function () {
          label.textContent = old;
          btn.classList.remove('is-added');
        }, 1600);
      }
    }
    if (open) {
      setTimeout(function () { if (window.Cart) window.Cart.open(); }, 420);
    } else {
      toast(state.qty + ' \u00d7 ' + TITLE + ' (' + state.size + ') added to your bag');
    }
  }

  var addBtn = $('[data-add]');
  if (addBtn) addBtn.addEventListener('click', function () { addToBag(true); });

  var buyBtn = $('[data-buy]');
  if (buyBtn) {
    buyBtn.addEventListener('click', function () {
      if (window.Cart) window.Cart.add(HANDLE, state.size, state.qty);
      window.location.href = 'cart.html';
    });
  }

  var toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* --------------------------------------------------------- accordions */
  $$('.acc').forEach(function (acc) {
    var head = $('.acc__head', acc);
    head.addEventListener('click', function () {
      var open = acc.classList.toggle('is-open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ------------------------------------------------- mobile gallery dots */
  var gallery = $('[data-gallery]');
  var dotsWrap = $('[data-gallery-dots]');
  if (gallery && dotsWrap) {
    var slides = $$('.product-media__item', gallery);
    dotsWrap.innerHTML = slides.map(function (_, i) {
      return '<i' + (i === 0 ? ' class="is-active"' : '') + '></i>';
    }).join('');
    var dots = $$('i', dotsWrap);
    gallery.addEventListener('scroll', function () {
      var idx = Math.round(gallery.scrollLeft / gallery.clientWidth);
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    }, { passive: true });
  }

  /* ======================================================================
     Size Advisor
     ====================================================================== */
  var ICON = {
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="2.5" y="7.5" width="19" height="9" rx="1"/><path d="M6.5 7.5v3M10 7.5v2M13.5 7.5v3M17 7.5v2"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>',
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8h10M9 4.5L12.5 8 9 11.5"/></svg>',
    back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 8h-10M7 4.5L3.5 8 7 11.5"/></svg>'
  };

  function figureSVG() {
    return '<svg viewBox="0 0 60 230" fill="none" stroke="#8a8783" stroke-width=".9" aria-hidden="true">' +
      '<path d="M6 6v218" stroke-width=".6"/>' +
      '<path d="M6 10h7M6 30h5M6 50h5M6 70h5M6 90h5M6 110h5M6 130h5M6 150h5M6 170h5M6 190h5M6 210h5" stroke-width=".6"/>' +
      '<circle cx="34" cy="26" r="9"/>' +
      '<path d="M34 35v4M28 40c0 12-4 22-4 34 0 14 3 20 3 30m11-64c0 12 4 22 4 34 0 14-3 20-3 30"/>' +
      '<path d="M27 104c0 24-1 30-2 46m11-46c0 24 1 30 2 46M25 150h9M25 150l-2 66m9-66 2 66" stroke-linejoin="round"/>' +
      '<path d="M24 216h6M31 216h6"/>' +
      '<path d="M26 60h16M26 82h16" stroke-dasharray="2 3" stroke-width=".7"/>' +
      '<path d="M44 60v22" stroke-width=".7"/>' +
      '</svg>';
  }

  var SHAPE_ICONS = {
    bust: [
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M7 3h8l1 20-2 12H8L6 23z" stroke-linejoin="round"/></svg>',
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M6 3h10l1 20-2 12H7L5 23z" stroke-linejoin="round"/></svg>',
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M5 3h12l2 20-3 12H6L3 23z" stroke-linejoin="round"/></svg>'
    ],
    stomach: [
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M8 4v30M12 4v30" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M8 4v30M12 4v30" stroke-linecap="round"/><path d="M14 14c2 2 2 8 0 10" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M9 4v30M13 4v30" stroke-linecap="round"/><path d="M15 12c3 2 3 10 0 12" stroke-linecap="round"/></svg>'
    ],
    hips: [
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M6 4c0 8-1 16 0 30M16 4c0 8 1 16 0 30" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M7 4c0 8-2 20 0 30M15 4c0 8 2 20 0 30" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 22 38" fill="none" stroke="currentColor" stroke-width=".9"><path d="M8 4c0 8-4 20-2 30M14 4c0 8 4 20 2 30" stroke-linecap="round"/></svg>'
    ]
  };

  var FIT_ICONS = [
    '<svg viewBox="0 0 26 44" fill="none" stroke="currentColor" stroke-width=".9"><path d="M9 4h8l3 6-2 30H8L6 10z" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 26 44" fill="none" stroke="currentColor" stroke-width=".9"><path d="M8 4h10l4 6-3 30H7L4 10z" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 26 44" fill="none" stroke="currentColor" stroke-width=".9"><path d="M6 4h14l3 6-3 30H6L3 10z" stroke-linejoin="round"/><path d="M10 20h6M10 26h6M10 32h6" stroke-dasharray="1.5 2.5" stroke-width=".7"/></svg>'
  ];

  var drawer = document.createElement('div');
  drawer.className = 'szr';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML =
    '<div class="szr__scrim" data-szr-close></div>' +
    '<aside class="szr__panel" role="dialog" aria-modal="true" aria-label="Size Advisor">' +
      '<div class="szr__head"><span class="szr__title">Size Advisor</span>' +
        '<button type="button" class="szr__close" data-szr-close aria-label="Close">' + ICON.close + '</button></div>' +
      '<div class="szr__productrow">' +
        '<img class="szr__thumb" src="' + THUMB + '" alt="">' +
        '<div><div class="szr__pname">' + TITLE + '</div><div class="szr__pprice">' + money(PRICE) + '</div></div>' +
      '</div>' +
      '<div class="szr__bars" data-szr-bars><i class="szr__bar is-on"></i><i class="szr__bar"></i><i class="szr__bar"></i></div>' +
      '<div class="szr__body">' +
        /* step 1 */
        '<section class="szr-step is-active" data-szr-step="0">' +
          '<h3 class="szr-h">Let\u2019s find your fit</h3>' +
          '<p class="szr-p">Two measurements are all it takes. Drag to adjust.</p>' +
          '<div class="szr-label">Sizing</div>' +
          '<div class="szr-seg" data-szr-garment>' +
            '<button type="button" data-garment="womens">Womenswear</button>' +
            '<button type="button" data-garment="mens" class="is-active">Menswear</button>' +
          '</div>' +
          '<div class="szr-measure">' +
            '<div class="szr-figure">' + figureSVG() + '</div>' +
            '<div>' +
              '<div class="szr-field">' +
                '<div class="szr-field-top"><span>Height</span><span class="szr-units" data-szr-hunits><button type="button" class="is-active" data-unit="cm">cm</button><button type="button" data-unit="ft">ft/in</button></span></div>' +
                '<div class="szr-readout"><b data-szr-height>165</b><span data-szr-height-unit>cm</span></div>' +
                '<div class="szr-slider"><button type="button" data-szr-nudge="height" data-dir="-1" aria-label="Decrease height">\u2212</button>' +
                  '<input class="szr-range" type="range" min="140" max="210" step="1" value="165" data-szr-range="height" aria-label="Height">' +
                  '<button type="button" data-szr-nudge="height" data-dir="1" aria-label="Increase height">+</button></div>' +
              '</div>' +
              '<div class="szr-field">' +
                '<div class="szr-field-top"><span>Weight</span><span class="szr-units" data-szr-wunits><button type="button" class="is-active" data-unit="kg">kg</button><button type="button" data-unit="lbs">lbs</button></span></div>' +
                '<div class="szr-readout"><b data-szr-weight>60</b><span data-szr-weight-unit>kg</span></div>' +
                '<div class="szr-slider"><button type="button" data-szr-nudge="weight" data-dir="-1" aria-label="Decrease weight">\u2212</button>' +
                  '<input class="szr-range" type="range" min="35" max="150" step="1" value="60" data-szr-range="weight" aria-label="Weight">' +
                  '<button type="button" data-szr-nudge="weight" data-dir="1" aria-label="Increase weight">+</button></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="szr-live"><div><div class="szr-live__lab">Live estimate</div><div class="szr-live__sub">Refined in the next steps</div></div><div class="szr-live__size" data-live-size>' + (SIZES[2] || SIZES[0]) + '</div></div>' +
          '<p class="szr-note">' + ICON.lock + '<span>Saved privately on this device, so every piece shows your size.</span></p>' +
        '</section>' +
        /* step 2 */
        '<section class="szr-step" data-szr-step="1">' +
          '<h3 class="szr-h">Your shape</h3>' +
          '<p class="szr-p">Clothes fit bodies, not numbers. Not sure? Leave it at average.</p>' +
          '<div class="szr-shape-row"><div class="szr-label">Bust</div><div class="szr-shape-grid" data-shape="bust">' +
            shapeOption('bust', 0, 'Slimmer') + shapeOption('bust', 1, 'Average', true) + shapeOption('bust', 2, 'Broader') +
          '</div></div>' +
          '<div class="szr-shape-row"><div class="szr-label">Stomach</div><div class="szr-shape-grid" data-shape="stomach">' +
            shapeOption('stomach', 0, 'Flatter') + shapeOption('stomach', 1, 'Average', true) + shapeOption('stomach', 2, 'Rounder') +
          '</div></div>' +
          '<div class="szr-shape-row"><div class="szr-label">Hips</div><div class="szr-shape-grid" data-shape="hips">' +
            shapeOption('hips', 0, 'Narrower') + shapeOption('hips', 1, 'Average', true) + shapeOption('hips', 2, 'Fuller') +
          '</div></div>' +
        '</section>' +
        /* step 3 */
        '<section class="szr-step" data-szr-step="2">' +
          '<h3 class="szr-h">How do you like it to fit?</h3>' +
          '<p class="szr-p">We will size around the way you wear it.</p>' +
          '<div class="szr-fit" data-szr-fit>' +
            fitCard('close', 'Close', 'Follows the body. Sharp and tailored.', 0) +
            fitCard('designed', 'As designed', 'The silhouette the designer intended.', 1, true) +
            fitCard('relaxed', 'Relaxed', 'Room to move and layer underneath.', 2) +
          '</div>' +
        '</section>' +
        /* result */
        '<section class="szr-step" data-szr-step="3">' +
          '<div class="szr-result">' +
            '<div class="szr-result__eyebrow">Your size</div>' +
            '<div class="szr-dial">' +
              '<svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="68" fill="none" stroke="#e6e4e0" stroke-width="1"/>' +
              '<circle class="szr-dial__arc" cx="70" cy="70" r="68" fill="none" stroke="#111" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="427" stroke-dashoffset="60"/></svg>' +
              '<span class="szr-dial__letter" data-szr-result-size>M</span>' +
            '</div>' +
            '<div class="szr-match"><span data-szr-fitpct>86</span>% fit match</div>' +
            '<p class="szr-match-sub">A confident match for your measurements.</p>' +
            '<div class="szr-scale">' +
              '<div class="szr-scale__lab">You</div>' +
              '<div class="szr-scale__track"><span class="szr-scale__dot" data-szr-dot style="left:50%"></span></div>' +
              '<div class="szr-scale__names" data-szr-scale-names></div>' +
              '<p class="szr-scale__hint">Tap a size to see how it would fit.</p>' +
            '</div>' +
          '</div>' +
          '<div class="szr-cols"><span></span><span><i>Snug</i><i>Ideal</i><i>Room</i></span><span></span></div>' +
          '<div class="szr-table" data-szr-table></div>' +
          '<p class="szr-note2">Against your measurements this piece fits true to size.<br>A guide based on your measurements. Fit can vary by style and fabric.</p>' +
        '</section>' +
      '</div>' +
      '<div class="szr__foot">' +
        '<div class="szr__nav" data-szr-nav>' +
          '<button type="button" class="szr-back" data-szr-back hidden aria-label="Back">' + ICON.back + '</button>' +
          '<button type="button" class="szr-next" data-szr-next><span data-szr-next-label>Continue</span>' + ICON.arrow + '</button>' +
        '</div>' +
        '<div class="szr__links" data-szr-links hidden>' +
          '<button type="button" data-szr-select>Select ' + (SIZES[2] || SIZES[0]) + ' only</button>' +
          '<button type="button" data-szr-edit>Edit details</button>' +
        '</div>' +
      '</div>' +
    '</aside>';
  document.body.appendChild(drawer);

  function shapeOption(field, idx, label, active) {
    return '<button type="button" class="szr-opt' + (active ? ' is-active' : '') + '" data-shape-field="' + field + '" data-shape-val="' + idx + '">' +
      SHAPE_ICONS[field][idx] + '<span>' + label + '</span></button>';
  }
  function fitCard(id, label, desc, idx, active) {
    return '<button type="button" class="szr-fitcard' + (active ? ' is-active' : '') + '" data-fit="' + id + '">' +
      FIT_ICONS[idx] + '<span class="szr-fitcard__txt"><span class="szr-fitcard__t">' + label + '</span>' +
      '<span class="szr-fitcard__d">' + desc + '</span></span><span class="szr-radio"></span></button>';
  }

  var step = 0;
  var bars = $$('.szr__bar', drawer);
  var nav = $('[data-szr-nav]', drawer);
  var links = $('[data-szr-links]', drawer);
  var nextBtn = $('[data-szr-next]', drawer);
  var nextLabel = $('[data-szr-next-label]', drawer);
  var backBtn = $('[data-szr-back]', drawer);

  function units() {
    return { h: state.hUnit || 'cm', w: state.wUnit || 'kg' };
  }

  var LADDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  /* canonical apparel size from the two measurements + shape/fit nudges */
  function canonicalIndex() {
    var h = state.height, w = state.weight;
    var hIdx = h < 155 ? 0 : h < 162 ? 1 : h < 170 ? 2 : h < 178 ? 3 : h < 186 ? 4 : 5;
    var bmi = w / Math.pow(h / 100, 2);
    var bump = bmi < 17 ? -2 : bmi < 19 ? -1 : bmi < 25 ? 0 : bmi < 28 ? 1 : 2;
    var shape = (state.shape.bust - 1) + (state.shape.stomach - 1) + (state.shape.hips - 1);
    var idx = hIdx + bump + (shape > 1 ? 1 : shape < -1 ? -1 : 0);
    if (state.fit === 'close') idx -= 1;
    if (state.fit === 'relaxed') idx += 1;
    return Math.max(0, Math.min(5, idx));
  }

  function recIndex() {
    var n = SIZES.length;
    if (!n) return 0;
    if (TYPE === 'shoe') {
      var score = (state.height - 140) / 70 * 0.55 + (state.weight - 35) / 115 * 0.45;
      if (state.fit === 'close') score -= 0.08;
      if (state.fit === 'relaxed') score += 0.08;
      return Math.max(0, Math.min(n - 1, Math.round(score * (n - 1))));
    }
    var target = canonicalIndex();
    var best = 0, bestDist = 99;
    SIZES.forEach(function (s, i) {
      var rank = LADDER.indexOf(s.toUpperCase());
      if (rank < 0) return;
      var d = Math.abs(rank - target);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }

  function recSize() { return SIZES[recIndex()] || SIZES[0] || ''; }

  function render() {
    $$('.szr-step', drawer).forEach(function (s, i) {
      s.classList.toggle('is-active', i === step);
    });
    bars.forEach(function (b, i) { b.classList.toggle('is-on', i <= Math.min(step, 2)); });
    $('[data-szr-bars]', drawer).style.display = step === 3 ? 'none' : 'flex';

    var result = step === 3;
    nav.hidden = result;
    links.hidden = !result;
    backBtn.hidden = step === 0;
    nextLabel.textContent = step === 2 ? 'See my size' : 'Continue';

    if (result) {
      var size = recSize();
      var idx = recIndex();
      $('[data-szr-result-size]', drawer).textContent = size;
      $('[data-szr-select]', drawer).textContent = 'Select ' + size + ' only';
      var names = $('[data-szr-scale-names]', drawer);
      names.innerHTML = SIZES.map(function (s) {
        return s === size ? '<b>' + s + '</b>' : '<span>' + s + '</span>';
      }).join('');
      var pct = SIZES.length ? Math.round((idx + 1) / (SIZES.length + 1) * 100) : 50;
      var dot = $('[data-szr-dot]', drawer);
      dot.style.left = Math.max(2, Math.min(98, pct)) + '%';
      $('[data-szr-fitpct]', drawer).textContent = '86';
      var rows = [
        ['Bust', 'Close', 62], ['Waist', 'Close', 62], ['Hips', 'Close', 62], ['Length', 'Ideal', 84]
      ];
      $('[data-szr-table]', drawer).innerHTML = rows.map(function (r) {
        return '<div class="szr-row"><span class="szr-row__lab">' + r[0] + '</span>' +
          '<span class="szr-row__bar"><u style="left:62%"></u><i style="left:' + r[2] + '%"></i></span>' +
          '<span class="szr-row__val">' + r[1] + '</span></div>';
      }).join('');
      // arc
      var arc = $('.szr-dial__arc', drawer);
      if (arc) arc.setAttribute('stroke-dashoffset', String(Math.round(427 * (1 - 0.86))));
    }
  }

  function open() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render();
  }
  function close() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  $$('[data-size-advisor]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); step = 0; open(); });
  });
  $$('[data-szr-close]', drawer).forEach(function (b) { b.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
  });

  nextBtn.addEventListener('click', function () {
    if (step < 3) { step += 1; render(); }
  });
  backBtn.addEventListener('click', function () {
    if (step > 0) { step -= 1; render(); }
  });
  $('[data-szr-edit]', drawer).addEventListener('click', function () { step = 0; render(); });
  $('[data-szr-select]', drawer).addEventListener('click', function () {
    setSize(recSize());
    close();
  });

  /* step 1 interactions */
  var hRange = $('[data-szr-range="height"]', drawer);
  var wRange = $('[data-szr-range="weight"]', drawer);
  hRange.value = state.height;
  wRange.value = state.weight;

  function syncMeasure() {
    $('[data-szr-height]', drawer).textContent = state.height;
    $('[data-szr-weight]', drawer).textContent = state.weight;
    var lv = $('[data-live-size]', drawer);
    if (lv) lv.textContent = recSize();
  }
  hRange.addEventListener('input', function () { state.height = +hRange.value; syncMeasure(); });
  wRange.addEventListener('input', function () { state.weight = +wRange.value; syncMeasure(); });
  $$('[data-szr-nudge]', drawer).forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-szr-nudge');
      var d = parseInt(b.getAttribute('data-dir'), 10);
      if (f === 'height') { state.height = Math.max(140, Math.min(210, state.height + d)); hRange.value = state.height; }
      else { state.weight = Math.max(35, Math.min(150, state.weight + d)); wRange.value = state.weight; }
      syncMeasure();
    });
  });
  $$('[data-szr-garment] button', drawer).forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-szr-garment] button', drawer).forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      state.garment = b.getAttribute('data-garment');
    });
  });
  $$('[data-szr-hunits] button, [data-szr-wunits] button', drawer).forEach(function (b) {
    b.addEventListener('click', function () {
      var isHeight = !!b.closest('[data-szr-hunits]');
      $$('button', b.parentElement).forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      var u = b.getAttribute('data-unit');
      var readout = isHeight ? $('[data-szr-height]', drawer) : $('[data-szr-weight]', drawer);
      var unitEl = isHeight ? $('[data-szr-height-unit]', drawer) : $('[data-szr-weight-unit]', drawer);
      if (isHeight) {
        state.hUnit = u;
        readout.textContent = u === 'cm' ? state.height : Math.floor(state.height / 30.48) + '\u2032' + Math.round((state.height / 2.54) % 12) + '\u2033';
        unitEl.textContent = '';
      } else {
        state.wUnit = u;
        readout.textContent = u === 'kg' ? state.weight : Math.round(state.weight * 2.20462);
        unitEl.textContent = u === 'kg' ? 'kg' : 'lbs';
      }
    });
  });

  /* step 2 */
  $$('[data-shape-field]', drawer).forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-shape-field');
      $$('[data-shape="' + f + '"] .szr-opt', drawer).forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      state.shape[f] = +b.getAttribute('data-shape-val');
      syncMeasure();
    });
  });

  /* step 3 */
  $$('[data-fit]', drawer).forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-fit]', drawer).forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      state.fit = b.getAttribute('data-fit');
      syncMeasure();
    });
  });

  /* footer primary button doubles as "add to bag" on the result step */
  var addResult = document.createElement('button');
  addResult.type = 'button';
  addResult.className = 'szr-next';
  addResult.style.width = '100%';
  addResult.style.display = 'none';
  addResult.innerHTML = '<span data-szr-add-label></span>' + ICON.arrow;
  $('.szr__foot', drawer).insertBefore(addResult, $('.szr__links', drawer));
  addResult.addEventListener('click', function () {
    setSize(recSize());
    addToBag(true);
    close();
  });

  var renderBase = render;
  render = function () {
    renderBase();
    if (step === 3) {
      addResult.style.display = 'inline-flex';
      $('[data-szr-add-label]', drawer).textContent = 'Add ' + recSize() + ' to bag';
    } else {
      addResult.style.display = 'none';
    }
  };
  render();

  syncMeasure();
})();
