import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiColumns } from 'react-icons/fi';
import StarRating from './StarRating';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useCompare } from '../context/CompareContext';

// Bundled fallback photos keep product cards visual even when the admin/API
// product has no image yet. Real API images always take priority.
import pStraight from '../assets/photos/p-kirti-straight.jpg';
import pBody from '../assets/photos/p-delhi-bodywave.jpg';
import pWavy from '../assets/photos/p-tara-wavywig.jpg';
import pTemple from '../assets/photos/p-temple-wavy.jpg';
import pCurly from '../assets/photos/p-nisha-curlywig.jpg';
import pKinky from '../assets/photos/p-chandni-kinky.jpg';
import pRaw from '../assets/photos/p-rekha-raw.jpg';
import pBlonde from '../assets/photos/p-roshni-honeyblonde.jpg';

const productFallback = (product = {}) => {
  const key = `${product.name || ''} ${product.slug || ''} ${product.category?.name || ''}`.toLowerCase();
  if (/kinky/.test(key)) return pKinky;
  if (/curly|deep curl/.test(key)) return pCurly;
  if (/water|temple|wavy/.test(key)) return pTemple;
  if (/body wave|bodywave/.test(key)) return pBody;
  if (/straight/.test(key)) return pStraight;
  if (/raw|bundle/.test(key)) return pRaw;
  if (/blonde|613|honey/.test(key)) return pBlonde;
  return pWavy;
};

/**
 * Product card. All behaviour is unchanged from the previous design:
 * wishlist toggle, compare toggle, quick view (when a handler is passed) and
 * add-to-cart for non-variant products. Variant products go to the detail page.
 */
export default function ProductCard({ product, onQuickView }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const wished = isWishlisted(product.id);
  const comparing = isComparing(product.id);
  const apiImg = resolveImageUrl(product.image || product.images?.[0]);
  const img = apiImg || productFallback(product);
  const img2 = product.images?.[1] ? resolveImageUrl(product.images[1]) : null;
  const href = `/product/${product.id}`;
  const onSale = product.discountPct > 0;

  return (
    <article className="pc">
      <div className="pc-media">
        <Link to={href} aria-label={product.name} tabIndex={-1} className="pc-media-link" style={{ position: 'absolute', inset: 0 }}>
          <img src={img} alt={product.name} loading="lazy" />
          {img2 && img2 !== img && <img className="pc-img-2" src={img2} alt="" loading="lazy" aria-hidden="true" />}
        </Link>

        <div className="pc-badges">
          {(product.saleBadgeText || product.badge) && <span className="badge badge-dark">{product.saleBadgeText || product.badge}</span>}
        </div>

        <div className="pc-tools">
          <button
            type="button" className="pc-tool" aria-pressed={wished}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={() => toggleWishlist(product)}
          >
            <FiHeart size={16} />
          </button>
          <button
            type="button" className="pc-tool pc-tool--compare" aria-pressed={comparing}
            aria-label={comparing ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
            onClick={() => toggleCompare(product)}
          >
            <FiColumns size={16} />
          </button>
        </div>

        {onQuickView && (
          <button type="button" className="pc-quick" onClick={() => onQuickView(product)}>
            <FiEye size={14} aria-hidden="true" /> Quick view
          </button>
        )}
      </div>

      <div className="pc-body">
        <h3 className="pc-name"><Link to={href}>{product.name}</Link></h3>

        {product.rating > 0 && (
          <div className="rating-row">
            <StarRating value={product.rating} size={12} />
            <span>{product.reviews > 0 ? `(${product.reviews})` : product.rating}</span>
          </div>
        )}

        <div className="pc-foot">
          <div className="price-row">
            <span className="price-now">{rupee(product.price)}</span>
            {onSale && <span className="price-was">{rupee(product.mrp)}</span>}
            {onSale && <span className="price-off">{product.discountPct}% off</span>}
          </div>
          {product.hasVariants ? (
            <Link to={href} className="btn btn-black btn-sm pc-add">Select Options</Link>
          ) : (
            <button type="button" className="btn btn-black btn-sm pc-add" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
