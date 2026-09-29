import { useMemo, useState } from 'react';
import PhotoBlock from './PhotoBlock';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { useStore } from '../context/StoreContext';

export default function FrequentlyBoughtTogether({ product, pool }) {
  const { addToCart } = useStore();

  const companions = useMemo(
    () => (pool || []).filter((p) => p.id !== product.id).slice(0, 2),
    [pool, product.id]
  );

  const all = [product, ...companions];
  const [checked, setChecked] = useState(() => new Set(all.map((p) => p.id)));

  if (companions.length === 0) return null;

  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const selected = all.filter((p) => checked.has(p.id));
  const total = selected.reduce((n, p) => n + p.price, 0);

  return (
    <div className="card card-pad fbt">
      <h3 className="fbt-title">Frequently bought together</h3>
      <div className="fbt-row">
        {all.map((p, i) => (
          <div key={p.id} className="fbt-cell">
            <div className="fbt-card">
              <PhotoBlock tone={p.tone} ratio="4/5" src={resolveImageUrl(p.image)} alt={p.name} />
              <p>{p.name}</p>
              <span className="price-now">{rupee(p.price)}</span>
            </div>
            {i < all.length - 1 && <span className="fbt-plus" aria-hidden="true">+</span>}
          </div>
        ))}
      </div>

      <div className="fbt-checklist">
        {all.map((p) => (
          <label key={p.id} className="check">
            <input type="checkbox" checked={checked.has(p.id)} onChange={() => toggle(p.id)} />
            <span>{p.name}, <strong className="price">{rupee(p.price)}</strong></span>
          </label>
        ))}
      </div>

      <div className="fbt-total">
        <span>Total for {selected.length} item{selected.length !== 1 ? 's' : ''}: <strong className="price-now">{rupee(total)}</strong></span>
        <button type="button" className="btn btn-primary btn-sm" disabled={selected.length === 0} onClick={() => selected.forEach((p) => addToCart(p, 1))}>
          Add {selected.length} to cart
        </button>
      </div>
    </div>
  );
}
