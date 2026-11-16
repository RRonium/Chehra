import type { Product } from './types';

// Stylised garment illustrations generated per product (no external images, fully offline).
const cache = new Map<string, string>();
export function productImage(p: Product): string {
  const hit = cache.get(p.id); if (hit) return hit;
  const [a, b] = p.colors, k = p.garment.kind, L = p.garment.length;
  const skin = '#E0B08C';
  const hem = 120 + L * 170;
  let body = '';
  const trim = (y: number, w = 120) => `<rect x="${100 - w / 2}" y="${y}" width="${w}" height="5" fill="${b}" opacity=".9"/>`;
  const dots = (y0: number, y1: number) => Array.from({ length: 14 }, (_, i) => `<circle cx="${70 + ((i * 37 + p.id.charCodeAt(3) * 7) % 60)}" cy="${y0 + ((i * 53) % (y1 - y0))}" r="2.2" fill="${b}" opacity=".75"/>`).join('');
  if (k === 'lehenga') {
    body = `<path d="M78 70 L122 70 L128 112 L72 112Z" fill="${b}"/><path d="M72 112 L128 112 L172 300 L28 300Z" fill="${a}"/>${trim(112, 56)}${trim(290, 144)}${dots(130, 280)}<path d="M126 80 Q170 130 150 230" stroke="${b}" stroke-width="10" fill="none" opacity=".8"/>`;
  } else if (k === 'saree') {
    body = `<path d="M80 72 L120 72 L124 112 L76 112Z" fill="${b}"/><path d="M76 112 L124 112 L158 300 L42 300Z" fill="${a}"/><path d="M82 72 Q140 120 118 200 L150 300 L132 300 Q108 200 120 150 Q70 120 82 72Z" fill="${b}" opacity=".85"/>${trim(288, 118)}${dots(150, 280)}`;
  } else if (k === 'sherwani' || k === 'suit') {
    const jacket = a;
    body = `<path d="M70 62 L130 62 L138 ${hem} L62 ${hem}Z" fill="${jacket}"/><path d="M100 62 L100 ${hem}" stroke="${b}" stroke-width="3"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="100" cy="${80 + i * ((hem - 90) / 6)}" r="3" fill="${b}"/>`).join('')}<rect x="64" y="${hem - 4}" width="72" height="6" fill="${b}"/><path d="M76 ${hem} L124 ${hem} L120 300 L104 300 L100 ${hem + 30} L96 300 L80 300Z" fill="${k === 'sherwani' ? '#F1E6CE' : '#1D1F25'}"/>`;
  } else if (k === 'kurta-pyjama' || k === 'kurta') {
    body = `<path d="M70 64 L130 64 L134 ${hem} L66 ${hem}Z" fill="${a}"/><path d="M92 64 L100 82 L108 64" fill="${skin}"/>${trim(hem - 6, 68)}${Array.from({ length: 4 }, (_, i) => `<circle cx="100" cy="${88 + i * 12}" r="2.5" fill="${b}"/>`).join('')}<path d="M76 ${hem} L124 ${hem} L118 300 L104 300 L100 ${hem + 30} L96 300 L82 300Z" fill="#F4EEDF"/>`;
  } else if (k === 'anarkali') {
    body = `<path d="M82 64 L118 64 L124 120 L180 ${hem} L20 ${hem} L76 120Z" fill="${a}"/>${trim(hem - 6, 140)}${dots(130, hem - 10)}<path d="M92 64 Q100 90 108 64" fill="${skin}"/><path d="M84 250 L116 250 L112 300 L88 300Z" fill="#F4EEDF" opacity="0"/>`;
  } else { // dress / jeans-top
    body = `<path d="M80 64 L120 64 L126 110 L158 ${hem} L42 ${hem} L74 110Z" fill="${a}"/><path d="M92 64 Q100 84 108 64" fill="${skin}"/><rect x="74" y="104" width="52" height="6" fill="${b}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4DC"/><stop offset="1" stop-color="#F6DDB6"/></linearGradient></defs><rect width="200" height="320" fill="url(#g)"/><circle cx="100" cy="44" r="15" fill="${skin}"/><rect x="95" y="56" width="10" height="10" fill="${skin}"/>${body}</svg>`;
  const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  cache.set(p.id, url); return url;
}
