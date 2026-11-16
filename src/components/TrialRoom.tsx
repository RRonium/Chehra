import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Measurements, Product, UnitSystem } from '../lib/types';
import type { Rec } from '../lib/recommend';
import { buildGarment, buildMannequin } from '../lib/avatar';
import { bestFit } from '../lib/fit';
import { BRANDS } from '../data/brands';
import { BODY_LABEL, bodyType, fmtLen, regionalSize } from '../lib/measure';
import { productImage } from '../lib/productImage';
import { fitClass, inr } from './Results';

const TONES = ['#EAD9C4', '#D9B38C', '#B98660', '#8A5A3C', '#5C3A26'];
const SCENES = [['studio', 'Studio'], ['mandap', 'Mandap'], ['haveli', 'Haveli night']] as const;
const LOOK: Record<string, string[]> = {
  lehenga: ['Kundan choker with matching maang tikka', 'Embellished juttis or block heels', 'A potli bag in the border colour'],
  saree: ['Temple-gold jhumkas and a slim waist chain', 'Kolhapuri heels', 'Fresh gajra in a low bun'],
  kurta: ['Oxidised silver jhumkas or a simple watch', 'Kolhapuri chappals or mojaris', 'A contrast dupatta or Nehru jacket'],
  sherwani: ['Safa or pagdi with a kalgi brooch', 'Embroidered mojaris', 'A pearl mala and a pocket square'],
  western: ['A slim belt and minimal studs', 'Loafers or strappy heels', 'A structured tote or leather strap watch'],
  fusion: ['Statement chandbalis', 'Metallic flats or brogues', 'A slim embroidered belt'],
};
interface P { product: Product; m: Measurements; unit: UnitSystem; recs: Rec[]; onBack: () => void; onPick: (p: Product) => void; saved: string[]; toggleSave: (id: string) => void }

function dispose(o: THREE.Object3D) {
  o.traverse((x: any) => { x.geometry?.dispose?.(); const ms = Array.isArray(x.material) ? x.material : x.material ? [x.material] : []; ms.forEach((mt: any) => { mt.map?.dispose?.(); mt.dispose?.(); }); });
}

export default function TrialRoom({ product, m, unit, recs, onBack, onPick, saved, toggleSave }: P) {
  const [scene, setScene] = useState<string>('studio');
  const isSaved = saved.includes(product.id);
  const mount = useRef<HTMLDivElement>(null);
  const three = useRef<{ scene: THREE.Scene; figure: THREE.Group; camera: THREE.PerspectiveCamera; controls: OrbitControls } | null>(null);
  const [tone, setTone] = useState(TONES[1]);
  const [dressed, setDressed] = useState(true);
  const [failed, setFailed] = useState(false);
  const fit = useMemo(() => bestFit(m, product), [m, product]);
  const chart = BRANDS[product.brand].sizeChart;

  useEffect(() => {
    const el = mount.current!; let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    scene.add(new THREE.HemisphereLight(0xfff1dc, 0x6b2a2a, 0.7));
    const key = new THREE.DirectionalLight(0xfff0d8, 2.0); key.position.set(2.5, 4, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0xf2a20c, 1.2); rim.position.set(-3, 3, -4); scene.add(rim);
    // pedestal
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.05, 80), new THREE.MeshStandardMaterial({ color: '#6B1B2C', roughness: 0.5 })); ped.position.y = -0.025; scene.add(ped);
    const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.008, 12, 100), new THREE.MeshStandardMaterial({ color: '#D9B25A', metalness: 0.9, roughness: 0.25 })); rimRing.rotation.x = Math.PI / 2; scene.add(rimRing);
    const figure = new THREE.Group(); scene.add(figure);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableDamping = true; controls.minPolarAngle = 0.9; controls.maxPolarAngle = 1.75; controls.autoRotate = true; controls.autoRotateSpeed = 1.2;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    let raf = 0; const loop = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); }; loop();
    three.current = { scene, figure, camera, controls };
    (window as any).__chehraScene = three.current;
    return () => { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); dispose(scene); pmrem.dispose(); renderer.dispose(); el.removeChild(renderer.domElement); three.current = null; };
  }, []);

  useEffect(() => {
    const t = three.current; if (!t) return;
    [...t.figure.children].forEach(c => { t.figure.remove(c); dispose(c); });
    const { group, body } = buildMannequin(m, tone); t.figure.add(group);
    if (dressed) t.figure.add(buildGarment(body, product));
    const H = body.H, dist = (H * 1.22) / (2 * Math.tan((15 * Math.PI) / 180));
    t.controls.target.set(0, H * 0.5, 0); t.controls.minDistance = dist * 0.55; t.controls.maxDistance = dist * 1.5;
    const dir = t.camera.position.clone().sub(t.controls.target); if (dir.lengthSq() < 0.01) dir.set(0.5, 0.12, 1);
    t.camera.position.copy(t.controls.target).addScaledVector(dir.normalize(), dist); t.controls.update();
  }, [m, product, tone, dressed, failed]);

  const saveLook = () => {
    const cv = mount.current?.querySelector('canvas'); if (!cv) return;
    const out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height; const g = out.getContext('2d')!;
    const grad = g.createRadialGradient(out.width / 2, out.height * 0.3, 0, out.width / 2, out.height * 0.3, out.height);
    const stops = scene === 'haveli' ? ['#3A2350', '#1B0F2A', '#0B0612'] : scene === 'mandap' ? ['#FFE6B0', '#F2A65A', '#B3261E'] : ['#FFF6E0', '#F7DFB4', '#E9BE7E'];
    stops.forEach((c, i) => grad.addColorStop(i / 2, c)); g.fillStyle = grad; g.fillRect(0, 0, out.width, out.height); g.drawImage(cv, 0, 0);
    g.fillStyle = scene === 'haveli' ? '#F6E3B4' : '#5A1220'; g.font = `600 ${Math.round(out.width / 34)}px Georgia, serif`;
    g.fillText(`Chehra · ${product.name} · stylized fit preview`, out.width * 0.035, out.height - out.width * 0.03);
    const a = document.createElement('a'); a.download = `chehra-${product.id}.png`; a.href = out.toDataURL('image/png'); a.click();
  };
  const others = recs.filter(r => r.product.id !== product.id).slice(0, 10);
  return (
    <section className="page trial">
      <div className="stage-wrap">
        <div className="stage-frame">
        <div className={`stage scene-${scene}`} ref={mount} aria-label="3D fit preview. Drag to rotate.">
          {failed && <p className="err pad">3D preview needs WebGL, which isn't available in this browser.</p>}
        </div>
        <div className="stage-top"><span className="pill">Stylized fit preview</span><span className="hint">Drag to rotate · pinch or scroll to zoom</span></div>
        <div className="stage-bottom">
          <div className="tones" role="radiogroup" aria-label="Mannequin tone">{TONES.map(t => <button key={t} role="radio" aria-checked={tone === t} className={tone === t ? 'on' : ''} style={{ background: t }} onClick={() => setTone(t)} aria-label={`Tone ${t}`} />)}</div>
          <div className="row gap">
            <div className="seg mini" role="radiogroup" aria-label="Backdrop">{SCENES.map(([id, l]) => <button key={id} role="radio" aria-checked={scene === id} className={scene === id ? 'on' : ''} onClick={() => setScene(id)}>{l}</button>)}</div>
            <button className="btn ghost sm" onClick={() => setDressed(!dressed)}>{dressed ? 'Figure only' : 'Dress figure'}</button>
            <button className="btn ghost sm" onClick={saveLook}>⤓ Save look</button>
          </div>
        </div>
        </div>
        <p className="disclaimer">A stylized mannequin shaped from your measurement ratios — not a photoreal try-on of you or your photo. Drape, colour and fit are indicative.</p>
      </div>
      <aside className="panel">
        <button className="link" onClick={onBack}>← Back to outfits</button>
        <small className="brandname">{product.brand} · via {product.source}</small>
        <h2>{product.name}</h2>
        <p className="price big"><b>{inr(product.price)}</b> <s>{inr(product.mrp)}</s></p>
        <p className="meta">{product.fabric} · ★ {product.rating.toFixed(1)}</p>
        <div className={`fitbox ${fitClass(fit.score)}`}>
          <div className="fit-score"><b>{fit.score}%</b><small>fit confidence</small></div>
          <div><b>{fit.label} — size {regionalSize(fit.size, unit, product.gender === 'women')}{unit !== 'india' ? ` (${fit.size})` : ''}</b>
            <p>{fit.notes.length ? fit.notes.join('. ') + '.' : `Your measurements sit comfortably inside ${product.brand}'s ${fit.size}.`}</p></div>
        </div>
        <div className="you">
          <span>Your shape: <b>{BODY_LABEL[bodyType(m)]}</b></span>
          <span>{fmtLen(m.chest, unit)} chest · {fmtLen(m.waist, unit)} waist · {fmtLen(m.hip, unit)} hip · {fmtLen(m.height, unit, true)}</span>
        </div>
        <details>
          <summary>{product.brand} size chart <span className="muted">(demo)</span></summary>
          <table><thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th><th>Shoulder</th></tr></thead>
            <tbody>{chart.map(r => <tr key={r.size} className={r.size === fit.size ? 'on' : ''}><td>{r.size}</td><td>{fmtLen(r.chest, unit)}</td><td>{fmtLen(r.waist, unit)}</td><td>{fmtLen(r.hip, unit)}</td><td>{fmtLen(r.shoulder, unit)}</td></tr>)}</tbody></table>
        </details>
        <div className="row gap cta">
          <a className="btn primary grow" href={product.url} target="_blank" rel="noopener noreferrer">Find this style on {product.source} ↗</a>
          <button className={`btn ghost ${isSaved ? 'saved' : ''}`} onClick={() => toggleSave(product.id)} aria-pressed={isSaved}>{isSaved ? '♥ Saved' : '♡ Save'}</button>
        </div>
        <p className="muted small">Opens {product.source}'s search results for this colour and style. This demo listing itself is not a real product page.</p>
        <h4>Complete the look</h4>
        <ul className="look">{LOOK[product.category].map(t => <li key={t}>{t}</li>)}</ul>
        <h4>Try another</h4>
        <div className="strip">{others.map(r => <button key={r.product.id} onClick={() => onPick(r.product)} title={r.product.name}><img src={productImage(r.product)} alt={r.product.name} /></button>)}</div>
      </aside>
    </section>
  );
}
