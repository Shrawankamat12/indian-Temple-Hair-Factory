import ProductCard from './ProductCard';
import { cx } from '../lib/ui';

/** Responsive product grid. `columns={3}` gives a 3-up layout beside a sidebar; `view="list"` stacks wide cards. */
export default function ProductGrid({ products = [], onQuickView, columns = 4, view = 'grid' }) {
  const cols = columns === 3
    ? 'grid-cols-2 gap-x-2.5 gap-y-4 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-3'
    : 'grid-cols-2 gap-x-2.5 gap-y-4 sm:gap-x-5 sm:gap-y-7 md:grid-cols-3 xl:grid-cols-4';
  return (
    <div className={cx('grid', view === 'list' ? 'grid-cols-1 gap-4' : cols)}>
      {products.map((p) => <ProductCard key={p.id} product={p} onQuickView={onQuickView} view={view} />)}
    </div>
  );
}
