import { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

/** Horizontal scroll-snap product carousel with prev/next controls (hidden on touch). */
export default function ProductCarousel({ products = [], onQuickView, label = 'Products' }) {
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
  return (
    <div className="pcar" role="region" aria-label={label}>
      <div className="pcar-track" ref={track} onScroll={measure} tabIndex={0}>
        {products.map((p) => (
          <div className="pcar-item" key={p.id}><ProductCard product={p} onQuickView={onQuickView} /></div>
        ))}
      </div>
      {!(edge.start && edge.end) && (
        <>
          <button type="button" className="pcar-btn pcar-btn--prev" onClick={() => scrollBy(-1)} disabled={edge.start} aria-label="Previous products"><FiChevronLeft size={20} /></button>
          <button type="button" className="pcar-btn pcar-btn--next" onClick={() => scrollBy(1)} disabled={edge.end} aria-label="Next products"><FiChevronRight size={20} /></button>
        </>
      )}
    </div>
  );
}
