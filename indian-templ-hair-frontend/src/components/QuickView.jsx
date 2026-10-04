import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiHeart } from 'react-icons/fi';
import PhotoBlock from './PhotoBlock';
import StarRating from './StarRating';
import Overlay from './Overlay';
import Button from './Button';
import Badge from './Badge';
import { Check } from './Field';
import { money } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useCompare } from '../context/CompareContext';
import { cx, iconBtn } from '../lib/ui';

export const closeBtn =
  'inline-flex size-10 items-center justify-center rounded-full border border-line bg-white transition-colors hover:bg-sand';

export default function QuickView({ product, onClose }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  const open = !!product;
  const onSale = product?.discountPct > 0;

  return (
    <>
      <Overlay open={open} onClick={onClose} />
      <div
        role="dialog" aria-modal="true" aria-label="Quick view" aria-hidden={!open}
        className={cx(
          'fixed left-1/2 top-1/2 z-[80] max-h-[92vh] w-[min(940px,94vw)] -translate-x-1/2 overflow-auto rounded-xl bg-white shadow-deep transition duration-300 ease-soft',
          open ? '-translate-y-1/2 opacity-100' : 'pointer-events-none -translate-y-[46%] opacity-0',
        )}
      >
        {product && (
          <>
            <button type="button" className={cx(closeBtn, 'absolute right-3 top-3 z-[2]')} onClick={onClose} aria-label="Close quick view"><FiX size={18} /></button>
            <div className="grid md:grid-cols-2">
              <div className="relative bg-sand">
                <PhotoBlock tone={product.tone} ratio="4/5" src={resolveImageUrl(product.image)} alt={product.name} />
                {product.badge && <span className="absolute left-2 top-2"><Badge kind="dark">{product.badge}</Badge></span>}
              </div>
              <div className="flex flex-col justify-center gap-3.5 p-6 sm:p-10">
                {(product.hairType || product.texture) && (
                  <span className="text-[0.82rem] text-muted">{[product.hairType, product.texture].filter(Boolean).join(', ')}</span>
                )}
                <h3 className="text-[1.6rem]">{product.name}</h3>
                <Link to={`/product/${product.id}#reviews`} onClick={onClose} className="inline-flex items-center gap-2 text-[0.8rem] text-muted transition-colors hover:text-brand">
                  <StarRating value={product.rating > 0 ? product.rating : 0} />
                  <span>{product.rating > 0 && product.reviews > 0 ? `${Number(product.rating).toFixed(1)} (${product.reviews} ${product.reviews === 1 ? 'review' : 'reviews'})` : 'Write a review'}</span>
                </Link>
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className="font-sans text-2xl font-bold tabular-nums text-espresso">{money(product.price)}</span>
                  {onSale && <span className="text-[0.88rem] tabular-nums text-muted line-through">{money(product.mrp)}</span>}
                  {onSale && <span className="text-[0.78rem] font-bold text-sale">-{product.discountPct}%</span>}
                </div>
                {product.description && (
                  <p className="text-[0.92rem] leading-relaxed text-muted">
                    {product.description.slice(0, 180)}{product.description.length > 180 ? '…' : ''}
                  </p>
                )}

                <div className="inline-flex items-center self-start rounded-md border border-line-strong bg-white">
                  <button type="button" className="inline-flex h-11 w-[42px] items-center justify-center text-lg text-espresso transition-colors hover:bg-sand" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span className="min-w-10 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
                  <button type="button" className="inline-flex h-11 w-[42px] items-center justify-center text-lg text-espresso transition-colors hover:bg-sand" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button onClick={() => { addToCart(product, qty); onClose(); }}>Add to cart</Button>
                  <button
                    type="button" className={cx(iconBtn, 'border border-line-strong aria-pressed:text-sale [&[aria-pressed=true]_svg]:fill-current')}
                    aria-pressed={isWishlisted(product.id)} onClick={() => toggleWishlist(product)} aria-label="Toggle wishlist"
                  >
                    <FiHeart size={18} />
                  </button>
                  <Button to={`/product/${product.id}`} variant="outline" onClick={onClose}>Full details</Button>
                </div>

                <Check checked={isComparing(product.id)} onChange={() => toggleCompare(product)}>Add to compare</Check>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
