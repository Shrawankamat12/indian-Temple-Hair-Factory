import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiX, FiPlay, FiHeart, FiTruck, FiShield, FiShare2, FiCheck, FiMessageCircle, FiRotateCcw,
  FiChevronLeft, FiChevronRight, FiMaximize2, FiImage,
} from 'react-icons/fi';
import { useParams, Link, Navigate } from 'react-router-dom';
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
import Container from '../components/Container';
import Section from '../components/Section';
import QtyStepper from '../components/QtyStepper';
import Badge from '../components/Badge';
import { Check, Textarea, Input } from '../components/Field';
import { btn, cx, chip, linkU } from '../lib/ui';

const DEFAULT_LENGTHS = [14, 18, 22, 26, 30];
const DEFAULT_COLORS = ['Natural Black', '#1B Natural Black', 'Ombre', 'Custom'];
const TABS = ['Product Details', 'Specifications', 'Shipping', 'Reviews'];

// Raised "3D" surfaces and buttons
const RAISED = 'shadow-[0_1px_0_rgb(255_255_255)_inset,0_30px_60px_-34px_rgb(30_20_16/0.38),0_8px_20px_-12px_rgb(30_20_16/0.14)]';
const PRESS = 'shadow-[0_6px_0_-1px_rgb(0_0_0/0.28),0_14px_24px_-10px_rgb(30_20_16/0.45)] transition duration-200 hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-[0_2px_0_-1px_rgb(0_0_0/0.28)]';

/* ------------------------------------------------------------------ */
/* Gallery: 3D tilt + cursor zoom + swipe + fullscreen lightbox        */
/* ------------------------------------------------------------------ */
function Gallery({ images, name, video, poster, badges, wished, onWish }) {
  const [active, setActive] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [failed, setFailed] = useState({});
  const [tilt, setTilt] = useState({ px: 0.5, py: 0.5, on: false });
  const frame = useRef(null);
  const touchX = useRef(null);

  const n = images.length;
  const go = (d) => { setShowVideo(false); setActive((a) => (a + d + n) % n); };
  const src = images[active];
  const broken = !src || failed[src];

  const onMove = (e) => {
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({ px: (e.clientX - r.left) / r.width, py: (e.clientY - r.top) / r.height, on: true });
  };
  const onLeave = () => setTilt({ px: 0.5, py: 0.5, on: false });

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, n]);

  const arrow = 'absolute top-1/2 z-[4] inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-espresso shadow-[0_10px_24px_-10px_rgb(30_20_16/0.5)] backdrop-blur transition hover:bg-espresso hover:text-cream';
  const Placeholder = (
    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[linear-gradient(160deg,#f3e9dc,#e9d9c4)] text-walnut/40">
      <FiImage size={44} aria-hidden="true" />
      <span className="text-[0.78rem] font-semibold">Photo coming soon</span>
    </span>
  );

  return (
    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[84px_minmax(0,1fr)]">
      {/* Thumbnails */}
      {(n > 1 || video) && (
        <div className="order-2 flex gap-2.5 overflow-x-auto p-1 lg:order-none lg:max-h-[640px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img} type="button" aria-label={`Show image ${i + 1}`} aria-pressed={!showVideo && active === i}
              onClick={() => { setActive(i); setShowVideo(false); }}
              className={cx(
                'relative aspect-[4/5] w-16 flex-none overflow-hidden rounded-xl border bg-sand p-0 transition duration-300 lg:w-full',
                !showVideo && active === i
                  ? 'border-brand opacity-100 ring-2 ring-brand/70 shadow-[0_12px_20px_-10px_rgb(30_20_16/0.55)] lg:-translate-x-0.5'
                  : 'border-line opacity-70 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-md',
              )}
            >
              {failed[img] ? <FiImage className="m-auto text-walnut/40" /> : (
                <img src={img} alt="" loading="lazy" className="size-full object-cover" onError={() => setFailed((f) => ({ ...f, [img]: true }))} />
              )}
            </button>
          ))}
          {video && (
            <button
              type="button" onClick={() => setShowVideo(true)} aria-label="Play product video"
              className={cx('relative aspect-[4/5] w-16 flex-none overflow-hidden rounded-xl border bg-espresso p-0 transition lg:w-full', showVideo ? 'border-brand ring-2 ring-brand/70' : 'border-line opacity-80 hover:opacity-100')}
            >
              {poster && <img src={poster} alt="" className="size-full object-cover opacity-60" />}
              <span className="absolute inset-0 flex items-center justify-center text-cream"><FiPlay size={22} /></span>
            </button>
          )}
        </div>
      )}

      {/* Stage */}
      <div className="min-w-0 [perspective:1400px]">
        {showVideo && video ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-espresso shadow-[0_40px_80px_-30px_rgb(30_20_16/0.55)]">
            <video src={video} controls autoPlay className="size-full object-contain" />
            <Button variant="dark" size="sm" className="absolute left-3 top-3" onClick={() => setShowVideo(false)} aria-label="Back to photos"><FiX /> Photos</Button>
          </div>
        ) : (
          <div className="relative">
            {/* floor shadow under the floating frame */}
            <div aria-hidden="true" className="absolute inset-x-[8%] -bottom-5 h-10 rounded-[50%] bg-espresso/25 blur-2xl" />
            <div
              ref={frame}
              onMouseMove={onMove} onMouseLeave={onLeave}
              onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchX.current == null || n < 2) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
                touchX.current = null;
              }}
              style={{
                transform: `rotateX(${(0.5 - tilt.py) * 9}deg) rotateY(${(tilt.px - 0.5) * 9}deg)`,
                transition: tilt.on ? 'transform 90ms linear' : 'transform 600ms cubic-bezier(.2,.8,.2,1)',
                transformStyle: 'preserve-3d',
              }}
              className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/70 bg-sand shadow-[0_45px_80px_-34px_rgb(30_20_16/0.55),0_12px_26px_-14px_rgb(30_20_16/0.25)]"
            >
              {broken ? Placeholder : (
                <img
                  key={src} src={src} alt={name} draggable={false}
                  onError={() => setFailed((f) => ({ ...f, [src]: true }))}
                  style={{ transform: `scale(${tilt.on ? 1.22 : 1})`, transformOrigin: `${tilt.px * 100}% ${tilt.py * 100}%`, transition: tilt.on ? 'transform 200ms ease-out' : 'transform 600ms cubic-bezier(.2,.8,.2,1)' }}
                  className="absolute inset-0 size-full animate-[fadeIn_.4s_ease] object-cover"
                />
              )}

              {/* glossy light that follows the cursor */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{ opacity: tilt.on ? 1 : 0, background: `radial-gradient(420px circle at ${tilt.px * 100}% ${tilt.py * 100}%, rgb(255 255 255 / 0.28), transparent 60%)` }}
              />

              {/* clicking anywhere opens fullscreen */}
              {!broken && (
                <button type="button" onClick={() => setLightbox(true)} aria-label="Open fullscreen" className="absolute inset-0 z-[1] cursor-zoom-in border-0 bg-transparent p-0" />
              )}

              {/* floating layer (pops out in 3D) */}
              <div className="pointer-events-none absolute left-3 top-3 z-[3] flex flex-col items-start gap-1.5" style={{ transform: 'translateZ(40px)' }}>
                {badges}
              </div>
              <button
                type="button" onClick={onWish} aria-pressed={wished} aria-label="Toggle wishlist"
                style={{ transform: 'translateZ(40px)' }}
                className="absolute right-3 top-3 z-[4] inline-flex size-11 items-center justify-center rounded-full bg-white/95 text-espresso shadow-[0_10px_22px_-10px_rgb(30_20_16/0.6)] transition hover:scale-110 aria-pressed:bg-espresso aria-pressed:text-champagne [&[aria-pressed=true]_svg]:fill-current"
              >
                <FiHeart size={19} />
              </button>
              {!broken && (
                <span className="pointer-events-none absolute bottom-3 right-3 z-[3] inline-flex items-center gap-1.5 rounded-full bg-espresso/75 px-3 py-1.5 text-[0.7rem] font-semibold text-cream backdrop-blur" style={{ transform: 'translateZ(30px)' }}>
                  <FiMaximize2 size={12} /> Tap to enlarge
                </span>
              )}
              {n > 1 && (
                <>
                  <button type="button" className={cx(arrow, 'left-3')} onClick={() => go(-1)} aria-label="Previous image"><FiChevronLeft size={20} /></button>
                  <button type="button" className={cx(arrow, 'right-3')} onClick={() => go(1)} aria-label="Next image"><FiChevronRight size={20} /></button>
                  <span className="pointer-events-none absolute bottom-3 left-3 z-[3] rounded-full bg-white/90 px-3 py-1 text-[0.72rem] font-bold tabular-nums text-espresso">{active + 1} / {n}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${name} photos`} onClick={() => setLightbox(false)}>
          <button type="button" aria-label="Close" onClick={() => setLightbox(false)} className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"><FiX size={22} /></button>
          {n > 1 && (
            <>
              <button type="button" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"><FiChevronLeft size={24} /></button>
              <button type="button" aria-label="Next image" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"><FiChevronRight size={24} /></button>
            </>
          )}
          {src && <img src={src} alt={name} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl" />}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 text-[0.78rem] font-semibold tabular-nums text-white">{active + 1} / {n}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function ProductDetail() {
  const { id } = useParams();
  const { product, loading, error, refetch } = useProduct(id);
  const { addToCart, toggleWishlist, isWishlisted, user, showToast, showError } = useStore();
  const { toggleCompare, isComparing } = useCompare();
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
      <Section className="pb-6">
        <Container className="grid gap-[clamp(28px,5vw,72px)] lg:grid-cols-[1.05fr_.95fr]">
          <BlockSkeleton height={560} />
          <div className="grid content-start gap-3.5">
            <LineSkeleton width="60%" height={34} />
            <LineSkeleton width="40%" />
            <LineSkeleton width="30%" height={32} />
            <LineSkeleton width="100%" height={90} />
          </div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="pb-6">
        <Container>
          <ErrorState message="This product could not be loaded." onRetry={refetch} />
        </Container>
      </Section>
    );
  }

  if (!product) return <Navigate to="/404" replace />;

  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);
  const similar = tagMatches.filter((p) => p.id !== product.id && !related.find((r) => r.id === p.id)).slice(0, 4);

  // Only this product's own photos (main image + gallery + images[]). Other products' photos are
  // no longer mixed in, so the gallery never shows a different product.
  const ownGallery = product.gallery?.length
    ? product.gallery.map((g) => (typeof g === 'string' ? g : g.url)).filter(Boolean)
    : [];
  const galleryImages = [...new Set([product.image, ...ownGallery, ...(product.images || [])])]
    .filter(Boolean).slice(0, 8).map(resolveImageUrl);

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const effectiveSku = selectedVariant?.sku || product.sku;
  const onSale = product.discountPct > 0;
  const cartItem = { ...product, price: effectivePrice, sku: effectiveSku, length: selLength, color: selColor };
  const whyItems = (siteContent?.whyChooseUs?.items || []).slice(0, 4);
  const alsoLike = [...related, ...similar];
  const saving = onSale && product.mrp > effectivePrice ? product.mrp - effectivePrice : 0;
  const lowStock = effectiveStock > 0 && effectiveStock <= 5;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`${product.name} ${pageUrl}`)}`;
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      showToast('Link copied');
    } catch { /* clipboard blocked */ }
  }
  const crumbs = [
    { label: 'Shop', to: '/shop' },
    ...(product.category && product.categoryName ? [{ label: product.categoryName, to: `/shop?category=${product.category}` }] : []),
    { label: product.name },
  ];
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

  const lbl = 'mb-2.5 block p-0 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-espresso';
  const noteBox = cx('mt-4 flex gap-3.5 rounded-2xl border border-line bg-white px-5 py-[18px]', 'shadow-[0_14px_28px_-22px_rgb(30_20_16/0.35)]');
  const tabBtn = 'relative whitespace-nowrap px-0.5 py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 hover:text-espresso aria-selected:text-brand aria-selected:after:scale-x-100';

  const imageBadges = (
    <>
      {product.badge && <Badge kind="dark">{product.badge}</Badge>}
      {product.saleBadgeText && <Badge kind="sale">{product.saleBadgeText}</Badge>}
      {onSale && !product.saleBadgeText && <Badge kind="sale">-{product.discountPct}%</Badge>}
    </>
  );

  return (
    <>
      <div className="bg-[radial-gradient(900px_520px_at_85%_-8%,rgb(200_154_61/0.13),transparent_65%),radial-gradient(700px_420px_at_0%_30%,rgb(107_62_34/0.06),transparent_60%)]">
        <Container className="pt-5"><Breadcrumb light className="mb-0" crumbs={crumbs} /></Container>

        <div className="pb-24 lg:pb-6">
          <Container className="grid items-start gap-[clamp(28px,5vw,64px)] pb-14 pt-6 lg:grid-cols-[1.05fr_.95fr]">
            {/* ===================== GALLERY ===================== */}
            <div className="min-w-0 lg:sticky lg:top-[calc(var(--navbar-h,72px)+20px)]">
              <Gallery
                key={product.id}
                images={galleryImages}
                name={product.name}
                video={product.video ? resolveImageUrl(product.video) : null}
                poster={galleryImages[0]}
                badges={imageBadges}
                wished={isWishlisted(product.id)}
                onWish={() => toggleWishlist(product)}
              />
            </div>

            {/* ===================== INFO ===================== */}
            <div className="min-w-0">
              <div className={cx('rounded-3xl border border-line bg-white/90 p-5 backdrop-blur sm:p-8', RAISED)}>
                {(product.badge || product.saleBadgeText) && (
                  <div className="mb-3.5 flex gap-2">
                    {product.badge && <Badge kind="dark">{product.badge}</Badge>}
                    {product.saleBadgeText && <Badge kind="sale">{product.saleBadgeText}</Badge>}
                  </div>
                )}
                <h1 className="text-[clamp(1.6rem,2.8vw,2.3rem)] leading-[1.1]">{product.name}</h1>
                <div className="mt-3 inline-flex items-center gap-2 text-[0.8rem] text-muted">
                  <StarRating value={product.rating} size={15} />
                  <span>{product.rating} ({product.reviews} reviews)</span>
                </div>

                <div className="mt-5 flex flex-wrap items-baseline gap-x-3.5 gap-y-2 rounded-2xl bg-[linear-gradient(135deg,#fbf5ea,#f5e9d6)] px-5 py-4">
                  <span className="font-sans text-[2rem] font-bold tabular-nums tracking-tight text-espresso">{rupee(effectivePrice)}</span>
                  {onSale && <span className="text-[1.05rem] tabular-nums text-muted line-through">{rupee(product.mrp)}</span>}
                  {onSale && <Badge kind="sale">-{product.discountPct}% off</Badge>}
                  {saving > 0 && <span className="text-[0.85rem] font-semibold text-ok">You save {rupee(saving)}</span>}
                  <span className="basis-full text-[0.78rem] text-muted">Inclusive of all taxes. Free shipping on orders above ₹15,000.</span>
                </div>

                {product.description && <p className="mt-5 max-w-[56ch] text-muted">{product.description}</p>}

                {highlights.length > 0 && (
                  <dl className="m-0 mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {highlights.map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-line bg-sand/50 px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_24px_-16px_rgb(30_20_16/0.4)]">
                        <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted">{k}</dt>
                        <dd className="m-0 mt-0.5 font-medium text-espresso">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <fieldset className="m-0 mt-[22px] min-w-0 border-0 p-0">
                  <legend className={lbl}>Length</legend>
                  <div className="flex flex-wrap gap-2">
                    {lengthOptions.map((l) => (
                      <button key={l} type="button" className={chip} aria-pressed={String(selLength) === String(l)} onClick={() => setSelLength(l)}>{l}"</button>
                    ))}
                  </div>
                </fieldset>

                {(product.texture || product.hairType) && (
                  <fieldset className="m-0 mt-[18px] min-w-0 border-0 p-0">
                    <legend className={lbl}>Texture / Hair Type</legend>
                    <div className="flex flex-wrap gap-2">
                      {[product.texture || product.hairTexture, product.hairType].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).map((t) => (
                        <span key={t} className={cx(chip, 'border-espresso bg-espresso text-cream')} aria-label={t}>{t}</span>
                      ))}
                    </div>
                  </fieldset>
                )}

                {laceOptions.length > 0 && (
                  <fieldset className="m-0 mt-[18px] min-w-0 border-0 p-0">
                    <legend className={lbl}>Lace Type</legend>
                    <div className="flex flex-wrap gap-2">
                      {laceOptions.map((l) => (
                        <button key={l} type="button" className={chip} aria-pressed={selLace === l} onClick={() => setSelLace(l)}>{l}</button>
                      ))}
                    </div>
                  </fieldset>
                )}

                {densityOptions.length > 0 && (
                  <fieldset className="m-0 mt-[18px] min-w-0 border-0 p-0">
                    <legend className={lbl}>Density</legend>
                    <div className="flex flex-wrap gap-2">
                      {densityOptions.map((d) => (
                        <button key={d} type="button" className={chip} aria-pressed={selDensity === d} onClick={() => setSelDensity(d)}>{d}</button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <fieldset className="m-0 mt-[18px] min-w-0 border-0 p-0">
                  <legend className={lbl}>Colour</legend>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((c) => (
                      <button key={c} type="button" className={chip} aria-pressed={selColor === c} onClick={() => setSelColor(c)}>{c}</button>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-[26px] flex flex-wrap items-end gap-x-7 gap-y-4">
                  <div>
                    <span className={lbl} id="qty-label">Quantity</span>
                    <QtyStepper value={qty} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => q + 1)} />
                  </div>
                  <p className={cx('m-0 mb-2.5 text-[0.88rem] font-semibold', effectiveStock > 0 ? 'text-ok' : 'text-sale')}>
                    {effectiveStock > 0 ? 'In stock. Ships within 24 hours from Delhi.' : 'Currently out of stock'}
                    {lowStock && <span className="ml-2 rounded-sm bg-sale-soft px-2 py-0.5 text-[0.74rem] text-sale">Only {effectiveStock} left</span>}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3.5 pb-1.5">
                  <Button size="lg" className={cx('flex-[1_1_150px]', PRESS)} onClick={() => addToCart(cartItem, qty)}>Add to Cart</Button>
                  <Link to="/checkout" className={cx(btn('dark', 'lg', 'flex-[1_1_150px]'), PRESS)} onClick={() => addToCart(cartItem, qty)}>Buy Now</Link>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                  <Check className="text-muted" checked={isComparing(product.id)} onChange={() => toggleCompare(product)}>Add this to my comparison list</Check>
                  <div className="flex items-center gap-2 text-[0.8rem] text-muted">
                    <FiShare2 size={15} aria-hidden="true" /> Share
                    <a href={whatsappShare} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="inline-flex size-8 items-center justify-center rounded-full border border-line-strong text-walnut transition hover:-translate-y-0.5 hover:bg-walnut hover:text-white"><FiMessageCircle size={15} /></a>
                    <button type="button" onClick={copyLink} aria-label="Copy link" className="inline-flex size-8 items-center justify-center rounded-full border border-line-strong text-walnut transition hover:-translate-y-0.5 hover:bg-walnut hover:text-white"><FiCheck size={15} /></button>
                  </div>
                </div>

                <TrustBadges className="mt-[22px] justify-start border-y border-line py-4 sm:justify-start" max={4} />
              </div>

              <div className={noteBox}>
                <FiTruck size={20} aria-hidden="true" className="mt-0.5 flex-none text-gold" />
                <div className="min-w-0 flex-1">
                  <strong className="mb-1 block text-espresso">Check Delivery</strong>
                  <form className="mt-2.5 flex max-w-80 gap-2" onSubmit={checkDelivery}>
                    <label htmlFor="pincode" className="sr-only">Delivery pincode</label>
                    <Input id="pincode" className="min-h-[38px] px-3 py-1.5" inputMode="numeric" maxLength={6} placeholder="Enter pincode" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} />
                    <Button type="submit" variant="dark" size="sm" loading={delivery?.status === 'loading'}>Check</Button>
                  </form>
                  <div aria-live="polite">
                    {delivery?.status === 'error' && <p className="mt-2.5 text-[0.86rem] text-sale">{delivery.message}</p>}
                    {delivery?.status === 'ok' && (delivery.data.serviceable === false ? (
                      <p className="mt-2.5 text-[0.86rem] text-sale">Sorry, delivery to {delivery.data.pincode} is not available right now.</p>
                    ) : (
                      <p className="mt-2.5 text-[0.86rem] text-ok">
                        {delivery.data.estimated ? 'Estimated' : 'Expected'} delivery to {delivery.data.pincode}: {delivery.data.minDays}–{delivery.data.maxDays} business days.
                        {delivery.data.estimated && <span className="mt-0.5 block text-[0.78rem] text-muted"> This is an estimate; serviceability is confirmed at checkout.</span>}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className={noteBox}>
                <FiRotateCcw size={20} aria-hidden="true" className="mt-0.5 flex-none text-gold" />
                <div>
                  <strong className="mb-1 block text-espresso">Easy 7-day returns</strong>
                  <p className="m-0 text-[0.9rem] text-muted">Unused, unwashed hair in its original packaging can be returned within 7 days of delivery. <Link to="/policy/returns" className="font-semibold text-walnut underline underline-offset-2">Read the return policy</Link></p>
                </div>
              </div>

              <div className={noteBox}>
                <FiShield size={20} aria-hidden="true" className="mt-0.5 flex-none text-gold" />
                <div className="min-w-0 flex-1">
                  <strong className="mb-1 block text-espresso">Bulk and wholesale pricing</strong>
                  <p className="mb-3.5 text-[0.9rem] text-muted">Buying for your salon or export business? Save more per bundle at higher quantities.</p>
                  <table className="mb-3.5 w-full border-collapse text-[0.86rem]">
                    <thead>
                      <tr className="[&_th]:border-b [&_th]:border-espresso [&_th]:px-1.5 [&_th]:py-2 [&_th]:text-left [&_th]:text-[0.7rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-muted">
                        <th scope="col">Quantity</th><th scope="col">Discount</th><th scope="col">Price / bundle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { qty: '1–2 bundles', off: '—', price: effectivePrice },
                        { qty: '3–5 bundles', off: '5% off', price: Math.round(effectivePrice * 0.95) },
                        { qty: '6–10 bundles', off: '10% off', price: Math.round(effectivePrice * 0.9) },
                        { qty: '11+ bundles', off: '15% off', price: Math.round(effectivePrice * 0.85) },
                      ].map((row) => (
                        <tr key={row.qty} className="[&_td]:border-b [&_td]:border-line [&_td]:px-1.5 [&_td]:py-[9px] [&_td:nth-child(2)]:font-semibold [&_td:nth-child(2)]:text-ok">
                          <td>{row.qty}</td><td>{row.off}</td><td className="tabular-nums">{rupee(row.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Link to="/wholesale" className={linkU}>Get a wholesale quote</Link>
                </div>
              </div>
            </div>
          </Container>

          {related.length > 0 && (
            <Container className="mb-[clamp(36px,5vw,64px)]">
              <FrequentlyBoughtTogether product={product} pool={related} />
            </Container>
          )}

          <Container className="mb-[clamp(36px,5vw,64px)]">
            <div className={cx('rounded-3xl border border-line bg-white px-5 pb-8 sm:px-8', RAISED)}>
              <div className="flex gap-[clamp(18px,4vw,44px)] overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Product information">
                {TABS.map((t) => (
                  <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls="pdp-panel" className={tabBtn} onClick={() => setTab(t)}>{t}</button>
                ))}
              </div>
              <div className="max-w-[800px] pt-8" id="pdp-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
                {tab === 'Product Details' && (
                  <p className="text-ink">{product.description || `This piece is sourced through our Delhi factory's standard chain: hand-collected, sorted by our artisans for ${(product.texture || '').toLowerCase()} pattern and root direction, then double-drawn for uniform thickness before wefting. Every batch carries a QC signature before it leaves our New Delhi facility.`}</p>
                )}
                {tab === 'Specifications' && (
                  <>
                    {product.specifications && <p className="mb-5 whitespace-pre-line text-ink">{product.specifications}</p>}
                    <dl className="m-0 border-t border-line">
                      {specRows.map(([k, v]) => (
                        <div key={k} className="grid gap-0.5 border-b border-line py-[13px] sm:grid-cols-[200px_1fr] sm:gap-4">
                          <dt className="text-[0.9rem] text-muted">{k}</dt><dd className="m-0 font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {product.careInstructions && (
                      <>
                        <h3 className="mt-[26px] text-[1.15rem]">Care instructions</h3>
                        <p className="text-ink">{product.careInstructions}</p>
                      </>
                    )}
                  </>
                )}
                {tab === 'Shipping' && (
                  <div className="grid gap-4">
                    <p className="text-ink">{product.shippingInfo || 'Ships from our Delhi warehouse within 24 hours. Domestic orders arrive in 3–6 business days; international orders in 6–12 business days depending on customs processing. Bulk and wholesale orders may ship by air freight with a separate timeline confirmed at checkout.'}</p>
                    {product.returnPolicy && <p className="text-muted"><strong className="text-espresso">Returns:</strong> {product.returnPolicy}</p>}
                  </div>
                )}
                {tab === 'Reviews' && (
                  <div>
                    <div className="flex items-center gap-[18px] pb-6">
                      <span className="font-display text-[3.4rem] leading-none text-espresso">{product.rating}</span>
                      <div><StarRating value={product.rating} size={17} /><span className="mt-1 block text-[0.85rem] text-muted">{product.reviews} verified reviews</span></div>
                    </div>

                    {reviewsLoading ? (
                      <LineSkeleton width="100%" height={60} />
                    ) : reviews.length === 0 ? (
                      <p className="text-muted">No reviews yet. Be the first to share how this piece wore for you.</p>
                    ) : (
                      <ul className="m-0 list-none p-0">
                        {reviews.map((r) => (
                          <li key={r.id} className="border-t border-line py-[18px]">
                            <StarRating value={r.rating} size={13} />
                            <p className="my-2 text-ink">"{r.comment}"</p>
                            <span className="text-[0.82rem] text-muted">{r.name || 'Verified Buyer'}{r.date ? `, ${r.date}` : ''}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form className="mt-8 grid max-w-[560px] gap-4 rounded-2xl border border-line bg-sand/40 p-7" onSubmit={submitReview}>
                      <h3 className="text-[1.25rem]">Write a review</h3>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Rating">
                        {[5, 4, 3, 2, 1].map((n) => (
                          <button type="button" key={n} className={chip} aria-pressed={reviewForm.rating === n} onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}>{n} ★</button>
                        ))}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.8rem] font-semibold text-espresso" htmlFor="review-comment">Your experience</label>
                        <Textarea id="review-comment" placeholder="Share your experience with this product…" value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} rows={4} required />
                      </div>
                      <Button type="submit" variant="dark" loading={submittingReview}>{submittingReview ? 'Submitting…' : user ? 'Submit review' : 'Sign in to review'}</Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>
      </div>

      {whyItems.length > 0 && (
        <Section tight>
          <Container>
            <SectionHeading title="Why choose this?" />
            <ul className="m-0 grid list-none grid-cols-2 gap-3.5 p-0 lg:grid-cols-4">
              {whyItems.map((it) => (
                <li key={it.title} className="flex flex-col items-start gap-1.5 rounded-2xl border border-line bg-white p-[18px] text-[0.84rem] text-muted transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_34px_-22px_rgb(30_20_16/0.45)]">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-sand text-brand"><BadgeIcon label={`${it.title} ${it.description || ''}`} size={22} /></span>
                  <strong className="text-[0.92rem] text-espresso">{it.title}</strong>
                  {it.description && <span>{it.description}</span>}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {alsoLike.length > 0 && (
        <Section tight>
          <Container>
            <SectionHeading title="You may also like" />
            <ProductCarousel products={alsoLike} onQuickView={setQuickViewProduct} label="You may also like" />
          </Container>
        </Section>
      )}

      <RecentlyViewed items={recentlyViewed} />
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-line bg-white/95 py-2.5 pl-4 pr-[84px] shadow-[0_-10px_30px_-18px_rgb(30_20_16/0.35)] backdrop-blur lg:hidden">
        <div className="min-w-0">
          <div className="font-sans text-lg font-bold tabular-nums leading-tight text-espresso">{rupee(effectivePrice)}</div>
          {onSale && <div className="text-[0.74rem] tabular-nums text-muted line-through">{rupee(product.mrp)}</div>}
        </div>
        <Button className="flex-1" onClick={() => addToCart(cartItem, qty)}>Add to Cart</Button>
      </div>
    </>
  );
}