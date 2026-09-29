import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../lib/api';
import { rupee } from '../lib/format';

/**
 * Compact, secondary "recently viewed" strip: small thumbnails in a single
 * horizontal scroll row. Renders nothing when there are no items.
 */
export default function RecentlyViewed({ items, title = 'Recently viewed' }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="rv" aria-label={title}>
      <div className="container">
        <h2 className="rv-title">{title}</h2>
        <ul className="rv-row">
          {items.slice(0, 10).map((p) => {
            const img = resolveImageUrl(p.image);
            return (
              <li key={p.id}>
                <Link to={`/product/${p.id}`} className="rv-item">
                  <span className="rv-thumb">{img ? <img src={img} alt="" loading="lazy" /> : <span>{p.name.charAt(0)}</span>}</span>
                  <span className="rv-text">
                    <span className="rv-name">{p.name}</span>
                    <span className="price rv-price">{rupee(p.price)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
