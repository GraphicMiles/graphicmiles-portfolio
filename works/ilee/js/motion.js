/* ilee - cinematic motion pass (index only).
   GSAP core + ScrollTrigger + SplitText carry the scroll choreography and
   heading masks; anime.js carries the magnetic CTA micro-physics. Every
   scene lives inside gsap.matchMedia, and the whole pass is skipped under
   prefers-reduced-motion so the page collapses to static. */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) { return; }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

  /* Tell the CSS to stand down: GSAP owns [data-reveal] from here on. */
  document.documentElement.classList.add('has-motion');
  gsap.registerPlugin(ScrollTrigger, SplitText);

  function start() {
    var mm = gsap.matchMedia();

  /* The hero intro lives in CSS (line masks + fade cascade, reduced-motion
     gated) - GSAP must not double-drive those elements. */

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    /* Headings: masked word rise as each title enters the viewport. */
    document.querySelectorAll('main h2').forEach(function (h) {
      var targets = [];
      if (h.querySelector('br')) {
        /* Keep the authored line break: mask each text chunk separately. */
        Array.prototype.slice.call(h.childNodes).forEach(function (node) {
          if (node.nodeType === 3 && node.textContent.trim()) {
            var mask = document.createElement('span');
            mask.className = 'w-mask';
            var word = document.createElement('span');
            word.className = 'w-word';
            word.textContent = node.textContent;
            mask.appendChild(word);
            h.replaceChild(mask, node);
            targets.push(word);
          }
        });
      } else {
        var split = new SplitText(h, { type: 'words', wordsClass: 'w-word' });
        split.words.forEach(function (w) {
          var mask = document.createElement('span');
          mask.className = 'w-mask';
          w.parentNode.insertBefore(mask, w);
          mask.appendChild(w);
        });
        targets = split.words;
      }
      if (targets.length) {
        gsap.from(targets, {
          yPercent: 120,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: { trigger: h, start: 'top 86%', once: true }
        });
      }
    });

    /* Staggered scroll reveals: siblings entering together cascade. */
    var sibCount = new Map();
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var i = sibCount.get(el.parentElement) || 0;
      sibCount.set(el.parentElement, i + 1);
      gsap.from(el, {
        opacity: 0,
        y: 22,
        duration: 0.7,
        ease: 'power3.out',
        delay: Math.min(i * 0.08, 0.24),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* Framed parallax: photos drift inside their masks while scrolling. */
    document.querySelectorAll('.workflow-figure img, .abroad-section figure img').forEach(function (img) {
      gsap.fromTo(img,
        { yPercent: -5, scale: 1.1 },
        {
          yPercent: 5,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });
  });

  /* Magnetic CTAs (anime.js): pills lean toward the cursor and spring
     back elastically on leave. Fine pointers only. */
  mm.add('(pointer: fine)', function () {
    if (!window.anime) { return; }
    var cleanup = [];
    document.querySelectorAll('.hero-actions .button, .cta-final .button').forEach(function (btn) {
      var move = function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        anime.remove(btn);
        anime({ targets: btn, translateX: x * 7, translateY: y * 5, duration: 280, easing: 'easeOutQuad' });
      };
      var leave = function () {
        anime.remove(btn);
        anime({ targets: btn, translateX: 0, translateY: 0, duration: 900, easing: 'easeOutElastic(1, 0.45)' });
      };
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', leave);
      cleanup.push(function () {
        btn.removeEventListener('pointermove', move);
        btn.removeEventListener('pointerleave', leave);
        anime.remove(btn);
        btn.style.transform = '';
      });
    });
    return function () { cleanup.forEach(function (fn) { fn(); }); };
  });
}

  /* Measure type only once the real typeface is on board (playwright
     flagged SplitText running before fonts loaded). */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }
}());
