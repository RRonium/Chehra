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

interface P { recs: Rec[]; unit: UnitSystem; gender: Gender | 'all'; prefs: Prefs; onBack: () => void; onTry: (p: Product) => void }
export default function Results({ recs, unit, prefs, onBack, onTry }: P) {
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState<'match' | 'fit' | 'low' | 'high'>('match');
  const [about, setAbout] = useState(false);
  const [limit, setLimit] = useState(24);
  const list = useMemo(() => {
    const l = recs.filter(r => cat === 'all' || r.product.category === cat);
    if (sort === 'fit') l.sort((a, b) => b.fit.score - a.fit.score);
    if (sort === 'low') l.sort((a, b) => a.product.price - b.product.price);
    if (sort === 'high') l.sort((a, b) => b.product.price - a.product.price);
    return l;
  }, [recs, cat, sort]);
  return (
    <section className="page">
      <div className="row between wrap results-head">
        <div>
          <p className="eyebrow">Curated for {OCC_LABEL[prefs.occasion]} · {prefs.time}</p>
          <h2>{list.length} outfits, ranked for you</h2>
        </div>
        <div className="row gap wrap">
          <button className="btn ghost sm" onClick={onBack}>← Edit answers</button>
          <select value={sort} onChange={e => setSort(e.target.value as any)} aria-label="Sort">
            <option value="match">Best match</option><option value="fit">Best fit</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
          </select>
        </div>
      </div>
      <div className="notice">
        <span><b>Curated demo dataset.</b> These {CATALOG.length} listings are illustrative, not live-scraped. </span>
        <button className="link" onClick={() => setAbout(!about)} aria-expanded={about}>About this data</button>
        {about && <p className="about">Chehra's catalog is a synthetic, hand-curated demo set: product names, brands, prices, ratings and size charts are fictional but modelled on how Indian fashion marketplaces list items. “Source” tags show the kind of store such an item would come from; outbound links open that store's homepage, not a real listing. Illustrations are generated. Fit confidence compares your measurements with each demo brand's size chart.</p>}
      </div>
      <div className="chips">
        {(['all', ...Object.keys(CAT_LABEL)] as (Category | 'all')[]).map(c => <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => { setCat(c); setLimit(24); }}>{c === 'all' ? 'All' : CAT_LABEL[c]}</button>)}
      </div>
      <div className="grid">
        {list.slice(0, limit).map(({ product: p, fit, match, why }) => (
          <article key={p.id} className="pcard">
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
              <a className="out" href={p.url} target="_blank" rel="noopener noreferrer">Visit {p.source} ↗ <span className="muted">(demo link)</span></a>
            </div>
          </article>
        ))}
      </div>
      {limit < list.length && <div className="center"><button className="btn ghost" onClick={() => setLimit(limit + 24)}>Show more outfits</button></div>}
    </section>
  );
}
