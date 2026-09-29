import ProductCard from './ProductCard';

/** Responsive product grid. `columns={3}` gives a 3-up layout beside a sidebar; `view="list"` stacks wide cards. */
export default function ProductGrid({ products = [], onQuickView, columns = 4, view = 'grid' }) {
  return (
    <div className={`pgrid ${columns === 3 ? 'pgrid--3' : ''} ${view === 'list' ? 'pgrid--list' : ''}`}>
      {products.map((p) => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)}
    </div>
  );
}
