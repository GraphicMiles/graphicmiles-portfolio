import { DELIVERY_POLICY, policyLabels, getCity, validLocation, locationLabel, quoteDelivery } from '../domain/delivery.js';
import { mountSelect } from '../ui/select.js';
import { escapeHTML, money } from '../ui/utils.js';
import { icon } from '../ui/icons.js';

export const cityOptions = () => DELIVERY_POLICY.cities.map(city => ({ value: city.id, label: city.label }));
export const areaOptions = city => [...(getCity(city)?.areas || []).map(area => ({ value: area.id, label: area.label })), { value: 'outside', label: 'Outside the listed areas' }];

export function createDeliveryFeature(context) {
  const { store, overlay, toast } = context;
  function openDelivery() {
    const returnToBag = overlay.isOpen && document.querySelector('#overlay').dataset.kind === 'cart';
    let draft = { ...(store.getState().location || { city: '', area: '' }) };
    overlay.open({ title: 'Let’s check your doorstep.', kind: 'delivery', content: `<div class="delivery-intro">${icon('pin', 27)}<p class="serif panel-intro">Good tech.<br>Closer than you think.</p><p>Find your area, your sample delivery fee, and your next six-hour window.</p></div><form class="delivery-form" novalidate><div class="field"><label for="delivery-city">Your city</label><div data-city-select></div></div><div class="field"><label for="delivery-area">Your area</label><div data-area-select></div></div><p class="field-error" data-delivery-error role="alert"></p><button class="button button-dark full-width" type="submit">Check my area ${icon('arrow-right', 18)}</button></form><div class="delivery-result" role="region" aria-label="Delivery check result" tabindex="-1" aria-live="polite" hidden></div><div class="panel-note">${icon('clock', 18)}<p>Daily order window: <strong>${policyLabels.orderWindow}.</strong><br>After cutoff, the next six-hour window starts at ${policyLabels.startTime}.</p></div><p class="fine-print demo-footnote">Preview coverage and fees only. This does not check a live courier service or arrange a delivery.</p>`, onMount: root => {
      const result = root.querySelector('.delivery-result');
      const error = root.querySelector('[data-delivery-error]');
      let areaSelect;
      function clearResult() { result.hidden = true; result.innerHTML = ''; error.textContent = ''; }
      const citySelect = mountSelect(root.querySelector('[data-city-select]'), { id: 'delivery-city', label: 'Your city', name: 'city', placeholder: 'Choose your city', value: draft.city, options: [...cityOptions(), { value: 'other', label: 'Another city' }], onChange: value => { draft.city = value; draft.area = ''; areaSelect.setOptions(areaOptions(value)); areaSelect.button.disabled = false; clearResult(); } });
      areaSelect = mountSelect(root.querySelector('[data-area-select]'), { id: 'delivery-area', label: 'Your area', name: 'area', placeholder: 'Choose your area', value: draft.area, options: areaOptions(draft.city), onChange: value => { draft.area = value; clearResult(); } });
      areaSelect.button.disabled = !draft.city;
      const submit = event => {
        event.preventDefault();
        if (!draft.city || !draft.area) { error.textContent = 'Choose your city and area to continue.'; (!draft.city ? citySelect.button : areaSelect.button).focus(); return; }
        const quote = quoteDelivery(draft, store.getState().cart);
        const supported = validLocation(draft);
        result.classList.toggle('is-unsupported', !supported || !quote.eligible);
        result.hidden = false;
        result.innerHTML = `${icon(supported && quote.eligible ? 'success' : 'alert', 23)}<div><p class="eyebrow">${supported ? escapeHTML(locationLabel(draft)) : 'A little further than our preview'}</p><h3>${escapeHTML(quote.headline)}</h3><p>${escapeHTML(quote.detail)}</p>${supported ? `<p class="delivery-fee">Sample delivery fee <strong>${money(quote.fee)}</strong></p><button type="button" class="button button-dark full-width" data-use-area>Use this area ${icon('check', 18)}</button>` : '<p class="fine-print">Try another area. No six-hour promise or checkout is available for an unsupported address.</p>'}</div>`;
        // A valid result used to appear entirely below shorter panels, looking like a dead form.
        root.scrollTop += result.getBoundingClientRect().top - root.getBoundingClientRect().top - 18;
        result.focus({ preventScroll: true });
      };
      const click = event => {
        if (event.target.closest('[data-use-area]') && validLocation(draft)) { store.setLocation(draft); if (returnToBag) context.cart.openCart(); else overlay.close(); toast(`Your area is set to ${locationLabel(draft)}.`); }
      };
      root.querySelector('form').addEventListener('submit', submit); root.addEventListener('click', click);
      return () => { citySelect.destroy(); areaSelect.destroy(); root.removeEventListener('click', click); };
    } });
  }
  return { openDelivery, actions: { 'open-delivery': openDelivery } };
}
