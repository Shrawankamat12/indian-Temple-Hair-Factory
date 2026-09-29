import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiX, FiHeart } from 'react-icons/fi';
import PhotoBlock from './PhotoBlock';
import StarRating from './StarRating';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useCompare } from '../context/CompareContext';

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
      <div className={`overlay-backdrop ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div className={`qv-modal ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Quick view" aria-hidden={!open}>
        {product && (
          <>
            <button type="button" className="qv-close" onClick={onClose} aria-label="Close quick view"><FiX size={18} /></button>
            <div className="qv-grid">
              <div className="qv-media">
                <PhotoBlock tone={product.tone} ratio="4/5" src={resolveImageUrl(product.image)} alt={product.name} />
                <span className="pc-badges">
                  {product.badge && <span className="badge badge-dark">{product.badge}</span>}
                </span>
              </div>
              <div className="qv-body">
                {(product.hairType || product.texture) && (
                  <span className="qv-meta">{[product.hairType, product.texture].filter(Boolean).join(', ')}</span>
                )}
                <h3>{product.name}</h3>
                {product.rating > 0 && (
                  <div className="rating-row"><StarRating value={product.rating} /><span>{product.rating} ({product.reviews} reviews)</span></div>
                )}
                <div className="price-row">
                  <span className="price-now" style={{ fontSize: '1.5rem' }}>{rupee(product.price)}</span>
                  {onSale && <span className="price-was">{rupee(product.mrp)}</span>}
                  {onSale && <span className="price-off">-{product.discountPct}%</span>}
                </div>
                {product.description && (
                  <p className="qv-meta" style={{ fontSize: '.92rem', lineHeight: 1.6 }}>
                    {product.description.slice(0, 180)}{product.description.length > 180 ? '…' : ''}
                  </p>
                )}

                <div className="qty" style={{ alignSelf: 'flex-start' }}>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span className="qty-n" aria-live="polite">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
                </div>

                <div className="qv-actions">
                  <button type="button" className="btn btn-primary" onClick={() => { addToCart(product, qty); onClose(); }}>Add to cart</button>
                  <button type="button" className="icon-btn" style={{ border: '1px solid #D9CBBB' }} aria-pressed={isWishlisted(product.id)}
                    onClick={() => toggleWishlist(product)} aria-label="Toggle wishlist">
                    <FiHeart size={18} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
                  </button>
                  <Link to={`/product/${product.id}`} className="btn btn-outline" onClick={onClose}>Full details</Link>
                </div>

                <label className="check">
                  <input type="checkbox" checked={isComparing(product.id)} onChange={() => toggleCompare(product)} />
                  Add to compare
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
