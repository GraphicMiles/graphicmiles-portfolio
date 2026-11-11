/* ==========================================================================
   layout.js — injects the shared header (top bar + main row), search modal,
   cart drawer mount. Every page includes this before its own scripts.
   ========================================================================== */
(function () {
  'use strict';

  var NAV = [
    { label: 'Home', href: 'index.html', key: 'home' },
    { label: 'Nike Orbit', href: 'page-nike-orbit.html', key: 'nike-orbit' },
    { label: 'Hand Rail Pro', href: 'page-scene-rail.html', key: 'scene-rail' },
    { label: 'Runway', href: 'page-runway.html', key: 'runway' },
    { label: 'Shoe Atelier', href: 'page-shoe-atelier.html', key: 'shoe-atelier' }
  ];

  var ICONS = {
    search:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="12.5" r="6" stroke="currentColor" stroke-width="1.6"/><path d="M15 18.5l4.6 4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M19.75 1.5v3.5M18 3.25h3.5M21.2 7.6v2.2M20.1 8.7h2.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    user:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8.2" r="3.7"/><path d="M4.8 20.2c.7-3.6 3.7-5.7 7.2-5.7s6.5 2.1 7.2 5.7"/></svg>',
    bag:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8.2 8.2V7a3.8 3.8 0 0 1 7.6 0v1.2"/><path d="M5.5 8.2h13l.9 11.1a1.6 1.6 0 0 1-1.6 1.7H6.2a1.6 1.6 0 0 1-1.6-1.7l.9-11.1Z"/></svg>',
    menu:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3.5 7h17M3.5 12h17M3.5 17h17"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function activeKey() {
    var b = document.body.getAttribute('data-page') || '';
    return b;
  }

  function buildHeader() {
    var mount = document.querySelector('[data-header]');
    if (!mount) return;
    var key = activeKey();
    var links = NAV.map(function (n) {
      var cls = 'menu-list__link' + (n.key === key ? ' menu-list__link--active' : '');
      return '<a class="' + cls + '" href="' + n.href + '">' + n.label + '</a>';
    }).join('');

    /* the live header carries the shop-name h1 on the home template only */
    var h1 = document.body.getAttribute('data-page') === 'home'
      ? '<h1 class="visually-hidden">Nikey | Password: 1</h1>' : '';

    mount.innerHTML = h1 +
      '<div class="top-info-bar">' +
      '<div class="top-info-bar__inner">' +
      '<div class="top-info-bar__left"></div>' +
      '<nav class="top-info-bar__right" aria-label="Top info links">' +
      '<ul class="top-info-bar__links" role="list">' +
      '<li class="top-info-bar__item"><span class="top-info-bar__link" role="link" tabindex="0">Find a Store</span></li>' +
      '<li class="top-info-bar__item"><span class="top-info-bar__link" role="link" tabindex="0">Help</span></li>' +
      '<li class="top-info-bar__item"><span class="top-info-bar__link" role="link" tabindex="0">Join Us</span></li>' +
      '<li class="top-info-bar__item"><span class="top-info-bar__link" role="link" tabindex="0">Sign In</span></li>' +
      '</ul></nav>' +
      '</div></div>' +
      '<div class="header__row">' +
      '<div class="header__columns">' +
      '<div class="header__col header__col--left">' +
      '<a class="header-logo" href="index.html" aria-label="Nikey home">' +
      '<img src="assets/img/Logo_NIKE.svg" alt="Nike" width="68" height="24">' +
      '</a>' +
      '</div>' +
      '<div class="header__col header__col--center">' +
      '<nav class="header-menu" aria-label="Main menu"><div class="header-menu__inner">' + links + '</div></nav>' +
      '</div>' +
      '<div class="header__col header__col--right">' +
      '<div class="header-actions">' +
      '<button type="button" class="search-pill-button" aria-label="Search" data-search-open>' +
      ICONS.search +
      '<span class="search-pill-label">Search</span>' +
      '</button>' +
      '<a class="header-actions__icon" href="#" aria-label="Account" data-noop>' + ICONS.user + '</a>' +
      '<button type="button" class="header-actions__icon" aria-label="Bag" data-cart-open>' +
      ICONS.bag +
      '<span class="cart-count" data-cart-count data-count="0">0</span>' +
      '</button>' +
      '<button type="button" class="header__menu-btn" aria-label="Menu" data-menu-open>' + ICONS.menu + '</button>' +
      '</div>' +
      '</div>' +
      '</div></div>';
  }

  function buildSearch() {
    var mount = document.querySelector('[data-search]');
    if (!mount) return;
    mount.innerHTML =
      '<div class="search-modal__backdrop" data-search-close></div>' +
      '<div class="search-modal__panel" role="dialog" aria-modal="true" aria-label="Search">' +
      '<div class="search-modal__head">' +
      ICONS.search +
      '<input class="search-modal__input" type="search" placeholder="Search" aria-label="Search products" data-search-input>' +
      '<button type="button" class="search-modal__close" aria-label="Close search" data-search-close>' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="search-modal__body">' +
      '<div class="search-modal__label">Products</div>' +
      '<div class="search-results" data-search-results></div>' +
      '</div>' +
      '</div>';
  }

  function renderResults(q) {
    var box = document.querySelector('[data-search-results]');
    if (!box) return;
    var list = DATA.products.filter(function (p) {
      return !q || p.title.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    });
    if (!list.length) {
      box.innerHTML = '<p class="search-modal__empty">No results found. Try a different search.</p>';
      return;
    }
    box.innerHTML = list
      .map(function (p) {
        return (
          '<a class="search-result" href="' +
          DATA.productUrl(p.handle) +
          '">' +
          '<span class="search-result__media"><img src="' +
          DATA.img +
          p.card +
          '" alt="' +
          p.title +
          '" loading="lazy"></span>' +
          '<span class="search-result__name">' +
          p.title +
          '</span>' +
          '<span class="search-result__price">' +
          DATA.money(p.price) +
          '</span>' +
          '</a>'
        );
      })
      .join('');
  }

  function openSearch() {
    var m = document.querySelector('[data-search]');
    if (!m) return;
    m.setAttribute('open', '');
    renderResults('');
    var input = m.querySelector('[data-search-input]');
    if (input) {
      input.value = '';
      setTimeout(function () {
        input.focus();
      }, 30);
    }
  }

  function closeSearch() {
    var m = document.querySelector('[data-search]');
    if (m) m.removeAttribute('open');
  }

  function buildMobileMenu() {
    var mount = document.querySelector('[data-mobile-menu]');
    if (!mount) return;
    mount.innerHTML =
      '<div class="mobile-menu__backdrop" data-menu-close></div>' +
      '<nav class="mobile-menu__panel" aria-label="Mobile menu">' +
      '<button type="button" class="mobile-menu__close" aria-label="Close menu" data-menu-close>' + ICONS.close + '</button>' +
      NAV.map(function (n) {
        return '<a class="mobile-menu__link" href="' + n.href + '">' + n.label + '</a>';
      }).join('') +
      '<div class="mobile-menu__sep"></div>' +
      '<span class="mobile-menu__small">Find a Store · Help · Join Us · Sign In</span>' +
      '</nav>';
  }

  function init() {
    buildHeader();
    buildSearch();
    buildMobileMenu();
    if (window.Cart) Cart.init();

    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t.closest) return;
      if (t.closest('[data-search-open]')) {
        ev.preventDefault();
        openSearch();
      } else if (t.closest('[data-search-close]')) {
        closeSearch();
      } else if (t.closest('[data-menu-open]')) {
        document.querySelector('[data-mobile-menu]').setAttribute('open', '');
      } else if (t.closest('[data-menu-close]')) {
        document.querySelector('[data-mobile-menu]').removeAttribute('open');
      } else if (t.closest('[data-noop]')) {
        ev.preventDefault();
      }
    });

    var input = document.querySelector('[data-search-input]');
    if (input) {
      input.addEventListener('input', function () {
        renderResults(input.value.trim());
      });
    }

    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      closeSearch();
      var mm = document.querySelector('[data-mobile-menu]');
      if (mm && mm.hasAttribute('open')) {
        mm.removeAttribute('open');
        var opener = document.querySelector('[data-menu-open]');
        if (opener) opener.focus();
      }
    });
  }

  /* Build the header immediately: the custom-element sections that follow measure
     the header on upgrade, so it has to exist before they run. */
  init();
})();
