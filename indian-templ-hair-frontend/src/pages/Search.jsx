import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import ProductGrid from '../components/ProductGrid';
import FilterPanel from '../components/FilterPanel';
import QuickView from '../components/QuickView';
import Button from '../components/Button';
import { ProductGridSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateBlocks';
import Container from '../components/Container';
import Section from '../components/Section';
import PageTitle from '../components/PageTitle';
import { useProducts, useCategories, useAttributes } from '../hooks/useStoreData';
import { topLevelCategories } from '../lib/categories';

const LENGTHS = [
  { id: 's', label: '8–14"', test: (l) => l >= 8 && l <= 14 },
  { id: 'm', label: '16–20"', test: (l) => l >= 16 && l <= 20 },
  { id: 'l', label: '22–28"', test: (l) => l >= 22 && l <= 28 },
  { id: 'xl', label: '30"+', test: (l) => l >= 30 },
];
const NONE = [];

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';
  const [localQ, setLocalQ] = useState(q);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { products: results, loading, error, refetch } = useProducts(q ? { search: q, limit: 60 } : {});
  const shown = q ? results : [];

  const { categories } = useCategories();
  const { attributes: hairTypeAttrs } = useAttributes('hairType');
  const { attributes: textureAttrs } = useAttributes('hairTexture');
  const { attributes: colorAttrs } = useAttributes('hairColour');
  const { attributes: laceAttrs } = useAttributes('laceType');
  const { attributes: densityAttrs } = useAttributes('hairDensity');

  const [f, setF] = useState({ cat: null, hairType: null, texture: null, length: null, color: null, laceType: null, density: null, rating: null, maxPrice: 35000 });
  const setKey = (key) => (v) => setF((s) => ({ ...s, [key]: typeof v === 'function' ? v(s[key]) : v }));
  const resetF = () => setF({ cat: null, hairType: null, texture: null, length: null, color: null, laceType: null, density: null, rating: null, maxPrice: 35000 });

  useEffect(() => { setLocalQ(q); }, [q]);

  // Client-side navigation (a full page reload would drop the in-memory guest cart).
  function onSubmit(e) {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(localQ)}`);
  }

  // Filters narrow the already-fetched search results.
  const filtered = useMemo(() => shown.filter((p) => {
    if (f.cat && p.category !== f.cat) return false;
    if (f.hairType && p.hairType !== f.hairType) return false;
    if (f.texture && p.texture !== f.texture && p.hairTexture !== f.texture) return false;
    if (f.length && !LENGTHS.find((l) => l.id === f.length).test(p.length)) return false;
    if (f.color && p.color !== f.color) return false;
    if (f.laceType && p.laceType !== f.laceType) return false;
    if (f.density && p.hairDensity !== f.density) return false;
    if (f.rating && p.rating < f.rating) return false;
    return p.price <= f.maxPrice;
  }), [shown, f]);

  const activeCount = [f.cat, f.hairType, f.texture, f.length, f.color, f.laceType, f.density, f.rating].filter(Boolean).length + (f.maxPrice < 35000 ? 1 : 0);
  const panel = {
    data: { categories: topLevelCategories(categories), subcategories: NONE, brands: NONE, collections: NONE, hairTypeAttrs, textureAttrs, colorAttrs, laceAttrs, densityAttrs },
    state: { ...f, subCat: null, brand: null, collection: null },
    set: { cat: setKey('cat'), hairType: setKey('hairType'), texture: setKey('texture'), length: setKey('length'), color: setKey('color'), laceType: setKey('laceType'), density: setKey('density'), rating: setKey('rating'), maxPrice: setKey('maxPrice'), subCat: () => {}, brand: () => {}, collection: () => {} },
    activeCount, onReset: resetF, lengths: LENGTHS,
  };

  return (
    <>
      <PageTitle count={q && !loading ? `(${filtered.length} found)` : undefined}>
        {q ? <>Search results for “{q}”</> : 'Search'}
      </PageTitle>
      <Section tight>
        <Container>
          <form
            onSubmit={onSubmit} role="search"
            className="mb-10 flex max-w-[760px] items-center gap-3 rounded-lg border border-line-strong bg-white py-2 pl-5 pr-2 text-walnut transition focus-within:border-walnut focus-within:ring-4 focus-within:ring-gold/30"
          >
            <FiSearch size={20} aria-hidden="true" />
            <label htmlFor="page-q" className="sr-only">Search products</label>
            <input
              id="page-q" type="search" value={localQ} onChange={(e) => setLocalQ(e.target.value)}
              placeholder="Search bundles, wigs, frontals…" autoComplete="off"
              className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[1.05rem] text-ink outline-none"
            />
            <Button type="submit" size="sm">Search</Button>
          </form>

          {!q ? (
            <EmptyState title="Find your perfect piece" message="Start typing to search our catalogue of extensions, wigs, closures and raw bundles."
              action={<Button to="/shop">Browse full shop</Button>} />
          ) : loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <ErrorState message="Search is unavailable right now." onRetry={refetch} />
          ) : shown.length === 0 ? (
            <EmptyState title={`No results for “${q}”`} message="Try a different texture, hair type or category, or browse the full collection."
              action={<Button to="/shop">Browse full shop</Button>} />
          ) : (
            <div className="grid items-start gap-[clamp(20px,3vw,40px)] min-[960px]:grid-cols-[250px_minmax(0,1fr)]">
              <details open className="group rounded-xl border border-line bg-white px-4 pb-4">
                <summary className="cursor-pointer list-none py-3.5 font-semibold min-[960px]:hidden [&::-webkit-details-marker]:hidden">
                  Filters{activeCount > 0 ? ` (${activeCount})` : ''}
                </summary>
                <FilterPanel {...panel} />
              </details>
              <div>
                {filtered.length === 0 ? (
                  <EmptyState title="No products match those filters" message="Try widening your price range or clearing a filter."
                    action={<Button variant="outline" onClick={resetF}>Clear filters</Button>} />
                ) : (
                  <ProductGrid products={filtered} onQuickView={setQuickViewProduct} columns={3} />
                )}
              </div>
            </div>
          )}
        </Container>
      </Section>
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
