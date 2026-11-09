import { icon } from './icons.js';
/** Explicitly illustrative layout data, never presented as verified customer feedback. */
export function sampleRating({ large = false } = {}) {
  return `<span class="sample-rating${large ? ' is-large' : ''}"><span class="rating-stars" aria-hidden="true">${Array.from({ length: 5 }, () => icon('star', large ? 24 : 15)).join('')}</span><span class="sample-rating-label">Sample</span><span class="sr-only">Illustrative stars only, not a verified rating</span></span>`;
}
