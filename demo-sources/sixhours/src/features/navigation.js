import { escapeHTML, uniqueId } from '../ui/utils.js';
import { icon } from '../ui/icons.js';

const accessories = [
  { label: 'Chargers & power', href: '#shop/accessories?q=charger' },
  { label: 'Desk accessories', href: '#shop/accessories?q=Magic' },
  { label: 'Apple Pencil', href: '#product/apple-pencil-pro' },
  { label: 'AirTag', href: '#product/airtag-pack' },
];
const gifting = [
  { label: 'Gift items & bundles', href: '#bundles' },
  { label: 'The workday edit', href: '#bundle/workday-edit' },
  { label: 'Everyday essentials', href: '#bundle/everyday-essentials' },
];
const tree = [
  { label: 'Shop', children: [
    { label: 'Phones', children: [{ label: 'All phones', href: '#shop/phones' }, { label: 'iPhone', href: '#shop/phones?q=iPhone' }, { label: 'Samsung', href: '#shop/phones?q=Samsung' }] },
    { label: 'Laptops', href: '#shop/laptops' },
    { label: 'Audio & Sound', href: '#shop/audio' },
    { label: 'Tablets', href: '#shop/tablets' },
    { label: 'Accessories', children: accessories },
    { label: 'Gifting', children: gifting },
  ] },
  { label: 'Phones', href: '#shop/phones' },
  { label: 'Laptops', href: '#shop/laptops' },
  { label: 'Tablets', href: '#shop/tablets' },
  { label: 'Accessories', children: accessories },
  { label: 'Audio & Sound', href: '#shop/audio' },
  { label: 'Gifting', children: gifting },
];

function menuItems(items, nested = false) {
  return `<ul class="${nested ? 'menu-sublist' : 'menu-links'}">${items.map(item => {
    if (!item.children) return `<li><a class="menu-row" href="${item.href}">${escapeHTML(item.label)}</a></li>`;
    const id = uniqueId('menu-group');
    return `<li><button type="button" class="menu-row menu-toggle-row" data-menu-toggle aria-expanded="false" aria-controls="${id}">${escapeHTML(item.label)}${icon('chevron-down', 17)}</button><div id="${id}" data-menu-group hidden>${menuItems(item.children, true)}</div></li>`;
  }).join('')}</ul>`;
}

export function createNavigationFeature({ overlay }) {
  function openMenu() {
    overlay.open({ title: 'Main navigation', kind: 'menu', content: `<nav aria-label="Browse the store">${menuItems(tree)}</nav>`, onMount: root => {
      root.closest('dialog').querySelector('#overlay-title').innerHTML = '<img src="images/brand/wordmark.svg" alt="Main navigation: sixhours" width="405" height="109">';
      const animations = new Map();
      const click = event => {
        const button = event.target.closest('[data-menu-toggle]');
        if (!button) return;
        const panel = root.querySelector(`#${button.getAttribute('aria-controls')}`);
        const opening = button.getAttribute('aria-expanded') !== 'true';
        const from = panel.hidden ? 0 : panel.getBoundingClientRect().height;
        animations.get(panel)?.cancel();
        button.setAttribute('aria-expanded', String(opening));
        panel.hidden = false;
        const to = opening ? panel.scrollHeight : 0;
        const finish = () => { panel.hidden = !opening; panel.style.height = ''; panel.style.overflow = ''; animations.delete(panel); };
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
        panel.style.overflow = 'hidden';
        const animation = panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 400, easing: 'cubic-bezier(.445,.05,.55,.95)' });
        animations.set(panel, animation);
        animation.onfinish = finish;
      };
      root.addEventListener('click', click);
      return () => { root.removeEventListener('click', click); animations.forEach(animation => animation.cancel()); };
    } });
  }
  return { actions: { 'open-menu': openMenu } };
}
