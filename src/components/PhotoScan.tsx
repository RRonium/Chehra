import { useEffect, useRef, useState } from 'react';
import type { Measurements } from '../lib/types';
import { BONES, scanPhoto, type ScanResult } from '../lib/pose';

interface P { height: number; onClose: () => void; onApply: (e: Omit<Measurements, 'height'>) => void }
export default function PhotoScan({ height, onClose, onApply }: P) {
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [err, setErr] = useState(''); const [res, setRes] = useState<ScanResult | null>(null);
  const [draw, setDraw] = useState(0);
  const img = useRef<HTMLImageElement>(null); const cv = useRef<HTMLCanvasElement>(null);

  async function run() {
    if (!img.current) return; setState('working'); setErr('');
    try { const r = await scanPhoto(img.current, height); setRes(r); setState('done'); setDraw(0); }
    catch (e: any) { setErr(e?.message || 'Pose detection failed.'); setState('error'); }
  }
  // Animated skeleton reveal, shown for visual feedback.
  useEffect(() => {
    if (state !== 'done' || !res || !img.current || !cv.current) return;
    const c = cv.current, im = img.current; c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext('2d')!; const L = res.landmarks; const lw = Math.max(3, c.width / 180);
    g.clearRect(0, 0, c.width, c.height); g.lineWidth = lw; g.lineCap = 'round';
    const n = Math.min(BONES.length, Math.ceil(draw)); 
    BONES.slice(0, n).forEach(([a, b]) => { g.strokeStyle = '#F2A20C'; g.beginPath(); g.moveTo(L[a].x * c.width, L[a].y * c.height); g.lineTo(L[b].x * c.width, L[b].y * c.height); g.stroke(); });
    L.filter((_, i) => i < 33).forEach(p => { g.fillStyle = '#7A1F2B'; g.beginPath(); g.arc(p.x * c.width, p.y * c.height, lw * 1.2, 0, 7); g.fill(); });
    if (draw < BONES.length) { const t = setTimeout(() => setDraw(d => d + 1), 60); return () => clearTimeout(t); }
  }, [state, res, draw]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Scan from photo">
      <div className="modal-card">
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        <h2>Scan from photo</h2>
        <p className="muted">Upload a front-facing, full-body photo (head to feet, arms slightly away from the body). Your photo is analysed <b>on this device</b> by an in-browser pose model — nothing is uploaded. Your entered height ({Math.round(height)} cm) is used as the scale.</p>
        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setUrl(URL.createObjectURL(f)); setState('idle'); setRes(null); } }} />
        {url && (
          <div className="scan-stage">
            <img ref={img} src={url} alt="Your uploaded photo" onLoad={() => state === 'idle' && void 0} />
            <canvas ref={cv} />
          </div>
        )}
        {state === 'error' && <p className="err">{err}</p>}
        {state === 'done' && res && (
          <div className="est">
            <p className="badge-est">Estimate only — front-view photos can't capture depth. Adjust values after applying.</p>
            {res.warning && <p className="err small">{res.warning}</p>}
            <div className="est-grid">{(['chest', 'waist', 'hip', 'shoulder'] as const).map(k => <div key={k}><small>{k}</small><b>{res.estimate[k]} cm</b></div>)}</div>
          </div>
        )}
        <div className="row gap">
          {url && state !== 'done' && <button className="btn primary" disabled={state === 'working'} onClick={run}>{state === 'working' ? 'Detecting pose…' : 'Detect body landmarks'}</button>}
          {state === 'done' && res && <button className="btn primary" onClick={() => onApply(res.estimate)}>Use these estimates</button>}
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
