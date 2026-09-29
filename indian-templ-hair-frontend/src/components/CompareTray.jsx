import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useCompare } from '../context/CompareContext';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import StarRating from './StarRating';

export default function CompareTray() {
  const { items, removeCompare, clearCompare, drawerOpen, setDrawerOpen } = useCompare();

  if (items.length === 0 && !drawerOpen) return null;

  const rows = [
    { label: 'Price', get: (p) => rupee(p.price) },
    { label: 'Hair type', get: (p) => p.hairType || '—' },
    { label: 'Texture', get: (p) => p.texture || '—' },
    { label: 'Length', get: (p) => (p.length ? `${p.length}"` : '—') },
    { label: 'Weight', get: (p) => p.weight || '—' },
    { label: 'Rating', get: (p) => `${p.rating || 0} (${p.reviews || 0})` },
    { label: 'Stock', get: (p) => (p.stock > 0 ? 'In stock' : 'Out of stock') },
  ];

  return (
    <>
      <div className={`ctray ${items.length > 0 ? 'open' : ''}`} role="region" aria-label="Compare selection">
        <div className="ctray-thumbs">
          {items.map((p) => (
            <span className="ctray-thumb" key={p.id}>
              {p.image && <img src={resolveImageUrl(p.image)} alt={p.name} />}
              <button type="button" onClick={() => removeCompare(p.id)} aria-label={`Remove ${p.name}`}><FiX size={12} /></button>
            </span>
          ))}
        </div>
        <span className="ctray-label">{items.length} of 4 selected</span>
        <div className="ctray-actions">
          <button type="button" className="btn btn-primary btn-sm" disabled={items.length < 2} onClick={() => setDrawerOpen(true)}>Compare</button>
          <button type="button" className="btn btn-outline-light btn-sm" onClick={clearCompare}>Clear</button>
        </div>
      </div>

      <div className={`overlay-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <div className={`cdrawer ${drawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Compare products" aria-hidden={!drawerOpen}>
        <div className="container cdrawer-head">
          <h2>Compare products</h2>
          <button type="button" className="qv-close" style={{ position: 'static' }} onClick={() => setDrawerOpen(false)} aria-label="Close compare"><FiX size={18} /></button>
        </div>
        <div className="container cdrawer-body">
          {items.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Add products to compare from the shop grid.</p>
          ) : (
            <div className="ctable-wrap">
              <table className="ctable">
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">Attribute</span></th>
                    {items.map((p) => (
                      <th scope="col" key={p.id} className="ctable-prod">
                        {p.image && <img src={resolveImageUrl(p.image)} alt="" />}
                        <Link to={`/product/${p.id}`} onClick={() => setDrawerOpen(false)}>{p.name}</Link>
                        <StarRating value={p.rating} size={12} />
                        <button type="button" className="link-u" onClick={() => removeCompare(p.id)}>Remove</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      {items.map((p) => <td key={p.id} className="price">{row.get(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
