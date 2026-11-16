import * as THREE from 'three';
import type { Measurements, Product } from './types';

/**
 * Stylised mannequin + garment builder. Units are metres. The torso is a lathe (surface of revolution)
 * built from the user's chest/waist/hip circumferences and squashed to an elliptical cross-section, so
 * the silhouette visibly follows the user's proportions. Garments are shells offset from the same profile.
 */
const SX = 1.2, SZ = 0.8; // ellipse: wider side-to-side than front-to-back
const TAU = Math.PI * 2;

export interface Body { H: number; R: (f: number) => number; shHalf: number; hipR: number; waistR: number; chestR: number; legX: number; thighR: number; armTop: THREE.Vector3; armDir: THREE.Vector3; armLen: number }

function profileFn(pts: [number, number][]) { // [heightFraction, radius], sorted; cubic Hermite for a smooth silhouette
  const n = pts.length, m: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)];
    m.push((c[1] - a[1]) / (c[0] - a[0]));
  }
  return (f: number) => {
    if (f <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < n; i++) if (f <= pts[i][0]) {
      const [f0, r0] = pts[i - 1], [f1, r1] = pts[i], h = f1 - f0, t = (f - f0) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * r0 + (t3 - 2 * t2 + t) * h * m[i - 1] + (-2 * t3 + 3 * t2) * r1 + (t3 - t2) * h * m[i];
    }
    return pts[n - 1][1];
  };
}
function lathe(fn: (f: number) => number, f0: number, f1: number, H: number, mat: THREE.Material, ease = 0, seg = 48, sx = SX, sz = SZ) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= seg; i++) { const f = f0 + ((f1 - f0) * i) / seg; pts.push(new THREE.Vector2(Math.max(0.001, fn(f) + ease), f * H)); }
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mat);
  mesh.scale.set(sx, 1, sz); return mesh;
}

export function bodyDims(m: Measurements): Body {
  const H = m.height / 100, chestR = m.chest / 100 / TAU, waistR = m.waist / 100 / TAU, hipR = m.hip / 100 / TAU;
  const shHalf = m.shoulder / 200, shR = Math.max(shHalf / SX, chestR * 0.9), neckR = 0.03 * (H / 1.68) + chestR * 0.12;
  const R = profileFn([
    [0.45, hipR * 0.5], [0.475, hipR * 0.9], [0.52, hipR], [0.575, (hipR + waistR) / 2], [0.63, waistR], [0.685, (waistR + chestR) / 2],
    [0.735, chestR], [0.785, shR * 0.99], [0.812, shR * 0.9], [0.835, neckR * 1.5], [0.85, neckR], [0.885, neckR * 0.95],
  ]);
  const armTop = new THREE.Vector3(shHalf - 0.012, 0.8 * H, 0);
  const armDir = new THREE.Vector3(Math.sin(0.2), -Math.cos(0.2), 0);
  return { H, R, shHalf, hipR, waistR, chestR, legX: hipR * SX * 0.5, thighR: hipR * 0.56, armTop, armDir, armLen: 0.34 * H };
}

function limb(top: THREE.Vector3, dir: THREE.Vector3, len: number, r0: number, r1: number, mat: THREE.Material, from = 0, to = 1) {
  const a = from * len, b = to * len;
  const ra = r0 + (r1 - r0) * from, rb = r0 + (r1 - r0) * to;
  const g = new THREE.CylinderGeometry(ra, rb, b - a, 24, 1, false);
  const mesh = new THREE.Mesh(g, mat);
  mesh.position.copy(top).addScaledVector(dir, (a + b) / 2);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  return mesh;
}
const legFn = (b: Body, ease = 0) => profileFn([[0.035, 0.03 + ease * 0.6], [0.16, 0.048 * (b.thighR / 0.085) * 0.5 + 0.024 + ease], [0.27, 0.047 + ease], [0.36, b.thighR * 0.86 + ease], [0.47, b.thighR + ease], [0.5, b.thighR * 0.96 + ease]]);

export function buildMannequin(m: Measurements, tone: string): { group: THREE.Group; body: Body } {
  const b = bodyDims(m), H = b.H; const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color: tone, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.6 });
  g.add(lathe(b.R, 0.45, 0.885, H, mat));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.066 * H, 40, 32), mat); head.scale.set(0.82, 1.08, 0.92); head.position.y = 0.935 * H; g.add(head);
  for (const s of [-1, 1]) {
    const leg = lathe(legFn(b), 0.035, 0.5, H, mat, 0, 32, 1, 0.95); leg.position.x = s * b.legX; g.add(leg);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 24, 16), mat); foot.scale.set(0.85, 0.55, 1.9); foot.position.set(s * b.legX, 0.024, 0.035); g.add(foot);
    const top = b.armTop.clone(); top.x *= s; const dir = b.armDir.clone(); dir.x *= s;
    const armR = 0.036 + b.chestR * 0.07;
    g.add(limb(top, dir, b.armLen, armR, armR * 0.62, mat));
    const sh = new THREE.Mesh(new THREE.SphereGeometry(armR * 1.08, 24, 16), mat); sh.position.copy(top); g.add(sh);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 14), mat); hand.scale.set(0.7, 1.5, 1); hand.position.copy(top).addScaledVector(dir, b.armLen + 0.035); g.add(hand);
  }
  return { group: g, body: b };
}

// ---------- fabrics ----------
function fabricTexture(base: string, accent: string, style: 'butti' | 'plain' | 'stripe' | 'floral', border = 0.12): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d')!;
  g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
  // weave grain
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},0.018)`; g.fillRect((i * 7919) % 1024, (i * 104729) % 1024, 2, 6); }
  g.fillStyle = accent; g.strokeStyle = accent;
  const bh = 1024 * border, top = 1024 - bh;
  if (style === 'butti' || style === 'floral') {
    const n = style === 'floral' ? 10 : 16; const step = 1024 / n;
    for (let y = 0; y * step < top - step / 2; y++) for (let x = 0; x < n; x++) {
      const cx = x * step + (y % 2 ? step / 2 : 0) + step / 2, cy = y * step + step / 2;
      if (style === 'floral') { for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(cx + Math.cos(k * 1.047) * 9, cy + Math.sin(k * 1.047) * 9, 7, 4, k * 1.047, 0, TAU); g.globalAlpha = 0.75; g.fill(); } g.globalAlpha = 1; }
      else { g.beginPath(); g.moveTo(cx, cy - 7); g.lineTo(cx + 5, cy); g.lineTo(cx, cy + 7); g.lineTo(cx - 5, cy); g.fill(); }
    }
  } else if (style === 'stripe') { g.globalAlpha = 0.18; for (let x = 0; x < 1024; x += 32) g.fillRect(x, 0, 3, top); g.globalAlpha = 1; }
  if (border > 0) {
    g.fillRect(0, top, 1024, bh); g.fillStyle = base; g.globalAlpha = 0.9;
    for (let x = 0; x < 1024; x += 64) { g.beginPath(); g.arc(x + 32, top + bh / 2, bh * 0.22, 0, TAU); g.fill(); g.fillRect(x, top + bh * 0.08, 64, bh * 0.05); g.fillRect(x, top + bh * 0.87, 64, bh * 0.05); }
    g.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
function cloth(base: string, accent: string, style: Parameters<typeof fabricTexture>[2], border = 0.12, repeat = 3, sheen = 0.8) {
  const map = fabricTexture(base, accent, style, border); map.repeat.set(repeat, 1);
  return new THREE.MeshPhysicalMaterial({ map, roughness: 0.62, sheen, sheenColor: new THREE.Color(accent), sheenRoughness: 0.4, side: THREE.DoubleSide });
}
const gold = () => new THREE.MeshStandardMaterial({ color: '#D9B25A', metalness: 0.85, roughness: 0.3 });

function ring(r: number, y: number, mat: THREE.Material, thick = 0.006, sx = SX, sz = SZ) {
  const t = new THREE.Mesh(new THREE.TorusGeometry(r, thick, 10, 80), mat); t.rotation.x = Math.PI / 2; const w = new THREE.Group(); w.add(t); w.scale.set(sx, 1, sz); w.position.y = y; return w;
}
/** Draped ribbon (pallu / dupatta / stole) following points given as [angle°, heightFraction, width m, extra offset m]. */
function drape(b: Body, path: [number, number, number, number][], mat: THREE.Material) {
  const pos = (deg: number, f: number, off: number) => { const a = (deg * Math.PI) / 180, r = b.R(Math.min(f, 0.81)) + 0.012 + off; return new THREE.Vector3(SX * r * Math.sin(a), f * b.H, SZ * r * Math.cos(a)); };
  const curve = new THREE.CatmullRomCurve3(path.map(p => pos(p[0], p[1], p[3])));
  const wcurve = new THREE.CatmullRomCurve3(path.map((p, i) => new THREE.Vector3(i, p[2], 0)));
  const N = 60, verts: number[] = [], uvs: number[] = [], idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, p = curve.getPoint(t), tan = curve.getTangent(t), w = wcurve.getPoint(t).y;
    const out = new THREE.Vector3(p.x / SX, 0, p.z / SZ).normalize();
    const side = new THREE.Vector3().crossVectors(tan, out).normalize();
    const a = p.clone().addScaledVector(side, w / 2), c = p.clone().addScaledVector(side, -w / 2);
    // keep both edges outside the body
    for (const v of [a, c]) { const f = v.y / b.H; if (f > 0.45 && f < 0.83) { const need = b.R(f) + 0.014; const rr = Math.hypot(v.x / SX, v.z / SZ); if (rr < need) { v.x *= need / rr; v.z *= need / rr; } } }
    verts.push(a.x, a.y, a.z, c.x, c.y, c.z); uvs.push(t * 2, 1, t * 2, 0);
    if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}
function sleeves(b: Body, mat: THREE.Material, to: number, ease = 0.008) {
  const g = new THREE.Group(); const armR = 0.036 + b.chestR * 0.07;
  for (const s of [-1, 1]) {
    const top = b.armTop.clone(); top.x *= s; const dir = b.armDir.clone(); dir.x *= s;
    g.add(limb(top, dir, b.armLen, armR + ease, armR * 0.62 + ease, mat, 0, to));
    const cap = new THREE.Mesh(new THREE.SphereGeometry((armR + ease) * 1.0, 24, 16), mat); cap.position.copy(top); g.add(cap);
  }
  return g;
}
function trousers(b: Body, mat: THREE.Material, ease = 0.012, hem = 0.05) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const leg = lathe(legFn(b, ease), hem, 0.5, b.H, mat, 0, 32, 1, 0.95); leg.position.x = s * b.legX; g.add(leg); }
  g.add(lathe(b.R, 0.45, 0.6, b.H, mat, ease * 0.8)); return g;
}
function buttons(b: Body, f0: number, f1: number, n: number, ease: number, mat: THREE.Material) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const f = f0 + ((f1 - f0) * i) / (n - 1); const s = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 10), mat); s.position.set(0, f * b.H, SZ * (b.R(f) + ease) + 0.002); g.add(s); }
  return g;
}

export function buildGarment(b: Body, p: Product): THREE.Group {
  const g = new THREE.Group(); const [c1, c2] = p.colors; const H = b.H; const G = gold();
  const hemF = 0.5 - p.garment.length * 0.44; // 0 → hip, 1 → ankle
  const seed = p.id.charCodeAt(4) + p.id.charCodeAt(3);
  const pattern = (['butti', 'floral', 'plain', 'butti'] as const)[seed % 4];
  const fitted = (f: number) => b.R(f);
  // straight / A-line cut: follows the torso to the chest then falls from the widest point
  const wide = Math.max(b.chestR, b.hipR * 0.99);
  const fall = (flare: number) => (f: number) => {
    if (f >= 0.735) return b.R(f);
    const t = Math.min(1, (0.735 - f) / 0.1), s = t * t * (3 - 2 * t);
    return Math.max(b.R(f), b.R(f) + (wide - b.R(f)) * s) + Math.max(0, 0.6 - f) * flare;
  };
  const isDark = (hex: string) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 90; };
  const skirt = (topF: number, hem: number, hemR: number, mat: THREE.Material, pow = 1.5) => {
    const r0 = b.R(topF) + 0.008;
    const base = (f: number) => r0 + (hemR - r0) * Math.pow((topF - f) / (topF - hem), 1 / pow);
    const hipF = 0.52, pts: [number, number][] = [[hem, hemR]];
    if (hem < hipF - 0.06) { const mid = (hem + hipF) / 2; pts.push([mid, Math.max(base(mid), b.hipR + 0.012)]); pts.push([hipF, Math.max(base(hipF), b.hipR + 0.012)]); pts.push([(hipF + topF) / 2, Math.max(base((hipF + topF) / 2), b.R((hipF + topF) / 2) + 0.01)]); }
    pts.push([topF, r0]);
    const fn = profileFn(pts);
    g.add(lathe(fn, hem, topF, H, mat, 0, 60)); g.add(ring(hemR, hem * H, G, 0.005)); g.add(ring(r0, topF * H, G, 0.005));
  };
  switch (p.garment.kind) {
    case 'lehenga': {
      const choli = cloth(c2, c1, 'butti', 0.18, 2);
      g.add(lathe(fitted, 0.68, 0.822, H, choli, 0.008)); g.add(sleeves(b, choli, 0.3));
      skirt(0.625, 0.045, Math.max(0.3 * H, b.hipR * 2.3), cloth(c1, c2, pattern === 'plain' ? 'butti' : pattern, 0.16, 6), 1.25);
      g.add(drape(b, [[-150, 0.5, 0.2, 0.03], [-120, 0.64, 0.2, 0.02], [-60, 0.7, 0.16, 0.012], [0, 0.745, 0.12, 0.012], [55, 0.8, 0.07, 0.012], [100, 0.824, 0.06, 0.012], [150, 0.74, 0.1, 0.02], [165, 0.58, 0.16, 0.03], [168, 0.4, 0.2, 0.05]], cloth(c2, c1, 'plain', 0.22, 1, 1)));
      break;
    }
    case 'saree': {
      const blouse = cloth(c2, c1, 'plain', 0, 1);
      g.add(lathe(fitted, 0.7, 0.822, H, blouse, 0.008)); g.add(sleeves(b, blouse, 0.28));
      const sari = cloth(c1, c2, pattern, 0.14, 5, 1);
      skirt(0.625, 0.03, Math.max(b.hipR * 1.45, 0.2 * H * 0.75), sari, 0.8);
      // front pleats
      for (let i = -3; i <= 3; i++) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, 0.56 * H, 8), sari); pl.position.set(i * 0.016, 0.33 * H, SZ * (b.hipR * 1.2) + 0.025); pl.rotation.x = -0.07; g.add(pl); }
      g.add(drape(b, [[-95, 0.6, 0.2, 0.012], [-45, 0.655, 0.22, 0.012], [0, 0.715, 0.2, 0.014], [40, 0.775, 0.12, 0.014], [80, 0.826, 0.065, 0.014], [125, 0.78, 0.09, 0.02], [158, 0.66, 0.17, 0.03], [166, 0.5, 0.22, 0.045], [168, 0.36, 0.24, 0.06]], cloth(c1, c2, pattern, 0.2, 1, 1)));
      break;
    }
    case 'anarkali': {
      const mat = cloth(c1, c2, pattern, 0.1, 5);
      g.add(lathe(fitted, 0.655, 0.822, H, mat, 0.008)); g.add(sleeves(b, mat, 0.72));
      skirt(0.66, hemF, b.hipR * (1.5 + p.garment.length * 0.9), mat, 1.3);
      g.add(trousers(b, cloth(c2, c1, 'plain', 0, 1, 0.3), 0.006));
      g.add(drape(b, [[150, 0.5, 0.14, 0.03], [120, 0.72, 0.1, 0.02], [80, 0.826, 0.06, 0.014], [30, 0.79, 0.07, 0.014], [0, 0.765, 0.08, 0.016], [-30, 0.79, 0.07, 0.014], [-80, 0.826, 0.06, 0.014], [-120, 0.72, 0.1, 0.02], [-150, 0.5, 0.14, 0.03]], cloth(c2, c1, 'plain', 0.2, 1, 1)));
      break;
    }
    case 'kurta-pyjama': case 'kurta': {
      const mat = cloth(c1, c2, pattern === 'floral' ? 'butti' : pattern, 0.07, 4, 0.5);
      g.add(lathe(fall(0.12), hemF, 0.835, H, mat, 0.012)); g.add(sleeves(b, mat, 0.92, 0.012));
      g.add(ring(b.R(0.835) + 0.014, 0.84 * H, G, 0.006)); g.add(buttons(b, 0.72, 0.81, 4, 0.012, G));
      g.add(trousers(b, cloth('#F4EEDF', '#D9B25A', 'plain', 0, 1, 0.2), 0.014));
      break;
    }
    case 'sherwani': {
      const mat = cloth(c1, c2, 'butti', 0.1, 4, 1);
      g.add(lathe(fall(0.16), hemF, 0.835, H, mat, 0.016)); g.add(sleeves(b, mat, 0.95, 0.014));
      const collar = lathe(() => b.R(0.855) + 0.012, 0.835, 0.868, H, mat); g.add(collar); g.add(ring(b.R(0.855) + 0.013, 0.868 * H, G, 0.004));
      g.add(buttons(b, hemF + 0.12, 0.82, 8, 0.016, G)); g.add(ring(fall(0.16)(hemF) + 0.017, hemF * H, G, 0.005));
      g.add(trousers(b, cloth('#F1E6CE', c2, 'plain', 0, 1, 0.4), 0.008));
      g.add(drape(b, [[38, 0.4, 0.1, 0.05], [40, 0.6, 0.09, 0.03], [48, 0.76, 0.08, 0.022], [85, 0.832, 0.06, 0.02], [135, 0.74, 0.08, 0.025], [150, 0.58, 0.09, 0.035], [152, 0.42, 0.1, 0.05]], cloth(c2, c1, 'plain', 0.25, 1, 1)));
      break;
    }
    case 'suit': {
      const dark = c1;
      const jacket = cloth(dark, c2, 'plain', 0, 1, 0.3);
      const jHem = Math.max(0.44, hemF + 0.08);
      g.add(lathe(fall(0.05), jHem, 0.835, H, jacket, 0.016)); g.add(sleeves(b, jacket, 0.95, 0.014));
      g.add(buttons(b, jHem + 0.06, p.category === 'fusion' ? 0.82 : 0.66, p.category === 'fusion' ? 7 : 3, 0.016, G));
      const shirt = new THREE.MeshStandardMaterial({ color: p.category === 'fusion' ? c2 : '#F5F1E8', roughness: 0.7 });
      g.add(lathe(() => b.R(0.855) + 0.008, 0.83, 0.862, H, shirt));
      g.add(trousers(b, cloth(isDark(c1) ? c1 : '#2B2D35', c2, 'plain', 0, 1, 0.2), 0.014));
      break;
    }
    default: { // dress
      const mat = cloth(c1, c2, pattern === 'butti' ? 'plain' : pattern, p.category === 'fusion' ? 0.1 : 0, 4, 0.7);
      g.add(lathe(fitted, 0.63, 0.80, H, mat, 0.008)); g.add(sleeves(b, mat, p.category === 'fusion' ? 0.5 : 0.22));
      skirt(0.635, hemF, b.hipR * (1.12 + p.garment.length * 0.5), mat, 0.9);
      g.add(ring(b.R(0.63) + 0.011, 0.632 * H, new THREE.MeshStandardMaterial({ color: c2, roughness: 0.5 }), 0.012));
    }
  }
  return g;
}
