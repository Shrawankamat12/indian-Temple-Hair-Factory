import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { productsApi } from '../lib/resources';
import { normalizeProduct } from '../lib/normalize';
import { resolveImageUrl } from '../lib/api';
import { rupee } from '../lib/format';

/**
 * Wide rounded search field in the header. Submitting navigates to /search?q=… (unchanged).
 * While typing, up to 5 live suggestions are fetched from the existing products endpoint;
 * failures are silent and never block submit.
 */
export default function NavSearch({ className = '' }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setItems([]); setBusy(false); return undefined; }
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const res = await productsApi.list({ search: term, limit: 5 });
        if (!cancelled) setItems((res?.data || []).map(normalizeProduct));
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false); };
    const onKey = (e) => { if (e.key === 'Escape') setFocused(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  function submit(e) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setQ(''); setItems([]); setFocused(false);
  }

  function pick() { setQ(''); setItems([]); setFocused(false); }

  const showPanel = focused && q.trim().length >= 2;

  return (
    <div className={`nsearch ${className}`} ref={wrapRef}>
      <form onSubmit={submit} role="search" className="nsearch-form">
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocused(true)}
          placeholder="Search for wigs, bundles, closures…" aria-label="Search products" autoComplete="off"
        />
        <button type="submit" className="nsearch-go" aria-label="Search"><FiSearch size={18} /></button>
      </form>

      {showPanel && (
        <div className="nsearch-results" aria-live="polite">
          {items.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} onClick={pick} className="nsearch-item">
              <span className="nsearch-thumb">{p.image && <img src={resolveImageUrl(p.image)} alt="" />}</span>
              <span className="nsearch-name">{p.name}</span>
              <span className="price nsearch-price">{rupee(p.price)}</span>
            </Link>
          ))}
          {!busy && items.length === 0 && <p className="nsearch-empty">No matches yet. Press Enter to search the full catalogue.</p>}
          {items.length > 0 && (
            <button type="button" className="link-u nsearch-all" onClick={submit}>View all results for “{q.trim()}”</button>
          )}
        </div>
      )}
    </div>
  );
}
