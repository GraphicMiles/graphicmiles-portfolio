export const money = value => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const plural = (count, singular, multiple = `${singular}s`) => `${count} ${count === 1 ? singular : multiple}`;
let serial = 0;
export const uniqueId = prefix => `${prefix}-${++serial}`;
export function focusHeading(root) {
  const target = root.querySelector('h1');
  if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
}
export function imageMarkup(src, alt, className = '', eager = false) {
  return `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" class="${className}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" width="800" height="900">`;
}
