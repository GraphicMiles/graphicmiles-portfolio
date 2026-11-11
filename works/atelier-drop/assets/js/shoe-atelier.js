/* shoe-atelier.js — shelf wall (theme section script, transcribed; local cart) */

  /* static clone: cart writes go to the local bag instead of /cart/add */
  const localAdd = (handle, size, qty) => {
    if (window.Cart && handle) window.Cart.add(handle, size || '', qty || 1);
  };
(() => {
  if (customElements.get('shoe-atelier')) return;

  /* ---------- helpers ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const phoneMq = matchMedia('(max-width: 749px)');
  const root = () => '/';
  // The store header (and announcement bar) the product view stays below.
  const HEADER_SEL = 'header-component, sticky-header, #header-group, .shopify-section-group-header-group, #shopify-section-header, .shopify-section-header, .section-header, header.header, .header-wrapper';
  const CART_SEL = ['cart-icon', '#cart-icon-bubble', '.header__icon--cart', '[data-cart-icon]', '.header-actions__cart-icon', '.header__cart', 'a[href$="/cart"]'];
  const EXPO_IN_OUT = 'cubic-bezier(.87,0,.13,1)';
  const EXPO_OUT = 'cubic-bezier(.16,1,.3,1)';
  const POWER_IN_OUT = 'cubic-bezier(.65,0,.35,1)';
  const store = {
    get(k) { try { const v = localStorage.getItem(k); return v === null ? undefined : JSON.parse(v); } catch { return undefined; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const play = (el, frames, opts) => {
    if (reduced.matches || !el || !el.animate) return Promise.resolve();
    return el.animate(frames, opts).finished.catch(() => {});
  };
  const loaded = img => img.complete && img.naturalWidth ? Promise.resolve() :
    new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); setTimeout(r, 1500); });
  // Loaded AND decoded, so swapping it in can never paint an empty frame (that was the blink).
  const ready = (img, ms = 2500) => {
    if (!img || !img.getAttribute('src')) return Promise.resolve();
    const d = img.decode ? img.decode().catch(() => loaded(img)) : loaded(img);
    return Promise.race([d, new Promise(r => setTimeout(r, ms))]);
  };
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  const frames2 = () => frame().then(frame);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // The visible picture inside an object-fit: contain box (ax / ay = object-position).
  const contentBox = (img, ax = .5, ay = .5) => {
    const r = img.getBoundingClientRect(), w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return { left: r.left, top: r.top, width: r.width, height: r.height };
    const k = Math.min(r.width / w, r.height / h), cw = w * k, ch = h * k;
    return { left: r.left + (r.width - cw) * ax, top: r.top + (r.height - ch) * ay, width: cw, height: ch };
  };
  // A picture of the given ratio, contained and centred in a box.
  const fit = (r, ratio) => {
    const w = Math.min(r.width, r.height * ratio), h = w / ratio;
    return { left: r.left + (r.width - w) / 2, top: r.top + (r.height - h) / 2, width: w, height: h };
  };
  // FLIP: an element laid out at rect b, drawn at rect a (transform-origin 0 0).
  const flip = (a, b, lift = 0) => 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top - lift) + 'px) scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')';
  const mix = (a, b, t) => ({ left: a.left + (b.left - a.left) * t, top: a.top + (b.top - a.top) * t, width: a.width + (b.width - a.width) * t, height: a.height + (b.height - a.height) * t });
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // A sharper copy of a Shopify CDN image, for the flight into the large gallery.
  const hiRes = (src, w = 1600) => {
    try {
      const u = new URL(src, location.href);
      if (!/\/cdn\/shop\/|cdn\.shopify\.com/.test(u.href)) return src;
      u.searchParams.set('width', w);
      u.searchParams.delete('height');
      u.searchParams.delete('crop');
      return u.href;
    } catch { return src; }
  };
  const samePic = (a, b) => { try { return new URL(a, location.href).pathname === new URL(b, location.href).pathname; } catch { return false; } };

  /* ---------- generated sounds (Web Audio) ---------- */
  function makeSfx(isOn, vol) {
    let ac = null, noise = null;
    const ctx = () => {
      if (!isOn()) return null;
      if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; try { ac = new AC(); } catch { return null; } }
      if (ac.state === 'suspended') ac.resume();
      if (!noise) {
        noise = ac.createBuffer(1, Math.floor(ac.sampleRate * .06), ac.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      }
      return ac;
    };
    const snap = (c, t, g0, f, dur = .045) => {
      const s = c.createBufferSource(); s.buffer = noise;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 1.1;
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(g0 * vol, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + .07);
    };
    const tone = (c, t, f0, f1, g0, dur) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(g0 * vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .02);
    };
    return {
      riffle() { const c = ctx(); if (!c) return; let t = c.currentTime + .01;
        for (let i = 0; i < 18; i++) { snap(c, t, .32 * (.55 + Math.random() * .45), 1800 + Math.random() * 2400); t += Math.max(.012, .034 - i * .0013); }
        t += .05; snap(c, t, .4, 900, .06); tone(c, t, 150, 70, .25, .14); },
      tick() { const c = ctx(); if (!c) return; snap(c, c.currentTime + .005, .18, 3200, .03); },
      pop() { const c = ctx(); if (!c) return; const t = c.currentTime + .01; tone(c, t, 660, 990, .18, .12); tone(c, t + .09, 1320, 1320, .12, .35); }
    };
  }

  class ShoeAtelier extends HTMLElement {
    /* ================= lifecycle ================= */
    connectedCallback() {
      if (this.ready) return;
      if (this.querySelector('[data-sa-ready]')) { this.init(); return; }
      // Upgraded while the parser is still adding children: wait for the end marker.
      this.waiter ??= new MutationObserver(() => {
        if (!this.querySelector('[data-sa-ready]')) return;
        this.waiter.disconnect();
        this.waiter = null;
        this.init();
      });
      this.waiter.observe(this, { childList: true, subtree: true });
    }

    disconnectedCallback() {
      this.waiter?.disconnect();
      this.waiter = null;
      if (!this.ready) return;
      this.abort.abort();
      this.stopAnim();
      clearTimeout(this.wheelT);
      if (this.ui.pop.open) this.ui.pop.close();
      this.lock(false);
      this.ready = false;
    }

    init() {
      this.ready = true;
      this.abort = new AbortController();
      this.stage = this.querySelector('[data-sa-stage]');
      this.wall = this.querySelector('[data-sa-wall]');
      this.viewport = this.querySelector('[data-sa-viewport]');
      this.grid = this.querySelector('[data-sa-grid]');
      this.seg = this.querySelector('[data-sa-seg]');
      this.ui = {};
      this.querySelectorAll('[data-sa-ref]').forEach(el => { this.ui[el.dataset.saRef] = el; });
      try { this.text = JSON.parse(this.querySelector('[data-sa-text]').textContent); } catch { this.text = {}; }
      const list = v => String(v || '').split(',').map(Number).filter(Boolean);
      const white = this.dataset.images === 'white';
      this.cfg = {
        white,
        card: white && !this.wall.classList.contains('sa-wall--photo'),
        seat: this.dataset.seat === 'true',
        fx: this.dataset.fx === 'shutter' ? 'shutter' : 'glide',
        k: Math.max(.5, (+this.dataset.speed || 1000) / 1000),
        fade: Math.min(1, Math.max(0, (+this.dataset.fade || 85) / 100)),
        rows: clamp(+this.dataset.rows || 3, 1, 6),
        colorStyle: this.dataset.colorStyle === 'swatches' ? 'swatches' : 'images',
        gridD: list(this.dataset.gridD),
        gridM: list(this.dataset.gridM),
        after: this.dataset.after === 'drawer' ? 'drawer' : 'message',
        colors: (this.dataset.colorNames || 'color,colour').split(',').map(s => s.trim()).filter(Boolean)
      };
      this.style.setProperty('--k', this.cfg.k);
      this.style.setProperty('--sa-fade', String(1 - this.cfg.fade));
      // Sound starts off; a shopper who turns it on is remembered.
      this.sound = this.dataset.sound === 'true' && store.get('sa-sound') === true;
      this.sfx = makeSfx(() => this.sound, .6);
      this.state = 'idle';
      this.cur = null;
      this.x = 0;
      this.tx = 0;
      this.page = 0;
      this.pages = 1;
      this.per = 1;
      this.pageW = 1;
      this.shown = -1;
      this.raf = 0;
      this.drag = null;
      this.refreshItems();
      const count = this.querySelector('[data-sa-count]');
      if (count) count.textContent = this.items.length;
      this.bind();
      this.paintSound();
      this.applyGrid(false);
      this.seatAll();
      (window.requestIdleCallback || (fn => setTimeout(fn, 400)))(() => this.preload(0));
    }

    refreshItems() { this.items = [...this.querySelectorAll('[data-sa-item]')]; }

    bind() {
      const on = (el, type, fn, opts) => el.addEventListener(type, fn, { signal: this.abort.signal, ...opts });
      on(this, 'click', e => this.onClick(e));
      // keyboard vs touch/mouse: focus rings only for keyboard users
      on(document, 'keydown', e => { if (e.key === 'Tab' || e.key.startsWith('Arrow')) { this.kbd = true; this.classList.add('is-kbd'); } }, { capture: true });
      on(document, 'pointerdown', () => { this.kbd = false; this.classList.remove('is-kbd'); }, { capture: true });
      on(this.ui.pop, 'cancel', e => { e.preventDefault(); this.close(); });
      on(document, 'keydown', e => { if (e.key === 'Escape' && this.state === 'detail') { e.preventDefault(); this.close(); } });
      // The header stays usable: tapping it (cart icon, menu) closes the product view quickly,
      // and the theme opens its own cart drawer or menu as normal.
      on(document, 'click', e => {
        if (this.state !== 'detail') return;
        const h = e.target.closest?.(HEADER_SEL);
        if (h && !this.contains(h)) this.close(true);
      }, { capture: true });
      on(this.ui.pop, 'close', () => { if (this.state !== 'idle' && this.state !== 'closing') this.reset(); });
      let rz = 0;
      on(window, 'resize', () => {
        if (!this.rzRaf) this.rzRaf = requestAnimationFrame(() => {
          this.rzRaf = 0;
          if (this.state !== 'idle' || this.drag) return;
          this.stopAnim();
          this.measure();
          this.goTo(this.page, true);
        });
        clearTimeout(rz);
        rz = setTimeout(() => this.reseat(), 150);
      });
      on(phoneMq, 'change', () => this.applyGrid(false));
      on(window, 'resize', () => { if (this.ui.pop.open) this.placePop(); });
      on(document, 'shopify:block:select', e => {
        const i = this.items.findIndex(b => b.dataset.block === e.detail?.blockId);
        if (i < 0) return;
        this.close(true).then(() => { this.goTo(this.pageOf(this.items[i]), true); this.open(i); });
      });
      on(document, 'shopify:section:select', e => { if (e.target.contains(this)) this.close(true); });
      on(this.ui.progress, 'click', e => {
        if (this.pages < 2) return;
        const r = this.ui.progress.getBoundingClientRect();
        this.moveTo(-clamp((e.clientX - r.left) / r.width, 0, 1) * (this.pages - 1) * this.pageW);
      });
      this.bindSwipe(on);
      this.bindGallery(on);
    }

    onClick(e) {
      const item = e.target.closest('[data-sa-item]');
      if (item && this.contains(item)) { this.open(this.items.indexOf(item)); return; }
      const b = e.target.closest('[data-sa-act]');
      if (!b || !this.contains(b)) return;
      switch (b.dataset.saAct) {
        case 'close': this.close(); break;
        case 'atc': this.addToCart(); break;
        case 'thumb': this.setMain(+b.dataset.i); break;
        case 'opt': this.choose(+b.dataset.o, b.dataset.v); break;
        case 'grid': this.setGrid(+b.dataset.n); break;
        case 'shuffle': this.shuffle(b); break;
        case 'prev': this.step(-1); break;
        case 'next': this.step(1); break;
        case 'bag': e.preventDefault(); this.openBag(); break;
        case 'sound': this.sound = !this.sound; store.set('sa-sound', this.sound); this.paintSound(); this.sfx.tick(); break;
      }
    }

    // Lock page scroll without the page shifting when the scrollbar disappears.
    lock(on) {
      const html = document.documentElement;
      if (on) {
        if (this.locked) return;
        this.locked = true;
        const sb = innerWidth - html.clientWidth;
        this.prevLock = { o: html.style.overflow, p: html.style.paddingRight };
        if (sb > 0) html.style.paddingRight = ((parseFloat(getComputedStyle(html).paddingRight) || 0) + sb) + 'px';
        html.style.overflow = 'hidden';
      } else if (this.locked) {
        this.locked = false;
        html.style.overflow = this.prevLock?.o || '';
        html.style.paddingRight = this.prevLock?.p || '';
      }
    }

    data(btn) {
      if (btn._sa) return btn._sa;
      try { btn._sa = JSON.parse(btn.closest('[data-sa-prod]').querySelector('script[data-sa-json]').textContent); } catch { btn._sa = null; }
      return btn._sa;
    }

    colors() {
      const cs = getComputedStyle(this);
      return { wall: cs.getPropertyValue('--sa-wall').trim() || '#f2f1ee', studio: cs.getPropertyValue('--sa-studio').trim() || '#f3f2ef' };
    }

    paintSound() { this.querySelector('[data-sa-act="sound"]')?.setAttribute('aria-pressed', String(this.sound)); }

    /* ================= seating: every product stands on its shelf ================= */
    seatAll() {
      if (!this.cfg.seat) return;
      const imgs = [...this.querySelectorAll('img.sa-img')];
      const idle = window.requestIdleCallback || (fn => setTimeout(fn, 16));
      const next = () => {
        const img = imgs.shift();
        if (!img || !this.ready) return;
        this.measureSeat(img).finally(() => idle(next));
      };
      next();
    }

    measureSeat(img) {
      return new Promise(done => {
        let src = img.currentSrc || img.getAttribute('src');
        if (!src) { done(); return; }
        try {
          const u = new URL(src, location.href);
          if (u.searchParams.has('width') || /\/cdn\/shop\/|cdn\.shopify\.com/.test(u.href)) { u.searchParams.set('width', '200'); src = u.href; }
        } catch {}
        const probe = new Image();
        probe.crossOrigin = 'anonymous';
        probe.decoding = 'async';
        probe.onload = () => {
          try {
            const w = Math.min(200, probe.naturalWidth), h = Math.round(probe.naturalHeight * w / probe.naturalWidth);
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            const g = c.getContext('2d', { willReadFrequently: true });
            g.drawImage(probe, 0, 0, w, h);
            const px = g.getImageData(0, 0, w, h).data;
            const white = this.cfg.white;
            let blank = 0;
            rows: for (let y = h - 1; y > 0; y--) {
              for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                const empty = white ? (px[i] > 242 && px[i + 1] > 242 && px[i + 2] > 242) || px[i + 3] < 16 : px[i + 3] < 16;
                if (!empty) break rows;
              }
              blank++;
            }
            img._seat = Math.min(.45, blank / h);
            img._ratio = probe.naturalWidth / probe.naturalHeight;
            this.applySeat(img);
          } catch { /* the image host does not allow reading pixels: leave it as it is */ }
          done();
        };
        probe.onerror = done;
        probe.src = src;
      });
    }

    applySeat(img) {
      if (!img._seat || !img._ratio) return;
      const w = img.offsetWidth, h = img.offsetHeight;
      if (!w || !h) return;
      const drawn = Math.min(h, w / img._ratio);
      img.style.setProperty('--seat', (img._seat * drawn).toFixed(1) + 'px');
    }

    reseat() { this.querySelectorAll('img.sa-img').forEach(img => this.applySeat(img)); }

    /* ================= pages: rows × columns, side by side ================= */
    cols() {
      const cs = getComputedStyle(this);
      return parseInt(cs.getPropertyValue('--cols-user'), 10) || parseInt(cs.getPropertyValue('--cols'), 10) || 2;
    }

    measure() { this.pageW = this.viewport.clientWidth || 1; }

    // Places every cell explicitly: page p, row r, column c. Each page reads left to right, top to bottom.
    layout() {
      const cells = [...this.grid.children], c = this.cols(), per = c * this.cfg.rows;
      this.per = per;
      cells.forEach((cell, i) => {
        const p = Math.floor(i / per), j = i % per;
        cell.style.gridRow = String(Math.floor(j / c) + 1);
        cell.style.gridColumn = String(p * c + (j % c) + 1);
      });
      this.pages = Math.max(1, Math.ceil(cells.length / per));
      this.style.setProperty('--pages', this.pages);
      this.classList.add('is-laid');
      this.classList.toggle('is-paged', this.pages > 1);
      this.ui.nav.hidden = this.pages < 2;
      if (this.ui.pageTot) this.ui.pageTot.textContent = String(this.pages).padStart(2, '0');
      this.page = clamp(this.page || 0, 0, this.pages - 1);
      this.stopAnim();
      this.measure();
      this.shown = -1;
      this.goTo(this.page, true);
    }

    pageOf(btn) {
      const cell = btn?.closest('.sa-cell');
      const i = cell ? [...this.grid.children].indexOf(cell) : 0;
      return Math.max(0, Math.floor(i / this.per));
    }

    /* The track never snaps to pages. It follows a target position through an exponential
       ease each frame, so drags, flicks, wheels and arrows all glide and come to rest softly. */
    minX() { return -(this.pages - 1) * this.pageW; }

    setX(x) {
      this.x = x;
      this.grid.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      const max = (this.pages - 1) * this.pageW;
      const p = max > 0 ? clamp(-x / max, 0, 1) : 0;
      if (this.ui.fill) this.ui.fill.style.transform = 'translate3d(' + (p * (this.pages - 1) * 100).toFixed(3) + '%,0,0)';
      const near = clamp(Math.round(-x / this.pageW), 0, this.pages - 1);
      this.page = near;
      if (near !== this.shown) {
        this.shown = near;
        if (this.ui.pageCur) this.ui.pageCur.textContent = String(near + 1).padStart(2, '0');
        this.preload(near);
      }
      this.paintNav();
    }

    paintNav() {
      const atStart = this.tx >= -1, atEnd = this.tx <= this.minX() + 1;
      if (this.ui.prev && this.ui.prev.disabled !== atStart) this.ui.prev.disabled = atStart;
      if (this.ui.next && this.ui.next.disabled !== atEnd) this.ui.next.disabled = atEnd;
    }

    // Soft resistance past the first and last product.
    rubber(x) {
      const min = this.minX(), c = this.pageW * .25;
      const band = o => c * (1 - 1 / (o * .5 / c + 1));
      if (x > 0) return band(x);
      if (x < min) return min - band(min - x);
      return x;
    }

    // Stop exactly where the track is now.
    stopAnim() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      if (typeof this.x === 'number') this.tx = this.x;
      this.grid?.classList.remove('is-moving');
    }

    // Starts the glide loop if it is not running.
    glide() {
      if (reduced.matches && !this.drag) { this.setX(this.tx); return; }
      if (this.raf) return;
      this.grid.classList.add('is-moving');
      let last = performance.now();
      const step = now => {
        const dt = Math.min(.05, Math.max(.001, (now - last) / 1000));
        last = now;
        // close follow while the finger is down, a long silky ease once it lets go
        const k = this.drag?.on ? 22 : 5.2 / Math.min(1.6, this.cfg.k);
        const nx = this.x + (this.tx - this.x) * (1 - Math.exp(-k * dt));
        if (!this.drag?.on && Math.abs(this.tx - nx) < .15) {
          this.setX(this.tx);
          this.raf = 0;
          this.grid.classList.remove('is-moving');
          return;
        }
        this.setX(nx);
        this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }

    moveTo(t) {
      this.tx = clamp(t, this.minX(), 0);
      this.paintNav();
      this.glide();
    }

    goTo(i, instant = false) {
      i = clamp(i, 0, this.pages - 1);
      if (instant) { this.stopAnim(); this.tx = -i * this.pageW; this.setX(this.tx); return; }
      this.moveTo(-i * this.pageW);
    }

    // Arrows: one page from wherever the shelf currently rests.
    step(dir) {
      const from = Math.round(-this.tx / this.pageW);
      this.goTo(from + dir);
    }

    preload(p) {
      [...this.grid.children].slice(p * this.per, (p + 2) * this.per).forEach(c => {
        const im = c.querySelector('img.sa-img');
        if (im && im.loading === 'lazy') im.loading = 'eager';
      });
    }

    bindSwipe(on) {
      const vp = this.viewport;
      on(vp, 'dragstart', e => e.preventDefault());

      on(vp, 'pointerdown', e => {
        if (this.pages < 2 || this.state !== 'idle' || this.busyGrid) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        // a touch while gliding catches the shelf where it is
        const wasMoving = Math.abs(this.tx - this.x) > 2;
        this.stopAnim();
        this.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, start: this.x, on: false, caught: wasMoving, s: [{ t: e.timeStamp, x: e.clientX }] };
      });

      on(vp, 'pointermove', e => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        if (!d.on) {
          const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
          if (Math.hypot(dx, dy) < 6) return;
          if (Math.abs(dy) > Math.abs(dx)) { this.drag = null; return; }   // the page is scrolling, not the shelf
          d.on = true;
          d.x0 = e.clientX;        // follow from here, so the track never jumps
          d.start = this.x;
          try { vp.setPointerCapture(d.id); } catch {}
          this.classList.add('is-dragging');
        }
        d.s.push({ t: e.timeStamp, x: e.clientX });
        if (d.s.length > 16) d.s.shift();
        this.tx = this.rubber(d.start + e.clientX - d.x0);
        this.glide();
      });

      const end = e => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        this.drag = null;
        if (!d.on) {
          if (d.caught) { this.dragged = true; setTimeout(() => { this.dragged = false; }, 0); }
          return;
        }
        this.classList.remove('is-dragging');
        try { vp.releasePointerCapture(d.id); } catch {}
        // release speed from the last ~100ms of movement
        const now = e.timeStamp, s = d.s.filter(p => now - p.t < 100);
        let v = 0;
        if (s.length > 1) {
          const a = s[0], b = s[s.length - 1];
          if (b.t > a.t && now - b.t < 60) v = (b.x - a.x) / (b.t - a.t) * 1000;
        }
        v = clamp(v, -5000, 5000);
        // momentum: the shelf carries on in the direction it was thrown, then eases to rest
        this.moveTo(this.tx + v * .32);
        this.dragged = true;
        setTimeout(() => { this.dragged = false; }, 0);
      };
      on(vp, 'pointerup', end);
      on(vp, 'pointercancel', end);
      // a drag (or catching the shelf mid-glide) never opens a product
      on(vp, 'click', e => { if (this.dragged) { e.preventDefault(); e.stopPropagation(); this.dragged = false; } }, { capture: true });

      // trackpads and horizontal mouse wheels move the target; the ease does the rest
      on(vp, 'wheel', e => {
        if (this.pages < 2 || this.state !== 'idle' || this.drag) return;
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.pageW : 1;
        this.moveTo(this.tx - e.deltaX * unit * 1.1);
      }, { passive: false });

      on(vp, 'keydown', e => {
        if (this.pages < 2 || this.state !== 'idle') return;
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        this.step(e.key === 'ArrowRight' ? 1 : -1);
      });

      // tabbing onto a product off-screen brings its page in
      on(vp, 'focusin', e => {
        vp.scrollLeft = 0;
        if (this.pages < 2 || this.drag || this.state !== 'idle' || !this.kbd) return;
        const cell = e.target.closest('.sa-cell');
        if (!cell) return;
        const p = Math.floor([...this.grid.children].indexOf(cell) / this.per);
        if (p !== Math.round(-this.tx / this.pageW)) this.goTo(p);
      });
    }

    /* ================= grid size and shuffle ================= */
    gridOptions() { return phoneMq.matches ? this.cfg.gridM : this.cfg.gridD; }

    applyGrid(animate) {
      const opts = this.gridOptions();
      const key = phoneMq.matches ? 'sa-grid-m' : 'sa-grid-d';
      const saved = store.get(key);
      if (opts.includes(saved)) this.style.setProperty('--cols-user', saved);
      else this.style.removeProperty('--cols-user');
      this.layout();
      this.buildSeg();
      if (!animate) requestAnimationFrame(() => this.reseat());
    }

    buildSeg() {
      if (!this.seg) return;
      const opts = this.gridOptions();
      const cur = this.cols();
      this.seg.replaceChildren(...(opts.length > 1 ? opts.map(n => {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.saAct = 'grid';
        b.dataset.n = n;
        b.setAttribute('aria-pressed', String(n === cur));
        b.setAttribute('aria-label', (this.text.grid || 'Grid') + ' ' + n);
        const icon = document.createElement('i');
        icon.style.setProperty('--n', n);
        for (let k = 0; k < n; k++) icon.append(document.createElement('b'));
        b.append(icon);
        return b;
      }) : []));
    }

    paintSeg() {
      const cur = this.cols();
      this.seg?.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.n === cur)));
    }

    // Rearrange with FLIP: every cell glides from where it was to where it lands.
    flipCells(change, opts = {}) {
      const nodes = opts.nodes || [...this.grid.children];
      const before = new Map(nodes.map(n => [n, n.getBoundingClientRect()]));
      change();
      this.reseat();
      if (reduced.matches) return Promise.resolve();
      return Promise.all(nodes.map((n, i) => {
        const a = before.get(n), b = n.getBoundingClientRect();
        if (!a || !b.width) return null;
        const dx = a.left - b.left, dy = a.top - b.top, s = a.width / b.width;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(s - 1) < .01) return null;
        n.style.transformOrigin = '0 0';
        const frames = opts.arc
          ? [{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' },
             { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - opts.arc) + 'px) scale(' + (s + 1) / 2 + ')', offset: .5 },
             { transform: 'none' }]
          : [{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' }, { transform: 'none' }];
        return play(n, frames, { duration: (opts.duration || 800) * this.cfg.k, delay: (opts.stagger || 0) * i, easing: opts.easing || EXPO_OUT, fill: 'backwards' })
          .then(() => { n.style.transformOrigin = ''; });
      }));
    }

    setGrid(n) {
      if (this.busyGrid || this.state !== 'idle' || n === this.cols()) return;
      this.busyGrid = true;
      this.sfx.tick();
      store.set(phoneMq.matches ? 'sa-grid-m' : 'sa-grid-d', n);
      const firstShown = this.page * this.per;
      this.flipCells(() => {
        this.style.setProperty('--cols-user', n);
        this.page = Math.floor(firstShown / (n * this.cfg.rows));   // keep the products the shopper was looking at
        this.layout();
        this.paintSeg();
      }, { duration: 900, stagger: 8 })
        .then(() => { this.busyGrid = false; });
    }

    // Shuffle moves the products between shelves; the shelves stay where they are.
    shuffle(btn) {
      if (this.busyGrid || this.state !== 'idle') return;
      const cells = [...this.grid.querySelectorAll('.sa-cell:not(.sa-cell--demo)')];
      if (cells.length < 2) return;
      this.busyGrid = true;
      this.sfx.riffle();
      btn?.classList.remove('is-spin');
      void btn?.offsetWidth;
      btn?.classList.add('is-spin');
      const prods = cells.map(c => c.querySelector('[data-sa-prod]'));
      const order = shuffle(prods);
      this.flipCells(() => {
        cells.forEach((c, k) => c.insertBefore(order[k], c.firstChild));
        this.refreshItems();
      }, { nodes: prods, arc: 46, duration: 900, stagger: 14, easing: 'cubic-bezier(.3,.7,.2,1)' })
        .then(() => { this.busyGrid = false; btn?.classList.remove('is-spin'); });
    }

    /* ================= open: the product glides into the product view ================= */
    async open(i) {
      const btn = this.items[i];
      if (!btn || this.state !== 'idle' || this.busyGrid || this.drag) return;
      const img = btn.querySelector('img.sa-img'), data = this.data(btn);
      if (!img || !data) return;
      this.state = 'opening';
      this.stopAnim();
      const k = this.cfg.k, u = this.ui, pop = u.pop, D = 1000 * k;
      const wallSrc = img.currentSrc || img.src;
      const from = contentBox(img, .5, 1);
      const ratio = (from.width / from.height) || 1;
      this.cur = { i, btn, img, data, cell: btn.closest('.sa-cell'), wallSrc, flySrc: wallSrc, ratio, hiReady: false };
      this.sfx.tick();
      const s = this.stage.getBoundingClientRect();
      this.stage.style.setProperty('--fx', (from.left - s.left + from.width / 2) + 'px');
      this.stage.style.setProperty('--fy', (from.top - s.top + from.height / 2) + 'px');
      this.lock(true);
      this.renderDetail(data);

      // the product view, still invisible; its final picture starts loading now
      u.popBg.style.opacity = 0;
      [u.bar, u.main, u.thumbs].forEach(el => { el.style.opacity = 0; });
      u.info.style.visibility = 'hidden';
      u.main.querySelectorAll('.sa-ghost').forEach(g => g.remove());
      u.main.classList.add('is-landing');
      this.setMain(this.preferredImage(), true);
      const mainReady = ready(u.mainImg, 3000);

      // the flying copy, decoded before the shelf picture hides, so there is never an empty frame
      const fly = u.fly, lo = u.flyImg, hi = u.flyHi;
      fly.hidden = true;
      fly.getAnimations().forEach(a => a.cancel());
      fly.style.opacity = '';
      fly.className = 'sa-fly' + (this.cfg.card ? ' is-card' : '');
      lo.hidden = false;
      hi.hidden = true;
      lo.src = wallSrc;

      this.placePop();
      pop.show();
      // focus the view itself, not its first button (that would flash a focus ring on "Back")
      pop.focus({ preventScroll: true });
      u.body.scrollTop = 0;
      u.info.scrollTop = 0;
      await Promise.all([ready(lo, 600), frame()]);
      if (this.state !== 'opening') return;   // closed meanwhile

      // the product lands exactly where the gallery picture will be
      const end = fit(u.mainImg.getBoundingClientRect(), ratio);

      // the wall steps back; the product leaves its shelf in the same frame the copy appears
      this.cur.cell.classList.add('is-target');
      this.stage.classList.add('is-open');
      Object.assign(fly.style, { left: end.left + 'px', top: end.top + 'px', width: end.width + 'px', height: end.height + 'px' });
      fly.hidden = false;
      btn.classList.add('is-lifted');

      let backdrop;
      if (this.cfg.fx === 'shutter') {
        // slats close over the wall from the product's side, then hand over to the plain backdrop
        const slats = [...u.slats.children], fromRight = from.left + from.width / 2 > innerWidth / 2;
        u.slats.style.display = 'flex';
        backdrop = Promise.all(slats.map((sl, n) => {
          sl.style.transformOrigin = n % 2 ? '50% 100%' : '50% 0%';
          const order = fromRight ? slats.length - 1 - n : n;
          return play(sl, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: .7 * D, delay: order * 55 * k, easing: EXPO_IN_OUT, fill: 'both' });
        })).then(() => { u.popBg.style.opacity = 1; return play(u.slats, [{ opacity: 1 }, { opacity: 0 }], { duration: .35 * D, fill: 'forwards' }); });
      } else {
        backdrop = play(u.popBg, [{ opacity: 0 }, { opacity: 1 }], { duration: .75 * D, delay: .1 * D, easing: 'ease-out', fill: 'both' }).then(() => { u.popBg.style.opacity = 1; });
      }

      // the product lifts off the shelf, then travels (fill: both, so it never shows at its end point early)
      const shutter = this.cfg.fx === 'shutter';
      const fdur = (shutter ? 1.15 : 1.05) * D, fdel = shutter ? .12 * D : 0, fease = shutter ? POWER_IN_OUT : EXPO_IN_OUT;
      const lift = Math.min(40, from.height * .25);
      if (this.cfg.card) {
        const c = this.colors();
        play(fly, [{ backgroundColor: c.wall }, { backgroundColor: c.studio }], { duration: fdur, delay: fdel, easing: fease, fill: 'both' });
      }
      const flight = shutter
        ? play(fly, [
            { transform: flip(from, end) },
            { transform: flip(from, end, lift), offset: .14 },
            { transform: flip(mix(from, end, .6), end), offset: .6 },
            { transform: 'scale(1.03,.97)', offset: .86 },
            { transform: 'none' }
          ], { duration: fdur, delay: fdel, easing: fease, fill: 'both' })
        : play(fly, [
            { transform: flip(from, end) },
            { transform: flip(from, end, lift), offset: .16 },
            { transform: 'none' }
          ], { duration: fdur, easing: fease, fill: 'both' });

      // swap in a sharp copy as soon as it is decoded (same picture, same box: invisible switch)
      const hiSrc = hiRes(wallSrc);
      if (hiSrc !== wallSrc) {
        hi.src = hiSrc;
        ready(hi, 5000).then(() => {
          if (this.cur?.btn !== btn || !hi.naturalWidth) return;
          this.cur.hiReady = true;
          this.cur.flySrc = hiSrc;
          if (this.state === 'opening') { hi.hidden = false; lo.hidden = true; }
        });
      }

      // the details arrive
      const reveal = this.revealPanel(.45 * D);
      await flight;
      if (this.state !== 'opening') return;
      await mainReady;
      if (this.state !== 'opening') return;

      // hand over: the gallery picture appears underneath first, then the copy goes
      u.main.classList.remove('is-landing');
      await frames2();
      if (this.state !== 'opening') return;
      if (!samePic(u.mainImg.currentSrc || u.mainImg.src, this.cur.flySrc)) {
        await play(fly, [{ opacity: 1 }, { opacity: 0 }], { duration: 380 * k, easing: 'ease', fill: 'forwards' });
        if (this.state !== 'opening') return;
      }
      fly.hidden = true;
      fly.getAnimations().forEach(a => a.cancel());

      await Promise.all([backdrop, reveal]);
      if (this.state !== 'opening') return;
      this.state = 'detail';
      if (document.activeElement !== pop && !pop.contains(document.activeElement)) pop.focus({ preventScroll: true });
    }

    async revealPanel(delay) {
      const u = this.ui, k = this.cfg.k, phone = phoneMq.matches;
      play(u.main, [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 700 * k, delay: delay * .6, easing: EXPO_OUT, fill: 'both' });
      play(u.bar, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 * k, delay, fill: 'both' });
      play(u.thumbs, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 600 * k, delay: delay + 200 * k, easing: EXPO_OUT, fill: 'both' });
      u.info.style.visibility = '';
      const panel = play(u.info, [
        { clipPath: phone ? 'inset(0 0 100% 0)' : 'inset(0 0 0 100%)' },
        { clipPath: 'inset(0 0 0 0)' }
      ], { duration: 1000 * k, delay, easing: EXPO_OUT, fill: 'backwards' });
      const chars = [...u.name.querySelectorAll('.sa-ch')];
      chars.forEach((ch, n) => play(ch, [{ transform: 'translateY(110%) rotate(6deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900 * k, delay: delay + 120 * k + n * 16, easing: EXPO_OUT, fill: 'backwards' }));
      // opacity and movement only: no blur filters, so the text is crisp at every frame
      [...u.info.querySelectorAll('.sa-in')].forEach((el, n) => play(el, [{ transform: 'translateY(18px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900 * k, delay: delay + 220 * k + n * 60 * k, easing: EXPO_OUT, fill: 'backwards' }));
      return panel;
    }

    /* ================= close: the product goes back onto its shelf ================= */
    // quick = a short fade (used before opening the cart drawer).
    async close(quick) {
      if (this.state !== 'detail') return;
      this.state = 'closing';
      clearTimeout(this.doneTimer);
      const u = this.ui, cur = this.cur, k = this.cfg.k, D = 1000 * k;
      u.main.classList.remove('is-zoom');
      u.main.querySelectorAll('.sa-ghost').forEach(g => g.remove());

      if (quick || reduced.matches) {
        await play(u.pop, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease', fill: 'forwards' });
        if (this.state === 'closing') this.reset();
        return;
      }

      // the same sharp copy that flew in flies back
      const fly = u.fly, lo = u.flyImg, hi = u.flyHi;
      fly.getAnimations().forEach(a => a.cancel());
      fly.style.opacity = '';
      fly.className = 'sa-fly' + (this.cfg.card ? ' is-card' : '');
      lo.src = cur.wallSrc;
      hi.hidden = !cur.hiReady;
      lo.hidden = !!cur.hiReady;
      await ready(cur.hiReady ? hi : lo, 400);
      if (this.state !== 'closing') return;

      // start: the picture's place in the gallery (from the frame's own box, so a zoom never skews it)
      const r = u.main.getBoundingClientRect();
      const start = fit({ left: r.left + r.width * .07, top: r.top + r.height * .07, width: r.width * .86, height: r.height * .86 }, cur.ratio);
      const same = samePic(u.mainImg.currentSrc || u.mainImg.src, cur.flySrc);

      // end: where the product stands once the wall is back at rest (measured without the transition)
      const wall = this.wall;
      wall.style.transition = 'none';
      this.stage.classList.remove('is-open');
      const end = contentBox(cur.img, .5, 1);
      this.stage.classList.add('is-open');
      void wall.offsetWidth;
      wall.style.transition = '';
      this.stage.classList.remove('is-open');

      Object.assign(fly.style, { left: end.left + 'px', top: end.top + 'px', width: end.width + 'px', height: end.height + 'px' });
      if (same) {
        u.main.classList.add('is-landing');   // identical picture: swap in the same frame
      } else {
        // a different gallery picture: a true cross-dissolve, never a dip to empty
        play(u.mainImg, [{ opacity: 1 }, { opacity: 0 }], { duration: .22 * D, easing: 'linear', fill: 'forwards' });
        play(fly, [{ opacity: 0 }, { opacity: 1 }], { duration: .22 * D, easing: 'linear', fill: 'backwards' });
      }
      fly.hidden = false;

      play(u.info, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 * k, fill: 'forwards' });
      play(u.bar, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 * k, fill: 'forwards' });
      play(u.thumbs, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 * k, fill: 'forwards' });
      play(u.main, [{ opacity: 1 }, { opacity: 0 }], { duration: .45 * D, delay: .08 * D, easing: 'ease', fill: 'forwards' });
      play(u.popBg, [{ opacity: 1 }, { opacity: 0 }], { duration: .6 * D, delay: .15 * D, easing: 'ease-in', fill: 'forwards' });
      if (this.cfg.card) {
        const c = this.colors();
        play(fly, [{ backgroundColor: c.studio }, { backgroundColor: c.wall }], { duration: D, easing: EXPO_IN_OUT, fill: 'both' });
      }
      const lift = Math.min(40, end.height * .25);
      await play(fly, [
        { transform: flip(start, end) },
        { transform: flip(mix(start, end, .04), end), offset: .12 },
        { transform: flip(end, end, lift), offset: .82 },
        { transform: 'none' }
      ], { duration: D, easing: EXPO_IN_OUT, fill: 'both' });
      if (this.state !== 'closing') return;

      // back on the shelf: show the real product, then drop the copy on the next frame
      cur.btn.classList.remove('is-lifted');
      await frame();
      if (this.state === 'closing') this.reset();
    }

    // Back to rest, whatever state we were in.
    reset() {
      const u = this.ui, pop = u.pop;
      clearTimeout(this.doneTimer);
      [pop, u.popBg, u.bar, u.main, u.mainImg, u.thumbs, u.info, u.fly, u.slats, ...u.slats.children].forEach(el => el.getAnimations().forEach(a => a.cancel()));
      u.main.querySelectorAll('.sa-ghost').forEach(g => g.remove());
      u.slats.style.display = '';
      u.popBg.style.opacity = '';
      [u.bar, u.main, u.thumbs].forEach(el => { el.style.opacity = ''; });
      u.info.style.visibility = '';
      u.main.classList.remove('is-landing', 'is-zoom');
      u.fly.hidden = true;
      u.fly.style.opacity = '';
      if (pop.open) pop.close();
      this.stage.classList.remove('is-open');
      if (this.cur) {
        this.cur.btn.classList.remove('is-lifted');
        this.cur.cell.classList.remove('is-target');
      }
      this.lock(false);
      const btn = this.cur?.btn;
      this.state = 'idle';
      this.cur = null;
      if (this.kbd) btn?.focus({ preventScroll: true });
      else if (document.activeElement && this.contains(document.activeElement)) document.activeElement.blur();
    }

    /* ================= product view content ================= */
    renderDetail(d) {
      const u = this.ui;
      u.vendor.textContent = d.vd || '';
      u.name.setAttribute('aria-label', d.t);
      u.name.replaceChildren(...String(d.t).split(' ').flatMap((word, n, all) => {
        const w = document.createElement('span');
        w.className = 'sa-w';
        w.setAttribute('aria-hidden', 'true');
        Array.from(word).forEach(c => { const ch = document.createElement('span'); ch.className = 'sa-ch'; ch.textContent = c; w.append(ch); });
        return n < all.length - 1 ? [w, ' '] : [w];
      }));
      u.desc.textContent = d.d || '';
      u.full.href = d.u;
      u.msg.textContent = '';
      u.msg.classList.remove('is-error');
      u.mainBadge.textContent = d.av ? '' : (this.text.soldOut || 'Sold out');
      this.gallery = (d.g || []).slice();
      if (!this.gallery.length) this.gallery = [{ s: hiRes(this.cur.img.currentSrc || this.cur.img.src), t: this.cur.img.src, a: d.t }];
      this.buildThumbs();

      // Starting selection: the first available colour; sizes wait for the shopper.
      const ci = this.colorIndex(d);
      const first = d.vs.find(v => v.a) || d.vs[0];
      this.sel = d.o.map((o, k) => {
        if (o.v.length === 1) return o.v[0].n;
        if (k === ci) return first ? first.o[k] : null;
        return null;
      });
      this.renderOptions();
      this.refresh();
    }

    buildThumbs() {
      const u = this.ui;
      u.thumbs.replaceChildren(...(this.gallery.length > 1 ? this.gallery.map((g, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.saAct = 'thumb';
        b.dataset.i = i;
        b.setAttribute('aria-label', (g.a || '') + ' ' + (i + 1));
        const im = document.createElement('img');
        im.src = g.t || g.s;
        im.alt = '';
        im.loading = 'lazy';
        b.append(im);
        return b;
      }) : []));
      this.mainIndex = -1;
    }

    preferredImage() {
      const v = this.variant();
      const im = v?.im || this.colorImage();
      if (im) {
        const k = this.gallery.findIndex(g => samePic(g.s, im));
        return k >= 0 ? k : im;
      }
      return 0;
    }

    // Show gallery image i (or a plain URL for a colour image that is not in the gallery).
    // The new picture is decoded first, then cross-faded over the old one: no flash, no empty frame.
    setMain(i, instant) {
      const u = this.ui;
      const src = typeof i === 'number' ? this.gallery[i]?.s : i;
      if (!src) return;
      this.mainIndex = typeof i === 'number' ? i : -1;
      [...u.thumbs.children].forEach((b, k) => b.setAttribute('aria-current', String(k === this.mainIndex)));
      const img = u.mainImg, alt = typeof i === 'number' ? (this.gallery[i].a || '') : '';
      if (img.src === new URL(src, location.href).href) return;
      const ticket = this.mainTicket = (this.mainTicket || 0) + 1;
      if (instant || reduced.matches || !img.getAttribute('src')) { img.src = src; img.alt = alt; return; }
      const pre = new Image();
      pre.src = src;
      ready(pre, 4000).then(async () => {
        if (ticket !== this.mainTicket) return;   // a newer picture was chosen meanwhile
        if (this.state !== 'detail') { img.src = src; img.alt = alt; return; }
        const ghost = img.cloneNode(false);
        ghost.removeAttribute('data-sa-ref');
        ghost.className = 'sa-ghost';
        ghost.alt = '';
        ghost.setAttribute('aria-hidden', 'true');
        img.after(ghost);
        await ready(ghost, 300);
        if (ticket !== this.mainTicket) { ghost.remove(); return; }
        img.src = src;
        img.alt = alt;
        await play(ghost, [{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        ghost.remove();
      });
    }

    bindGallery(on) {
      const main = this.ui.main;
      on(main, 'pointermove', e => {
        if (!finePointer.matches || this.state !== 'detail') return;
        const r = main.getBoundingClientRect();
        main.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%');
        main.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
      });
      on(main, 'click', () => { if (finePointer.matches && this.state === 'detail') main.classList.toggle('is-zoom'); });
      on(main, 'pointerleave', () => main.classList.remove('is-zoom'));
      let x0 = null;
      on(main, 'pointerdown', e => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
      on(main, 'pointerup', e => {
        if (x0 === null) return;
        const dx = e.clientX - x0;
        x0 = null;
        if (Math.abs(dx) < 40 || this.gallery.length < 2) return;
        const n = this.gallery.length, cur = this.mainIndex < 0 ? 0 : this.mainIndex;
        this.setMain((cur + (dx < 0 ? 1 : -1) + n) % n);
      });
      on(main, 'pointercancel', () => { x0 = null; });
    }

    /* ================= options ================= */
    colorIndex(d) { return d.o.findIndex(o => this.cfg.colors.includes(String(o.n).toLowerCase())); }

    swatchLook(d, oi, val) {
      if (val.si) return 'center / cover no-repeat url("' + val.si + '")';
      if (val.sw) return val.sw;
      const v = d.vs.find(x => x.o[oi] === val.n && x.it);
      if (v) return '#fff center / contain no-repeat url("' + v.it + '")';
      const css = String(val.n).toLowerCase().replace(/\s+/g, '');
      return CSS.supports('color', css) ? css : null;
    }

    available(oi, val) {
      return this.cur.data.vs.some(v => v.a && v.o[oi] === val && v.o.every((x, k) => k === oi || this.sel[k] === null || this.sel[k] === x));
    }

    renderOptions() {
      const d = this.cur.data, u = this.ui, ci = this.colorIndex(d);
      const frag = document.createDocumentFragment();
      d.o.forEach((o, oi) => {
        if (o.v.length === 1 && /^title$/i.test(o.n)) return;
        const fs = document.createElement('fieldset');
        fs.className = 'sa-opt';
        const lg = document.createElement('legend');
        lg.textContent = o.n;
        const chosen = document.createElement('b');
        chosen.dataset.chosen = oi;
        lg.append(chosen);
        fs.append(lg);
        const wrap = document.createElement('div');
        const isColor = oi === ci;
        wrap.className = isColor ? 'sa-swatches' : 'sa-sizes';
        o.v.forEach(val => {
          const b = document.createElement('button');
          b.type = 'button';
          b.dataset.saAct = 'opt';
          b.dataset.o = oi;
          b.dataset.v = val.n;
          if (isColor) {
            b.className = 'sa-tile';
            b.setAttribute('aria-label', val.n);
            b.title = val.n;
            const pic = this.cfg.colorStyle === 'images' ? (d.vs.find(x => x.o[oi] === val.n && x.it)?.it || val.si) : null;
            if (pic) {
              const im = document.createElement('img');
              im.src = pic;
              im.alt = '';
              im.loading = 'lazy';
              b.append(im);
            } else {
              const chip = document.createElement('i');
              const look = this.swatchLook(d, oi, val);
              if (look) chip.style.background = look;
              b.append(chip);
            }
          } else {
            b.className = 'sa-size';
            b.textContent = val.n;
          }
          wrap.append(b);
        });
        fs.append(wrap);
        frag.append(fs);
      });
      u.opts.replaceChildren(frag);
    }

    choose(oi, val) {
      if (this.busy || this.state !== 'detail') return;
      const d = this.cur.data, ci = this.colorIndex(d);
      this.sel[oi] = this.sel[oi] === val && oi !== ci ? null : val;
      // A new colour may not stock the chosen size: clear it rather than land on a dead pair.
      this.sel.forEach((s, k) => { if (k !== oi && s !== null && d.o[k].v.length > 1 && !this.available(k, s)) this.sel[k] = null; });
      this.ui.opts.classList.remove('is-shake');
      this.ui.msg.textContent = '';
      this.sfx.tick();
      this.refresh();
      if (oi === ci) {
        const im = this.preferredImage();
        if (im !== this.mainIndex) this.setMain(im);
      }
    }

    variant() {
      const d = this.cur?.data;
      if (!d || this.sel.includes(null)) return null;
      return d.vs.find(v => v.o.every((x, k) => x === this.sel[k])) || null;
    }

    colorImage() {
      const d = this.cur.data, ci = this.colorIndex(d);
      if (ci < 0 || !this.sel[ci]) return null;
      return d.vs.find(v => v.o[ci] === this.sel[ci] && v.im)?.im || null;
    }

    refresh() {
      const d = this.cur.data, u = this.ui, v = this.variant();
      u.opts.querySelectorAll('[data-sa-act="opt"]').forEach(b => {
        const oi = +b.dataset.o, val = b.dataset.v;
        b.setAttribute('aria-pressed', String(this.sel[oi] === val));
        const ok = this.available(oi, val);
        b.classList.toggle('is-na', !ok);
        b.disabled = !ok && !b.classList.contains('sa-tile');
      });
      u.opts.querySelectorAll('[data-chosen]').forEach(el => { const v = this.sel[+el.dataset.chosen]; el.textContent = v ? ' - ' + v : ''; });

      const price = v ? v.p : d.pf, compare = v ? v.c : d.cf;
      u.price.replaceChildren(price);
      if (compare) { const s = document.createElement('s'); s.textContent = compare; u.price.append(s); }
      const atc = u.atc;
      atc.classList.remove('is-done', 'is-wait');
      atc.disabled = false;
      const say = label => { u.atcLabel.textContent = label; };
      if (!d.av) { atc.disabled = true; say(this.text.soldOut || 'Sold out'); return; }
      const missing = this.sel.indexOf(null);
      if (missing >= 0) {
        atc.classList.add('is-wait');
        say((this.text.select || 'Select a size').replace('[option]', d.o[missing].n.toLowerCase()));
        return;
      }
      if (!v) { atc.disabled = true; say(this.text.unavailable || 'Unavailable'); return; }
      if (!v.a) { atc.disabled = true; say(this.text.soldOut || 'Sold out'); return; }
      say(this.text.addToCart || 'Add to bag');
    }

    /* ================= cart ================= */
    // Adding always keeps the shopper on this page.
    async addToCart() {
      const u = this.ui, atc = u.atc;
      if (this.state !== 'detail' || this.busy) return;
      const v = this.variant();
      if (!v) {
        u.opts.classList.remove('is-shake');
        void u.opts.offsetWidth;
        u.opts.classList.add('is-shake');
        return;
      }
      if (!v.a) return;
      this.busy = true;
      atc.classList.add('is-loading');
      atc.disabled = true;
      u.msg.textContent = '';
      u.msg.classList.remove('is-error');
      try {
        const cart = await this.cartAdd([{ id: v.id, quantity: 1 }]);
        if (this.state !== 'detail') { this.setBag(cart?.item_count); return; }
        atc.classList.remove('is-loading');
        atc.classList.add('is-done');
        u.atcLabel.textContent = '✓ ' + (this.text.added || 'Added to bag');
        this.sfx.pop();
        if (this.cfg.after === 'drawer') {
          this.setBag(cart?.item_count);
          await this.close();
          await this.openDrawer();
          return;
        }
        await this.flyToBag();
        this.setBag(cart?.item_count);
        const a = document.createElement('a');
        a.href = root() + 'cart';
        a.dataset.saAct = 'bag';
        a.textContent = this.text.viewBag || 'View bag';
        u.msg.replaceChildren((this.text.added || 'Added to bag') + ' · ', a);
        // put the button back for another size, unless the shopper has moved on
        const product = this.cur;
        clearTimeout(this.doneTimer);
        this.doneTimer = setTimeout(() => { if (this.state === 'detail' && this.cur === product) this.refresh(); }, 2600);
      } catch (err) {
        atc.classList.remove('is-loading');
        this.refresh();
        u.msg.textContent = err.message;
        u.msg.classList.add('is-error');
      } finally {
        this.busy = false;
      }
    }

    // The bag icon and the "View bag" link open the theme's cart drawer instead of the cart page.
    async openBag() {
      if (this.state === 'detail') await this.close(true);
      else if (this.state !== 'idle') return;
      const ok = await this.openDrawer();
      if (!ok) location.href = root() + 'cart';
    }

    async openDrawer() {
      // Horizon and other current themes
      const hz = document.querySelector('cart-drawer-component');
      if (hz) {
        for (const m of ['open', 'showDialog', 'show']) {
          if (typeof hz[m] === 'function') { try { hz[m](); return true; } catch {} }
        }
      }
      // Dawn and Dawn-based themes: refresh the drawer's contents, which also opens it
      const dawn = document.querySelector('cart-drawer');
      if (dawn && typeof dawn.open === 'function') {
        if (typeof dawn.renderContents === 'function' && typeof dawn.getSectionsToRender === 'function') {
          try {
            const ids = dawn.getSectionsToRender().map(s => s.id || s.section).filter(Boolean);
            const sections = await (await fetch(root() + '?sections=' + ids.join(','), { headers: { Accept: 'application/json' } })).json();
            dawn.classList.remove('is-empty');
            dawn.renderContents({ sections });
            return true;
          } catch {}
        }
        try { dawn.open(); return true; } catch {}
      }
      // Anything else: press the theme's own cart button
      const t = [...document.querySelectorAll('[data-cart-drawer-toggle], [data-drawer-toggle="cart"], [aria-controls*="cart" i], #cart-icon-bubble, .header__icon--cart')]
        .find(el => !this.contains(el) && el.getClientRects().length);
      if (t) { t.click(); return true; }
      return false;
    }

    /* Horizon (current): the cart icon and the cart drawer listen for Shopify's standard
       "shopify:cart:lines-update" event and wait on its promise for the new cart. That refreshes
       them without opening the drawer. The module comes from the theme's import map. */
    async cartAdd(items) {
      /* static clone: writes go to the local bag, the rest of the flow is unchanged */
      try {
        const d = this.cur && this.cur.data;
        if (window.Cart && d && d.u) {
          const handle = String(d.u).split('/products/')[1] || '';
          const size = (this.sel || []).filter(Boolean).join(' / ');
          const qty = (items && items[0] && items[0].quantity) || 1;
          if (handle) {
            window.Cart.add(handle, size, qty);
            return { item_count: window.Cart.count() };
          }
        }
      } catch (e) { /* fall through to the theme helper */ }
      return this._cartAddRemote(items);
    }

    async _cartAddRemote(items) {
      let Ev = null, deferred = null;
      try { Ev = (await import('@shopify/events')).CartLinesUpdateEvent || null; } catch { Ev = null; }
      if (Ev && typeof Ev.createPromise === 'function') {
        try {
          deferred = Ev.createPromise();
          deferred.promise.catch(() => {});
          this.dispatchEvent(new Ev({ action: 'add', lines: items.map(i => ({ merchandiseId: i.id, quantity: i.quantity })), promise: deferred.promise }));
        } catch { deferred = null; }
      }
      const ids = [...document.querySelectorAll('cart-items-component[data-section-id], [data-cart-section-id]')]
        .map(el => el.dataset.sectionId || el.dataset.cartSectionId).filter(Boolean);
      if (document.getElementById('cart-icon-bubble')) ids.push('cart-icon-bubble');
      const dawn = document.querySelector('cart-drawer');
      if (dawn && typeof dawn.getSectionsToRender === 'function') {
        try { dawn.getSectionsToRender().forEach(s => ids.push(s.section || s.id)); } catch {}
      }
      const body = { items };
      if (ids.length) { body.sections = [...new Set(ids)].join(','); body.sections_url = location.pathname; }

      const fail = this.text.error || 'Couldn’t add to bag. Please try again.';
      let res, data;
      try {
        res = await fetch(root() + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(body)
        });
        data = await res.json().catch(() => ({}));
      } catch (err) {
        deferred?.reject(err);
        throw new Error(fail);
      }
      const getCart = async () => { try { return await (await fetch(root() + 'cart.js', { headers: { Accept: 'application/json' } })).json(); } catch { return null; } };
      const toStd = c => { try { return c && typeof Ev?.createCartFromAjaxResponse === 'function' ? Ev.createCartFromAjaxResponse(c) : null; } catch { return null; } };
      const sourceId = this.id || 'shoe-atelier';
      if (!res.ok || data.status) {
        if (deferred) {
          const std = toStd(await getCart());
          std ? deferred.resolve({ cart: std, detail: { source: 'shoe-atelier', sourceId, didError: true } })
              : deferred.reject(new Error(fail));
        }
        throw new Error(data.description || data.message || fail);
      }
      const cart = await getCart();
      if (deferred) {
        const std = toStd(cart);
        if (!std) deferred.reject(new Error(fail));
        else deferred.resolve({
          cart: std,
          detail: { items: data.items || [], source: 'shoe-atelier', sourceId, itemCount: cart?.item_count, productId: data.items?.[0]?.product_id, sections: data.sections, didError: false }
        });
      }
      this.announce(cart, data, !!deferred, sourceId);
      this.cartCount = cart?.item_count;
      return cart;
    }

    // Other themes: refresh count bubbles quietly (the drawer itself only opens when asked).
    announce(cart, data, standard, sourceId) {
      const html = data.sections?.['cart-icon-bubble'];
      const bubble = document.getElementById('cart-icon-bubble');
      if (html && bubble) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        bubble.innerHTML = (doc.querySelector('.shopify-section') || doc.body).innerHTML;
      }
      const count = cart?.item_count;
      if (count !== undefined) document.querySelectorAll('[data-cart-count], .cart-count-bubble span[aria-hidden="true"]').forEach(el => { el.textContent = count; });
      try { if (typeof window.publish === 'function') window.publish('cart-update', { source: 'shoe-atelier', cartData: cart }); } catch {}
      // Older Horizon builds listen for 'cart:update' (and may open the drawer): only when the drawer is wanted.
      if (!standard && this.cfg.after === 'drawer') {
        document.dispatchEvent(new CustomEvent('cart:update', {
          bubbles: true,
          detail: { resource: cart, sourceId, data: { source: 'shoe-atelier', itemCount: count, productId: data.items?.[0]?.product_id, sections: data.sections, didError: false } }
        }));
      }
    }

    // Bottom edge of the visible store header, so the product view starts below it.
    headerBottom() {
      let b = 0;
      document.querySelectorAll(HEADER_SEL).forEach(el => {
        if (this.contains(el) || el.contains(this)) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.height && r.bottom > 0 && r.top < innerHeight * .5) b = Math.max(b, r.bottom);
      });
      return Math.round(clamp(b, 0, innerHeight * .4));
    }

    placePop() { this.ui.pop.style.setProperty('--sa-top', this.headerBottom() + 'px'); }

    // The theme's own cart icon in the header.
    themeCart() {
      const visible = el => el && !this.contains(el) && el.getClientRects().length && el.getBoundingClientRect().bottom > 0;
      for (const h of document.querySelectorAll(HEADER_SEL)) {
        for (const sel of CART_SEL) { const el = [...h.querySelectorAll(sel)].find(visible); if (el) return el; }
      }
      for (const sel of CART_SEL) { const el = [...document.querySelectorAll(sel)].find(visible); if (el) return el; }
      return null;
    }

    setBag(n) {
      if (n !== undefined && n !== null) this.cartCount = n;
    }

    // The product image lifts and drops into the theme's own cart icon in the header.
    async flyToBag() {
      const u = this.ui, src = u.mainImg, bag = this.themeCart();
      if (reduced.matches || !src.naturalWidth || !bag) return;
      const fly = u.fly, lo = u.flyImg, hi = u.flyHi;
      fly.getAnimations().forEach(a => a.cancel());
      fly.style.opacity = '';
      fly.className = 'sa-fly';
      hi.hidden = true;
      lo.hidden = false;
      lo.src = src.currentSrc || src.src;
      await ready(lo, 400);
      if (this.state !== 'detail') return;
      const a = contentBox(src), t = bag.getBoundingClientRect();
      const size = Math.min(a.width, a.height, 200);
      const r = { left: a.left + (a.width - size) / 2, top: a.top + (a.height - size) / 2 };
      Object.assign(fly.style, { left: r.left + 'px', top: r.top + 'px', width: size + 'px', height: size + 'px' });
      fly.hidden = false;
      const dx = t.left + t.width / 2 - (r.left + size / 2), dy = t.top + t.height / 2 - (r.top + size / 2);
      await play(fly, [
        { transform: 'none', opacity: 1 },
        { transform: 'translate(0,-24px) scale(1.03)', offset: .2 },
        { transform: 'translate(' + dx * .55 + 'px,' + (dy * .5 - 60) + 'px) scale(.5)', offset: .6 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.08)', opacity: .5 }
      ], { duration: 850, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'both' });
      fly.hidden = true;
      fly.getAnimations().forEach(x => x.cancel());
      play(bag, [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.2,1.6,.4,1)' });
    }
  }

  customElements.define('shoe-atelier', ShoeAtelier);
})();