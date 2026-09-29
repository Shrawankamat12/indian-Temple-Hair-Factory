import { useEffect, useMemo, useState } from 'react';
import { FiX, FiPlay, FiHeart, FiTruck, FiShield } from 'react-icons/fi';
import { useParams, Link, Navigate } from 'react-router-dom';
import PhotoBlock from '../components/PhotoBlock';
import ImageZoom from '../components/ImageZoom';
import StarRating from '../components/StarRating';
import Breadcrumb from '../components/Breadcrumb';
import SectionHeading from '../components/SectionHeading';
import QuickView from '../components/QuickView';
import TrustBadges from '../components/TrustBadges';
import FrequentlyBoughtTogether from '../components/FrequentlyBoughtTogether';
import RecentlyViewed from '../components/RecentlyViewed';
import Button from '../components/Button';
import { LineSkeleton, BlockSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { rupee } from '../lib/format';
import { resolveImageUrl } from '../lib/api';
import { useProduct, useProducts, useProductReviews, useSiteContent } from '../hooks/useStoreData';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { reviewsApi, shippingApi } from '../lib/resources';
import ProductCarousel from '../components/ProductCarousel';
import BadgeIcon from '../components/BadgeIcon';
import { useStore } from '../context/StoreContext';
import { useCompare } from '../context/CompareContext';

const DEFAULT_LENGTHS = [14, 18, 22, 26, 30];
const DEFAULT_COLORS = ['Natural Black', '#1B Natural Black', 'Ombre', 'Custom'];
const TABS = ['Product Details', 'Specifications', 'Shipping', 'Reviews'];

export default function ProductDetail() {
  const { id } = useParams();
  const { product, loading, error, refetch } = useProduct(id);
  const { addToCart, toggleWishlist, isWishlisted, user, showToast, showError } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const [activeImg, setActiveImg] = useState(0);
  const [selLength, setSelLength] = useState(18);
  const [selColor, setSelColor] = useState(undefined);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('Product Details');
  const [selLace, setSelLace] = useState(undefined);
  const [selDensity, setSelDensity] = useState(undefined);
  const [pincode, setPincode] = useState('');
  const [delivery, setDelivery] = useState(null); // { status: 'loading' | 'ok' | 'error', data?, message? }
  const { siteContent } = useSiteContent();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  // Admin-managed variants (length / colour / texture / weight / density) drive the picker
  // when the product has them; otherwise we fall back to the original static option lists.
  const variants = product?.hasVariants ? (product.variants || []) : [];
  const lengthOptions = useMemo(() => {
    const fromVariants = [...new Set(variants.map((v) => v.length).filter(Boolean))];
    return fromVariants.length ? fromVariants : DEFAULT_LENGTHS;
  }, [variants]);
  const colorOptions = useMemo(() => {
    const fromVariants = [...new Set(variants.map((v) => v.colour).filter(Boolean))];
    return fromVariants.length ? fromVariants : DEFAULT_COLORS;
  }, [variants]);

  // Lace type + density: shown as option groups when variants define them, otherwise as the product's own single value.
  const laceOptions = useMemo(() => {
    const fromVariants = [...new Set(variants.map((v) => v.laceType).filter(Boolean))];
    return fromVariants.length ? fromVariants : (product?.laceType ? [product.laceType] : []);
  }, [variants, product?.laceType]);
  const densityOptions = useMemo(() => {
    const fromVariants = [...new Set(variants.map((v) => v.density).filter(Boolean))];
    return fromVariants.length ? fromVariants : (product?.hairDensity ? [product.hairDensity] : []);
  }, [variants, product?.hairDensity]);

  const selectedVariant = variants.find(
    (v) => (!v.length || String(v.length) === String(selLength)) && (!v.colour || v.colour === selColor)
      && (!v.laceType || !selLace || v.laceType === selLace) && (!v.density || !selDensity || v.density === selDensity)
  );

  useEffect(() => {
    if (product) {
      setSelLength(lengthOptions[0] ?? product.length ?? 18);
      setSelColor(colorOptions[0] ?? product.color);
      setSelLace(laceOptions[0]);
      setSelDensity(densityOptions[0]);
      setDelivery(null);
      setActiveImg(0);
      setShowVideo(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const { products: sameCategory } = useProducts(product ? { category: product.category, limit: 8 } : {});
  // "Similar Products": overlap on admin-assigned tags, distinct from same-category "Related Products" below.
  const { products: tagMatches } = useProducts(product?.tags?.length ? { tags: product.tags[0], limit: 8 } : {});
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useProductReviews(product?.id);
  const recentlyViewed = useRecentlyViewed(product);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  if (loading) {
    return (
      <div className="section pdp">
        <div className="container pdp-grid">
          <BlockSkeleton height={560} />
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <LineSkeleton width="60%" height={34} />
            <LineSkeleton width="40%" />
            <LineSkeleton width="30%" height={32} />
            <LineSkeleton width="100%" height={90} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section pdp">
        <div className="container">
          <ErrorState message="This product could not be loaded." onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!product) return <Navigate to="/404" replace />;

  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);
  const similar = tagMatches.filter((p) => p.id !== product.id && !related.find((r) => r.id === p.id)).slice(0, 4);

  // Real product gallery first (admin-uploaded), topped up with related-product imagery only
  // if the catalog entry doesn't have enough images of its own yet.
  const ownGallery = product.gallery?.length
    ? product.gallery.map((g) => (typeof g === 'string' ? g : g.url)).filter(Boolean)
    : product.images || [];
  const thumbImages = [...new Set([product.image, ...ownGallery])].filter(Boolean);
  if (thumbImages.length < 2) thumbImages.push(...related.map((p) => p.image).filter(Boolean));
  // Resolve every image (admin-uploaded paths like "/uploads/xyz.png") into a full URL
  // the browser can actually load.
  const galleryImages = [...new Set(thumbImages)].slice(0, 6).map(resolveImageUrl);

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const effectiveSku = selectedVariant?.sku || product.sku;
  const onSale = product.discountPct > 0;
  const cartItem = { ...product, price: effectivePrice, sku: effectiveSku, length: selLength, color: selColor };
  const whyItems = (siteContent?.whyChooseUs?.items || []).slice(0, 4);
  const alsoLike = [...related, ...similar];
  const specRows = [
    ['Hair type', product.hairType], ['Texture', product.texture || product.hairTexture], ['Lace type', product.laceType],
    ['Density', product.hairDensity], ['Colour', product.color], ['Weight', product.weight && `${product.weight} per bundle`],
    ['Available lengths', lengthOptions.length ? `${lengthOptions.join('", ')}"` : ''], ['SKU', effectiveSku],
  ].filter(([, v]) => v);

  async function checkDelivery(e) {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode)) { setDelivery({ status: 'error', message: 'Enter a valid 6-digit pincode.' }); return; }
    setDelivery({ status: 'loading' });
    try {
      const res = await shippingApi.check(pincode);
      setDelivery({ status: 'ok', data: res.data });
    } catch (err) {
      setDelivery({ status: 'error', message: err.message || 'Could not check this pincode right now.' });
    }
  }

  const highlights = [
    product.hairType && ['Hair type', product.hairType],
    product.texture && ['Texture', product.texture],
    product.weight && ['Weight', `${product.weight} per bundle`],
    effectiveSku && ['SKU', effectiveSku],
  ].filter(Boolean);

  async function submitReview(e) {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to leave a review', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsApi.create({ productId: product.id, rating: reviewForm.rating, comment: reviewForm.comment });
      showToast('Thanks! Your review will appear once approved.');
      setReviewForm({ rating: 5, comment: '' });
      refetchReviews();
    } catch (err) {
      showError(err, 'Could not submit your review');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <>
      <div className="container pdp-crumbs">
        <Breadcrumb light crumbs={[{ label: 'Shop', to: '/shop' }, { label: product.name }]} />
      </div>

      <div className="pdp">
        <div className="container pdp-grid">
          {/* ===================== GALLERY ===================== */}
          <div className="pdp-gallery">
            {(galleryImages.length > 1 || product.video) && (
              <div className="pdp-thumbs" role="group" aria-label="Product images">
                {galleryImages.map((img, i) => (
                  <button
                    key={i} type="button"
                    className={`pdp-thumb ${!showVideo && activeImg === i ? 'is-active' : ''}`}
                    aria-label={`Show image ${i + 1}`} aria-pressed={!showVideo && activeImg === i}
                    onClick={() => { setActiveImg(i); setShowVideo(false); }}
                  >
                    <PhotoBlock tone={['gold', 'brown', 'beige', 'espresso'][i % 4]} ratio="4/5" src={img} alt="" />
                  </button>
                ))}
                {product.video && (
                  <button
                    type="button" className={`pdp-thumb pdp-thumb-video ${showVideo ? 'is-active' : ''}`}
                    onClick={() => setShowVideo(true)} aria-label="Play product video"
                  >
                    <PhotoBlock tone="espresso" ratio="4/5" src={resolveImageUrl(product.image)} alt="" />
                    <span className="pdp-thumb-play"><FiPlay /></span>
                  </button>
                )}
              </div>
            )}

            <div className="pdp-stage">
              {showVideo && product.video ? (
                <div className="pdp-video-frame">
                  <video src={resolveImageUrl(product.video)} controls autoPlay className="pdp-video" />
                  <button type="button" className="btn btn-dark btn-sm pdp-video-close" onClick={() => setShowVideo(false)} aria-label="Back to photos"><FiX /> Photos</button>
                </div>
              ) : (
                <ImageZoom src={galleryImages[activeImg] || resolveImageUrl(product.image)} alt={product.name} tone={product.tone} ratio="4/5" />
              )}
            </div>
          </div>

          {/* ===================== INFO ===================== */}
          <div className="pdp-info">
            {(product.badge || product.saleBadgeText) && (
              <div className="pdp-badges">
                {product.badge && <span className="badge badge-dark">{product.badge}</span>}
                {product.saleBadgeText && <span className="badge badge-sale">{product.saleBadgeText}</span>}
              </div>
            )}
            <h1 className="pdp-title">{product.name}</h1>
            <div className="rating-row pdp-rating">
              <StarRating value={product.rating} size={15} />
              <span>{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="pdp-price price-row">
              <span className="price-now">{rupee(effectivePrice)}</span>
              {onSale && <span className="price-was">{rupee(product.mrp)}</span>}
              {onSale && <span className="badge badge-sale">-{product.discountPct}% off</span>}
            </div>

            {product.description && <p className="pdp-desc">{product.description}</p>}

            {highlights.length > 0 && (
              <dl className="pdp-highlights">
                {highlights.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
              </dl>
            )}

            <fieldset className="pdp-opt">
              <legend>Length</legend>
              <div className="chip-row">
                {lengthOptions.map((l) => (
                  <button key={l} type="button" className="chip" aria-pressed={String(selLength) === String(l)} onClick={() => setSelLength(l)}>{l}"</button>
                ))}
              </div>
            </fieldset>

            {(product.texture || product.hairType) && (
              <fieldset className="pdp-opt">
                <legend>Texture / Hair Type</legend>
                <div className="chip-row">
                  {[product.texture || product.hairTexture, product.hairType].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).map((t) => (
                    <span key={t} className="chip is-active" aria-label={t}>{t}</span>
                  ))}
                </div>
              </fieldset>
            )}

            {laceOptions.length > 0 && (
              <fieldset className="pdp-opt">
                <legend>Lace Type</legend>
                <div className="chip-row">
                  {laceOptions.map((l) => (
                    <button key={l} type="button" className="chip" aria-pressed={selLace === l} onClick={() => setSelLace(l)}>{l}</button>
                  ))}
                </div>
              </fieldset>
            )}

            {densityOptions.length > 0 && (
              <fieldset className="pdp-opt">
                <legend>Density</legend>
                <div className="chip-row">
                  {densityOptions.map((d) => (
                    <button key={d} type="button" className="chip" aria-pressed={selDensity === d} onClick={() => setSelDensity(d)}>{d}</button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="pdp-opt">
              <legend>Colour</legend>
              <div className="chip-row">
                {colorOptions.map((c) => (
                  <button key={c} type="button" className="chip" aria-pressed={selColor === c} onClick={() => setSelColor(c)}>{c}</button>
                ))}
              </div>
            </fieldset>

            <div className="pdp-buy-row">
              <div>
                <span className="pdp-opt-label" id="qty-label">Quantity</span>
                <div className="qty" role="group" aria-labelledby="qty-label">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span className="qty-n" aria-live="polite">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
                </div>
              </div>
              <p className={`pdp-stock ${effectiveStock > 0 ? 'is-in' : 'is-out'}`}>
                {effectiveStock > 0 ? 'In stock. Ships within 24 hours from Delhi.' : 'Currently out of stock'}
              </p>
            </div>

            <div className="pdp-actions">
              <Button size="lg" onClick={() => addToCart(cartItem, qty)}>Add to Cart</Button>
              <Link to="/checkout" className="btn btn-dark btn-lg" onClick={() => addToCart(cartItem, qty)}>Buy Now</Link>
              <button type="button" className="pdp-wish" aria-pressed={isWishlisted(product.id)} onClick={() => toggleWishlist(product)} aria-label="Toggle wishlist">
                <FiHeart size={20} />
              </button>
            </div>

            <label className="check pdp-compare">
              <input type="checkbox" checked={isComparing(product.id)} onChange={() => toggleCompare(product)} />
              Add this to my comparison list
            </label>

            <TrustBadges className="pdp-trust" max={4} />

            <div className="pdp-note pdp-delivery">
              <FiTruck size={20} aria-hidden="true" />
              <div className="pdp-delivery-body">
                <strong>Check Delivery</strong>
                <form className="pdp-pin" onSubmit={checkDelivery}>
                  <label htmlFor="pincode" className="sr-only">Delivery pincode</label>
                  <input id="pincode" className="input" inputMode="numeric" maxLength={6} placeholder="Enter pincode" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} />
                  <Button type="submit" variant="dark" size="sm" loading={delivery?.status === 'loading'}>Check</Button>
                </form>
                <div aria-live="polite">
                  {delivery?.status === 'error' && <p className="pdp-pin-msg is-err">{delivery.message}</p>}
                  {delivery?.status === 'ok' && (delivery.data.serviceable === false ? (
                    <p className="pdp-pin-msg is-err">Sorry, delivery to {delivery.data.pincode} is not available right now.</p>
                  ) : (
                    <p className="pdp-pin-msg">
                      {delivery.data.estimated ? 'Estimated' : 'Expected'} delivery to {delivery.data.pincode}: {delivery.data.minDays}–{delivery.data.maxDays} business days.
                      {delivery.data.estimated && <span className="pdp-pin-note"> This is an estimate; serviceability is confirmed at checkout.</span>}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="pdp-note pdp-bulk">
              <FiShield size={20} aria-hidden="true" />
              <div className="pdp-bulk-body">
                <strong>Bulk and wholesale pricing</strong>
                <p>Buying for your salon or export business? Save more per bundle at higher quantities.</p>
                <table className="pdp-bulk-table">
                  <thead><tr><th scope="col">Quantity</th><th scope="col">Discount</th><th scope="col">Price / bundle</th></tr></thead>
                  <tbody>
                    {[
                      { qty: '1–2 bundles', off: '—', price: effectivePrice },
                      { qty: '3–5 bundles', off: '5% off', price: Math.round(effectivePrice * 0.95) },
                      { qty: '6–10 bundles', off: '10% off', price: Math.round(effectivePrice * 0.9) },
                      { qty: '11+ bundles', off: '15% off', price: Math.round(effectivePrice * 0.85) },
                    ].map((row) => (
                      <tr key={row.qty}><td>{row.qty}</td><td>{row.off}</td><td className="price">{rupee(row.price)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <Link to="/wholesale" className="link-u">Get a wholesale quote</Link>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="container pdp-block">
            <FrequentlyBoughtTogether product={product} pool={related} />
          </div>
        )}

        <div className="container pdp-block">
          <div className="pdp-tabs" role="tablist" aria-label="Product information">
            {TABS.map((t) => (
              <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls="pdp-panel" className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="pdp-panel" id="pdp-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {tab === 'Product Details' && (
              <p>{product.description || `This piece is sourced through our Delhi factory's standard chain: hand-collected, sorted by our artisans for ${(product.texture || '').toLowerCase()} pattern and root direction, then double-drawn for uniform thickness before wefting. Every batch carries a QC signature before it leaves our New Delhi facility.`}</p>
            )}
            {tab === 'Specifications' && (
              <>
                {product.specifications && <p style={{ marginBottom: 20, whiteSpace: 'pre-line' }}>{product.specifications}</p>}
                <dl className="spec-list">
                  {specRows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                </dl>
                {product.careInstructions && (
                  <>
                    <h3 className="pdp-panel-sub">Care instructions</h3>
                    <p>{product.careInstructions}</p>
                  </>
                )}
              </>
            )}
            {tab === 'Shipping' && (
              <p>{product.shippingInfo || 'Ships from our Delhi warehouse within 24 hours. Domestic orders arrive in 3–6 business days; international orders in 6–12 business days depending on customs processing. Bulk and wholesale orders may ship by air freight with a separate timeline confirmed at checkout.'}</p>
            )}
            {tab === 'Reviews' && (
              <div className="reviews">
                <div className="reviews-summary">
                  <span className="reviews-score">{product.rating}</span>
                  <div><StarRating value={product.rating} size={17} /><span>{product.reviews} verified reviews</span></div>
                </div>

                {reviewsLoading ? (
                  <LineSkeleton width="100%" height={60} />
                ) : reviews.length === 0 ? (
                  <p className="reviews-empty">No reviews yet. Be the first to share how this piece wore for you.</p>
                ) : (
                  <ul className="reviews-list">
                    {reviews.map((r) => (
                      <li key={r.id}>
                        <StarRating value={r.rating} size={13} />
                        <p>"{r.comment}"</p>
                        <span>{r.name || 'Verified Buyer'}{r.date ? `, ${r.date}` : ''}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <form className="reviews-form" onSubmit={submitReview}>
                  <h3>Write a review</h3>
                  <div className="chip-row" role="group" aria-label="Rating">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <button type="button" key={n} className="chip" aria-pressed={reviewForm.rating === n} onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}>{n} ★</button>
                    ))}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="review-comment">Your experience</label>
                    <textarea id="review-comment" className="textarea" placeholder="Share your experience with this product…" value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} rows={4} required />
                  </div>
                  <Button type="submit" variant="dark" loading={submittingReview}>{submittingReview ? 'Submitting…' : user ? 'Submit review' : 'Sign in to review'}</Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {whyItems.length > 0 && (
        <section className="section section--tight">
          <div className="container">
            <SectionHeading title="Why choose this?" />
            <ul className="why-row">
              {whyItems.map((it) => (
                <li key={it.title} className="why-card">
                  <span className="why-ico"><BadgeIcon label={`${it.title} ${it.description || ''}`} size={22} /></span>
                  <strong>{it.title}</strong>
                  {it.description && <span>{it.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {alsoLike.length > 0 && (
        <section className="section section--tight">
          <div className="container">
            <SectionHeading title="You may also like" />
            <ProductCarousel products={alsoLike} onQuickView={setQuickViewProduct} label="You may also like" />
          </div>
        </section>
      )}

      <RecentlyViewed items={recentlyViewed} />
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
