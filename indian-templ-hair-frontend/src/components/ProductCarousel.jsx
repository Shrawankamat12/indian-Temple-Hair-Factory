import { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';
import { cx } from '../lib/ui';

const navBtn =
  'absolute top-[34%] z-[4] inline-flex size-11 items-center justify-center rounded-full border border-espresso bg-white text-espresso shadow-pop transition hover:enabled:bg-espresso hover:enabled:text-cream disabled:cursor-default disabled:opacity-30 [@media(hover:none)]:hidden';

// Card widths per row. `five` = 5 across on desktop (Best Sellers); `sm` = small cards for secondary shelves (Recently viewed).
const CELL = {
  md: 'flex-[0_0_64%] sm:flex-[0_0_calc((100%-40px)/3)] xl:flex-[0_0_calc((100%-60px)/4)]',
  five: 'flex-[0_0_64%] sm:flex-[0_0_calc((100%-40px)/3)] lg:flex-[0_0_calc((100%-60px)/4)] xl:flex-[0_0_calc((100%-80px)/5)]',
  sm: 'flex-[0_0_44%] sm:flex-[0_0_calc((100%-60px)/4)] xl:flex-[0_0_calc((100%-100px)/6)]',
};

// Jab products kam hon (<= columns), carousel ki jagah grid jaisa behave kare:
// cards poori width lein, left se align hon, scroll/arrows na aayein.
const FEW = {
  md: 'sm:flex-[1_1_0] sm:max-w-[calc((100%-40px)/3)] xl:max-w-[calc((100%-60px)/4)]',
  five: 'sm:flex-[1_1_0] sm:max-w-[calc((100%-40px)/3)] lg:max-w-[calc((100%-60px)/4)] xl:max-w-[calc((100%-80px)/5)]',
  sm: 'sm:flex-[1_1_0] sm:max-w-[calc((100%-60px)/4)] xl:max-w-[calc((100%-100px)/6)]',
};

// Desktop par kitne cards ek row mein aate hain (few-products check ke liye)
const COLS = { md: 4, five: 5, sm: 6 };

/** Horizontal scroll-snap product carousel with prev/next controls (hidden on touch). */
export default function ProductCarousel({ products = [], onQuickView, label = 'Products', size = 'md' }) {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, products.length]);

  const scrollBy = (dir) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (!products.length) return null;

  const cols = COLS[size] || COLS.md;
  const few = products.length < cols;

  return (
    <div className="relative" role="region" aria-label={label}>
      <div
        ref={track} onScroll={measure} tabIndex={0}
        className="-mx-0.5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-0.5 pb-5 pt-1 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className={cx(
              'min-w-0 snap-start',
              // mobile par hamesha carousel width, desktop par few ho to grid jaisi width
              few ? cx('flex-[0_0_64%]', FEW[size] || FEW.md) : (CELL[size] || CELL.md),
            )}
          >
            <ProductCard product={p} onQuickView={onQuickView} compact={size === 'sm'} />
          </div>
        ))}
      </div>
      {!(edge.start && edge.end) && (
        <>
          <button type="button" className={cx(navBtn, 'left-1.5 min-[1400px]:-left-[22px]')} onClick={() => scrollBy(-1)} disabled={edge.start} aria-label="Previous products"><FiChevronLeft size={20} /></button>
          <button type="button" className={cx(navBtn, 'right-1.5 min-[1400px]:-right-[22px]')} onClick={() => scrollBy(1)} disabled={edge.end} aria-label="Next products"><FiChevronRight size={20} /></button>
        </>
      )}
    </div>
  );
}