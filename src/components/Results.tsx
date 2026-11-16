import { useMemo, useState } from 'react';
import type { Category, Gender, Prefs, Product, UnitSystem } from '../lib/types';
import type { Rec } from '../lib/recommend';
import { productImage } from '../lib/productImage';
import { regionalSize } from '../lib/measure';
import { CATALOG } from '../data/catalog';

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const CAT_LABEL: Record<Category, string> = { kurta: 'Kurta', sherwani: 'Sherwani', lehenga: 'Lehenga', saree: 'Saree', western: 'Western', fusion: 'Fusion' };
const OCC_LABEL: Record<string, string> = { wedding: 'a wedding', festival: 'a festival or puja', office: 'the office', casual: 'a casual day', date: 'date night', sangeet: 'a sangeet or reception' };
export const fitClass = (s: number) => (s >= 88 ? 'great' : s >= 74 ? 'good' : s >= 60 ? 'ok' : 'low');

interface P { recs: Rec[]; unit: UnitSystem; gender: Gender | 'all'; prefs: Prefs; onBack: () => void; onTry: (p: Product) => void; saved: string[]; toggleSave: (id: string) => void }
export default function Results({ recs, unit, prefs, onBack, onTry, saved, toggleSave }: P) {
  const [cat, setCat] = useState<Category | 'all' | 'saved'>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'match' | 'fit' | 'low' | 'high'>('match');
  const [about, setAbout] = useState(false);
  const [limit, setLimit] = useState(24);
  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const l = recs.filter(r => (cat === 'all' || (cat === 'saved' ? saved.includes(r.product.id) : r.product.category === cat)) &&
      words.every(w => `${r.product.name} ${r.product.brand} ${r.product.fabric} ${r.product.source} ${r.product.category}`.toLowerCase().includes(w)));
    if (sort === 'fit') l.sort((a, b) => b.fit.score - a.fit.score);
    if (sort === 'low') l.sort((a, b) => a.product.price - b.product.price);
    if (sort === 'high') l.sort((a, b) => b.product.price - a.product.price);
    return l;
  }, [recs, cat, sort, q, saved]);
  const top = cat === 'all' && !q && sort === 'match' ? list[0] : undefined;
  return (
    <section className="page">
      <div className="row between wrap results-head">
        <div>
          <p className="eyebrow">Curated for {OCC_LABEL[prefs.occasion]} · {prefs.time}</p>
          <h2 className="on-dark">{list.length} outfits, ranked for you</h2>
        </div>
        <div className="row gap wrap">
          <input className="search" type="search" placeholder="Search colour, fabric, brand…" value={q} onChange={e => { setQ(e.target.value); setLimit(24); }} aria-label="Search outfits" />
          <button className="btn ghost sm" onClick={onBack}>← Edit answers</button>
          <select value={sort} onChange={e => setSort(e.target.value as any)} aria-label="Sort">
            <option value="match">Best match</option><option value="fit">Best fit</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
          </select>
        </div>
      </div>
      <div className="notice">
        <span><b>Curated demo dataset.</b> These {CATALOG.length} listings are illustrative, not live-scraped. </span>
        <button className="link" onClick={() => setAbout(!about)} aria-expanded={about}>About this data</button>
        {about && <p className="about">Chehra's catalog is a synthetic, hand-curated demo set: product names, brands, prices, ratings and size charts are fictional but modelled on how Indian fashion marketplaces list items. “Source” tags show the kind of store such an item would come from. Each outbound link opens that store's own search results for the same colour and style, so you land on real, similar pieces rather than a homepage. The pictures are illustrations, not store photographs. Fit confidence compares your measurements with each demo brand's size chart.</p>}
      </div>
      <div className="chips">
        {(['all', ...Object.keys(CAT_LABEL)] as (Category | 'all')[]).map(c => <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => { setCat(c); setLimit(24); }}>{c === 'all' ? 'All' : CAT_LABEL[c]}</button>)}
        <button className={`chip heart ${cat === 'saved' ? 'on' : ''}`} onClick={() => { setCat('saved'); setLimit(24); }}>♥ Saved ({saved.length})</button>
      </div>
      {top && (
        <article className="spotlight">
          <button className="spot-img" onClick={() => onTry(top.product)} aria-label={`Try ${top.product.name} in the trial room`}><img src={productImage(top.product)} alt={`Illustration of ${top.product.name}`} /></button>
          <div className="spot-body">
            <p className="eyebrow">✦ Chehra's pick for you</p>
            <h2>{top.product.name}</h2>
            <p className="meta">{top.product.brand} · {top.product.fabric} · ★ {top.product.rating.toFixed(1)}</p>
            <p className="price big"><b>{inr(top.product.price)}</b> <s>{inr(top.product.mrp)}</s></p>
            <ul className="reasons">{[...top.why, `${top.fit.label} in size ${regionalSize(top.fit.size, unit, top.product.gender === 'women')} (${top.fit.score}%)`].map(w => <li key={w}>{w}</li>)}</ul>
            <div className="row gap wrap">
              <button className="btn primary" onClick={() => onTry(top.product)}>Step into the trial room</button>
              <a className="btn ghost" href={top.product.url} target="_blank" rel="noopener noreferrer">Find on {top.product.source} ↗</a>
            </div>
          </div>
        </article>
      )}
      {list.length === 0 && <p className="empty">{cat === 'saved' ? 'Nothing saved yet. Tap the ♥ on any outfit to keep it here.' : 'No outfits match that search.'}</p>}
      <div className="grid">
        {list.slice(top ? 1 : 0, limit).map(({ product: p, fit, match, why }) => (
          <article key={p.id} className="pcard">
            <button className={`save ${saved.includes(p.id) ? 'on' : ''}`} onClick={() => toggleSave(p.id)} aria-pressed={saved.includes(p.id)} aria-label={saved.includes(p.id) ? 'Remove from saved' : 'Save outfit'}>♥</button>
            <button className="pimg" onClick={() => onTry(p)} aria-label={`Try ${p.name} in the trial room`}>
              <img src={productImage(p)} alt={`Illustration of ${p.name}`} loading="lazy" />
              <span className={`fit ${fitClass(fit.score)}`}>{fit.label} · {fit.score}%</span>
              <span className="src">{p.source}</span>
              <span className="try">Try in trial room</span>
            </button>
            <div className="pbody">
              <small className="brandname">{p.brand}</small>
              <h3>{p.name}</h3>
              <p className="meta">{p.fabric} · ★ {p.rating.toFixed(1)} · Size <b>{regionalSize(fit.size, unit, p.gender === 'women')}</b>{unit !== 'india' && <span className="muted"> ({fit.size})</span>}</p>
              <p className="price"><b>{inr(p.price)}</b> <s>{inr(p.mrp)}</s> <span className="match">{match}% match</span></p>
              {why[0] && <p className="why">{why.slice(0, 2).join(' · ')}</p>}
              <a className="out" href={p.url} target="_blank" rel="noopener noreferrer">Find this style on {p.source} ↗</a>
            </div>
          </article>
        ))}
      </div>
      {limit < list.length && <div className="center"><button className="btn ghost" onClick={() => setLimit(limit + 24)}>Show more outfits</button></div>}
    </section>
  );
}
