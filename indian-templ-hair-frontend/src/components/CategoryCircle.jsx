import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../lib/api';

/**
 * Editorial category card — large image, flat scrim, label + arrow
 * revealed on hover. Single visual treatment used everywhere a
 * category is shown (Home grid, mega menu, etc).
 */
export default function CategoryCircle({ cat }) {
  const imageUrl = resolveImageUrl(cat.image);
  return (
    <Link to={`/shop?category=${cat.slug}`} className="cc">
      <div className="cc-media">
        {imageUrl ? (
          <img src={imageUrl} alt={cat.name} loading="lazy" />
        ) : (
          <div className="hm-fallback">{cat.name.charAt(0)}</div>
        )}
        <div className="cc-scrim" />
        <span className="cc-label">{cat.name}</span>
        <span className="cc-cta">Shop now →</span>
      </div>
    </Link>
  );
}
