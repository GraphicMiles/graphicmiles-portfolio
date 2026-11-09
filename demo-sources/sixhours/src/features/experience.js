import { experienceExamples as examples } from '../data/experience-examples.js';
import { getProduct } from '../domain/catalog.js';
import { sampleRating } from '../ui/rating.js';
import { escapeHTML, imageMarkup } from '../ui/utils.js';

function card(example, number) {
  const product = getProduct(example.productId);
  return `<article class="review-card" aria-label="Preview guide ${number + 1}, not a customer review"><div class="review-person"><span class="review-avatar" aria-hidden="true">${String(number + 1).padStart(2, '0')}</span><div><strong>${escapeHTML(example.title)}</strong><p>Preview guide</p></div></div><div class="review-rating">${sampleRating({ large: true })}</div><p class="review-content">${escapeHTML(example.copy)}</p><p class="review-meta">Illustrative, not customer feedback.</p><a class="review-product" href="#product/${product.id}">${imageMarkup(product.images[0], '')}<span>${escapeHTML(product.name)}</span></a></article>`;
}

/** A manual, one-at-a-time infinite carousel. No autoplay or idle animation. */
export function mountExperienceCarousel() {
  const root = document.querySelector('[data-review-carousel]');
  const track = root.querySelector('.reviews-track');
  const viewport = root.querySelector('.reviews-window');
  const dots = root.querySelector('[data-review-dots]');
  const status = root.querySelector('[data-review-status]');
  const padding = 3; // Stable clones cover the widest layout without rebuilding on resize.
  let visible = 3; let index = padding; let moving = false; let timer; let swipeStart; let suppressClickUntil = 0; let lastWidth = 0;
  const normalize = value => (value + examples.length) % examples.length;
  const current = () => normalize(index - padding);
  const count = () => innerWidth <= 650 ? 1 : innerWidth <= 800 ? 2 : 3;
  function updateAccessibility() {
    const focusedCard = document.activeElement?.closest('.review-card');
    [...track.children].forEach((element, position) => {
      const active = position >= index && position < index + visible;
      element.inert = !active; element.setAttribute('aria-hidden', String(!active));
    });
    [...dots.children].forEach((button, position) => button.setAttribute('aria-pressed', String(position === current())));
    if (focusedCard && track.contains(focusedCard) && focusedCard.inert) dots.children[current()]?.focus({ preventScroll: true });
    status.textContent = `Preview example ${current() + 1} of ${examples.length}. These are not customer reviews.`;
  }
  function position(animate = true) {
    const first = track.firstElementChild; if (!first || !viewport.clientWidth) return;
    const step = first.getBoundingClientRect().width + 20;
    track.style.transition = animate ? '' : 'none';
    track.style.transform = `translateX(${-index * step}px)`;
    if (!animate) { track.getBoundingClientRect(); track.style.transition = ''; }
    updateAccessibility();
  }
  function finish() {
    clearTimeout(timer); moving = false;
    if (index >= examples.length + padding) index -= examples.length;
    else if (index < padding) index += examples.length;
    position(false);
  }
  function move(delta) {
    if (moving || delta === 0) return;
    index += delta; moving = true; position(true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish(); else timer = setTimeout(finish, 500);
  }
  const ordered = [...examples.slice(-padding), ...examples, ...examples.slice(0, padding)];
  track.innerHTML = ordered.map((example, offset) => card(example, normalize(offset - padding))).join('');
  dots.innerHTML = examples.map((_, offset) => `<button type="button" data-review-index="${offset}" aria-label="Show preview example ${offset + 1} of ${examples.length}" aria-pressed="${offset === 0}"></button>`).join('');
  function refresh() {
    const width = viewport.clientWidth;
    // Mobile address bars and keyboards change height only. They must not reset a slide/focus.
    if (!width || (width === lastWidth && visible === count())) return;
    clearTimeout(timer); moving = false;
    const selected = current(); visible = count(); index = padding + selected; lastWidth = width;
    position(false);
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-review-step]');
    if (button) move(Number(button.dataset.reviewStep));
    const dot = event.target.closest('[data-review-index]');
    if (dot && !moving) move(Number(dot.dataset.reviewIndex) - current());
  });
  root.addEventListener('click', event => { if (Date.now() < suppressClickUntil && event.target.closest('.review-product')) { event.preventDefault(); event.stopPropagation(); } }, true);
  viewport.addEventListener('pointerdown', event => { swipeStart = { x: event.clientX, id: event.pointerId }; });
  window.addEventListener('pointerup', event => {
    if (!swipeStart || swipeStart.id !== event.pointerId) return;
    const distance = event.clientX - swipeStart.x; swipeStart = null;
    if (Math.abs(distance) > 45) { suppressClickUntil = Date.now() + 250; move(distance < 0 ? 1 : -1); }
  });
  window.addEventListener('pointercancel', () => { swipeStart = null; });
  window.addEventListener('resize', refresh);
  refresh();
  return { refresh };
}
