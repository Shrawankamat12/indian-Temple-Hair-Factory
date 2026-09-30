import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { productsApi } from '../lib/resources';
import { normalizeProduct } from '../lib/normalize';
import { resolveImageUrl } from '../lib/api';
import { rupee } from '../lib/format';
import { cx, linkU } from '../lib/ui';

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
    <div className={cx('relative w-full max-w-[720px] justify-self-center', className)} ref={wrapRef}>
      <form
        onSubmit={submit} role="search"
        className="flex h-[46px] items-center overflow-hidden rounded-full border border-line-strong bg-white pl-5 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/20"
      >
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocused(true)}
          placeholder="Search for wigs, bundles, closures…" aria-label="Search products" autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent text-[0.92rem] text-ink outline-none placeholder:text-[#9a8f87]"
        />
        <button type="submit" aria-label="Search" className="inline-flex h-full w-[52px] items-center justify-center bg-brand text-white transition-colors hover:bg-brand-dark">
          <FiSearch size={18} />
        </button>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-[5] grid animate-pop-in rounded-lg border border-line bg-white px-3 pb-3 pt-2 shadow-deep" aria-live="polite">
          {items.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} onClick={pick} className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 border-b border-line px-1 py-2 transition-colors hover:bg-cream">
              <span className="h-[54px] w-11 overflow-hidden rounded-sm bg-sand">
                {p.image && <img src={resolveImageUrl(p.image)} alt="" className="size-full object-cover" />}
              </span>
              <span className="text-[0.9rem] text-espresso">{p.name}</span>
              <span className="font-sans text-[0.88rem] font-bold tabular-nums">{rupee(p.price)}</span>
            </Link>
          ))}
          {!busy && items.length === 0 && <p className="px-1 py-3 text-[0.9rem] text-muted">No matches yet. Press Enter to search the full catalogue.</p>}
          {items.length > 0 && (
            <button type="button" className={cx(linkU, 'mx-1 mt-3 justify-self-start border-0 bg-transparent')} onClick={submit}>
              View all results for “{q.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
