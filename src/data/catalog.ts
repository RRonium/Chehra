import type { Category, Gender, GarmentSpec, Occasion, Product } from '../lib/types';
import { BRAND_NAMES } from './brands';

// Deterministic PRNG so the curated demo dataset is identical on every load.
function rng(seed: number) { return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296); }
const rand = rng(20261116);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
const between = (lo: number, hi: number, step = 50) => Math.round((lo + rand() * (hi - lo)) / step) * step;

const SOURCES: Product['source'][] = ['Myntra', 'Amazon Fashion', 'Ajio', 'Nykaa Fashion', 'Tata CLiQ'];
const SRC_URL: Record<Product['source'], string> = {
  Myntra: 'https://www.myntra.com/', 'Amazon Fashion': 'https://www.amazon.in/fashion', Ajio: 'https://www.ajio.com/',
  'Nykaa Fashion': 'https://www.nykaafashion.com/', 'Tata CLiQ': 'https://www.tatacliq.com/',
};
// [name, hex]
const COLORS: [string, string, string][] = [
  ['Marigold', '#F2A20C', '#7A1F2B'], ['Maroon', '#7A1F2B', '#D4A64A'], ['Emerald', '#0F6B4F', '#E8C872'], ['Ivory', '#F6EEDD', '#B8862F'],
  ['Royal Blue', '#1F3C88', '#D4A64A'], ['Blush Pink', '#E9A9B5', '#8E2F4A'], ['Mustard', '#C99A18', '#4A2A12'], ['Teal', '#0E6E73', '#F0D58A'],
  ['Wine', '#5A1A33', '#E2B65B'], ['Saffron', '#EE7B12', '#FFF0C9'], ['Peacock Blue', '#0F5E7D', '#E0B64A'], ['Rani Pink', '#D1286B', '#F4D58D'],
  ['Midnight Navy', '#14213D', '#D4A64A'], ['Sage', '#8FA583', '#5A3A1F'], ['Charcoal', '#33363B', '#C8A24A'], ['Off-white', '#EFE9DC', '#6E7F59'],
  ['Burgundy', '#6B1B2C', '#E7C26A'], ['Turquoise', '#1AA6A0', '#7A1F2B'], ['Onyx Black', '#17171A', '#D4A64A'], ['Sky', '#8FB8DE', '#1F3C88'],
];
const FABRICS = {
  kurta: ['Cotton', 'Chanderi', 'Linen blend', 'Rayon', 'Silk blend', 'Khadi'],
  sherwani: ['Raw silk', 'Jacquard', 'Velvet', 'Brocade'],
  lehenga: ['Georgette', 'Net with zari', 'Raw silk', 'Velvet', 'Organza'],
  saree: ['Banarasi silk', 'Kanjivaram silk', 'Chiffon', 'Georgette', 'Organza', 'Cotton Chanderi', 'Tussar'],
  western: ['Cotton', 'Crepe', 'Denim', 'Poly-viscose', 'Linen'],
  fusion: ['Cotton silk', 'Crepe', 'Organza', 'Linen blend'],
};
interface Tpl { names: string[]; kind: GarmentSpec['kind']; gender: Gender; price: [number, number]; occ: Occasion[]; formality: [number, number]; length: [number, number] }
type Tpls = Record<Category, Tpl[]>;
const T: Tpls = {
  kurta: [
    { names: ['Straight Cotton Kurta Set', 'Chikankari Kurta & Palazzo', 'Printed Kurta with Dupatta', 'Block-Print Anarkali Kurta'], kind: 'anarkali', gender: 'women', price: [1299, 5999], occ: ['festival', 'office', 'casual', 'wedding'], formality: [2, 4], length: [0.6, 0.9] },
    { names: ['Kurta Pyjama Set', 'Pintucked Linen Kurta', 'Nehru Jacket Kurta Set', 'Silk Blend Festive Kurta'], kind: 'kurta-pyjama', gender: 'men', price: [1499, 7999], occ: ['festival', 'wedding', 'sangeet', 'casual', 'office'], formality: [2, 4], length: [0.45, 0.6] },
  ],
  sherwani: [
    { names: ['Embroidered Sherwani', 'Jacquard Bandhgala Sherwani', 'Velvet Indo-Western Sherwani', 'Achkan Sherwani Set'], kind: 'sherwani', gender: 'men', price: [9999, 39999], occ: ['wedding', 'sangeet'], formality: [4, 5], length: [0.55, 0.75] },
  ],
  lehenga: [
    { names: ['Bridal Zardozi Lehenga', 'Mirror-Work Lehenga Choli', 'Pastel Organza Lehenga', 'Banarasi Brocade Langa Voni', 'Half-Saree Langa Set'], kind: 'lehenga', gender: 'women', price: [6999, 59999], occ: ['wedding', 'sangeet', 'festival'], formality: [3, 5], length: [0.9, 1] },
  ],
  saree: [
    { names: ['Banarasi Silk Saree', 'Kanjivaram Zari Saree', 'Organza Floral Saree', 'Ready-to-Wear Pleated Saree', 'Chiffon Party Saree', 'Linen Office Saree'], kind: 'saree', gender: 'women', price: [1999, 34999], occ: ['wedding', 'festival', 'office', 'sangeet', 'date'], formality: [2, 5], length: [0.95, 1] },
  ],
  western: [
    { names: ['Satin Slip Dress', 'Tailored Blazer Set', 'Wrap Midi Dress', 'Cotton Shirt & Trousers', 'Co-ord Set', 'Cocktail Bodycon Dress'], kind: 'dress', gender: 'women', price: [1499, 7999], occ: ['office', 'casual', 'date'], formality: [1, 4], length: [0.4, 0.8] },
    { names: ['Slim-Fit Formal Shirt & Trousers', 'Three-Piece Suit', 'Linen Casual Shirt & Chinos', 'Bomber & Denim Set'], kind: 'suit', gender: 'men', price: [1999, 14999], occ: ['office', 'casual', 'date', 'wedding'], formality: [1, 5], length: [0.7, 0.9] },
  ],
  fusion: [
    { names: ['Dhoti Skirt & Crop Top', 'Cape Lehenga Set', 'Kurta Dress with Belt', 'Saree Gown', 'Indo-Western Jacket Set'], kind: 'dress', gender: 'women', price: [2499, 18999], occ: ['sangeet', 'date', 'festival', 'wedding'], formality: [2, 4], length: [0.6, 1] },
    { names: ['Kurta with Denim', 'Bandhgala Blazer Set', 'Asymmetric Kurta Jacket'], kind: 'suit', gender: 'men', price: [2999, 15999], occ: ['sangeet', 'date', 'festival', 'office'], formality: [2, 4], length: [0.5, 0.7] },
  ],
};
const COUNTS: Record<Category, number> = { kurta: 34, sherwani: 16, lehenga: 28, saree: 34, western: 32, fusion: 26 };
const TAGS: Record<Category, string[]> = {
  kurta: ['everyday ethnic', 'chikankari', 'festive'], sherwani: ['groom', 'zardozi', 'regal'], lehenga: ['bridal', 'zari', 'statement'],
  saree: ['drape', 'heritage weave', 'handloom'], western: ['workwear', 'tailored', 'date-ready'], fusion: ['indo-western', 'modern ethnic', 'party'],
};

export const CATALOG: Product[] = [];
let n = 1;
(Object.keys(COUNTS) as Category[]).forEach(cat => {
  for (let i = 0; i < COUNTS[cat]; i++) {
    const t = T[cat][i % T[cat].length];
    const [cn, c1, c2] = pick(COLORS);
    const name = pick(t.names);
    const price = between(t.price[0], t.price[1], t.price[1] > 10000 ? 500 : 50) - 1;
    const discount = 1 + (0.1 + rand() * 0.4);
    const source = pick(SOURCES);
    const brand = pick(BRAND_NAMES.filter(b => cat === 'sherwani' ? ['Nawabi Threads', 'Maharaja Mode', 'Raag Rivaaz', 'Kesar Atelier'].includes(b) : true));
    const id = `CH${String(n++).padStart(3, '0')}`;
    const occasions = [...new Set([...t.occ.filter(() => rand() > 0.25), t.occ[0]])];
    CATALOG.push({
      id, name: `${cn} ${name}`, brand, category: cat, gender: t.gender, price: Math.max(price, 799), mrp: Math.round((price * discount) / 100) * 100 - 1,
      source, url: `${SRC_URL[source]}?demo=${id}`, colors: [c1, c2], accent: c2, fabric: pick(FABRICS[cat]), occasions,
      formality: Math.round(t.formality[0] + rand() * (t.formality[1] - t.formality[0])),
      garment: { kind: t.kind, length: t.length[0] + rand() * (t.length[1] - t.length[0]) },
      rating: Math.round((3.8 + rand() * 1.1) * 10) / 10, tags: [pick(TAGS[cat]), cn.toLowerCase(), pick(FABRICS[cat]).toLowerCase()],
    });
  }
});
