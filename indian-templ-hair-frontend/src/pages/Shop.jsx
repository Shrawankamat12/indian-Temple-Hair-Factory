import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiX, FiSliders, FiGrid, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import ProductGrid from '../components/ProductGrid';
import FilterPanel from '../components/FilterPanel';
import QuickView from '../components/QuickView';
import RecentlyViewed from '../components/RecentlyViewed';
import Button from '../components/Button';
import { ProductGridSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateBlocks';
import Container from '../components/Container';
import Section from '../components/Section';
import Overlay from '../components/Overlay';
import { Select } from '../components/Field';
import { chip, cx, iconBtn, linkU } from '../lib/ui';
import {
  useProducts, useCategories, useSubCategories, useBrands, useCollections, useAttributes, useBanners,
} from '../hooks/useStoreData';
import { imageOr } from '../lib/media';
import { useRecentlyViewedList } from '../hooks/useRecentlyViewed';

// Length is a numeric field on the product (inches), so it stays a computed bucket rather than
// an admin-managed list — there is no "min/max inches" field on the Attribute model to map to.
const LENGTHS = [
  { id: 's', label: '8–14"', test: (l) => l >= 8 && l <= 14 },
  { id: 'm', label: '16–20"', test: (l) => l >= 16 && l <= 20 },
  { id: 'l', label: '22–28"', test: (l) => l >= 22 && l <= 28 },
  { id: 'xl', label: '30"+', test: (l) => l >= 30 },
];
const PAGE_SIZE = 12;
const SORTS = [
  { value: 'featured', label: 'Sort: Featured' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
];
const hasVariant = (p, key, value) => (p.variants || []).some((v) => v[key] === value);

export default function Shop() {
  const { products, loading, error, refetch } = useProducts({ limit: 100 });
  const recentlyViewed = useRecentlyViewedList();
  const [searchParams] = useSearchParams();

  // ---- Admin-managed filter sources (Categories, Sub Categories, Brands, Collections, Attributes) ----
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { collections } = useCollections();
  const { attributes: hairTypeAttrs } = useAttributes('hairType');
  const { attributes: textureAttrs } = useAttributes('hairTexture');
  const { attributes: colorAttrs } = useAttributes('hairColour');
  const { attributes: laceAttrs } = useAttributes('laceType');
  const { attributes: densityAttrs } = useAttributes('hairDensity');
  const { banners: topBanners } = useBanners('category-top');

  const [cat, setCat] = useState(null);
  const [subCat, setSubCat] = useState(null);
  const [brand, setBrand] = useState(null);
  const [collection, setCollection] = useState(null);
  const [hairType, setHairType] = useState(null);
  const [texture, setTexture] = useState(null);
  const [length, setLength] = useState(null);
  const [color, setColor] = useState(null);
  const [laceType, setLaceType] = useState(null);
  const [density, setDensity] = useState(null);
  const [onSale, setOnSale] = useState(false);
  const [view, setView] = useState('grid');
  const [rating, setRating] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null); // null = no limit; the slider ceiling comes from the real catalogue
  const [sort, setSort] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Price slider ceiling = the dearest real product (rounded up), not a made-up number.
  const priceCeiling = useMemo(() => Math.ceil(Math.max(0, ...products.map((p) => Number(p.price) || 0)) / 500) * 500, [products]);
  const priceActive = maxPrice !== null && maxPrice < priceCeiling;
  const activeCategory = categories.find((c) => c.id === cat);
  const { subcategories } = useSubCategories(activeCategory?._id);

  // Pre-select a collection when arriving from a "Shop by Collection" link.
  // When the param is absent (e.g. the nav's "All products" link) the filter is cleared.
  useEffect(() => {
    setCollection(searchParams.get('collection') || null);
  }, [searchParams]);

  // Pre-select a category when arriving from a category tile / mega menu
  // (links go to /shop?category=<slug>; `cat` is matched against categories[].id,
  // which normalizeCategory sets to the category's slug).
  useEffect(() => {
    setCat(searchParams.get('category') || null);
  }, [searchParams]);

  // Other deep links: /shop?texture=Body%20Wave, ?hairType=, ?laceType=, ?sort=newest, ?onSale=1
  useEffect(() => {
    setTexture(searchParams.get('texture') || null);
    setHairType(searchParams.get('hairType') || null);
    setLaceType(searchParams.get('laceType') || null);
    setOnSale(searchParams.get('onSale') === '1');
    const sortParam = searchParams.get('sort');
    setSort(SORTS.some((o) => o.value === sortParam) ? sortParam : 'featured');
  }, [searchParams]);

  function reset() {
    setCat(null); setSubCat(null); setBrand(null); setCollection(null);
    setHairType(null); setTexture(null); setLength(null);
    setColor(null); setLaceType(null); setDensity(null); setOnSale(false);
    setRating(null); setMaxPrice(null); setSort('featured');
  }

  const activeFilterCount = [cat, subCat, brand, collection, hairType, texture, length, color, laceType, density, rating, onSale].filter(Boolean).length
    + (priceActive ? 1 : 0);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (subCat && p.subcategory !== subCat) return false;
      if (brand && p.brand !== brand) return false;
      if (collection && p.collectionRef !== collection) return false;
      if (hairType && p.hairType !== hairType) return false;
      if (texture && p.texture !== texture && p.hairTexture !== texture && !hasVariant(p, 'texture', texture)) return false;
      if (laceType && p.laceType !== laceType && !hasVariant(p, 'laceType', laceType)) return false;
      if (density && p.hairDensity !== density && !hasVariant(p, 'density', density)) return false;
      if (onSale && !(p.discountPct > 0)) return false;
      if (length && !LENGTHS.find((l) => l.id === length).test(p.length)) return false;
      if (color && p.color !== color) return false;
      if (rating && p.rating < rating) return false;
      if (maxPrice !== null && p.price > maxPrice) return false;
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'popularity') list = [...list].sort((a, b) => b.reviews - a.reviews || b.rating - a.rating);
    if (sort === 'newest') list = [...list].sort((a, b) => (b.newArrival || b.badge === 'New') - (a.newArrival || a.badge === 'New'));
    return list;
  }, [products, cat, subCat, brand, collection, hairType, texture, length, color, laceType, density, onSale, rating, maxPrice, sort]);

  // show the first page again whenever the result set changes
  useEffect(() => { setPage(1); }, [filtered]);

  const panelProps = {
    data: { categories, subcategories, brands, collections, hairTypeAttrs, textureAttrs, colorAttrs, laceAttrs, densityAttrs },
    state: { cat, subCat, brand, collection, hairType, texture, length, color, laceType, density, rating, maxPrice: maxPrice ?? priceCeiling, priceCeiling },
    set: { cat: setCat, subCat: setSubCat, brand: setBrand, collection: setCollection, hairType: setHairType, texture: setTexture, length: setLength, color: setColor, laceType: setLaceType, density: setDensity, rating: setRating, maxPrice: setMaxPrice },
    activeCount: activeFilterCount, onReset: reset, lengths: LENGTHS,
    onApply: () => { setFiltersOpen(false); document.getElementById('shop-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  };

  const activeChips = [
    activeCategory && { label: activeCategory.name, clear: () => { setCat(null); setSubCat(null); } },
    hairType && { label: hairType, clear: () => setHairType(null) },
    texture && { label: texture, clear: () => setTexture(null) },
    length && { label: LENGTHS.find((l) => l.id === length)?.label, clear: () => setLength(null) },
    color && { label: color, clear: () => setColor(null) },
    laceType && { label: laceType, clear: () => setLaceType(null) },
    density && { label: `${density} density`, clear: () => setDensity(null) },
    onSale && { label: 'On offer', clear: () => setOnSale(false) },
    rating && { label: `${rating}+ stars`, clear: () => setRating(null) },
    priceActive && { label: `Up to ₹${maxPrice.toLocaleString('en-IN')}`, clear: () => setMaxPrice(null) },
  ].filter(Boolean);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goPage = (n) => { setPage(n); document.getElementById('shop-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  // Banner: the selected category's own banner, else the first `category-top` banner, else a plain dark band.
  const topBanner = topBanners[0];
  const bannerImage = imageOr(activeCategory?.banner) || imageOr(topBanner?.img) || imageOr(activeCategory?.image);
  const bannerTitle = activeCategory?.name || topBanner?.title || 'The Complete Collection';
  const bannerLede = (activeCategory ? (activeCategory.tag || activeCategory.description) : topBanner?.subtitle) || '';

  const pagerBtn = 'inline-flex h-[38px] min-w-[38px] items-center justify-center rounded-md border border-line bg-white px-2.5 text-[0.85rem] font-semibold text-espresso transition hover:enabled:border-brand hover:enabled:text-brand disabled:cursor-default disabled:opacity-40 aria-[current=page]:border-brand aria-[current=page]:bg-brand aria-[current=page]:text-white';

  return (
    <>
      <PageHeader
        crumbs={activeCategory ? [{ label: 'Shop', to: '/shop' }, { label: activeCategory.name }] : [{ label: 'Shop' }]}
        title={bannerTitle}
        lede={bannerLede}
        image={bannerImage}
        tall
      />

      {categories.length > 0 && (
        <nav className="border-b border-line bg-cream" aria-label="Categories">
          <Container className="flex gap-2.5 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" className={cx(chip, 'flex-none')} aria-pressed={!cat} onClick={() => { setCat(null); setSubCat(null); }}>All</button>
            {categories.map((c) => (
              <button key={c.id} type="button" className={cx(chip, 'flex-none')} aria-pressed={cat === c.id} onClick={() => { setCat(cat === c.id ? null : c.id); setSubCat(null); }}>{c.name}</button>
            ))}
          </Container>
        </nav>
      )}

      <div className="sticky top-[var(--navbar-h,72px)] z-40 border-b border-line bg-cream/95 backdrop-blur">
        <Container className="flex min-h-14 items-center gap-2.5 min-[960px]:gap-4">
          <Button variant="outline" size="sm" className="min-[960px]:hidden" onClick={() => setFiltersOpen(true)}>
            <FiSliders size={15} aria-hidden="true" /> Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
          <p className="m-0 hidden flex-1 text-[0.9rem] font-medium text-espresso min-[960px]:block" role="status">
            {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`}
          </p>
          <div className="ml-auto min-[960px]:ml-0">
            <label htmlFor="sort" className="sr-only">Sort products</label>
            <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="min-h-10 w-auto max-w-[170px] py-1.5 sm:max-w-none min-[960px]:min-w-[190px]">
              {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div className="inline-flex overflow-hidden rounded-md border border-line-strong bg-white" role="group" aria-label="Layout">
            {[['grid', 'Grid view', FiGrid], ['list', 'List view', FiList]].map(([v, label, Icon]) => (
              <button
                key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} aria-label={label}
                className="inline-flex h-[38px] w-10 items-center justify-center text-muted transition-colors aria-pressed:bg-espresso aria-pressed:text-white"
              ><Icon size={17} /></button>
            ))}
          </div>
        </Container>
      </div>

      <Section tight>
        <Container className="grid items-start gap-[clamp(28px,4vw,56px)] min-[960px]:grid-cols-[250px_minmax(0,1fr)]">
          <aside
            className="sticky top-[calc(var(--navbar-h,72px)+84px)] hidden max-h-[calc(100vh-var(--navbar-h,72px)-100px)] overflow-auto rounded-xl border border-line bg-white px-4 pb-4 [scrollbar-width:thin] min-[960px]:block"
            aria-label="Filters"
          >
            <FilterPanel {...panelProps} />
          </aside>

          <div id="shop-results" className="min-w-0 scroll-mt-40">
            {activeChips.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2" aria-label="Active filters">
                {activeChips.map((c) => (
                  <button key={c.label} type="button" className={cx(chip, 'min-h-[34px] px-3 text-[0.8rem]')} aria-pressed="true" onClick={c.clear} aria-label={`Remove filter ${c.label}`}>
                    {c.label} <FiX size={13} aria-hidden="true" />
                  </button>
                ))}
                <button type="button" className={linkU} onClick={reset}>Clear all</button>
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton count={9} />
            ) : error ? (
              <ErrorState message="Could not load products right now." onRetry={refetch} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No pieces match those filters yet."
                message="Try widening your price range or clearing a filter."
                action={<Button variant="outline" onClick={reset}>Clear filters</Button>}
              />
            ) : (
              <>
                <ProductGrid products={shown} onQuickView={setQuickViewProduct} columns={3} view={view} />
                {pages > 1 && (
                  <nav className="mt-9 flex flex-wrap justify-center gap-1.5" aria-label="Pagination">
                    <button type="button" className={pagerBtn} onClick={() => goPage(page - 1)} disabled={page === 1} aria-label="Previous page"><FiChevronLeft size={16} /></button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                      <button type="button" key={n} className={pagerBtn} onClick={() => goPage(n)} aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined}>{n}</button>
                    ))}
                    <button type="button" className={pagerBtn} onClick={() => goPage(page + 1)} disabled={page === pages} aria-label="Next page"><FiChevronRight size={16} /></button>
                  </nav>
                )}
              </>
            )}
          </div>
        </Container>
      </Section>

      <RecentlyViewed items={recentlyViewed} />
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      <Overlay open={filtersOpen} onClick={() => setFiltersOpen(false)} />
      <aside
        aria-hidden={!filtersOpen} aria-label="Filters"
        className={cx(
          'fixed inset-y-0 right-0 z-[80] flex w-[min(92vw,400px)] flex-col bg-cream shadow-deep transition duration-[380ms] ease-soft',
          filtersOpen ? 'visible translate-x-0' : 'invisible translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="text-xl">Filters</h3>
          <button type="button" className={iconBtn} onClick={() => setFiltersOpen(false)} aria-label="Close filters"><FiX size={20} /></button>
        </div>
        <div className="flex-1 overflow-auto px-5 pb-4 pt-1"><FilterPanel {...panelProps} /></div>
        <div className="border-t border-line bg-white px-5 py-3.5">
          <Button block onClick={() => setFiltersOpen(false)}>Show {filtered.length} results</Button>
        </div>
      </aside>
    </>
  );
}
