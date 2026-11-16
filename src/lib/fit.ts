import type { Measurements, Product, SizeRow } from './types';
import { BRANDS } from '../data/brands';

export interface FitResult { size: string; score: number; label: 'Great fit' | 'Good fit' | 'Check size chart' | 'Likely tight/loose'; notes: string[] }
const W = { chest: 0.35, waist: 0.3, hip: 0.25, shoulder: 0.1 };
// Garment ease allowance per category (cm added to body size when garment is cut).
const dev = (body: number, row: number, tol: number) => Math.abs(body - row) / tol;

export function bestFit(m: Measurements, product: Product): FitResult {
  const chart: SizeRow[] = BRANDS[product.brand].sizeChart;
  const lowerOnly = product.category === 'lehenga' || product.category === 'saree';
  let best: { row: SizeRow; d: number } | null = null;
  for (const row of chart) {
    let d = dev(m.chest, row.chest, 12) * W.chest + dev(m.waist, row.waist, 12) * W.waist +
      dev(m.hip, row.hip, 12) * W.hip + dev(m.shoulder, row.shoulder, 4) * W.shoulder;
    if (lowerOnly) d = dev(m.chest, row.chest, 14) * 0.2 + dev(m.waist, row.waist, 12) * 0.45 + dev(m.hip, row.hip, 12) * 0.35;
    if (!best || d < best.d) best = { row, d };
  }
  const { row, d } = best!;
  const score = Math.max(30, Math.round(100 - d * 55));
  const notes: string[] = [];
  const side = (n: string, b: number, r: number, tol: number) => {
    if (b - r > tol) notes.push(`${n} runs snug in ${row.size}`); else if (r - b > tol * 1.6) notes.push(`${n} will be roomy in ${row.size}`);
  };
  side('Chest', m.chest, row.chest, 3); side('Waist', m.waist, row.waist, 3); side('Hip', m.hip, row.hip, 3.5);
  const label = score >= 88 ? 'Great fit' : score >= 74 ? 'Good fit' : score >= 60 ? 'Check size chart' : 'Likely tight/loose';
  return { size: row.size, score, label, notes };
}
