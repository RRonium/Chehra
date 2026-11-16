import { useState } from 'react';
import type { Category, Occasion, Prefs, TimeOfDay } from '../lib/types';

const OCC: { id: Occasion; label: string; sub: string; icon: string }[] = [
  { id: 'wedding', label: 'Wedding', sub: 'Shaadi, pheras, baraat', icon: '🪔' },
  { id: 'festival', label: 'Festival / Puja', sub: 'Diwali, Eid, Pongal, Durga Puja', icon: '🌼' },
  { id: 'sangeet', label: 'Sangeet / Reception', sub: 'Dance floor ready', icon: '🎶' },
  { id: 'office', label: 'Office', sub: 'Meetings & everyday work', icon: '💼' },
  { id: 'casual', label: 'Casual', sub: 'Brunch, travel, weekends', icon: '☕' },
  { id: 'date', label: 'Date night', sub: 'Dinner & evenings out', icon: '🌙' },
];
const TIME: { id: TimeOfDay; label: string; sub: string }[] = [
  { id: 'morning', label: 'Morning', sub: 'Soft light, fresh tones' }, { id: 'afternoon', label: 'Afternoon', sub: 'Bright & breathable' },
  { id: 'evening', label: 'Evening', sub: 'Golden hour glow' }, { id: 'night', label: 'Night', sub: 'Jewel tones & shimmer' },
];
const FORM = ['Relaxed', 'Smart casual', 'Dressed up', 'Formal', 'Grand'];
const BUDGETS: { label: string; range: [number, number] }[] = [
  { label: 'Under ₹2,500', range: [0, 2500] }, { label: '₹2,500 – ₹6,000', range: [2500, 6000] }, { label: '₹6,000 – ₹15,000', range: [6000, 15000] },
  { label: '₹15,000 – ₹30,000', range: [15000, 30000] }, { label: '₹30,000 +', range: [30000, 100000] }, { label: 'No limit', range: [0, 100000] },
];
const CATS: { id: Category; label: string }[] = [
  { id: 'kurta', label: 'Kurta' }, { id: 'sherwani', label: 'Sherwani' }, { id: 'lehenga', label: 'Lehenga / Langa' },
  { id: 'saree', label: 'Saree' }, { id: 'western', label: 'Western wear' }, { id: 'fusion', label: 'Fusion' },
];
const Q = ['What are we dressing for?', 'When is it happening?', 'How dressed-up should it feel?', 'What would you like to spend?', 'Any styles you lean towards?'];
const SUB = ['Pick the occasion — we\'ll tune fabrics, colours and formality around it.', 'Time of day shapes the palette: pastels by day, jewel tones by night.', 'From relaxed to full grandeur.', 'We\'ll prioritise outfits in this range.', 'Choose as many as you like, or skip to see everything.'];

interface P { prefs: Prefs; setPrefs: (p: Prefs) => void; onBack: () => void; onNext: () => void }
export default function Questionnaire({ prefs, setPrefs, onBack, onNext }: P) {
  const [i, setI] = useState(0);
  const next = () => (i < 4 ? setI(i + 1) : onNext());
  const pickAndGo = (patch: Partial<Prefs>) => { setPrefs({ ...prefs, ...patch }); setTimeout(() => setI(x => Math.min(4, x + 1)), 180); };
  return (
    <section className="page narrow">
      <div className="q-progress" aria-hidden>{Q.map((_, k) => <span key={k} className={k <= i ? 'on' : ''} />)}</div>
      <div className="card q-card" key={i}>
        <p className="eyebrow">Question {i + 1} of 5</p>
        <h2>{Q[i]}</h2>
        <p className="muted">{SUB[i]}</p>
        {i === 0 && <div className="opts grid3">{OCC.map(o => <button key={o.id} className={`opt ${prefs.occasion === o.id ? 'on' : ''}`} onClick={() => pickAndGo({ occasion: o.id })}><span className="ico">{o.icon}</span><b>{o.label}</b><small>{o.sub}</small></button>)}</div>}
        {i === 1 && <div className="opts grid4">{TIME.map(o => <button key={o.id} className={`opt ${prefs.time === o.id ? 'on' : ''}`} onClick={() => pickAndGo({ time: o.id })}><b>{o.label}</b><small>{o.sub}</small></button>)}</div>}
        {i === 2 && <div className="formality"><input type="range" min={1} max={5} step={1} value={prefs.formality} onChange={e => setPrefs({ ...prefs, formality: +e.target.value })} aria-label="Formality" /><div className="scale">{FORM.map((f, k) => <span key={f} className={prefs.formality === k + 1 ? 'on' : ''}>{f}</span>)}</div></div>}
        {i === 3 && <div className="opts grid3">{BUDGETS.map(b => <button key={b.label} className={`opt ${prefs.budget[0] === b.range[0] && prefs.budget[1] === b.range[1] ? 'on' : ''}`} onClick={() => pickAndGo({ budget: b.range })}><b>{b.label}</b></button>)}</div>}
        {i === 4 && <div className="opts grid3">{CATS.map(c => { const on = prefs.categories.includes(c.id); return <button key={c.id} aria-pressed={on} className={`opt ${on ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, categories: on ? prefs.categories.filter(x => x !== c.id) : [...prefs.categories, c.id] })}><b>{c.label}</b></button>; })}</div>}
        <div className="row between q-nav">
          <button className="btn ghost" onClick={() => (i === 0 ? onBack() : setI(i - 1))}>← Back</button>
          <button className="btn primary" onClick={next}>{i === 4 ? 'Show my outfits ✨' : 'Next →'}</button>
        </div>
      </div>
    </section>
  );
}
