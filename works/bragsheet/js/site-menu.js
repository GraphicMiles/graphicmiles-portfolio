(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  let closeTimer;
  const close = (restoreFocus = false) => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.inert = true;
    menu.classList.remove('is-open');
    clearTimeout(closeTimer);
    const closeDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280;
    closeTimer = window.setTimeout(() => { menu.hidden = true; }, closeDelay);
    if (restoreFocus) toggle.focus();
  };
  const open = () => {
    clearTimeout(closeTimer);
    menu.hidden = false;
    menu.inert = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    // Start from the closed frame so the entrance transition also works after Escape/close.
    void menu.offsetWidth;
    requestAnimationFrame(() => menu.classList.add('is-open'));
  };

  toggle.addEventListener('click', () => {
    toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close(true);
  });
  document.addEventListener('click', (event) => {
    if (toggle.getAttribute('aria-expanded') === 'true' && !menu.contains(event.target) && !toggle.contains(event.target)) close();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) close();
  }, { passive: true });
})();
