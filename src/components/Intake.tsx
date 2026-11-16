import { useState } from 'react';
import type { Gender, Measurements, UnitSystem } from '../lib/types';
import { BODY_LABEL, RANGES, UNITS, bodyType, fmtLen, fromDisplay, toDisplay } from '../lib/measure';
import PhotoScan from './PhotoScan';

const FIELDS: { key: keyof Measurements; label: string; hint: string }[] = [
  { key: 'height', label: 'Height', hint: 'Head to floor, barefoot' },
  { key: 'chest', label: 'Chest', hint: 'Around the fullest part' },
  { key: 'waist', label: 'Waist', hint: 'Natural waistline, above the navel' },
  { key: 'hip', label: 'Hip', hint: 'Around the fullest part of the hips' },
  { key: 'shoulder', label: 'Shoulder width', hint: 'Bone to bone across the back' },
];
interface P { unit: UnitSystem; setUnit: (u: UnitSystem) => void; m: Measurements; setM: (m: Measurements) => void; gender: Gender | 'all'; setGender: (g: Gender | 'all') => void; onNext: () => void }

export default function Intake({ unit, setUnit, m, setM, gender, setGender, onNext }: P) {
  const [scanOpen, setScanOpen] = useState(false);
  const [estimated, setEstimated] = useState(false);
  const set = (k: keyof Measurements, cm: number) => { setM({ ...m, [k]: Math.round(cm * 10) / 10 }); };
  return (
    <section className="page intake">
      <div className="hero">
        <p className="eyebrow">Fashion discovery · Sizing · Virtual trial room</p>
        <h1>Dress for the moment.<br /><em>Sized for you.</em></h1>
        <p className="lede">Tell us your measurements, share the occasion, and Chehra finds outfits — from sherwanis to sarees — that suit the day and fit your frame.</p>
      </div>
      <div className="card form">
        <div className="row between wrap">
          <div className="seg" role="radiogroup" aria-label="Units">
            {(Object.keys(UNITS) as UnitSystem[]).map(u => <button key={u} role="radio" aria-checked={unit === u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>{UNITS[u].label}</button>)}
          </div>
          <div className="seg" role="radiogroup" aria-label="Show me">
            {([['all', 'All styles'], ['women', 'Womenswear'], ['men', 'Menswear']] as const).map(([g, l]) => <button key={g} role="radio" aria-checked={gender === g} className={gender === g ? 'on' : ''} onClick={() => setGender(g)}>{l}</button>)}
          </div>
        </div>
        <p className="muted small">{UNITS[unit].note}</p>
        {estimated && <p className="badge-est">Estimated from your photo — adjust anything that looks off.</p>}
        <div className="fields">
          {FIELDS.map(f => {
            const [lo, hi] = RANGES[f.key];
            const isH = f.key === 'height'; const showFt = isH && unit !== 'india';
            const dv = toDisplay(m[f.key], unit);
            const step = unit === 'india' ? 1 : 0.5;
            return (
              <label key={f.key} className="field">
                <span className="field-top"><b>{f.label}</b><span className="val">{fmtLen(m[f.key], unit, isH)}</span></span>
                <input type="range" min={lo} max={hi} step={0.5} value={m[f.key]} onChange={e => set(f.key, +e.target.value)} />
                <span className="field-bottom"><small className="muted">{f.hint}</small>
                  <span className="num"><input type="number" step={step} value={+dv.toFixed(1)} onChange={e => { const v = fromDisplay(+e.target.value, unit); if (v >= lo * 0.8 && v <= hi * 1.2) set(f.key, v); }} aria-label={`${f.label} in ${UNITS[unit].lenUnit}`} />{UNITS[unit].lenUnit}</span>
                </span>
                {showFt && <small className="muted">{fmtLen(m.height, unit, true)}</small>}
              </label>
            );
          })}
        </div>
        <div className="body-chip">Body shape: <b>{BODY_LABEL[bodyType(m)]}</b> <span className="muted small">(from your ratios — used for the trial-room figure)</span></div>
        <div className="row gap wrap">
          <button className="btn ghost" onClick={() => setScanOpen(true)}>📷 Scan from photo <span className="tag">optional</span></button>
          <button className="btn primary" onClick={onNext}>Continue to occasion →</button>
        </div>
      </div>
      {scanOpen && <PhotoScan height={m.height} onClose={() => setScanOpen(false)} onApply={est => { setM({ ...m, ...est }); setEstimated(true); setScanOpen(false); }} />}
    </section>
  );
}
