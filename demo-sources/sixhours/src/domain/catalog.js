import { products, categories } from '../data/catalog.js';
export { products, categories };

export const getProduct = id => products.find(product => product.id === id);
export const getVariant = (product, id) => product?.variants.find(variant => variant.id === id);
export const minPrice = product => Math.min(...product.variants.map(variant => variant.price));

export function findProducts({ category = 'all', query = '', sort = 'featured', maxPrice = Infinity } = {}) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = products.filter(product => (category === 'all' || product.category === category)
    && minPrice(product) <= maxPrice
    && words.every(word => `${product.name} ${product.cardName || ''} ${product.brand} ${product.category} ${product.subtitle} ${product.finish} ${product.description} ${(product.keywords || []).join(' ')}`.toLocaleLowerCase().includes(word)));
  const comparators = {
    featured: (a, b) => a.featured - b.featured,
    'price-asc': (a, b) => minPrice(a) - minPrice(b),
    'price-desc': (a, b) => minPrice(b) - minPrice(a),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return matches.sort(comparators[sort] || comparators.featured);
}
