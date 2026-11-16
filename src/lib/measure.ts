import type { Measurements, UnitSystem } from './types';

export const DEFAULTS: Measurements = { chest: 92, waist: 78, hip: 98, shoulder: 40, height: 168 };
export const RANGES = {
  chest: [70, 140], waist: [55, 130], hip: [75, 150], shoulder: [32, 56], height: [140, 205],
} as const;

const IN = 2.54;
export interface UnitInfo { label: string; lenUnit: 'cm' | 'in'; note: string }
export const UNITS: Record<UnitSystem, UnitInfo> = {
  india: { label: 'India', lenUnit: 'cm', note: 'Centimetres; sizes S–XXL (brand charts in cm).' },
  us: { label: 'US', lenUnit: 'in', note: 'Inches, height in ft/in; US size numbers.' },
  uk: { label: 'UK', lenUnit: 'in', note: 'Inches (height shown in ft/in); UK dress sizes.' },
};
export const toDisplay = (cm: number, u: UnitSystem) => (UNITS[u].lenUnit === 'cm' ? cm : cm / IN);
export const fromDisplay = (v: number, u: UnitSystem) => (UNITS[u].lenUnit === 'cm' ? v : v * IN);
export function fmtLen(cm: number, u: UnitSystem, isHeight = false): string {
  if (u === 'india') return `${Math.round(cm)} cm`;
  const inches = cm / IN;
  if (isHeight) { const ft = Math.floor(inches / 12); return `${ft}′ ${Math.round(inches - ft * 12)}″`; }
  return `${inches.toFixed(1)}″`;
}
export function regionalSize(letter: string, u: UnitSystem, womenswear: boolean): string {
  if (u === 'india') return letter;
  const idx = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].indexOf(letter);
  if (idx < 0) return letter;
  if (womenswear) return u === 'us' ? String(0 + idx * 2 + 2) : String(6 + idx * 2 + 2);
  return u === 'us' ? ['34', '36', '38', '40', '42', '44', '46'][idx] : ['34', '36', '38', '40', '42', '44', '46'][idx];
}

export type BodyType = 'hourglass' | 'pear' | 'rectangle' | 'athletic' | 'apple';
export function bodyType(m: Measurements): BodyType {
  const wh = m.waist / m.hip, ch = m.chest / m.hip, cw = m.chest / m.waist;
  if (wh < 0.8 && Math.abs(ch - 1) < 0.08) return 'hourglass';
  if (m.hip / m.chest > 1.08) return 'pear';
  if (m.shoulder / m.hip > 0.44 && wh < 0.9 && ch > 1.04) return 'athletic';
  if (wh > 0.95 && cw < 1.1) return 'apple';
  return 'rectangle';
}
export const BODY_LABEL: Record<BodyType, string> = {
  hourglass: 'Hourglass', pear: 'Pear', rectangle: 'Rectangle', athletic: 'Athletic', apple: 'Apple',
};
