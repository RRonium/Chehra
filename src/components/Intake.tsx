import { useState } from 'react';
import type { Gender, Measurements, Occasion, UnitSystem } from '../lib/types';
import { BODY_LABEL, RANGES, UNITS, bodyType, fmtLen, fromDisplay, toDisplay } from '../lib/measure';
import { CATALOG } from '../data/catalog';
import { BRAND_NAMES } from '../data/brands';
import PhotoScan from './PhotoScan';

const FIELDS: { key: keyof Measurements; label: string; hint: string }[] = [
  { key: 'height', label: 'Height', hint: 'Head to floor, barefoot' },
  { key: 'chest', label: 'Chest', hint: 'Around the fullest part' },
  { key: 'waist', label: 'Waist', hint: 'Natural waistline, above the navel' },
  { key: 'hip', label: 'Hip', hint: 'Around the fullest part of the hips' },
  { key: 'shoulder', label: 'Shoulder width', hint: 'Bone to bone across the back' },
];
const OCC: { id: Occasion; label: string; hi: string; icon: string }[] = [
  { id: 'wedding', label: 'Wedding', hi: 'शादी', icon: '🪔' }, { id: 'festival', label: 'Festival & Puja', hi: 'त्योहार', icon: '🌼' },
  { id: 'sangeet', label: 'Sangeet', hi: 'संगीत', icon: '🎶' }, { id: 'office', label: 'Office', hi: 'दफ़्तर', icon: '💼' },
  { id: 'casual', label: 'Casual', hi: 'रोज़मर्रा', icon: '☕' }, { id: 'date', label: 'Date night', hi: 'शाम', icon: '🌙' },
];
const HOW = [
  ['१', 'Measure', 'Enter five measurements, or let a photo estimate them on your device.'],
  ['२', 'Tell us the occasion', 'Shaadi, puja, office or date night. Five quick questions.'],
  ['३', 'Discover', 'Outfits ranked for the day, each with a fit score for your size.'],
  ['४', 'Step into the trial room', 'See the outfit on a 3D figure shaped like you.'],
];
interface P { unit: UnitSystem; setUnit: (u: UnitSystem) => void; m: Measurements; setM: (m: Measurements) => void; gender: Gender | 'all'; setGender: (g: Gender | 'all') => void; onNext: () => void; occasion: Occasion; onOccasion: (o: Occasion) => void }

export default function Intake({ unit, setUnit, m, setM, gender, setGender, onNext, occasion, onOccasion }: P) {
  const [scanOpen, setScanOpen] = useState(false);
  const [estimated, setEstimated] = useState(false);
  const set = (k: keyof Measurements, cm: number) => setM({ ...m, [k]: Math.round(cm * 10) / 10 });
  const toMeasure = () => document.getElementById('measure')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="home">
      <section className="hero-full">
        <div className="hero-photo" role="img" aria-label="A bride and groom in blush and gold wedding wear" />
        <div className="hero-inner">
          <p className="eyebrow">Fashion discovery · Sizing · Virtual trial room</p>
          <p className="hindi">हर मौक़े का अंदाज़, आपके नाप का</p>
          <h1>Dress for the moment.<br /><em>Sized for you.</em></h1>
          <p className="lede">From sherwanis to sarees, Chehra finds outfits that suit the occasion and fit your frame, then lets you see them on a 3D figure built from your own measurements.</p>
          <div className="row gap wrap">
            <button className="btn gold" onClick={toMeasure}>Begin your fitting</button>
            <button className="btn ghost light" onClick={() => { toMeasure(); setScanOpen(true); }}>📷 Scan from photo</button>
          </div>
          <dl className="stats">
            <div><dt>{CATALOG.length}</dt><dd>curated outfits</dd></div>
            <div><dt>{BRAND_NAMES.length}</dt><dd>brand size charts</dd></div>
            <div><dt>6</dt><dd>occasions</dd></div>
            <div><dt>3D</dt><dd>trial room</dd></div>
          </dl>
        </div>
      </section>

      <section className="page band">
        <div className="ornament"><span>✦</span></div>
        <h2 className="on-dark center-t">What are you dressing for?</h2>
        <div className="occ-row">
          {OCC.map(o => (
            <button key={o.id} className={`occ-tile ${occasion === o.id ? 'on' : ''}`} onClick={() => { onOccasion(o.id); toMeasure(); }}>
              <span className="ico">{o.icon}</span><b>{o.label}</b><small>{o.hi}</small>
            </button>
          ))}
        </div>
        <ol className="how">
          {HOW.map(([n, t, d]) => <li key={t}><span className="how-n">{n}</span><b>{t}</b><p>{d}</p></li>)}
        </ol>
      </section>

      <section className="page measure" id="measure">
        <div className="measure-intro">
          <p className="eyebrow">Step one</p>
          <h2 className="on-dark">Your measurements</h2>
          <p className="lede">Five numbers are all a good darzi needs. Everything stays in your browser.</p>
          <ul className="tips">
            <li>Use a soft tape, snug but not tight.</li>
            <li>Measure over light clothing, standing straight.</li>
            <li>No tape? Use the photo scan for a starting estimate.</li>
          </ul>
          <div className="body-chip dark">Body shape <b>{BODY_LABEL[bodyType(m)]}</b><small>from your ratios, used to shape the trial room figure</small></div>
        </div>
        <div className="card form framed">
          <div className="row between wrap">
            <div className="seg" role="radiogroup" aria-label="Units">
              {(Object.keys(UNITS) as UnitSystem[]).map(u => <button key={u} role="radio" aria-checked={unit === u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>{UNITS[u].label}</button>)}
            </div>
            <div className="seg" role="radiogroup" aria-label="Show me">
              {([['all', 'All styles'], ['women', 'Womenswear'], ['men', 'Menswear']] as const).map(([g, l]) => <button key={g} role="radio" aria-checked={gender === g} className={gender === g ? 'on' : ''} onClick={() => setGender(g)}>{l}</button>)}
            </div>
          </div>
          <p className="muted small">{UNITS[unit].note}</p>
          {estimated && <p className="badge-est">Estimated from your photo. Adjust anything that looks off.</p>}
          <div className="fields">
            {FIELDS.map(f => {
              const [lo, hi] = RANGES[f.key];
              const isH = f.key === 'height';
              const dv = toDisplay(m[f.key], unit);
              const step = unit === 'india' ? 1 : 0.5;
              return (
                <label key={f.key} className="field">
                  <span className="field-top"><b>{f.label}</b><span className="val">{fmtLen(m[f.key], unit, isH)}</span></span>
                  <input type="range" min={lo} max={hi} step={0.5} value={m[f.key]} onChange={e => set(f.key, +e.target.value)} />
                  <span className="field-bottom"><small className="muted">{f.hint}</small>
                    <span className="num"><input type="number" step={step} value={+dv.toFixed(1)} onChange={e => { const v = fromDisplay(+e.target.value, unit); if (v >= lo * 0.8 && v <= hi * 1.2) set(f.key, v); }} aria-label={`${f.label} in ${UNITS[unit].lenUnit}`} />{UNITS[unit].lenUnit}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <div className="row gap wrap">
            <button className="btn ghost" onClick={() => setScanOpen(true)}>📷 Scan from photo <span className="tag">optional</span></button>
            <button className="btn primary" onClick={onNext}>Continue to occasion →</button>
          </div>
        </div>
      </section>
      {scanOpen && <PhotoScan height={m.height} onClose={() => setScanOpen(false)} onApply={est => { setM({ ...m, ...est }); setEstimated(true); setScanOpen(false); }} />}
    </div>
  );
}
