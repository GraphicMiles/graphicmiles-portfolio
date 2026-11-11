/* carousel.js — full-bleed collection carousel (arrows + snap + drag) */
(function () {
  'use strict';
  var root = document.querySelector('[data-carousel-track]');
  if (!root || root.__cc) return;
  root.__cc = true;
  var sec = root.closest('.section-carousel');
  var prev = sec.querySelector('[data-carousel-prev]');
  var next = sec.querySelector('[data-carousel-next]');

  function step() {
    var card = root.querySelector('.card');
    var gap = parseFloat(getComputedStyle(root).columnGap) || 12;
    return card ? card.getBoundingClientRect().width + gap : root.clientWidth;
  }
  function sync() {
    var max = root.scrollWidth - root.clientWidth - 1;
    if (prev) prev.disabled = root.scrollLeft <= 1;
    if (next) next.disabled = root.scrollLeft >= max;
  }
  if (prev) prev.addEventListener('click', function () { root.scrollBy({ left: -step(), behavior: 'smooth' }); });
  if (next) next.addEventListener('click', function () { root.scrollBy({ left: step(), behavior: 'smooth' }); });
  root.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();

  // pointer drag (desktop)
  var down = false, x0 = 0, s0 = 0, moved = false;
  root.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') return;
    down = true; moved = false; x0 = e.clientX; s0 = root.scrollLeft;
  });
  root.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - x0;
    if (Math.abs(dx) > 3) { moved = true; root.scrollLeft = s0 - dx; }
  });
  root.addEventListener('pointerup', function () {
    if (!down) return;
    down = false;
    if (moved) {
      var st = step();
      root.scrollTo({ left: Math.round(root.scrollLeft / st) * st, behavior: 'smooth' });
    }
  });
  root.addEventListener('pointercancel', function () { down = false; });
  root.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
})();
