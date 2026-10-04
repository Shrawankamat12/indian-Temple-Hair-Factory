import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiColumns, FiShoppingBag, FiImage } from 'react-icons/fi';
import StarRating from './StarRating';
import Button from './Button';
import Badge from './Badge';
import { money } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useCompare } from '../context/CompareContext';
import { cx } from '../lib/ui';

const tool =
  'inline-flex size-9 items-center justify-center rounded-full border-0 bg-white/95 text-espresso shadow-soft transition duration-200 hover:bg-espresso hover:text-cream aria-pressed:bg-espresso aria-pressed:text-champagne [&[aria-pressed=true]_svg]:fill-current';

/**
 * Product card. Behaviour: wishlist toggle, compare toggle, quick view (when a handler is passed)
 * and add-to-cart for non-variant products. Variant products go to the detail page.
 * `view="list"` lays the card out horizontally (Shop list view).
 * `compact` is a smaller card for secondary shelves: no rating, no cart button, just image, name and price.
 */
export default function ProductCard({ product, onQuickView, view = 'grid', compact = false }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const wished = isWishlisted(product.id);
  const comparing = isComparing(product.id);

  // FIX: agar `image` khaali ho to gallery ki pehli image use karo (placeholder isi wajah se dikh raha tha)
  const gallery = Array.isArray(product.images) ? product.images : [];
  const mainSrc = product.image || gallery[0];
  const img = mainSrc ? resolveImageUrl(mainSrc) : null;
  const secondSrc = gallery.find((g) => g && g !== mainSrc);
  const img2 = secondSrc ? resolveImageUrl(secondSrc) : null;

  const href = `/product/${product.id}`;
  const onSale = product.discountPct > 0;
  const soldOut = !product.hasVariants && product.stock === 0;
  const lowStock = !product.hasVariants && product.stock > 0 && product.stock <= 5;
  const list = view === 'list';
  const hasReviews = product.reviews > 0 && product.rating > 0;
  const reviewsHref = `${href}#reviews`;

  return (
    <article className={cx(
      'group relative flex h-full overflow-hidden rounded-xl border border-line bg-white transition duration-300 ease-soft hover:border-line-strong hover:shadow-card focus-within:shadow-card',
      list ? 'flex-row' : 'flex-col',
    )}>
      <div className={cx('relative block aspect-[4/5] overflow-hidden bg-sand', list && 'flex-[0_0_min(34%,220px)]')}>
        <Link to={href} aria-label={product.name} tabIndex={-1} className="absolute inset-0">
          {img
            ? <img src={img} alt={product.name} loading="lazy" className={cx('absolute inset-0 size-full object-cover transition duration-[800ms] ease-soft group-hover:scale-105', soldOut && 'opacity-60')} />
            : <span className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,#f3e9dc,#e9d9c4)] text-walnut/35"><FiImage size={34} aria-hidden="true" /></span>}
          {img && img2 && img2 !== img && (
            <img src={img2} alt="" loading="lazy" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-0 transition duration-500 ease-soft group-hover:scale-105 group-hover:opacity-100" />
          )}
        </Link>

        <div className="absolute left-2 top-2 z-[2] flex flex-col items-start gap-1.5">
          {(product.saleBadgeText || product.badge) && <Badge kind="dark">{product.saleBadgeText || product.badge}</Badge>}
          {onSale && !product.saleBadgeText && <Badge kind="sale">-{product.discountPct}%</Badge>}
          {soldOut && <Badge kind="out">Sold out</Badge>}
        </div>

        <div className="absolute right-2 top-2 z-[3] flex flex-col gap-2">
          <button
            type="button" className={tool} aria-pressed={wished}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={() => toggleWishlist(product)}
          >
            <FiHeart size={16} />
          </button>
          {!compact && <button
            type="button" aria-pressed={comparing}
            aria-label={comparing ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
            onClick={() => toggleCompare(product)}
            className={cx(tool, '-translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 aria-pressed:translate-y-0 aria-pressed:opacity-100 [@media(hover:none)]:hidden')}
          >
            <FiColumns size={16} />
          </button>}
        </div>

        {onQuickView && !compact && (
          <button
            type="button" onClick={() => onQuickView(product)}
            className="absolute inset-x-2.5 bottom-2.5 z-[3] inline-flex min-h-[40px] translate-y-2 items-center justify-center gap-2 rounded-md border-0 bg-white/95 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-espresso opacity-0 shadow-soft transition duration-300 ease-soft hover:bg-espresso hover:text-cream group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:hidden"
          >
            <FiEye size={14} aria-hidden="true" /> Quick view
          </button>
        )}
      </div>

      <div className={cx('flex flex-1 flex-col gap-1.5', compact ? 'px-3 pb-3 pt-3' : 'px-3.5 pb-3.5 pt-3.5', list && 'justify-center')}>
        <h3 className={cx('line-clamp-2 font-sans font-semibold leading-[1.35] text-espresso', compact ? 'text-[0.82rem]' : 'text-[0.92rem]')}>
          <Link to={href} className="transition-colors hover:text-brand">{product.name}</Link>
        </h3>

        {/* Review row (always visible on full cards): real rating + count, or a "Write a review" link when there are none yet. */}
        {!compact && (
          <div className="flex min-h-[18px] flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.78rem] text-muted">
            {hasReviews ? (
              <Link to={reviewsHref} className="inline-flex items-center gap-1.5 transition-colors hover:text-brand" aria-label={`${product.rating} out of 5 stars, ${product.reviews} reviews. Read reviews`}>
                <StarRating value={product.rating} size={12} />
                <span>({product.reviews})</span>
              </Link>
            ) : (
              <Link to={reviewsHref} className="inline-flex items-center gap-1.5 transition-colors hover:text-brand">
                <StarRating value={0} size={12} />
                <span className="underline-offset-2 hover:underline">Write a review</span>
              </Link>
            )}
            {lowStock && <span className="font-semibold text-sale">Only {product.stock} left</span>}
          </div>
        )}

        <div className={cx('mt-auto flex flex-col gap-3', compact ? 'pt-0' : 'pt-2', list && 'mt-2 max-w-80')}>
          {/* FIX: "21% off" chip hata diya, kyunki image par "-21%" badge pehle se hai */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={cx('font-sans font-bold tabular-nums text-espresso', compact ? 'text-[0.95rem]' : 'text-[1.08rem]')}>{money(product.price)}</span>
            {onSale && <span className="text-[0.85rem] tabular-nums text-muted line-through">{money(product.mrp)}</span>}
          </div>
          {compact ? null : product.hasVariants ? (
            <Button to={href} variant="dark" size="sm" block className="min-h-10 tracking-[0.08em]">Select Options</Button>
          ) : (
            <Button variant="dark" size="sm" block disabled={soldOut} className="min-h-10 gap-2 tracking-[0.08em]" onClick={() => addToCart(product)}>
              {soldOut ? 'Sold out' : <><FiShoppingBag size={15} aria-hidden="true" /> Add to Cart</>}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}