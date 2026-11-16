import type { Brand, SizeRow } from '../lib/types';

// Each brand has its own (fictional) size chart — real brands differ, so the fit badge compares body vs. brand chart.
// base chest per size for a "true to size" brand; offset/step vary per brand.
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
function chart(chest0: number, step: number, waistOff: number, hipOff: number, sh0: number): SizeRow[] {
  return SIZES.map((size, i) => ({
    size, chest: chest0 + i * step, waist: chest0 + waistOff + i * step * 1.05, hip: chest0 + hipOff + i * step * 0.95,
    shoulder: sh0 + i * 1.3,
  }));
}
const mk = (chest0: number, step: number, waistOff: number, hipOff: number, sh0: number): Brand => ({ name: '', sizeChart: chart(chest0, step, waistOff, hipOff, sh0) });

export const BRANDS: Record<string, Brand> = {
  'Rangrez & Co': mk(80, 4, -14, 6, 35),
  'Zariwala': mk(82, 4.5, -12, 8, 36),
  'Kesar Atelier': mk(84, 5, -16, 8, 36.5),
  'Nawabi Threads': mk(88, 5, -8, 4, 39),
  'Mehrunnisa': mk(81, 4, -13, 9, 35.5),
  'Banarasi Bazaar': mk(83, 4.5, -14, 7, 36),
  'Maharaja Mode': mk(90, 5, -10, 4, 40),
  'Phulkari Lane': mk(79, 4, -13, 8, 35),
  'Urban Dhaga': mk(86, 4.5, -10, 5, 38),
  'Metro Loom': mk(87, 5, -9, 4, 38.5),
  'Cotton Cartel': mk(85, 4.5, -8, 4, 37.5),
  'Denim & Dusk': mk(84, 4, -12, 6, 37),
  'Studio Saanjh': mk(82, 4.5, -13, 7, 36),
  'Ishani Fusion': mk(80, 4.5, -12, 8, 35.5),
  'Raag Rivaaz': mk(86, 5, -9, 5, 38),
  'Gulabo': mk(81, 4.5, -14, 9, 35.5),
};
for (const k of Object.keys(BRANDS)) BRANDS[k].name = k;
export const BRAND_NAMES = Object.keys(BRANDS);
