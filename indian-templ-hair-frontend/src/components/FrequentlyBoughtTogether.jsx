import { useMemo, useState } from 'react';
import PhotoBlock from './PhotoBlock';
import Button from './Button';
import { Check } from './Field';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { cardCls } from '../lib/ui';

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
    <div className={`${cardCls} p-5 sm:p-7`}>
      <h3 className="mb-5 text-[1.4rem]">Frequently bought together</h3>
      <div className="flex flex-wrap items-center gap-2">
        {all.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className="w-[120px] sm:w-[150px]">
              <PhotoBlock tone={p.tone} ratio="4/5" rounded={8} src={resolveImageUrl(p.image)} alt={p.name} />
              <p className="mb-0.5 mt-2 line-clamp-2 text-[0.8rem] leading-[1.35] text-ink">{p.name}</p>
              <span className="font-sans text-[0.95rem] font-bold tabular-nums text-espresso">{rupee(p.price)}</span>
            </div>
            {i < all.length - 1 && <span className="px-1.5 font-display text-[1.6rem] text-walnut" aria-hidden="true">+</span>}
          </div>
        ))}
      </div>

      <div className="my-[22px] grid gap-2.5 border-y border-line py-[18px]">
        {all.map((p) => (
          <Check key={p.id} checked={checked.has(p.id)} onChange={() => toggle(p.id)}>
            {p.name}, <strong className="tabular-nums">{rupee(p.price)}</strong>
          </Check>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <span>Total for {selected.length} item{selected.length !== 1 ? 's' : ''}: <strong className="font-sans text-lg font-bold tabular-nums text-espresso">{rupee(total)}</strong></span>
        <Button size="sm" disabled={selected.length === 0} onClick={() => selected.forEach((p) => addToCart(p, 1))}>
          Add {selected.length} to cart
        </Button>
      </div>
    </div>
  );
}
