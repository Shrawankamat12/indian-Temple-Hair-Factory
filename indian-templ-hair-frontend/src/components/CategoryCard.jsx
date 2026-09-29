import { Link } from 'react-router-dom';
import { imageOr } from '../lib/media';

/**
 * Category tile linking to the shop pre-filtered by category slug.
 * `shape="round"` (Shop by Category / mega menu) or `"square"`. Falls back to a bundled photo
 * (`fallback`) then a neutral tile when the admin has not uploaded a category image.
 */
export default function CategoryCard({ category, fallback = null, shape = 'square' }) {
  const img = imageOr(category.image, fallback);
  return (
    <Link to={`/shop?category=${category.slug}`} className={`ccard ccard--${shape}`}>
      <span className="ccard-arch">
        {img ? <img src={img} alt="" loading="lazy" /> : <span className="ccard-fallback">{category.name.charAt(0)}</span>}
      </span>
      <span className="ccard-name">{category.name}</span>
    </Link>
  );
}
