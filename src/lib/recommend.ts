import type { Measurements, Prefs, Product, Gender } from './types';
import { CATALOG } from '../data/catalog';
import { bestFit, type FitResult } from './fit';

export interface Rec { product: Product; fit: FitResult; match: number; why: string[] }
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

export function recommend(m: Measurements, prefs: Prefs, gender: Gender | 'all'): Rec[] {
  return CATALOG.filter(p => gender === 'all' || p.gender === gender || p.gender === 'unisex').map(product => {
    const fit = bestFit(m, product); const why: string[] = []; let s = 0;
    if (product.occasions.includes(prefs.occasion)) { s += 34; why.push('Right for the occasion'); }
    const fd = Math.abs(product.formality - prefs.formality); s += Math.max(0, 16 - fd * 7);
    if (prefs.categories.length === 0 || prefs.categories.includes(product.category)) { s += 22; if (prefs.categories.length) why.push('Your preferred style'); } 
    if (product.price >= prefs.budget[0] && product.price <= prefs.budget[1]) { s += 18; why.push('Within budget'); }
    else s -= Math.min(18, (Math.abs(product.price - (product.price < prefs.budget[0] ? prefs.budget[0] : prefs.budget[1])) / prefs.budget[1]) * 30);
    const l = lum(product.colors[0]); const night = prefs.time === 'evening' || prefs.time === 'night';
    if ((night && l < 0.5) || (!night && l >= 0.5)) { s += 6; why.push(night ? 'Rich tone for the evening' : 'Bright tone for daytime'); }
    s += (fit.score - 60) * 0.1;
    return { product, fit, match: Math.max(0, Math.min(100, Math.round(s))), why };
  }).sort((a, b) => b.match - a.match || b.fit.score - a.fit.score);
}
