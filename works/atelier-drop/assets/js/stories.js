/* stories.js — mobile shop stories (theme custom element, transcribed; local cart) */

(() => {
  if (customElements.get('mobile-shop-stories')) return;

  /* ---------- helpers ---------- */
  const LIKE_KEY = 'velvetica-story-like:' + location.hostname + ':';
  const SEEN_KEY = 'velvetica-story-seen:' + location.hostname + ':';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };
  const root = () => '/';   /* static clone */
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const svg = d => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
  const ICON = {
    pause: svg('<path d="M8 5v14M16 5v14"/>'),
    play: svg('<path d="M8 5.5v13l11-6.5-11-6.5Z"/>'),
    soundOn: svg('<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
    soundOff: svg('<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9.5 5 5M22 9.5l-5 5"/>')
  };
  // Reasons that stop playback. 'buffer' only waits for data; every other reason is a hard pause.
  const SOFT = 'buffer';

  class MobileShopStories extends HTMLElement {
    /* ================= lifecycle ================= */
    connectedCallback() {
      if (this.ready) return;
      if (this.querySelector('[data-st-ready]')) { this.init(); return; }
      // When the element is upgraded while the parser is still adding its children,
      // wait for the end marker before reading the markup.
      this.waiter ??= new MutationObserver(() => {
        if (!this.querySelector('[data-st-ready]')) return;
        this.stopWaiting();
        this.init();
      });
      this.waiter.observe(this, { childList: true, subtree: true });
    }

    disconnectedCallback() {
      this.stopWaiting();
      if (!this.ready) return;
      this.close();
      this.abort.abort();
      this.observer?.disconnect();
      this.clearWarm();
      this.ready = false;
    }

    stopWaiting() { this.waiter?.disconnect(); this.waiter = null; }

    init() {
      this.ready = true;
      this.abort = new AbortController();
      this.dialog = this.querySelector('dialog');
      this.ui = {};
      this.querySelectorAll('[data-ref]').forEach(el => { this.ui[el.dataset.ref] = el; });
      this.templates = [...this.querySelectorAll('template[data-story]')];
      this.circles = [...this.querySelectorAll('[data-action="open"]')];
      this.mq = matchMedia('(max-width: 749px)');
      this.repeat = this.dataset.repeat === 'true';
      this.notifyCart = this.dataset.notifyCart === 'true';
      this.addedText = this.dataset.added || 'Added to cart';

      this.index = 0;
      this.token = 0;
      this.playSerial = 0;
      this.suppressUntil = 0;
      this.reasons = new Set();
      this.muted = true;
      this.warm = null;
      this.active = false;

      this.circles.forEach(c => { if (store.get(SEEN_KEY + c.dataset.id) === '1') c.setAttribute('data-seen', ''); });
      this.bindEvents();
      this.observeViewport();
      this.openFromHash();
    }

    /* ================= events ================= */
    bindEvents() {
      const on = (el, type, fn, opts) => el.addEventListener(type, fn, { signal: this.abort.signal, ...opts });

      on(this, 'click', e => this.onClick(e));
      on(this.dialog, 'cancel', e => {
        e.preventDefault();
        if (!this.ui.panel.hidden) this.panel(false);
        else if (!this.ui.dock.hidden) this.dock(false);
        else this.close();
      });
      // Browsers can close a modal dialog without a cancelable 'cancel' event; always clean up.
      on(this.dialog, 'close', () => this.cleanup());
      on(this.dialog, 'keydown', e => {
        if (!this.ui.panel.hidden || e.target.matches('select, input, textarea')) return;
        if (e.key === 'ArrowRight') this.go(1);
        else if (e.key === 'ArrowLeft') this.go(-1);
      });
      on(document, 'visibilitychange', () => {
        if (document.hidden) this.clearWarm();
        this.pause('hidden', document.hidden);
        if (!document.hidden && this.dialog.open) this.preloadNext();
      });
      on(window, 'pagehide', () => this.close());
      on(this.mq, 'change', () => { if (!this.mq.matches) { this.close(); this.clearWarm(); } });
      on(document, 'shopify:block:select', e => {
        const i = this.indexOf(e.detail?.blockId);
        if (i >= 0 && this.mq.matches) this.open(i);
      });
      on(document, 'shopify:block:deselect', e => { if (this.indexOf(e.detail?.blockId) >= 0) this.close(); });
      // The card that snaps into view shows its number above the picture.
      on(this.ui.slot, 'scroll', () => {
        if (this.scrollRaf) return;
        this.scrollRaf = requestAnimationFrame(() => { this.scrollRaf = 0; this.markCurrent(); });
      }, { passive: true });
      this.bindGestures(on);
    }

    onClick(e) {
      const b = e.target.closest('[data-action]');
      if (!b || !this.contains(b)) return;
      const action = b.dataset.action;
      // A hold or swipe ends with a click on the tap zone; ignore it.
      if ((action === 'next' || action === 'prev') && performance.now() < this.suppressUntil) return;
      switch (action) {
        case 'open': this.open(+b.dataset.index, b); break;
        case 'close': this.close(); break;
        case 'next': this.go(1); break;
        case 'prev': this.go(-1); break;
        case 'shop': this.dock(this.ui.dock.hidden); break;
        case 'quick': this.quick(b.closest('[data-product]')); break;
        case 'panel-close': this.panel(false); break;
        case 'confirm': this.add(); break;
        case 'option': this.choose(b); break;
        case 'like': this.like(); break;
        case 'share': this.share(); break;
        case 'sound': this.toggleSound(); break;
        case 'pause': this.togglePause(); break;
        case 'retry': this.retry(); break;
      }
    }

    // Hold to pause, swipe sideways to change story, swipe down to close.
    bindGestures(on) {
      let start = null;
      on(this.ui.nav, 'pointerdown', e => {
        if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
        start = { x: e.clientX, y: e.clientY, id: e.pointerId };
        this.held = false;
        clearTimeout(this.holdTimer);
        this.holdTimer = setTimeout(() => { this.held = true; this.pause('hold', true); }, 200);
      });
      const end = (e, cancelled) => {
        if (!start || e.pointerId !== start.id) return;
        clearTimeout(this.holdTimer);
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        start = null;
        this.pause('hold', false);
        let consumed = this.held;
        if (!cancelled) {
          if (dy > 90 && Math.abs(dy) > Math.abs(dx)) { this.close(); consumed = true; }
          else if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) { this.go(dx < 0 ? 1 : -1); consumed = true; }
        }
        if (consumed) this.suppressUntil = performance.now() + 450;
        this.held = false;
      };
      on(window, 'pointerup', e => end(e, false));
      on(window, 'pointercancel', e => end(e, true));
    }

    observeViewport() {
      if (!('IntersectionObserver' in window)) return;
      // Warm the first video's metadata only while the row is near the screen.
      this.observer = new IntersectionObserver(([entry]) => {
        if (this.dialog.open) return;
        if (entry.isIntersecting) this.preload(0, true); else this.clearWarm();
      }, { rootMargin: '150px' });
      this.observer.observe(this);
    }

    openFromHash() {
      const hash = location.hash.slice(1);
      if (!hash.startsWith('story-')) return;
      const i = this.indexOf(hash.slice(6));
      if (i >= 0) requestAnimationFrame(() => this.open(i));
    }

    indexOf(id) { return id ? this.templates.findIndex(t => t.dataset.id === id) : -1; }

    /* ================= open / close ================= */
    open(i, trigger) {
      if (!this.ready || !this.mq.matches || this.busy || !this.templates[i]) return;
      if (!this.dialog.open) {
        document.querySelectorAll('mobile-shop-stories').forEach(el => { if (el !== this) el.close?.(); });
        this.trigger = trigger || document.activeElement;
        this.oldOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        this.buildProgress();
        this.dialog.showModal();
        this.active = true;
      }
      this.show(i);
      this.ui.close.focus({ preventScroll: true });
    }

    close() {
      if (!this.ready) return;
      if (this.dialog.open) this.dialog.close();
      this.cleanup();
    }

    cleanup() {
      if (!this.active) return;
      this.active = false;
      this.token++;
      clearTimeout(this.holdTimer);
      clearTimeout(this.toastTimer);
      this.stopProgress();
      this.reasons.clear();
      this.unload();
      this.clearWarm();
      this.setSheet(false);
      this.setDock(false);
      document.body.style.overflow = this.oldOverflow || '';
      if (location.hash.startsWith('#story-')) {
        try { history.replaceState(history.state, '', location.pathname + location.search); } catch {}
      }
      if (this.trigger?.isConnected) this.trigger.focus({ preventScroll: true });
      this.trigger = null;
    }

    /* ================= one story ================= */
    show(i) {
      const token = ++this.token;
      this.stopProgress();
      this.unload();
      this.index = i;
      this.elapsed = 0;
      this.last = 0;
      this.pendingEnd = false;
      this.reasons.clear();
      if (document.hidden) this.reasons.add('hidden');
      this.resetChrome();

      const tpl = this.templates[i];
      // importNode (not cloneNode): template content belongs to an inert document where media cannot load.
      const frag = document.importNode(tpl.content, true);
      this.mountProducts([...frag.querySelectorAll('[data-product]')]);
      this.mountMedia(frag, i);

      this.ui.name.textContent = tpl.dataset.title || 'Story';
      this.duration = (+tpl.dataset.seconds || 5) * 1000;
      this.updateProgress(i);
      this.likeUI();
      this.soundUI();
      this.variant();
      this.markSeen(i);

      if (this.video) this.startVideo(token); else this.startImage(token);
      this.animateIn();
    }

    resetChrome() {
      this.setSheet(false);
      this.setDock(false);
      this.pauseUI();
      this.ui.retry.hidden = true;
      this.ui.status.textContent = '';
      this.toast('');
    }

    mountMedia(frag, i) {
      const placeholder = frag.querySelector('video');
      let video = null;
      if (placeholder) {
        if (this.warm?.index === i) {
          video = this.warm.video;
          placeholder.replaceWith(video);
          this.warm = null;
        } else {
          video = this.prepareVideo(placeholder);
        }
        video.preload = 'auto';
      }
      this.ui.media.replaceChildren(frag);
      this.video = video;
    }

    // Prefer adaptive HLS where supported (Safari); otherwise the smallest MP4 that is at least 720p.
    prepareVideo(v) {
      const sources = [...v.querySelectorAll('source')];
      const hls = sources.find(s => /mpegurl/i.test(s.type));
      const mp4 = sources.filter(s => /mp4/i.test(s.type))
        .sort((a, b) => (+a.dataset.height || 9999) - (+b.dataset.height || 9999));
      const pick = hls && v.canPlayType(hls.type) ? hls : (mp4.find(s => +s.dataset.height >= 720) || mp4[mp4.length - 1] || sources[0]);
      if (pick) {
        const url = pick.getAttribute('src');
        sources.forEach(s => s.remove());
        v.src = url;
      }
      v.muted = true;
      v.playsInline = true;
      return v;
    }

    releaseVideo(v) {
      if (!v) return;
      v.onwaiting = v.onplaying = v.onended = v.onerror = v.onpause = null;
      v.pause();
      v.removeAttribute('src');
      v.querySelectorAll('source').forEach(s => s.removeAttribute('src'));
      v.load();   // frees the network connection and decoder
    }

    unload() {
      this.playSerial++;
      this.pendingPlay = null;
      this.mediaAnimation?.cancel();
      this.releaseVideo(this.video);
      this.video = null;
      this.ui.media.replaceChildren();
    }

    startVideo(token) {
      const v = this.video;
      const live = () => token === this.token;
      v.muted = this.muted;
      v.onwaiting = () => { if (live()) { this.reasons.add('buffer'); this.stopProgress(); } };
      v.onplaying = () => {
        if (!live()) return;
        this.reasons.delete('buffer');
        this.reasons.delete('blocked');
        this.ui.retry.hidden = true;
        if (this.hardPaused()) { v.pause(); return; }
        this.startProgress();
        this.preloadNext();
      };
      // Paused by the browser or OS (not by us): show the retry button.
      v.onpause = () => { if (live() && this.dialog.open && !v.ended && !this.hardPaused()) this.blocked(); };
      v.onended = () => { if (live()) { this.pendingEnd = true; this.sync(); } };
      v.onerror = () => {
        if (!live()) return;
        this.blocked();
        this.toast('Video unavailable. Tap to retry or swipe to continue.');
      };
      this.reasons.add('buffer');
      this.sync();
    }

    startImage(token) {
      const img = this.ui.media.querySelector('img');
      if (img && !img.complete) {
        this.reasons.add('image');
        const done = () => { if (token === this.token) { this.reasons.delete('image'); this.sync(); } };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
      this.sync();
      this.preloadNext();
    }

    animateIn() {
      if (reducedMotion.matches || !this.ui.media.animate) return;
      this.mediaAnimation = this.ui.media.animate(
        [{ opacity: .7, transform: 'translateX(12px)' }, { opacity: 1, transform: 'none' }],
        { duration: 180, easing: 'ease-out' }
      );
    }

    go(d) {
      if (!this.dialog.open || this.busy || this.reasons.has('shop') || this.reasons.has('share')) return;
      // With the product cards open, a tap on the story just closes them.
      if (!this.ui.dock.hidden) { this.dock(false); return; }
      let n = this.index + d;
      if (n < 0) n = 0;
      else if (n >= this.templates.length) {
        if (!this.repeat) { this.close(); return; }
        n = 0;
      }
      this.show(n);
    }

    markSeen(i) {
      const c = this.circles[i];
      if (!c) return;
      c.setAttribute('data-seen', '');
      store.set(SEEN_KEY + c.dataset.id, '1');
    }

    /* ================= playback state ================= */
    hardPaused() { for (const r of this.reasons) if (r !== SOFT) return true; return false; }

    pause(reason, yes) {
      if (yes) this.reasons.add(reason); else this.reasons.delete(reason);
      this.sync();
    }

    // Single place that decides whether the story should be moving.
    sync() {
      if (!this.dialog.open) return;
      if (this.hardPaused()) { this.halt(); return; }
      if (this.pendingEnd) { this.pendingEnd = false; this.go(1); return; }
      const v = this.video;
      if (!v || !v.paused || this.pendingPlay) { this.startProgress(); return; }
      this.play(v, false);
    }

    play(v, retried) {
      const token = this.token, serial = ++this.playSerial;
      const stale = () => token !== this.token || serial !== this.playSerial;
      const p = Promise.resolve(v.play());
      this.pendingPlay = p;
      p.then(() => {
        if (stale()) return;
        this.reasons.delete('buffer');
        this.startProgress();
      }).catch(err => {
        if (stale() || this.hardPaused() || err?.name === 'AbortError') return;
        // Sound on can block autoplay when the story advances on its own: fall back to muted.
        if (err?.name === 'NotAllowedError' && !v.muted && !retried) {
          this.muted = v.muted = true;
          this.soundUI();
          this.toast('Sound turned off so the story can play.');
          this.pendingPlay = null;
          this.play(v, true);
          return;
        }
        this.reasons.delete('buffer');
        this.blocked();
      }).finally(() => { if (this.pendingPlay === p) this.pendingPlay = null; });
    }

    halt() {
      this.playSerial++;
      this.pendingPlay = null;
      this.video?.pause();
      this.stopProgress();
    }

    blocked() {
      this.reasons.add('blocked');
      this.playSerial++;
      this.pendingPlay = null;
      this.stopProgress();
      this.ui.retry.hidden = false;
    }

    retry() {
      this.reasons.delete('blocked');
      this.ui.retry.hidden = true;
      this.toast('');
      if (this.video?.error) this.video.load();
      this.sync();
    }

    togglePause() {
      this.pause('manual', !this.reasons.has('manual'));
      this.pauseUI();
    }

    pauseUI() {
      const paused = this.reasons.has('manual');
      this.ui.pause.innerHTML = paused ? ICON.play : ICON.pause;
      this.ui.pause.setAttribute('aria-label', paused ? 'Resume story' : 'Pause story');
    }

    toggleSound() {
      this.muted = !this.muted;
      if (this.video) this.video.muted = this.muted;
      this.soundUI();
    }

    soundUI() {
      const b = this.ui.sound;
      b.hidden = !this.video;
      b.innerHTML = this.muted ? ICON.soundOff : ICON.soundOn;
      b.setAttribute('aria-label', this.muted ? 'Turn sound on' : 'Turn sound off');
    }

    /* ================= progress bars ================= */
    buildProgress() {
      this.bars = this.templates.map(() => {
        const span = document.createElement('span');
        span.append(document.createElement('i'));
        return span;
      });
      this.ui.progress.replaceChildren(...this.bars);
      this.bars = this.bars.map(s => s.firstChild);
    }

    updateProgress(i) {
      this.bars.forEach((bar, k) => { bar.style.transform = k < i ? 'scaleX(1)' : 'scaleX(0)'; });
      this.bar = this.bars[i];
    }

    stopProgress() {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.last = 0;
    }

    startProgress() {
      if (this.raf || !this.dialog.open || this.reasons.size) return;
      const token = this.token;
      const frame = now => {
        this.raf = 0;
        if (token !== this.token || !this.dialog.open || this.reasons.size) { this.last = 0; return; }
        const dt = this.last ? Math.min(now - this.last, 100) : 0;
        this.last = now;
        let ratio = -1;
        if (this.video) {
          const d = this.video.duration;
          if (d > 0 && Number.isFinite(d)) ratio = this.video.currentTime / d;
        } else {
          this.elapsed += dt;
          ratio = this.elapsed / this.duration;
        }
        if (ratio >= 0) this.bar.style.transform = 'scaleX(' + Math.min(1, ratio) + ')';
        if (!this.video && ratio >= 1) { this.go(1); return; }
        this.raf = requestAnimationFrame(frame);
      };
      this.raf = requestAnimationFrame(frame);
    }

    /* ================= preloading (one video at a time, phone memory is tight) ================= */
    canPreload() {
      const c = navigator.connection;
      return this.mq.matches && !document.hidden && !c?.saveData && !/(^|-)2g$/.test(c?.effectiveType || '');
    }

    preloadNext() {
      let n = this.index + 1;
      if (n >= this.templates.length) n = this.repeat ? 0 : -1;
      if (n < 0 || n === this.index) { this.clearWarm(); return; }
      this.preload(n, false);
    }

    preload(index, preview) {
      if (!this.canPreload()) return;
      const tpl = this.templates[index];
      if (!tpl || (this.dialog.open && index === this.index)) return;
      const source = tpl.content.querySelector('video');
      if (!source) { if (!preview) this.preloadImage(tpl); return; }
      if (this.warm?.index === index) {
        if (!preview && this.warm.video.preload !== 'auto') { this.warm.video.preload = 'auto'; this.warm.video.load(); }
        return;
      }
      this.clearWarm();
      const v = this.prepareVideo(document.importNode(source, true));
      v.preload = preview ? 'metadata' : 'auto';
      this.warm = { index, video: v };
      v.load();
    }

    preloadImage(tpl) {
      const src = tpl.content.querySelector('img');
      if (!src || this.warmImageFor === tpl) return;
      const img = new Image();
      img.decoding = 'async';
      if (src.getAttribute('sizes')) img.sizes = src.getAttribute('sizes');
      if (src.getAttribute('srcset')) img.srcset = src.getAttribute('srcset');
      img.src = src.getAttribute('src');
      this.warmImage = img;
      this.warmImageFor = tpl;
    }

    clearWarm() {
      if (!this.warm) return;
      this.releaseVideo(this.warm.video);
      this.warm = null;
    }

    /* ================= product and options ================= */
    mountProducts(cards) {
      this.ui.slot.replaceChildren(...cards);
      this.ui.slot.classList.toggle('is-multi', cards.length > 1);
      this.ui.options.replaceChildren();
      this.products = cards;
      this.product = null;
      this.select = null;
      this.variants = [];
      this.optionNames = [];
      this.ui.shop.hidden = !cards.length;
      this.ui.shop.classList.remove('is-added');
      this.ui.shop.setAttribute('aria-label', cards.length > 1 ? 'Shop ' + cards.length + ' products' : 'Shop this story');
      this.ui.count.textContent = cards.length > 1 ? cards.length : '';
      cards.forEach((card, i) => {
        card.querySelectorAll('.st-card-num, .st-card-badge').forEach(el => { el.textContent = i + 1; });
        const simple = card.dataset.simple === 'true';
        const option = card.querySelector('[data-variant]')?.selectedOptions[0];
        const soldOut = card.dataset.available !== 'true' || (simple && option?.dataset.available !== 'true');
        card.classList.toggle('is-soldout', soldOut);
        const add = card.querySelector('.st-card-add');
        add.disabled = soldOut;
        if (soldOut) add.setAttribute('aria-label', card.dataset.title + ' is sold out');
      });
    }

    // The bag button opens the product cards; the story waits while they are open.
    dock(open) {
      if (open && !this.products.length) return;
      if (open === !this.ui.dock.hidden) return;
      this.setDock(open);
      this.pause('dock', open);
      if (open) {
        this.ui.slot.scrollLeft = 0;
        this.markCurrent();
      }
    }

    setDock(open) {
      const d = this.ui.dock;
      d.hidden = !open;
      this.ui.screen.classList.toggle('has-dock', open);
      this.ui.shop.setAttribute('aria-expanded', String(open));
      // Lift the footer (and its bag button) above the cards.
      if (open) this.ui.screen.style.setProperty('--st-dock-h', d.offsetHeight + 'px');
    }

    markCurrent() {
      const t = this.ui.slot, pad = parseFloat(getComputedStyle(t).paddingLeft) || 0;
      let best = 0, dist = Infinity;
      this.products.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - t.offsetLeft - pad - t.scrollLeft);
        if (d < dist) { dist = d; best = i; }
      });
      this.products.forEach((card, i) => card.classList.toggle('is-current', i === best));
    }

    // + on a card: products with variants open the options sheet, the rest go straight to the cart.
    quick(card) {
      if (!card || this.busy) return;
      this.setActive(card);
      if (card.dataset.simple === 'true') this.add();
      else this.panel(true);
    }

    // Make this card the product the options and the Add button work on.
    setActive(card) {
      this.product = card;
      this.select = card.querySelector('[data-variant]');
      // Parse each card's variants once instead of on every tap.
      card._variants ??= [...this.select.options].map(o => ({
        el: o,
        id: o.value,
        values: JSON.parse(o.dataset.values || '[]'),
        available: o.dataset.available === 'true'
      }));
      card._names ??= JSON.parse(card.dataset.options || '[]');
      this.variants = card._variants;
      this.optionNames = card._names;
      const img = card.querySelector('.st-card-img img');
      this.ui.pickImg.replaceChildren(...(img ? [img.cloneNode()] : []));
      this.ui.pickVendor.textContent = card.querySelector('.st-vendor')?.textContent || '';
      this.ui.pickVendor.hidden = !this.ui.pickVendor.textContent;
      this.ui.pickTitle.textContent = card.dataset.title || '';
      this.ui.status.textContent = '';
      this.variant();
    }

    setSheet(open) {
      for (const el of [this.ui.nav, this.ui.header, this.ui.footer, this.ui.dock]) el.inert = open;
      this.ui.panel.hidden = !open;
    }

    panel(open) {
      if (open && !this.product) return;
      if (!open && this.ui.panel.hidden) return;
      this.setSheet(open);
      this.pause('shop', open);
      if (open) {
        this.renderOptions();
        this.ui.panelClose.focus({ preventScroll: true });
      } else {
        const back = !this.ui.dock.hidden && this.product?.querySelector('.st-card-add');
        (back || this.ui.shop).focus({ preventScroll: true });
      }
    }

    current() { return this.variants[this.select.selectedIndex] || null; }

    currentValues() {
      return this.product._selection || this.current()?.values || this.variants[0]?.values || [];
    }

    variant() {
      if (!this.product) return;
      const v = this.current(), btn = this.ui.confirm;
      if (!v) {
        btn.disabled = true;
        btn.textContent = 'Unavailable';
        return;
      }
      this.product.querySelector('[data-price]').textContent = v.el.dataset.price;
      this.ui.pickPrice.textContent = v.el.dataset.price;
      if (this.recent === v.id) { btn.disabled = true; btn.textContent = this.addedText + ' ✓'; return; }
      if (this.busy) { btn.disabled = true; btn.textContent = 'Adding…'; return; }
      btn.disabled = !v.available;
      btn.textContent = v.available ? 'Add to bag' : 'Sold out';
    }

    renderOptions() {
      const host = this.ui.options;
      host.replaceChildren();
      if (!this.product || this.product.dataset.simple === 'true') return;
      const selected = this.currentValues();
      const frag = document.createDocumentFragment();
      this.optionNames.forEach((name, index) => {
        const group = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = name;
        group.append(legend);
        const values = [...new Set(this.variants.map(v => v.values[index]))];
        values.forEach(value => {
          const withValue = this.variants.filter(v => v.available && v.values[index] === value);
          const fits = withValue.some(v => v.values.every((x, k) => k === index || x === selected[k]));
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = value;
          b.dataset.action = 'option';
          b.dataset.optionIndex = index;
          b.dataset.value = value;
          b.setAttribute('aria-pressed', String(selected[index] === value));
          b.disabled = this.busy || !withValue.length;
          b.classList.toggle('is-unavailable', withValue.length > 0 && !fits);
          group.append(b);
        });
        frag.append(group);
      });
      host.append(frag);
    }

    choose(b) {
      if (this.busy || !this.select) return;
      const index = +b.dataset.optionIndex, value = b.dataset.value;
      const wanted = [...this.currentValues()];
      wanted[index] = value;
      // Exact match if it is in stock; otherwise the in-stock variant with this value that keeps
      // the most of the shopper's other choices, so the button never lands on a dead combination.
      const score = v => v.values.reduce((n, x, k) => n + (x === wanted[k] ? 1 : 0), 0);
      const exact = this.variants.find(v => v.values.every((x, k) => x === wanted[k]));
      const best = this.variants
        .filter(v => v.available && v.values[index] === value)
        .sort((a, b) => score(b) - score(a))[0];
      const pick = exact?.available ? exact : best || exact;
      this.product._selection = pick ? pick.values : wanted;
      this.select.selectedIndex = pick ? this.variants.indexOf(pick) : -1;
      this.variant();
      this.renderOptions();
      const again = [...this.ui.options.querySelectorAll('button')]
        .find(el => +el.dataset.optionIndex === index && el.dataset.value === value);
      again?.focus({ preventScroll: true });
    }

    /* ================= cart ================= */
    async add() {
      const v = this.select ? this.current() : null;
      if (this.busy || !v || !v.available || this.recent === v.id) return;
      this.busy = true;
      const token = this.token, card = this.product, fromSheet = !this.ui.panel.hidden;
      card.classList.add('is-loading');
      this.pause('adding', true);
      this.variant();
      this.ui.options.inert = true;
      this.ui.status.textContent = '';
      try {
        await this.cartAdd([{ id: Number(v.id), quantity: 1 }]);
        if (token !== this.token || !this.dialog.open) return;
        // Measure the product image before the sheet closes, then drop it into the bag.
        const img = fromSheet ? this.ui.pickImg.querySelector('img') : card.querySelector('.st-card-img img');
        const rect = img?.getBoundingClientRect();
        card.classList.remove('is-loading');
        this.flash(v.id, card);
        if (fromSheet) this.panel(false);
        // The story stays paused until the product has landed in the bag.
        await this.flyToBag(img, rect);
        if (!this.dialog.open) return;
        this.bagAdded();
        this.toast('✓ ' + this.addedText);
        this.buzz();
      } catch (err) {
        if (token === this.token) {
          const msg = err?.message || 'Couldn’t add to cart. Please try again.';
          this.ui.status.textContent = msg;
          this.toast(msg);
        }
      } finally {
        card.classList.remove('is-loading');
        this.busy = false;
        this.ui.options.inert = false;
        this.pause('adding', false);
        if (this.dialog.open && this.product) {
          this.variant();
          if (!this.ui.panel.hidden) this.renderOptions();
        }
      }
    }

    // Show "Added" on the button for a moment; the same variant can be added again afterwards.
    flash(id, card) {
      this.recent = id;
      this.products.forEach(c => c.classList.remove('is-added'));
      card.classList.add('is-added');
      clearTimeout(this.recentTimer);
      this.recentTimer = setTimeout(() => {
        this.recent = null;
        card.classList.remove('is-added');
        if (this.dialog.open && this.product) this.variant();
      }, 2200);
    }

    /* Horizon (current): the cart icon and the cart drawer listen for Shopify's standard
       "shopify:cart:lines-update" event and wait on its promise for the new cart. That refreshes
       them without opening the drawer. The module comes from the theme's import map. */
    async cartAdd(items) {
      /* static clone: the Shopify cart endpoint is replaced by the local bag.
         The variant id maps to a handle through the card link, and the chosen
         size is the first option value of the selected variant. */
      const v = this.current ? this.current() : null;
      const card = this.product;
      const a = card ? card.querySelector('a.st-card-title, a.st-card-img') : null;
      let handle = a ? (a.getAttribute('href') || '') : '';
      handle = handle.replace(/^product-/, '').replace(/\.html$/, '');
      const size = (v && v.values && v.values[0]) || (v && v.opts && v.opts[0]) || 'M';
      if (window.Cart && handle) window.Cart.add(handle, size, 1);
      return { items: [{ quantity: 1 }] };
    }

    // Other themes: refresh the cart count quietly. The cart drawer is never opened from here.
    announce(cart, data, standard, sourceId) {
      const html = data.sections?.['cart-icon-bubble'];
      const bubble = document.getElementById('cart-icon-bubble');
      if (html && bubble) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        bubble.innerHTML = (doc.querySelector('.shopify-section') || doc.body).innerHTML;
      }
      const count = cart?.item_count;
      if (count !== undefined) {
        document.querySelectorAll('[data-cart-count], .cart-count-bubble span[aria-hidden="true"]').forEach(el => { el.textContent = count; });
      }
      try { if (typeof window.publish === 'function') window.publish('cart-update', { source: 'mobile-shop-stories', cartData: cart }); } catch {}
      // Older Horizon builds listen for 'cart:update'; some open their drawer on it, so it is opt-in.
      if (!standard && this.notifyCart) {
        document.dispatchEvent(new CustomEvent('cart:update', {
          bubbles: true,
          detail: { resource: cart, sourceId, data: { source: 'mobile-shop-stories', itemCount: count, productId: data.items?.[0]?.product_id, sections: data.sections, didError: false } }
        }));
      }
    }

    // The product image lifts, arcs and drops into the bag button.
    flyToBag(src, r) {
      return new Promise(done => {
        const bag = this.ui.shop;
        if (!src || !r || !r.width || reducedMotion.matches || !bag.animate || bag.hidden) { done(); return; }
        const t = bag.getBoundingClientRect();
        const f = document.createElement('img');
        f.className = 'st-fly';
        f.alt = '';
        f.src = src.currentSrc || src.src;
        Object.assign(f.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
        this.ui.screen.append(f);
        const dx = t.left + t.width / 2 - (r.left + r.width / 2);
        const dy = t.top + t.height / 2 - (r.top + r.height / 2);
        const finish = () => { f.remove(); done(); };
        f.animate([
          { transform: 'none', opacity: 1 },
          { transform: 'translate(0,-34px) scale(1.08) rotate(-3deg)', opacity: 1, offset: .22 },
          { transform: 'translate(' + dx * .55 + 'px,' + (dy * .45 - 90) + 'px) scale(.55) rotate(-10deg)', opacity: 1, offset: .58 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.12) rotate(-18deg)', opacity: .4 }
        ], { duration: 900, easing: 'cubic-bezier(.45,0,.25,1)' }).finished.then(finish, finish);
      });
    }

    bagAdded() {
      const bag = this.ui.shop;
      bag.classList.remove('is-added');
      void bag.offsetWidth;   // restart the burst
      bag.classList.add('is-added');
      if (!reducedMotion.matches && bag.animate) {
        bag.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 520, easing: 'cubic-bezier(.2,1.6,.4,1)' });
      }
      clearTimeout(this.addedTimer);
      this.addedTimer = setTimeout(() => bag.classList.remove('is-added'), 2400);
    }

    // A light haptic tick on phones that support it.
    buzz() {
      if (reducedMotion.matches || typeof navigator.vibrate !== 'function') return;
      try { navigator.vibrate(12); } catch {}
    }

    /* ================= like, share, toast ================= */
    likeKey() { return LIKE_KEY + this.templates[this.index].dataset.id; }

    likeUI() {
      const b = this.ui.like;
      if (!b) return;
      const liked = store.get(this.likeKey()) === '1';
      b.setAttribute('aria-pressed', String(liked));
      b.setAttribute('aria-label', liked ? 'Unlike this story' : 'Like this story');
    }

    like() {
      const b = this.ui.like;
      if (!b) return;
      const liked = b.getAttribute('aria-pressed') !== 'true';
      store.set(this.likeKey(), liked ? '1' : '0');
      this.likeUI();
    }

    async share() {
      if (this.reasons.has('share')) return;
      const token = this.token, tpl = this.templates[this.index];
      this.pause('share', true);
      try {
        const url = new URL(location.href);
        url.hash = 'story-' + tpl.dataset.id;
        if (navigator.share) {
          await navigator.share({ title: tpl.dataset.title || document.title, url: url.href });
        } else {
          await navigator.clipboard.writeText(url.href);
          if (token === this.token) this.toast('Story link copied');
        }
      } catch (err) {
        if (token === this.token && err?.name !== 'AbortError') this.toast('Unable to share. Copy the page link from your browser.');
      } finally {
        if (token === this.token) this.pause('share', false);
      }
    }

    toast(text) {
      clearTimeout(this.toastTimer);
      this.ui.toast.textContent = text;
      if (text) this.toastTimer = setTimeout(() => { this.ui.toast.textContent = ''; }, 2800);
    }
  }

  customElements.define('mobile-shop-stories', MobileShopStories);
})();
