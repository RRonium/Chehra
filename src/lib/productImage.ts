import type { Product } from './types';

// Fashion-plate style illustrations generated per product: a croquis figure in a jharokha arch,
// with shaded fabric, woven borders and butti motifs. No external images are fetched.
const cache = new Map<string, string>();
const SKIN = ['#E3B48F', '#D29F78', '#B98660', '#C99873'];

function mix(hex: string, to: string, t: number) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}
const mirror = (s: string) => `${s}<g transform="translate(300,0) scale(-1,1)">${s}</g>`;

export function productImage(p: Product): string {
  const hit = cache.get(p.id); if (hit) return hit;
  const [a, b] = p.colors, k = p.garment.kind, L = p.garment.length;
  const seed = p.id.charCodeAt(3) * 7 + p.id.charCodeAt(4);
  const skin = SKIN[seed % SKIN.length], hair = '#2A1A14';
  const women = p.gender === 'women';
  const hem = Math.round(208 + L * 158);
  const dark = mix(a, '#000000', 0.35);
  // cloth = base + motif + side shading; `d` is the garment outline
  const cloth = (d: string, fill = a, pat = true) => `<path d="${d}" fill="${fill}"/>${pat ? `<path d="${d}" fill="url(#bt)"/>` : ''}<path d="${d}" fill="url(#sh)"/>`;
  const border = (d: string, w = 16, col = b) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/><path d="${d}" fill="none" stroke="${mix(col, '#ffffff', 0.55)}" stroke-width="${Math.max(1.5, w / 7)}" stroke-dasharray="2 5"/>`;
  const folds = (x0: number, y0: number, spread: number, y1: number, n = 4) => Array.from({ length: n * 2 + 1 }, (_, i) => i - n).map(i => `<path d="M${x0 + i * 5} ${y0} Q${x0 + i * spread * 0.6} ${(y0 + y1) / 2} ${x0 + i * spread} ${y1}" fill="none" stroke="${dark}" stroke-opacity=".28" stroke-width="1.4"/>`).join('');
  const armSkin = mirror(`<path d="M113 104 C102 142 99 184 97 228 Q102 236 108 229 C112 190 118 152 126 116Z" fill="${skin}"/>`);
  const sleeve = (to: number, fill: string) => { const y = 104 + to * 124, x = 113 - to * 16; return mirror(`<path d="M112 100 C104 ${110 + to * 40} ${x - 2} ${y - 20} ${x} ${y} L${x + 13} ${y + 3} C${x + 16} ${y - 30} 122 130 128 112Z" fill="${fill}"/><path d="M112 100 C104 ${110 + to * 40} ${x - 2} ${y - 20} ${x} ${y} L${x + 13} ${y + 3} C${x + 16} ${y - 30} 122 130 128 112Z" fill="url(#sh)"/><path d="M${x - 1} ${y - 1} L${x + 14} ${y + 2}" stroke="${b}" stroke-width="4"/>`); };
  const legs = (top: number, fill: string) => mirror(`<path d="M148 ${top} L128 ${top} C128 ${top + 60} 132 320 136 366 L147 366 C148 320 149 ${top + 60} 149 ${top}Z" fill="${fill}"/>`) + mirror(`<ellipse cx="139" cy="371" rx="11" ry="5" fill="${mix(b, '#3A1A10', 0.5)}"/>`);
  const head = `<rect x="143" y="78" width="14" height="22" rx="5" fill="${mix(skin, '#000000', 0.1)}"/><ellipse cx="150" cy="60" rx="19" ry="23" fill="${skin}"/>` +
    (women ? `<path d="M130 62 C128 34 172 34 170 62 C166 44 134 44 130 62Z" fill="${hair}"/><circle cx="150" cy="35" r="9" fill="${hair}"/><circle cx="150" cy="47" r="2.2" fill="${b}"/>` : `<path d="M131 58 C128 32 172 32 169 58 C164 42 136 42 131 58Z" fill="${hair}"/>`);
  let g = '';
  if (k === 'lehenga') {
    const skirt = 'M126 170 Q150 165 174 170 C198 240 238 318 254 366 Q150 388 46 366 C62 318 102 240 126 170Z';
    g = armSkin + `<path d="M122 150 L178 150 L174 172 L126 172Z" fill="${skin}"/>` + cloth('M114 100 Q150 110 186 100 L180 150 Q150 157 120 150Z', b) + sleeve(0.22, b) +
      `<clipPath id="c"><path d="${skirt}"/></clipPath>` + cloth(skirt) + `<g clip-path="url(#c)">${folds(150, 172, 26, 380)}${border('M40 356 Q150 380 260 356', 26)}${border('M52 326 Q150 348 248 326', 5)}</g>` +
      `<path d="M124 170 Q150 165 176 170" stroke="${b}" stroke-width="6" fill="none"/>` +
      `<path d="M186 100 C176 128 150 150 128 168 L112 258 Q104 214 110 176 C128 150 160 126 174 100Z" fill="${mix(b, '#ffffff', 0.25)}" opacity=".78"/>`;
  } else if (k === 'saree') {
    const skirt = 'M126 170 Q150 165 174 170 C188 240 206 320 214 368 Q150 384 86 368 C94 320 112 240 126 170Z';
    const pallu = 'M122 178 C150 152 172 126 182 98 L192 102 C198 160 204 240 212 326 L192 332 C188 250 182 196 174 164 C160 180 142 194 126 204Z';
    g = armSkin + `<path d="M122 150 L178 150 L174 172 L126 172Z" fill="${skin}"/>` + cloth('M114 100 Q150 110 186 100 L180 150 Q150 157 120 150Z', b, false) + sleeve(0.2, b) +
      `<clipPath id="c"><path d="${skirt}"/></clipPath>` + cloth(skirt) + `<g clip-path="url(#c)">${folds(146, 174, 9, 380, 3)}${border('M80 360 Q150 378 220 360', 20)}</g>` +
      cloth(pallu) + `<path d="M182 98 C172 126 150 152 122 178" fill="none" stroke="${b}" stroke-width="7"/><path d="M192 332 L212 326" stroke="${b}" stroke-width="12"/>`;
  } else if (k === 'anarkali' || k === 'dress') {
    const flare = k === 'anarkali' ? 40 + L * 50 : 14 + L * 30;
    const d = `M114 100 Q150 ${women ? 114 : 104} 186 100 L176 168 C${186 + flare * 0.4} ${(168 + hem) / 2} ${180 + flare * 0.9} ${hem - 30} ${182 + flare} ${hem} Q150 ${hem + 14} ${118 - flare} ${hem} C${120 - flare * 0.9} ${hem - 30} ${114 - flare * 0.4} ${(168 + hem) / 2} 124 168Z`;
    const under = k === 'anarkali' ? legs(hem - 6, mix(b, '#ffffff', 0.2)) : mirror(`<path d="M146 ${hem - 4} L132 ${hem - 4} C132 ${hem + 40} 134 330 137 366 L146 366Z" fill="${skin}"/>`) + mirror(`<ellipse cx="140" cy="371" rx="10" ry="5" fill="${dark}"/>`);
    g = under + (k === 'anarkali' ? '' : armSkin) + `<clipPath id="c"><path d="${d}"/></clipPath>` + cloth(d, a, k === 'anarkali' || p.category === 'fusion') +
      `<g clip-path="url(#c)">${folds(150, 172, flare / 3.2 + 4, hem + 10)}${k === 'anarkali' || p.category === 'fusion' ? border(`M${100 - flare} ${hem - 8} Q150 ${hem + 6} ${200 + flare} ${hem - 8}`, 18) : ''}</g>` +
      `<path d="M124 168 Q150 173 176 168" stroke="${b}" stroke-width="${k === 'dress' ? 7 : 4}" fill="none"/>` + sleeve(k === 'anarkali' ? 0.78 : p.category === 'fusion' ? 0.5 : 0.2, a) +
      (k === 'anarkali' ? `<path d="M118 100 C124 150 150 160 150 160 C150 160 176 150 182 100 L190 102 C196 170 198 240 204 300 L190 304 C188 240 184 190 178 160 Q150 186 122 160 C116 190 112 240 110 304 L96 300 C102 240 104 170 110 102Z" fill="${mix(b, '#ffffff', 0.2)}" opacity=".85"/>` : '');
  } else { // kurta-pyjama, sherwani, suit
    const sher = k === 'sherwani', suit = k === 'suit';
    const h = suit ? Math.min(hem, 236) : hem;
    const d = `M110 100 Q150 92 190 100 L${sher ? 198 : 194} ${h} Q150 ${h + 9} ${sher ? 102 : 106} ${h} Z`;
    const lower = suit ? (parseInt(a.slice(1, 3), 16) < 90 ? a : '#2B2D35') : sher ? '#F1E6CE' : '#F6EFE0';
    g = legs(h - 8, lower) + mirror(`<path d="M99 226 Q102 240 109 230 L108 222Z" fill="${skin}"/>`) + `<clipPath id="c"><path d="${d}"/></clipPath>` + cloth(d, a, !suit) + sleeve(0.98, a) +
      `<g clip-path="url(#c)">${suit ? '' : border(`M96 ${h - 6} Q150 ${h + 4} 204 ${h - 6}`, sher ? 16 : 8)}</g>` +
      (suit ? `<path d="M136 96 L150 150 L164 96Z" fill="#F7F3EA"/><path d="M136 96 L150 150 L128 122Z M164 96 L150 150 L172 122Z" fill="${mix(a, '#000000', 0.22)}"/><circle cx="150" cy="170" r="3" fill="${b}"/><circle cx="150" cy="192" r="3" fill="${b}"/>`
        : `<path d="M150 98 L150 ${sher ? h : 176}" stroke="${b}" stroke-width="${sher ? 5 : 3}"/>${Array.from({ length: sher ? 7 : 4 }, (_, i) => `<circle cx="150" cy="${112 + i * (sher ? (h - 130) / 6 : 17)}" r="${sher ? 3.4 : 2.6}" fill="${mix(b, '#ffffff', 0.5)}" stroke="${b}"/>`).join('')}<path d="M136 96 Q150 106 164 96 L164 88 Q150 96 136 88Z" fill="${sher ? b : mix(a, '#000000', 0.15)}"/>`) +
      (sher ? `<path d="M170 96 L186 100 C192 160 194 230 198 290 L180 294 C180 230 176 160 170 96Z" fill="${mix(b, '#ffffff', 0.15)}" opacity=".9"/>` : '');
  }
  const tint = mix(b, '#FFF6E2', 0.82), tint2 = mix(b, '#F4DDB0', 0.6);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF7E6"/><stop offset="1" stop-color="#F3DDB2"/></linearGradient>
<linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint}"/><stop offset="1" stop-color="${tint2}"/></linearGradient>
<linearGradient id="sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".38" stop-color="#fff" stop-opacity=".1"/><stop offset=".62" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
<pattern id="bt" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(${seed % 2 ? 45 : 0})"><path d="M9 5 L11.5 9 L9 13 L6.5 9Z" fill="${b}" opacity=".7"/>${seed % 3 === 0 ? `<circle cx="0" cy="0" r="1.4" fill="${b}" opacity=".6"/><circle cx="18" cy="18" r="1.4" fill="${b}" opacity=".6"/>` : ''}</pattern>
</defs><rect width="300" height="400" fill="url(#bg)"/>
<path d="M38 400 L38 150 C38 70 96 40 150 18 C204 40 262 70 262 150 L262 400Z" fill="url(#ar)" stroke="#C9993A" stroke-width="2"/>
<path d="M48 400 L48 152 C48 80 100 52 150 31 C200 52 252 80 252 152 L252 400" fill="none" stroke="#C9993A" stroke-opacity=".45" stroke-dasharray="1 5" stroke-linecap="round" stroke-width="2"/>
<ellipse cx="150" cy="376" rx="92" ry="10" fill="#5A1220" opacity=".16"/>${head}${g}</svg>`;
  const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  cache.set(p.id, url); return url;
}
