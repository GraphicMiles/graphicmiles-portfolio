import { imageMarkup } from '../ui/utils.js';
import { icon } from '../ui/icons.js';

/** An accessible black image viewer, isolated from product configuration and cart state. */
export function createGalleryFeature({ overlay }) {
  function open(product, initialIndex = 0) {
    let index = Math.max(0, Math.min(initialIndex, product.images.length - 1));
    const multiple = product.images.length > 1;
    overlay.open({ title: `${product.name}: product photographs`, kind: 'gallery', content: `<div class="gallery-lightbox">${multiple ? `<button type="button" class="gallery-arrow gallery-previous icon-button" data-gallery-step="-1" aria-label="Previous photograph">${icon('chevron-left', 30)}</button>` : ''}${imageMarkup(product.images[index], `${product.name}, view ${index + 1}`, 'gallery-enlarged', true)}${multiple ? `<button type="button" class="gallery-arrow gallery-next icon-button" data-gallery-step="1" aria-label="Next photograph">${icon('chevron-right', 30)}</button>` : ''}<p class="gallery-counter" aria-live="polite">${index + 1} / ${product.images.length}</p></div>`, onMount: root => {
      function step(delta) {
        if (!multiple) return;
        index = (index + delta + product.images.length) % product.images.length;
        const image = root.querySelector('img'); image.src = product.images[index]; image.alt = `${product.name}, view ${index + 1}`;
        root.querySelector('.gallery-counter').textContent = `${index + 1} / ${product.images.length}`;
      }
      const click = event => { const button = event.target.closest('[data-gallery-step]'); if (button) step(Number(button.dataset.galleryStep)); };
      const key = event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); } };
      root.addEventListener('click', click); root.closest('dialog').addEventListener('keydown', key);
      return () => { root.removeEventListener('click', click); root.closest('dialog')?.removeEventListener('keydown', key); };
    } });
  }
  return { open };
}
