import { cartTotals, productQuantity } from './cart.js';

/** Proposed demo policy. This is configuration, not a verified fulfilment operation. */
export const DELIVERY_POLICY = {
  timezone: 'Africa/Lagos', utcOffsetMinutes: 60, startHour: 9, cutoffHour: 15, hours: 6,
  cities: [
    { id: 'lagos', label: 'Lagos', fee: 3500, areas: [
      ['victoria-island', 'Victoria Island'], ['ikoyi', 'Ikoyi'], ['lekki-phase-1', 'Lekki Phase 1'], ['oniru', 'Oniru'], ['ajah', 'Ajah'], ['marina', 'Marina'], ['yaba', 'Yaba'], ['surulere', 'Surulere'], ['ikeja', 'Ikeja'], ['maryland', 'Maryland'], ['gbagada', 'Gbagada'], ['magodo', 'Magodo'],
    ].map(([id, label]) => ({ id, label })) },
    { id: 'abuja', label: 'Abuja', fee: 4500, areas: [
      ['maitama', 'Maitama'], ['wuse', 'Wuse'], ['wuse-2', 'Wuse 2'], ['garki', 'Garki'], ['asokoro', 'Asokoro'], ['jabi', 'Jabi'], ['utako', 'Utako'], ['gwarinpa', 'Gwarinpa'],
    ].map(([id, label]) => ({ id, label })) },
  ],
};
const hourLabel = hour => `${hour % 12 || 12} ${hour >= 12 ? 'pm' : 'am'}`;
export const policyLabels = Object.freeze({
  startTime: hourLabel(DELIVERY_POLICY.startHour),
  cutoffTime: hourLabel(DELIVERY_POLICY.cutoffHour),
  orderWindow: `${hourLabel(DELIVERY_POLICY.startHour)} to ${hourLabel(DELIVERY_POLICY.cutoffHour)} WAT`,
  betweenWindow: `${hourLabel(DELIVERY_POLICY.startHour)} and ${hourLabel(DELIVERY_POLICY.cutoffHour)} WAT`,
  deliveryRange: `${hourLabel(DELIVERY_POLICY.startHour)} to ${hourLabel(DELIVERY_POLICY.startHour + DELIVERY_POLICY.hours)}`,
});
export const getCity = id => DELIVERY_POLICY.cities.find(city => city.id === id);
export const getArea = (cityId, areaId) => getCity(cityId)?.areas.find(area => area.id === areaId);
export const validLocation = value => Boolean(value && getArea(value.city, value.area));
export const locationLabel = value => validLocation(value) ? `${getArea(value.city, value.area).label}, ${getCity(value.city).label}` : 'Choose your area';
export const formatWatTime = date => new Intl.DateTimeFormat('en-NG', { timeZone: DELIVERY_POLICY.timezone, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(date)).replaceAll('AM', 'am').replaceAll('PM', 'pm');

export function deliveryWindow(now = new Date()) {
  const date = new Date(now);
  if (!Number.isFinite(date.getTime())) throw new TypeError('A valid date is required.');
  const wat = new Date(date.getTime() + DELIVERY_POLICY.utcOffsetMinutes * 60000);
  const hour = wat.getUTCHours();
  const kind = hour >= DELIVERY_POLICY.startHour && hour < DELIVERY_POLICY.cutoffHour ? 'express' : 'scheduled';
  const nextDay = hour >= DELIVERY_POLICY.cutoffHour ? 1 : 0;
  const startAt = kind === 'express' ? date : new Date(Date.UTC(wat.getUTCFullYear(), wat.getUTCMonth(), wat.getUTCDate() + nextDay, DELIVERY_POLICY.startHour - DELIVERY_POLICY.utcOffsetMinutes / 60));
  const deadlineAt = new Date(startAt.getTime() + DELIVERY_POLICY.hours * 3600000);
  return {
    kind, startAt: startAt.toISOString(), deadlineAt: deadlineAt.toISOString(),
    headline: kind === 'express' ? `Within ${DELIVERY_POLICY.hours} hours, by ${formatWatTime(deadlineAt)}` : `Next window: ${nextDay ? 'tomorrow' : 'today'}, ${policyLabels.deliveryRange}`,
    detail: kind === 'express' ? `For eligible items confirmed in the ${policyLabels.orderWindow} order window.` : `The order window is daily, ${policyLabels.orderWindow}. After cutoff, the six-hour clock starts at ${policyLabels.startTime} next day.`,
  };
}

export function quoteDelivery(location, lines = [], now = new Date()) {
  if (!validLocation(location)) return { eligible: false, fee: null, kind: 'unsupported', headline: 'Let’s check your doorstep.', detail: 'Choose a supported city and area. Outside the listed areas, six-hour delivery is not available in this preview.', stockIssues: [] };
  const city = getCity(location.city);
  const stockIssues = [];
  const seen = new Set();
  for (const { product } of cartTotals(lines).items) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    const requested = productQuantity(lines, product.id);
    if (requested > product.stock[city.id]) stockIssues.push({ productId: product.id, name: product.name, available: product.stock[city.id], requested });
  }
  if (stockIssues.length) return { eligible: false, fee: city.fee, kind: 'stock', headline: 'A little change to your bag.', detail: `${stockIssues.map(issue => issue.name).join(', ')} exceeds the illustrative stock for ${city.label}. Remove the item or reduce its quantity to continue.`, stockIssues };
  return { eligible: true, fee: city.fee, ...deliveryWindow(now), stockIssues: [] };
}
