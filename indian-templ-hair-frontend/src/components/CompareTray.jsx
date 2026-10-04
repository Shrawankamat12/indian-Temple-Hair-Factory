import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useCompare } from '../context/CompareContext';
import { money } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import StarRating from './StarRating';
import Overlay from './Overlay';
import Button from './Button';
import Container from './Container';
import { closeBtn } from './QuickView';
import { cx, linkU } from '../lib/ui';

export default function CompareTray() {
  const { items, removeCompare, clearCompare, drawerOpen, setDrawerOpen } = useCompare();

  if (items.length === 0 && !drawerOpen) return null;

  const rows = [
    { label: 'Price', get: (p) => money(p.price) },
    { label: 'Hair type', get: (p) => p.hairType || '—' },
    { label: 'Texture', get: (p) => p.texture || '—' },
    { label: 'Length', get: (p) => (p.length ? `${p.length}"` : '—') },
    { label: 'Weight', get: (p) => p.weight || '—' },
    { label: 'Rating', get: (p) => `${p.rating || 0} (${p.reviews || 0})` },
    { label: 'Stock', get: (p) => (p.stock > 0 ? 'In stock' : 'Out of stock') },
  ];

  return (
    <>
      <div
        role="region" aria-label="Compare selection"
        className={cx(
          'on-dark fixed bottom-3 left-1/2 z-[55] flex max-w-[94vw] items-center gap-2.5 rounded-lg border border-gold bg-espresso py-2.5 pl-3 pr-3.5 text-cream shadow-deep transition-transform duration-[400ms] ease-soft sm:bottom-5 sm:gap-[18px]',
          items.length > 0 ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-[140%]',
        )}
      >
        <div className="flex gap-2">
          {items.map((p) => (
            <span className="relative h-[54px] w-11 rounded-sm bg-chocolate" key={p.id}>
              {p.image && <img src={resolveImageUrl(p.image)} alt={p.name} className="size-full rounded-sm object-cover" />}
              <button type="button" onClick={() => removeCompare(p.id)} aria-label={`Remove ${p.name}`} className="absolute -right-[7px] -top-[7px] inline-flex size-5 items-center justify-center rounded-full bg-gold text-espresso"><FiX size={12} /></button>
            </span>
          ))}
        </div>
        <span className="hidden whitespace-nowrap text-[0.82rem] text-cream/70 sm:inline">{items.length} of 4 selected</span>
        <div className="flex gap-2">
          <Button size="sm" disabled={items.length < 2} onClick={() => setDrawerOpen(true)}>Compare</Button>
          <Button variant="light" size="sm" onClick={clearCompare}>Clear</Button>
        </div>
      </div>

      <Overlay open={drawerOpen} onClick={() => setDrawerOpen(false)} />
      <div
        role="dialog" aria-modal="true" aria-label="Compare products" aria-hidden={!drawerOpen}
        className={cx(
          'fixed inset-x-0 bottom-0 z-[80] max-h-[90vh] overflow-auto border-t-[3px] border-gold bg-cream transition duration-[400ms] ease-soft',
          drawerOpen ? 'visible translate-y-0' : 'invisible translate-y-full',
        )}
      >
        <Container className="flex items-center justify-between py-[22px]">
          <h2 className="text-2xl">Compare products</h2>
          <button type="button" className={closeBtn} onClick={() => setDrawerOpen(false)} aria-label="Close compare"><FiX size={18} /></button>
        </Container>
        <Container className="pb-14">
          {items.length === 0 ? (
            <p className="text-muted">Add products to compare from the shop grid.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line bg-white">
              <table className="w-full min-w-[560px] border-collapse text-[0.92rem] [&_td]:border-b [&_td]:border-line [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:align-top [&_th]:border-b [&_th]:border-line [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:align-top">
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">Attribute</span></th>
                    {items.map((p) => (
                      <th scope="col" key={p.id} className="w-[22%] font-normal">
                        {p.image && <img src={resolveImageUrl(p.image)} alt="" className="mb-2.5 aspect-[4/5] w-full rounded-md object-cover" />}
                        <Link to={`/product/${p.id}`} onClick={() => setDrawerOpen(false)} className="mb-1 block font-display text-[1.05rem] text-espresso hover:text-walnut">{p.name}</Link>
                        <StarRating value={p.rating} size={12} />
                        <div><button type="button" className={cx(linkU, 'mt-2 border-0 bg-transparent')} onClick={() => removeCompare(p.id)}>Remove</button></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="w-[140px] font-semibold text-walnut">{row.label}</th>
                      {items.map((p) => <td key={p.id} className="tabular-nums">{row.get(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
