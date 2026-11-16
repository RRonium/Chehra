import { useMemo, useState } from 'react';
import type { Gender, Measurements, Prefs, Product, UnitSystem } from './lib/types';
import { DEFAULTS } from './lib/measure';
import { recommend } from './lib/recommend';
import Intake from './components/Intake';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';
import TrialRoom from './components/TrialRoom';

type Step = 'intake' | 'questions' | 'results' | 'trial';
const STEPS: { id: Step; label: string }[] = [
  { id: 'intake', label: 'Measure' }, { id: 'questions', label: 'Occasion' }, { id: 'results', label: 'Discover' }, { id: 'trial', label: 'Trial room' },
];
const DEFAULT_PREFS: Prefs = { occasion: 'wedding', time: 'evening', formality: 4, budget: [2000, 25000], categories: [] };

export default function App() {
  const [step, setStep] = useState<Step>('intake');
  const [unit, setUnit] = useState<UnitSystem>('india');
  const [m, setM] = useState<Measurements>(DEFAULTS);
  const [gender, setGender] = useState<Gender | 'all'>('all');
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [selected, setSelected] = useState<Product | null>(null);
  const recs = useMemo(() => recommend(m, prefs, gender), [m, prefs, gender]);
  const idx = STEPS.findIndex(s => s.id === step);
  const [reached, setReached] = useState(0);
  if (idx > reached) setReached(idx);
  const can = (i: number) => i <= reached && (STEPS[i].id !== 'trial' || !!selected);

  return (
    <div className="app">
      <header className="top">
        <button className="brand" onClick={() => setStep('intake')} aria-label="Chehra home">
          <span className="brand-mark">चेहरा</span><span className="brand-name">Chehra</span>
        </button>
        <nav className="stepper" aria-label="Progress">
          {STEPS.map((s, i) => (
            <button key={s.id} disabled={!can(i)} className={`stepper-item ${i === idx ? 'on' : ''} ${i < idx ? 'done' : ''}`}
              onClick={() => can(i) && setStep(s.id)}>
              <span className="dot">{i < idx ? '✓' : i + 1}</span><span className="lbl">{s.label}</span>
            </button>
          ))}
        </nav>
      </header>
      <main>
        {step === 'intake' && <Intake unit={unit} setUnit={setUnit} m={m} setM={setM} gender={gender} setGender={setGender} onNext={() => setStep('questions')} />}
        {step === 'questions' && <Questionnaire prefs={prefs} setPrefs={setPrefs} onBack={() => setStep('intake')} onNext={() => setStep('results')} />}
        {step === 'results' && <Results recs={recs} unit={unit} gender={gender} prefs={prefs} onBack={() => setStep('questions')} onTry={p => { setSelected(p); setStep('trial'); }} />}
        {step === 'trial' && selected && <TrialRoom product={selected} m={m} unit={unit} recs={recs} onBack={() => setStep('results')} onPick={setSelected} />}
      </main>
      <footer className="foot">
        <span>चेहरा · Made for India's festive, formal & everyday wardrobes.</span>
        <span>Runs entirely in your browser — your measurements and photos never leave this device.</span>
      </footer>
    </div>
  );
}
