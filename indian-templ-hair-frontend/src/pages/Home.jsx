import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiCopy } from 'react-icons/fi';
import ProductCarousel from '../components/ProductCarousel';
import TrustBadges from '../components/TrustBadges';
import HeroSlider from '../components/HeroSlider';
import PromoTile from '../components/PromoTiles';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import StarRating from '../components/StarRating';
import BadgeIcon from '../components/BadgeIcon';
import Container from '../components/Container';
import CountdownTimer from '../components/CountdownTimer';
import { btn, cx, eyebrow, eyebrowGold } from '../lib/ui';
import NewsletterForm from '../components/NewsletterForm';
import RecentlyViewed from '../components/RecentlyViewed';
import QuickView from '../components/QuickView';
import { useRecentlyViewedList } from '../hooks/useRecentlyViewed';
import { imageOr, isExternal, isRealImage } from '../lib/media';
import { topLevelCategories } from '../lib/categories';
import {
  useCategories, useProductsByBadge, useProductsByFlag, useTestimonials, useSiteContent,
  useCompanyInfo, useBanners, useAttributes, useBlogs,
} from '../hooks/useStoreData';

// ---- Bundled photos: FALLBACKS ONLY (used when the admin has not uploaded an image for the slot) ----
import heroModel from '../assets/photos/hero-model.jpg';
import factorySorting from '../assets/photos/factory-sorting.jpg';
import factoryWefting from '../assets/photos/factory-wefting.jpg';
import catBulk from '../assets/photos/cat-bulk.jpg';
import catBlonde from '../assets/photos/cat-blonde.jpg';
import catRaw from '../assets/photos/cat-rawbundles.jpg';
import catWigs from '../assets/photos/cat-wigs.jpg';
import wigShelf from '../assets/photos/wig-shelf.jpg';
import insta3 from '../assets/photos/insta-3.jpg';
import insta4 from '../assets/photos/insta-4.jpg';
import insta5 from '../assets/photos/insta-5.jpg';
import insta6 from '../assets/photos/insta-6.jpg';
import pStraight from '../assets/photos/p-kirti-straight.jpg';
import pBody from '../assets/photos/p-delhi-bodywave.jpg';
import pWavy from '../assets/photos/p-tara-wavywig.jpg';
import pTemple from '../assets/photos/p-temple-wavy.jpg';
import pCurly from '../assets/photos/p-nisha-curlywig.jpg';
import pKinky from '../assets/photos/p-chandni-kinky.jpg';
import blogCare from '../assets/photos/blog-carecare.jpg';
import blogRemy from '../assets/photos/blog-remyvirgin.jpg';
import blogClosures from '../assets/photos/blog-closures.jpg';
import blogBlonde from '../assets/photos/blog-blonde.jpg';
import blogBulk from '../assets/photos/blog-bulkimport.jpg';

const FALLBACK_INSTAGRAM = [insta3, insta4, insta5, insta6, catRaw, catBlonde];
const FALLBACK_BLOG = [blogCare, blogRemy, blogClosures, blogBlonde, blogBulk];
const FALLBACK_OFFER = [catRaw, catBlonde, catBulk, catWigs];
const FALLBACK_SEASONAL = [pStraight, pBody, pWavy, pCurly];
const FALLBACK_SPECIAL = [catWigs, catBulk, catRaw, catBlonde];

// ---- Section rhythm: one spacing scale + alternating backgrounds so the page reads in clear bands ----
const BAND = 'py-10 sm:py-14 lg:py-[72px]'; // content sections
const BAND_SM = 'py-6 sm:py-8 lg:py-10'; // promo strips and banners
const BAND_WHITE = cx(BAND, 'border-y border-line bg-white'); // light alternate band
const BAND_SAND = cx(BAND, 'bg-sand/60'); // soft alternate band

// Keyword → bundled photo, matched against the admin-entered name.
const categoryFallback = (c) => {
  const k = `${c.slug} ${c.name}`.toLowerCase();
  if (/wig|topper/.test(k)) return catWigs;
  if (/blonde/.test(k)) return catBlonde;
  if (/bulk/.test(k)) return catBulk;
  if (/closure|frontal/.test(k)) return factorySorting;
  if (/extension/.test(k)) return factoryWefting;
  if (/raw|bundle|temple/.test(k)) return catRaw;
  return null;
};
const textureFallback = (name = '') => {
  const k = name.toLowerCase();
  if (/kinky/.test(k)) return pKinky;
  if (/water/.test(k)) return pTemple;
  if (/deep/.test(k)) return pWavy;
  if (/body/.test(k)) return pBody;
  if (/curl/.test(k)) return pCurly;
  if (/straight/.test(k)) return pStraight;
  return null;
};

// Default section order (mockup). Sections that have an entry in Website Content → Home Sections
// follow the admin's order/enabled flags; the rest keep their default slot and are always on.
const SECTION_ORDER = [
  'categories', 'textures', 'midBanner', 'flashSale', 'bestSellers', 'newArrivals', 'offerCards', 'whyUs', 'process',
  'seasonalOffers', 'specialOffers', 'beforeAfter', 'careGuide', 'testimonials', 'exportBand', 'instagram',
];

function orderSections(homeSections = []) {
  const flags = new Map(homeSections.map((s) => [s.key, s]));
  const slots = SECTION_ORDER.map((k, idx) => (flags.has(k) ? idx : -1)).filter((idx) => idx >= 0);
  const flagged = SECTION_ORDER.filter((k) => flags.has(k)).sort((a, b) => (flags.get(a).order ?? 0) - (flags.get(b).order ?? 0));
  const out = [...SECTION_ORDER];
  slots.forEach((slot, n) => { out[slot] = flagged[n]; });
  return { keys: out, enabled: (k) => flags.get(k)?.enabled !== false };
}

function mergeShelf(flagList = [], badgeList = []) {
  const seen = new Set(flagList.map((p) => p.id));
  return [...flagList, ...badgeList.filter((p) => !seen.has(p.id))];
}

function TileAnchor({ to, className, children }) {
  if (!to) return <div className={className}>{children}</div>;
  return isExternal(to) ? <a href={to} className={className}>{children}</a> : <Link to={to} className={className}>{children}</Link>;
}

/** Wide welcome-offer banner: big discount, copy-able code, one CTA. */
function CouponBanner({ coupon, image }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: the code stays visible to copy by hand */ }
  };
  return (
    <div className="on-dark relative isolate grid items-center gap-[clamp(24px,5vw,72px)] overflow-hidden rounded-2xl bg-espresso p-[clamp(26px,5vw,60px)] text-cream shadow-deep md:grid-cols-[1.25fr_.75fr]">
      <img className="absolute inset-0 -z-20 size-full object-cover opacity-55" src={image} alt="" loading="lazy" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(20_12_9/0.96)_0%,rgb(20_12_9/0.78)_55%,rgb(20_12_9/0.45)_100%)]" />
      <div className="pointer-events-none absolute -right-[120px] -top-40 -z-10 size-[420px] rounded-full border border-champagne/25" />
      <div>
        {coupon.eyebrow && (
          <span className="mb-3.5 inline-block rounded-full bg-champagne px-3.5 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-espresso">{coupon.eyebrow}</span>
        )}
        <h3 className="max-w-[18ch] text-[clamp(1.9rem,4vw,3.2rem)] leading-[1.08] text-cream">
          {coupon.discountText && <span className="text-champagne">{coupon.discountText}</span>} {coupon.title}
        </h3>
      </div>
      <div className="flex flex-col items-start gap-[18px]">
        {coupon.code && (
          <div className="flex flex-wrap items-center gap-3.5 rounded-[14px] border-[1.5px] border-dashed border-champagne bg-cream/[0.07] py-3 pl-5 pr-3">
            <span className="text-[0.72rem] uppercase tracking-[0.14em] text-cream/75">Use code</span>
            <b className="font-display text-2xl font-normal tracking-[0.14em] text-champagne">{coupon.code}</b>
            <button
              type="button" onClick={copy} aria-label={`Copy code ${coupon.code}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-cream px-3.5 text-[0.78rem] font-bold text-espresso transition-colors hover:bg-champagne"
            >
              {copied ? <><FiCheck size={14} /> Copied</> : <><FiCopy size={14} /> Copy</>}
            </button>
          </div>
        )}
        {coupon.ctaText && <TileAnchor to={coupon.ctaLink || '/shop'} className={btn('primary', 'lg')}>{coupon.ctaText} <FiArrowRight size={16} /></TileAnchor>}
      </div>
    </div>
  );
}

export default function Home() {
  const { siteContent: sc, loading: scLoading } = useSiteContent();
  const { company } = useCompanyInfo();
  const { categories } = useCategories();
  const { attributes: textures } = useAttributes('hairTexture');
  const { banners: heroBanners } = useBanners('home-hero');
  const { banners: midBanners } = useBanners('home-mid');
  const { banners: offerBanners } = useBanners('offer-card');
  const { banners: seasonalBanners } = useBanners('seasonal-offer');
  const { banners: tryOnBanners } = useBanners('home-strip');
  const { blogs } = useBlogs();
  const { testimonials } = useTestimonials();

  const { products: bestSellerFlag } = useProductsByFlag('bestSeller');
  const { products: bestSellerBadge } = useProductsByBadge('Bestseller');
  const bestSellers = mergeShelf(bestSellerFlag, bestSellerBadge);
  const { products: newArrivals } = useProductsByFlag('newArrival', 10);
  const { products: flashSaleProducts } = useProductsByFlag('flashSale', 10);

  const recentlyViewed = useRecentlyViewedList();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { keys, enabled } = orderSections(sc?.homeSections);

  // ---------------- HERO: only what the admin has configured ----------------
  // Slide 1 = Website Content → Hero Banner. More slides = Banners with placement "home-hero".
  // Nothing is invented: with one configured slide the hero shows one slide (no arrows / dots).
  const hero = sc?.hero || {};
  const slides = [];
  if (hero.title || hero.image) {
    slides.push({
      key: 'hero',
      eyebrow: hero.eyebrow,
      title: hero.title,
      highlight: hero.highlightText,
      subtitle: hero.subtitle,
      image: imageOr(hero.image, heroModel),
      flip: !isRealImage(hero.image), // bundled model photo faces left; flip so she sits on the right of the copy
      alt: hero.title || '',
      primary: hero.primaryCtaText ? { text: hero.primaryCtaText, link: hero.primaryCtaLink || '/shop' } : null,
      secondary: hero.secondaryCtaText ? { text: hero.secondaryCtaText, link: hero.secondaryCtaLink || '/about' } : null,
      stats: (hero.stats || []).filter((st) => st?.value && st?.label).slice(0, 3),
    });
  }
  heroBanners.filter((b) => imageOr(b.img)).forEach((b) => {
    slides.push({
      key: `b-${b.id}`, title: b.title, subtitle: b.subtitle, image: imageOr(b.img), alt: b.title || '',
      primary: b.ctaText ? { text: b.ctaText, link: b.ctaLink || '/shop' } : null,
    });
  });

  // ---------------- data for sections ----------------
  const shopCategories = [...topLevelCategories(categories)]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)
    .slice(0, 6);
  const textureTiles = textures.filter((t) => t.status !== false);

  const promoCards = offerBanners.slice(0, 3);
  const specialBanners = offerBanners.slice(3);
  const seasonal = seasonalBanners.slice(0, 4);
  const coupon = sc?.couponBanner;
  const showCoupon = coupon?.enabled && (coupon.code || coupon.title);

  const beforeAfter = (sc?.beforeAfter || []).filter((b) => b.beforeImage && b.afterImage);
  const tryOn = tryOnBanners[0];
  const guides = blogs.slice(0, 5);

  const instaImages = sc?.instagram?.images?.length ? sc.instagram.images.map((img) => imageOr(img)).filter(Boolean) : FALLBACK_INSTAGRAM;
  const instaUrl = company.socialLinks?.instagram;
  const news = sc?.newsletterSection || {};
  const why = sc?.whyChooseUs || {};
  const processSteps = (sc?.processSteps || []).filter((st) => st?.step);
  const certifications = (sc?.certifications || []).filter(Boolean);
  const exportCountries = (sc?.exportCountries || []).filter(Boolean);
  const processPhotos = (sc?.factoryGallery?.images || []).filter((g) => g?.image).slice(0, 3);
  const whyItems = (why.items || []).filter((it) => it?.title).slice(0, 6);

  const sections = {
    categories: shopCategories.length > 0 && (
      <Reveal as="section" className={BAND}>
        <Container>
          <SectionHeading title="Shop by Category" rule action={{ to: '/shop', label: 'View all' }} />
          <div className="flex flex-wrap justify-center gap-x-[clamp(20px,4vw,56px)] gap-y-6">
            {shopCategories.map((c) => {
              const img = imageOr(c.image || c.img, categoryFallback(c));
              return (
                <Link key={c.slug} to={`/shop?category=${c.slug}`} className="group w-[clamp(96px,26vw,148px)] text-center">
                  {/* ring + image that fills the whole circle */}
                  <span className="mx-auto block aspect-square rounded-full border border-line bg-white p-1.5 transition duration-300 group-hover:border-brand group-hover:shadow-[0_10px_24px_-12px_rgb(30_20_16/0.45)]">
                    <span className="relative block size-full overflow-hidden rounded-full bg-[linear-gradient(135deg,#3a2618,#6b3e22)]">
                      {img
                        ? <img src={img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[800ms] ease-soft group-hover:scale-[1.08]" />
                        : <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-display text-4xl text-champagne/60">{c.name.charAt(0)}</span>}
                    </span>
                  </span>
                  <span className="mt-3 block text-[0.9rem] font-semibold leading-snug text-espresso transition-colors group-hover:text-brand">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Reveal>
    ),

    textures: textureTiles.length > 0 && (
      <Reveal as="section" className="pb-10 sm:pb-14 lg:pb-[72px]">
        <Container>
          <SectionHeading title="Shop by Texture" sub="Pick the wave, curl or straight that suits you." rule action={{ to: '/shop', label: 'View all' }} />
          <div className="flex gap-[clamp(14px,3vw,40px)] overflow-x-auto px-0.5 pb-2.5 pt-1 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden">
            {textureTiles.map((t) => {
              const img = imageOr(t.image, textureFallback(t.name));
              return (
                <Link key={t.id} to={`/shop?texture=${encodeURIComponent(t.name)}`} className="group w-[clamp(84px,12vw,128px)] flex-none text-center">
                  <span className="relative block aspect-square overflow-hidden rounded-full border border-line bg-sand transition duration-300 group-hover:border-brand group-hover:shadow-[0_8px_22px_-12px_rgb(30_20_16/0.4)]">
                    {img
                      ? <img src={img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[800ms] ease-soft group-hover:scale-[1.07]" />
                      : <span className="absolute inset-0 flex items-center justify-center font-display text-3xl text-walnut">{t.name.charAt(0)}</span>}
                  </span>
                  <span className="mt-2.5 block text-[0.84rem] font-semibold text-espresso transition-colors group-hover:text-brand">{t.name}</span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Reveal>
    ),

    midBanner: midBanners[0] && (
      <Reveal as="section" className={BAND_SM}>
        <Container><PromoTile banner={midBanners[0]} fallback={wigShelf} variant="mid" /></Container>
      </Reveal>
    ),

    flashSale: flashSaleProducts.length > 0 && (
      <Reveal as="section" className={cx('on-dark relative overflow-hidden bg-[linear-gradient(120deg,#1e1410,#3a2618)] text-cream', BAND)}>
        <div className="pointer-events-none absolute -right-20 -top-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgb(200_154_61/0.25),transparent_65%)]" />
        <Container className="relative">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className={cx(eyebrowGold, 'mb-2.5')}>Limited time</p>
              <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] text-cream">Flash Sale</h2>
              <p className="mt-2 max-w-[46ch] text-cream/70">Hand-picked pieces at special prices. Grab them before the timer runs out.</p>
            </div>
            <CountdownTimer endsAt={flashSaleProducts.find((p) => p.flashSaleEndsAt)?.flashSaleEndsAt} />
          </div>
          <ProductCarousel products={flashSaleProducts} onQuickView={setQuickViewProduct} label="Flash sale" />
        </Container>
      </Reveal>
    ),

    // UPDATED: wrapper (max-w-[1000px] mx-auto) hata diya. Carousel khud kam products par left se align karta hai.
    bestSellers: bestSellers.length > 0 && (
      <Reveal as="section" className={BAND}>
        <Container>
          <SectionHeading title="Best Sellers" sub="The bundles and wigs our customers reorder most." rule action={{ to: '/shop', label: 'View all' }} />
          <ProductCarousel products={bestSellers.slice(0, 10)} onQuickView={setQuickViewProduct} label="Best sellers" size="five" />
        </Container>
      </Reveal>
    ),

    newArrivals: newArrivals.length > 0 && (
      <Reveal as="section" className={BAND_WHITE}>
        <Container>
          <SectionHeading title="New Arrivals" sub="Fresh from the factory floor: the latest wigs, bundles and closures." rule action={{ to: '/shop', label: 'Shop all' }} />
          <ProductCarousel products={newArrivals.slice(0, 10)} onQuickView={setQuickViewProduct} label="New arrivals" />
        </Container>
      </Reveal>
    ),

    offerCards: promoCards.length > 0 && (
      <Reveal as="section" className={BAND_SM}>
        <Container className="grid gap-4 md:grid-cols-3">
          {promoCards.map((b, i) => <PromoTile key={b.id} banner={b} fallback={FALLBACK_OFFER[i % FALLBACK_OFFER.length]} variant="card" />)}
        </Container>
      </Reveal>
    ),

    whyUs: whyItems.length > 0 && (
      <Reveal as="section" className={BAND_WHITE}>
        <Container className="grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <p className={cx(eyebrow, 'mb-3')}>{why.eyebrow || 'Why Indian Temple Remy Hair Exports'}</p>
            <h2 className="max-w-[16ch] text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.12] text-espresso">{why.title || 'Straight from the temple floor to your salon'}</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/wholesale" className={btn('primary', 'lg')}>Wholesale enquiry <FiArrowRight size={16} /></Link>
              <Link to="/about" className="inline-flex min-h-12 items-center justify-center rounded-md border border-line-strong px-6 text-[0.9rem] font-semibold text-espresso transition hover:border-espresso hover:bg-sand">Our story</Link>
            </div>
          </div>
          <ul className="m-0 grid list-none gap-x-10 gap-y-9 p-0 sm:grid-cols-2">
            {whyItems.map((it) => (
              <li key={it.title} className="border-t border-line pt-6">
                <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-sand text-brand"><BadgeIcon label={`${it.title} ${it.description || ''}`} size={22} /></span>
                <strong className="block font-display text-[1.2rem] font-normal leading-tight text-espresso">{it.title}</strong>
                {it.description && <span className="mt-2 block text-[0.92rem] leading-relaxed text-muted">{it.description}</span>}
              </li>
            ))}
          </ul>
        </Container>
      </Reveal>
    ),

    process: processSteps.length > 0 && (
      <Reveal as="section" className={cx('on-dark bg-espresso text-cream', BAND)}>
        <Container>
          <div className="text-center">
            <p className={cx(eyebrowGold, 'mb-2.5')}>{sc?.factoryGallery?.eyebrow || 'Our Process'}</p>
            <SectionHeading center rule title={sc?.factoryGallery?.title || 'From Temple to Your Doorstep'} />
          </div>
          {processPhotos.length > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-4">
              {processPhotos.map((g) => (
                <figure key={g.label || g.image} className="group relative m-0 aspect-[16/9] overflow-hidden rounded-xl border border-champagne/20">
                  <img src={imageOr(g.image)} alt={g.label || ''} loading="lazy" className="size-full object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-105" />
                  {g.label && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/85 to-transparent px-2 pb-2 pt-[18px] text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-cream sm:px-4 sm:pb-3 sm:pt-[26px] sm:text-[0.8rem]">{g.label}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {processSteps.map((st, n) => (
              <li key={st.step} className="flex gap-4 rounded-xl border border-champagne/20 bg-cream/5 p-5 transition-colors duration-300 hover:border-champagne/50 hover:bg-cream/[0.09]">
                <span className="font-display text-[1.6rem] leading-none tabular-nums text-champagne">{String(n + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="mb-1 text-[1.05rem] text-cream">{st.step}</h3>
                  {st.desc && <p className="text-[0.86rem] leading-relaxed text-cream/70">{st.desc}</p>}
                </div>
              </li>
            ))}
          </ol>
          {certifications.length > 0 && (
            <ul className="m-0 mt-7 flex list-none flex-wrap justify-center gap-x-3 gap-y-2.5 p-0">
              {certifications.map((c) => (
                <li key={c} className="inline-flex items-center gap-2 rounded-full border border-champagne/20 px-4 py-2 text-[0.8rem] text-cream"><FiCheck size={15} className="flex-none text-champagne" />{c}</li>
              ))}
            </ul>
          )}
          <div className="mt-7 flex justify-center"><Link to="/factory" className={btn('primary', 'lg')}>See our full process</Link></div>
        </Container>
      </Reveal>
    ),

    seasonalOffers: seasonal.length > 0 && (
      <Reveal as="section" className={BAND}>
        <Container>
          <SectionHeading title="Seasonal Offers" rule />
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {seasonal.map((b, i) => <PromoTile key={b.id} banner={b} fallback={FALLBACK_SEASONAL[i % FALLBACK_SEASONAL.length]} variant="seasonal" />)}
          </div>
        </Container>
      </Reveal>
    ),

    specialOffers: (specialBanners.length > 0 || showCoupon) && (
      <Reveal as="section" className={BAND}>
        <div id="offers" className="scroll-mt-28">
          <Container>
            <SectionHeading title="Special Offers" sub="Limited-time deals on our most popular hair." rule />
            {showCoupon && <CouponBanner coupon={coupon} image={catRaw} />}
            {specialBanners.length > 0 && (
              <div className="mt-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
                {specialBanners.map((b, i) => <PromoTile key={b.id} banner={b} fallback={FALLBACK_SPECIAL[i % FALLBACK_SPECIAL.length]} variant="special" />)}
              </div>
            )}
          </Container>
        </div>
      </Reveal>
    ),

    beforeAfter: (beforeAfter.length > 0 || tryOn) && (
      <Reveal as="section" className={BAND_WHITE}>
        <Container className={cx('grid items-start gap-[clamp(16px,3vw,32px)]', beforeAfter.length > 0 && tryOn && 'md:grid-cols-2')}>
          {beforeAfter.length > 0 && (
            <div>
              <SectionHeading title="Before & After" />
              <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl border border-line">
                {[['Before', beforeAfter[0].beforeImage], ['After', beforeAfter[0].afterImage]].map(([label, image]) => (
                  <figure key={label} className="relative m-0 aspect-[4/3] bg-sand">
                    <img src={imageOr(image)} alt={label} loading="lazy" className="size-full object-cover" />
                    <figcaption className="absolute bottom-2.5 left-2.5 rounded-sm bg-espresso/85 px-2.5 py-[3px] text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white">{label}</figcaption>
                  </figure>
                ))}
              </div>
              {(beforeAfter[0].title || beforeAfter[0].tag) && (
                <p className="mt-2.5 text-[0.86rem] text-muted"><strong className="font-semibold text-espresso">{beforeAfter[0].title}</strong>{beforeAfter[0].tag && <span> · {beforeAfter[0].tag}</span>}</p>
              )}
            </div>
          )}
          {tryOn && (
            <div>
              <SectionHeading title={tryOn.title || 'Virtual Try-On'} />
              <PromoTile banner={{ ...tryOn, title: '' }} fallback={heroModel} variant="tryon" />
            </div>
          )}
        </Container>
      </Reveal>
    ),

    careGuide: guides.length > 0 && (
      <Reveal as="section" className={BAND}>
        <Container>
          <SectionHeading title="Hair Care Guide" sub="Tips from our journal on caring for your hair." rule action={{ to: '/journal', label: 'View all' }} />
          <div className={cx('grid gap-4 sm:gap-5', guides.length > 1 && 'lg:grid-cols-[1.1fr_1fr]')}>
            {/* Lead article */}
            <Link to={`/journal/${guides[0].id}`} className="group relative block min-h-[300px] overflow-hidden rounded-xl bg-espresso sm:min-h-[360px]">
              <img src={imageOr(guides[0].img, FALLBACK_BLOG[0])} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.05]" />
              <span className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/35 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 block p-5 sm:p-7">
                <span className="mb-2.5 inline-block rounded-full bg-champagne px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-espresso">Latest</span>
                <strong className="block max-w-[28ch] font-display text-[clamp(1.35rem,2.4vw,1.85rem)] font-normal leading-tight text-cream">{guides[0].title}</strong>
                {guides[0].excerpt && <span className="mt-2 line-clamp-2 block max-w-[52ch] text-[0.9rem] leading-relaxed text-cream/75">{guides[0].excerpt}</span>}
                <span className="mt-3.5 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-champagne">Read article <FiArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" /></span>
              </span>
            </Link>

            {/* More articles */}
            {guides.length > 1 && (
              <ul className="m-0 grid list-none content-start gap-3 p-0 sm:gap-4">
                {guides.slice(1).map((g, i) => (
                  <li key={g.id}>
                    <Link to={`/journal/${g.id}`} className="group flex gap-4 rounded-xl border border-line bg-white p-3 transition duration-300 hover:border-brand hover:shadow-[0_12px_26px_-18px_rgb(30_20_16/0.4)]">
                      <span className="block aspect-[4/3] w-[104px] flex-none overflow-hidden rounded-lg bg-sand sm:w-[140px]">
                        <img src={imageOr(g.img, FALLBACK_BLOG[(i + 1) % FALLBACK_BLOG.length])} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[800ms] ease-soft group-hover:scale-105" />
                      </span>
                      <span className="flex min-w-0 flex-col justify-center gap-1">
                        <strong className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-espresso transition-colors group-hover:text-brand">{g.title}</strong>
                        {g.excerpt && <span className="line-clamp-2 text-[0.82rem] leading-relaxed text-muted">{g.excerpt}</span>}
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[0.78rem] font-semibold text-brand">Read more <FiArrowRight size={13} /></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </Reveal>
    ),

    testimonials: testimonials.length > 0 && (
      <Reveal as="section" className={BAND_SAND}>
        <Container>
          <SectionHeading title="Customer Reviews" sub="What our customers say about us." rule />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t, i) => (
              <figure className="m-0 flex flex-col gap-3 rounded-xl border border-line bg-white p-6" key={t.id || i}>
                <span aria-hidden="true" className="font-display text-5xl leading-none text-gold/60">“</span>
                {t.rating > 0 && <StarRating value={t.rating} size={15} />}
                <blockquote className="m-0 flex-1 text-[0.92rem] leading-relaxed text-ink">{t.quote || t.message || t.text}</blockquote>
                <figcaption>
                  <strong className="block text-[0.9rem] text-espresso">{t.name}</strong>
                  {(t.country || t.location || t.role) && <span className="text-[0.8rem] text-muted">{t.country || t.location || t.role}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </Reveal>
    ),

    // Light card (not another dark block): keeps the dark newsletter + footer at the bottom distinct.
    exportBand: exportCountries.length > 0 && (
      <Reveal as="section" className={BAND}>
        <Container>
          <div className="grid items-center gap-[clamp(24px,5vw,64px)] rounded-2xl border border-line bg-white p-[clamp(24px,5vw,56px)] shadow-soft lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className={cx(eyebrow, 'mb-2.5')}>Wholesale &amp; Export</p>
              <h2 className="max-w-[20ch] text-[clamp(1.6rem,3vw,2.3rem)] text-espresso">Exporting Indian temple hair worldwide</h2>
              <p className="mt-3.5 max-w-[46ch] leading-relaxed text-muted">Buying in bulk for a salon, brand or distribution business? Tell us what you need and our team will get back to you with wholesale details.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/wholesale" className={btn('primary', 'lg')}>Wholesale enquiry <FiArrowRight size={16} /></Link>
                <Link to="/contact" className="inline-flex min-h-12 items-center justify-center rounded-md border border-line-strong px-6 text-[0.9rem] font-semibold text-espresso transition hover:border-espresso hover:bg-sand">Talk to us</Link>
              </div>
            </div>
            <div>
              <p className="mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-brand">We ship to customers in</p>
              <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
                {exportCountries.map((c) => <li key={c} className="rounded-full border border-line bg-sand px-4 py-2 text-[0.84rem] text-espresso">{c}</li>)}
              </ul>
            </div>
          </div>
        </Container>
      </Reveal>
    ),

    instagram: instaImages.length > 0 && (
      <Reveal as="section" className={cx(BAND, 'pt-0 sm:pt-0 lg:pt-0')}>
        <Container>
          <SectionHeading title="Follow Us on Instagram" sub={sc?.instagram?.handle} />
          <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6">
            {instaImages.slice(0, 6).map((img, i) => {
              const tile = 'block aspect-square overflow-hidden rounded-lg bg-sand';
              const pic = <img src={img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[800ms] ease-soft group-hover:scale-[1.07]" />;
              return instaUrl ? (
                <a href={instaUrl} target="_blank" rel="noopener noreferrer" key={i} aria-label={`Open Instagram, photo ${i + 1}`} className={`group ${tile}`}>{pic}</a>
              ) : (
                <span key={i} className={`group ${tile}`}>{pic}</span>
              );
            })}
          </div>
        </Container>
      </Reveal>
    ),
  };

  return (
    <>
      {/* ================= HERO ================= */}
      {scLoading
        ? <section className="min-h-[clamp(400px,46vw,640px)] bg-espresso" aria-hidden="true" />
        : <HeroSlider slides={slides} />}

      {/* ================= TRUST STRIP ================= */}
      <Container className="relative z-[2] -mt-8 pb-2"><TrustBadges variant="strip" /></Container>

      {/* ================= ORDERED SECTIONS ================= */}
      {keys.map((k) => (enabled(k) && sections[k] ? <Fragment key={k}>{sections[k]}</Fragment> : null))}

      {recentlyViewed.length > 0 && <RecentlyViewed items={recentlyViewed} />}

      {/* ================= NEWSLETTER ================= */}
      <section className="on-dark relative overflow-hidden bg-espresso text-cream">
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[560px] w-[420px] -translate-x-1/2 rounded-t-full border border-champagne/20" />
        <Container className="relative flex flex-col items-center py-12 text-center sm:py-16 lg:py-20">
          <h2 className="text-[clamp(1.7rem,3vw,2.4rem)] text-cream">{news.title || 'Join the list'}</h2>
          <p className="mx-auto mb-7 mt-3 text-cream/70">{news.description || 'New arrivals, styling edits and offers, straight to your inbox.'}</p>
          <div className="w-[min(100%,520px)]"><NewsletterForm /></div>
        </Container>
      </section>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}