/** The reference uses an expanded first information item per column at wide widths. */
export function mountInformation() {
  const secondary = document.querySelector('[data-information-open-wide]');
  const media = matchMedia('(min-width: 768px)');
  const update = () => { secondary.open = media.matches; };
  update(); media.addEventListener('change', update);
  return () => media.removeEventListener('change', update);
}
