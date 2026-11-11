/* lumina.js — Lumina Slider (static clone: CSS cross-fade instead of WebGL) */
(function () {
  'use strict';
  var root = document.querySelector('.lumina-slider');
  if (!root || root.__lu) return;
  root.__lu = true;

  var slides = [].slice.call(root.querySelectorAll('.lu-slide'));
  var dots = [].slice.call(root.querySelectorAll('.lu-dot'));
  var title = root.querySelector('[data-lu-title]');
  var desc = root.querySelector('[data-lu-desc]');
  var actions = root.querySelector('[data-lu-actions]');
  var num = root.querySelector('[data-lu-num]');
  var data = window.LUMINA_SLIDES || [];
  var i = 0, timer = null, SPEED = parseInt(root.dataset.speed || '5000', 10);
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function letters(text) {
    return text.split(' ').map(function (word) {
      return '<span aria-hidden="true" class="w">' + word.split('').map(function (c) {
        return '<span class="c">' + c + '</span>';
      }).join('') + '</span>';
    }).join(' ');
  }

  function go(n, user) {
    var s = data[n];
    if (!s) return;
    i = n;
    slides.forEach(function (el, k) { el.classList.toggle('is-active', k === n); });
    dots.forEach(function (d, k) {
      d.classList.toggle('is-active', k === n);
      d.setAttribute('aria-selected', k === n ? 'true' : 'false');
    });
    if (title) { title.innerHTML = letters(s.title); title.setAttribute('aria-label', s.title); }
    if (desc) desc.textContent = s.desc;
    if (actions && s.link) actions.innerHTML = '<a class="lu-btn lu-btn--link" href="' + s.link + '">' + s.label + '</a>';
    if (num) num.textContent = pad(n + 1);
    if (!reduce && title) {
      [].forEach.call(title.querySelectorAll('.c'), function (c, k) {
        c.style.opacity = '0'; c.style.transform = 'translateY(.35em)';
        setTimeout(function () {
          c.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1)';
          c.style.opacity = '1'; c.style.transform = 'none';
        }, 18 * k);
      });
    }
    if (user) restart();
  }

  function restart() {
    clearInterval(timer);
    if (root.dataset.autoplay !== 'true' || reduce) return;
    timer = setInterval(function () { go((i + 1) % slides.length); }, SPEED);
  }

  dots.forEach(function (d) {
    d.addEventListener('click', function () { go(parseInt(d.dataset.index, 10), true); });
  });

  // drag / swipe
  var down = false, x0 = 0;
  root.addEventListener('pointerdown', function (e) { down = true; x0 = e.clientX; root.classList.add('is-dragging'); });
  root.addEventListener('pointerup', function (e) {
    if (!down) return;
    down = false; root.classList.remove('is-dragging');
    var dx = e.clientX - x0;
    if (Math.abs(dx) > 60) go((i + (dx < 0 ? 1 : slides.length - 1)) % slides.length, true);
  });
  root.addEventListener('pointercancel', function () { down = false; root.classList.remove('is-dragging'); });

  go(0);
  restart();
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearInterval(timer); else restart();
  });
})();
