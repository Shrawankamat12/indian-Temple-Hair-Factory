import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiCopy } from 'react-icons/fi';
import CategoryCard from '../components/CategoryCard';
import ProductCarousel from '../components/ProductCarousel';
import TrustBadges from '../components/TrustBadges';
import HeroSlider from '../components/HeroSlider';
import PromoTile from '../components/PromoTiles';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import StarRating from '../components/StarRating';
import BadgeIcon from '../components/BadgeIcon';
import NewsletterForm from '../components/NewsletterForm';
import RecentlyViewed from '../components/RecentlyViewed';
import QuickView from '../components/QuickView';
import { useRecentlyViewedList } from '../hooks/useRecentlyViewed';
import { imageOr, isExternal, isRealImage } from '../lib/media';
import { topLevelCategories } from '../lib/categories';
import { processSteps, certifications, exportCountries } from '../data/content';
import {
  useCategories, useProductsByBadge, useProductsByFlag, useTestimonials, useSiteContent,
  useCompanyInfo, useBanners, useAttributes, useBlogs,
} from '../hooks/useStoreData';

// ---- Bundled photos: FALLBACKS ONLY (used when the admin has not uploaded an image for the slot) ----
import heroModel from '../assets/photos/hero-model.jpg';
import factorySorting from '../assets/photos/factory-sorting.jpg';
import factoryWefting from '../assets/photos/factory-wefting.jpg';
import factoryPacking from '../assets/photos/factory-packing.jpg';
import factoryExport from '../assets/photos/factory-export.jpg';
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
  'categories', 'collections', 'textures', 'midBanner', 'bestSellers', 'offerCards', 'whyUs', 'process',
  'factorySpotlight', 'seasonalOffers', 'specialOffers', 'beforeAfter', 'careGuide', 'testimonials',
  'wholesale', 'exportBand', 'globalExport', 'instagram',
];

// Hero extras. Real values from Website Content → Hero Banner (stats, badges) win; these are fallbacks
// that repeat facts already shown on the About / Factory pages.
const DEFAULT_HERO_STATS = [
  { value: '200+', label: 'Artisans' },
  { value: '50+', label: 'Export countries' },
  { value: '24 hrs', label: 'Dispatch from Delhi' },
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
    <div className="offer">
      <img className="offer-bg" src={image} alt="" loading="lazy" />
      <div className="offer-copy">
        {coupon.eyebrow && <span className="offer-eyebrow">{coupon.eyebrow}</span>}
        <h3 className="offer-title">
          {coupon.discountText && <span className="offer-disc">{coupon.discountText}</span>} {coupon.title}
        </h3>
      </div>
      <div className="offer-side">
        {coupon.code && (
          <div className="offer-code">
            <span className="offer-code-label">Use code</span>
            <b>{coupon.code}</b>
            <button type="button" className="offer-copy-btn" onClick={copy} aria-label={`Copy code ${coupon.code}`}>
              {copied ? <><FiCheck size={14} /> Copied</> : <><FiCopy size={14} /> Copy</>}
            </button>
          </div>
        )}
        {coupon.ctaText && <TileAnchor to={coupon.ctaLink || '/shop'} className="btn btn-primary btn-lg">{coupon.ctaText} <FiArrowRight size={16} /></TileAnchor>}
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

  const recentlyViewed = useRecentlyViewedList();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { keys, enabled } = orderSections(sc?.homeSections);

  // ---------------- HERO: admin Hero Banner content + home-hero banners ----------------
  const hero = sc?.hero || {};
  const slides = [];
  if (hero.title || hero.image || !sc) {
    slides.push({
      key: 'hero',
      eyebrow: hero.eyebrow,
      title: hero.title || 'Pure Indian Hair. Naturally Beautiful.',
      highlight: hero.highlightText,
      subtitle: hero.subtitle,
      image: imageOr(hero.image, heroModel),
      flip: !isRealImage(hero.image), // bundled model photo faces left; flip so she sits on the right of the copy
      alt: 'Woman with long, glossy Indian remy hair',
      primary: { text: hero.primaryCtaText || 'Shop Now', link: hero.primaryCtaLink || '/shop' },
      secondary: hero.secondaryCtaText ? { text: hero.secondaryCtaText, link: hero.secondaryCtaLink || '/about' } : null,
      stats: (hero.stats?.length ? hero.stats : DEFAULT_HERO_STATS).slice(0, 3),
    });
  }
  heroBanners.filter((b) => imageOr(b.img)).forEach((b) => {
    slides.push({
      key: `b-${b.id}`, title: b.title, subtitle: b.subtitle, image: imageOr(b.img), alt: b.title || '',
      primary: b.ctaText ? { text: b.ctaText, link: b.ctaLink || '/shop' } : null,
    });
  });

  // Always show 3 photo slides: pad with these until the admin adds real slides (Banners → home-hero).
  const wigCategory = topLevelCategories(categories).find((c) => /wig/i.test(`${c.slug} ${c.name}`));
  const fallbackSlides = [
    {
      key: 'fb-wigs', eyebrow: 'Wigs & Toppers', title: 'Real Indian hair wigs, ready to wear.',
      subtitle: 'Full lace wigs, bob wigs, curly and long wavy styles, and hair toppers from our New Delhi factory.',
      image: wigShelf, alt: 'Shelves of human hair wigs',
      primary: { text: 'Shop Wigs', link: wigCategory ? `/shop?category=${wigCategory.slug}` : '/shop' },
      secondary: { text: 'View all products', link: '/shop' },
    },
    {
      key: 'fb-export', eyebrow: 'Wholesale & Export', title: 'Made in New Delhi. Shipped worldwide.',
      subtitle: 'Raw, remy and virgin hair, closures and frontals, hand-sorted and packed for salons and distributors.',
      image: factoryExport, alt: 'Wall of hair bundles and extensions at our factory',
      primary: { text: 'Wholesale enquiry', link: '/wholesale' },
      secondary: { text: 'Our process', link: '/factory' },
    },
  ];
  for (let n = 0; slides.length < 3 && n < fallbackSlides.length; n += 1) slides.push(fallbackSlides[n]);

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
  const whyItems = (why.items || []).filter((it) => it?.title).slice(0, 6);

  const premiumCollections = [
    { title: 'Temple Hair', text: 'Authentic Indian temple hair selected for natural beauty.', image: catRaw, link: '/shop?search=temple' },
    { title: 'Raw Indian Hair', text: 'Natural-looking hair with a premium raw-hair finish.', image: pTemple, link: '/shop?search=raw' },
    { title: 'Virgin Hair', text: 'Premium virgin styles for salons, stylists and brands.', image: pStraight, link: '/shop?search=virgin' },
    { title: 'Bulk Hair', text: 'Bulk quantities for wholesale and professional production.', image: catBulk, link: '/shop?search=bulk' },
  ];

  const factoryPhotos = [
    [factorySorting, 'Hand Sorting'],
    [factoryWefting, 'Professional Wefting'],
    [factoryPacking, 'Quality Packing'],
    [factoryExport, 'Export Ready'],
  ];

  const sections = {
    categories: shopCategories.length > 0 && (
      <section className="section section--tight">
        <div className="container">
          <SectionHeading title="Shop by Category" sub="Wigs, closures, frontals and bulk hair, straight from our New Delhi factory." rule action={{ to: '/shop', label: 'View all' }} />
          <div className="cat-grid">
            {shopCategories.map((c) => <CategoryCard category={c} shape="round" fallback={categoryFallback(c)} key={c.slug} />)}
          </div>
        </div>
      </section>
    ),

    collections: (
      <Reveal as="section" className="section section--tight home-collections">
        <div className="container">
          <div className="home-center">
            <p className="home-eyebrow">Premium Collections</p>
            <SectionHeading center rule title="Hair Collections Made for Professionals" sub="Explore Indian hair collections for salons, stylists, brands and wholesale buyers." />
          </div>
          <div className="collection-grid">
            {premiumCollections.map((item) => (
              <Link to={item.link} className="collection-card" key={item.title}>
                <span className="collection-img"><img src={item.image} alt={item.title} loading="lazy" /></span>
                <span className="collection-overlay" />
                <span className="collection-copy">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                  <em>Explore collection <FiArrowRight size={15} /></em>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    ),

    textures: textureTiles.length > 0 && (
      <section className="section section--tight">
        <div className="container">
          <SectionHeading title="Shop by Texture" sub="Pick the wave, curl or straight that suits you." rule action={{ to: '/shop', label: 'View all' }} />
          <div className="tex-row">
            {textureTiles.map((t) => {
              const img = imageOr(t.image, textureFallback(t.name));
              return (
                <Link key={t.id} to={`/shop?texture=${encodeURIComponent(t.name)}`} className="tex">
                  <span className="tex-img">{img ? <img src={img} alt="" loading="lazy" /> : <span className="tex-fallback">{t.name.charAt(0)}</span>}</span>
                  <span className="tex-name">{t.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    ),

    midBanner: midBanners[0] && (
      <section className="section section--tight">
        <div className="container"><PromoTile banner={midBanners[0]} fallback={wigShelf} variant="mid" /></div>
      </section>
    ),

    bestSellers: bestSellers.length > 0 && (
      <Reveal as="section" className="section section--tight">
        <div className="container">
          <SectionHeading title="Best Sellers" sub="The bundles and wigs our customers reorder most." rule action={{ to: '/shop', label: 'View all' }} />
          <ProductCarousel products={bestSellers.slice(0, 10)} onQuickView={setQuickViewProduct} label="Best sellers" />
        </div>
      </Reveal>
    ),

    offerCards: promoCards.length > 0 && (
      <section className="section section--tight">
        <div className="container promo-row">
          {promoCards.map((b, i) => <PromoTile key={b.id} banner={b} fallback={FALLBACK_OFFER[i % FALLBACK_OFFER.length]} variant="card" />)}
        </div>
      </section>
    ),


    whyUs: whyItems.length > 0 && (
      <Reveal as="section" className="section home-band home-band--white">
        <div className="container">
          <div className="home-center">
            <p className="home-eyebrow">{why.eyebrow || 'Why Indian Temple Remy Hair Exports'}</p>
            <SectionHeading center rule title={why.title || 'Straight from the temple floor to your salon'} />
          </div>
          <ul className="wy-grid">
            {whyItems.map((it) => (
              <li key={it.title} className="wy">
                <span className="wy-ico"><BadgeIcon label={`${it.title} ${it.description || ''}`} size={24} /></span>
                <strong>{it.title}</strong>
                {it.description && <span>{it.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    ),

    process: (
      <Reveal as="section" className="section section--dark home-band">
        <div className="container">
          <div className="home-center">
            <p className="home-eyebrow home-eyebrow--gold">Our Process</p>
            <SectionHeading center rule title="From Temple to Your Doorstep" sub="Every stage, from sourcing to packing, is handled at our New Delhi facility." />
          </div>
          <div className="proc-photos">
            {[[factorySorting, 'Hand-sorting'], [factoryWefting, 'Wefting'], [factoryPacking, 'Export packing']].map(([src, label]) => (
              <figure key={label}><img src={src} alt={label} loading="lazy" /><figcaption>{label}</figcaption></figure>
            ))}
          </div>
          <ol className="proc-grid">
            {processSteps.map((st, n) => (
              <li key={st.step} className="proc">
                <span className="proc-num num">{String(n + 1).padStart(2, '0')}</span>
                <h3>{st.step}</h3>
                <p>{st.desc}</p>
              </li>
            ))}
          </ol>
          <ul className="proc-certs">
            {certifications.map((c) => <li key={c}><FiCheck size={15} />{c}</li>)}
          </ul>
          <div className="center-row"><Link to="/factory" className="btn btn-primary btn-lg">See our full process</Link></div>
        </div>
      </Reveal>
    ),

    factorySpotlight: (
      <Reveal as="section" className="section home-band home-factory">
        <div className="container">
          <div className="factory-grid">
            <div className="factory-copy">
              <p className="home-eyebrow">Inside Our Hair Factory</p>
              <SectionHeading title="From Selection to Export, Every Detail Matters" rule />
              <p className="factory-lede">See how selected Indian hair is sorted, processed, checked and prepared for customers and wholesale buyers.</p>
              <div className="factory-points">
                <span><FiCheck size={15} /> Careful hair selection</span>
                <span><FiCheck size={15} /> Professional processing</span>
                <span><FiCheck size={15} /> Export-ready packaging</span>
              </div>
              <Link to="/factory" className="btn btn-primary btn-lg">Explore Factory <FiArrowRight size={16} /></Link>
            </div>
            <div className="factory-gallery">
              {factoryPhotos.map(([src, label], i) => (
                <figure className={i === 0 ? 'is-lead' : ''} key={label}>
                  <img src={src} alt={label} loading="lazy" />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    ),

    seasonalOffers: seasonal.length > 0 && (
      <section className="section section--tight">
        <div className="container">
          <SectionHeading title="Seasonal Offers" rule />
          <div className="seasonal-row">
            {seasonal.map((b, i) => <PromoTile key={b.id} banner={b} fallback={FALLBACK_SEASONAL[i % FALLBACK_SEASONAL.length]} variant="seasonal" />)}
          </div>
        </div>
      </section>
    ),

    specialOffers: (specialBanners.length > 0 || showCoupon) && (
      <section className="section section--tight" id="offers">
        <div className="container">
          <SectionHeading title="Special Offers" sub="Limited-time deals on our most popular hair." rule />
          {showCoupon && <CouponBanner coupon={coupon} image={catRaw} />}
          {specialBanners.length > 0 && (
            <div className="special-row special-row--gap">
              {specialBanners.map((b, i) => <PromoTile key={b.id} banner={b} fallback={FALLBACK_SPECIAL[i % FALLBACK_SPECIAL.length]} variant="special" />)}
            </div>
          )}
        </div>
      </section>
    ),

    beforeAfter: (beforeAfter.length > 0 || tryOn) && (
      <section className="section section--tight">
        <div className="container ba-grid">
          {beforeAfter.length > 0 && (
            <div className="ba-col">
              <SectionHeading title="Before & After" />
              <div className="ba-card">
                <figure><img src={imageOr(beforeAfter[0].beforeImage)} alt="Before" loading="lazy" /><figcaption>Before</figcaption></figure>
                <figure><img src={imageOr(beforeAfter[0].afterImage)} alt="After" loading="lazy" /><figcaption>After</figcaption></figure>
              </div>
              {(beforeAfter[0].title || beforeAfter[0].tag) && (
                <p className="ba-cap"><strong>{beforeAfter[0].title}</strong>{beforeAfter[0].tag && <span> · {beforeAfter[0].tag}</span>}</p>
              )}
            </div>
          )}
          {tryOn && (
            <div className="ba-col">
              <SectionHeading title={tryOn.title || 'Virtual Try-On'} />
              <PromoTile banner={{ ...tryOn, title: '' }} fallback={heroModel} variant="tryon" />
            </div>
          )}
        </div>
      </section>
    ),

    careGuide: guides.length > 0 && (
      <Reveal as="section" className="section section--tight">
        <div className="container">
          <SectionHeading title="Hair Care Guide" sub="Tips from our journal on caring for your hair." rule action={{ to: '/journal', label: 'View all' }} />
          <div className="care-row">
            {guides.map((g, i) => (
              <Link to={`/journal/${g.id}`} className="care" key={g.id}>
                <span className="care-img"><img src={imageOr(g.img, FALLBACK_BLOG[i % FALLBACK_BLOG.length])} alt="" loading="lazy" /></span>
                <strong className="care-title">{g.title}</strong>
                {g.excerpt && <span className="care-ex">{g.excerpt}</span>}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    ),

    testimonials: testimonials.length > 0 && (
      <Reveal as="section" className="section section--tight">
        <div className="container">
          <SectionHeading title="Customer Reviews" sub="What our customers say about us." rule />
          <div className="testi-grid">
            {testimonials.slice(0, 3).map((t, i) => (
              <figure className="testi" key={t.id || i}>
                {t.rating > 0 && <StarRating value={t.rating} size={15} />}
                <blockquote>{t.quote || t.message || t.text}</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  {(t.country || t.location || t.role) && <span>{t.country || t.location || t.role}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Reveal>
    ),


    wholesale: (
      <Reveal as="section" className="section section--tight">
        <div className="container">
          <div className="wholesale-hero">
            <img src={factoryExport} alt="Indian hair export packaging" loading="lazy" />
            <div className="wholesale-shade" />
            <div className="wholesale-copy">
              <p className="home-eyebrow home-eyebrow--gold">For Salons, Brands & Distributors</p>
              <h2>Build Your Hair Business with Indian Hair</h2>
              <p>Looking for bulk quantities, repeat supply or custom requirements? Send us your requirements and talk to our wholesale team.</p>
              <div className="export-ctas">
                <Link to="/wholesale" className="btn btn-primary btn-lg">Request Wholesale Quote <FiArrowRight size={16} /></Link>
                <Link to="/contact" className="btn btn-lg btn-outline-light">Contact Export Team</Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    ),

    exportBand: (
      <Reveal as="section" className="section section--tight">
        <div className="container">
          <div className="export">
            <div className="export-copy">
              <p className="home-eyebrow home-eyebrow--gold">Wholesale &amp; Export</p>
              <h2>Exporting Indian temple hair worldwide</h2>
              <p>Buying in bulk for a salon, brand or distribution business? Tell us what you need and our team will get back to you with wholesale details.</p>
              <div className="export-ctas">
                <Link to="/wholesale" className="btn btn-primary btn-lg">Wholesale enquiry <FiArrowRight size={16} /></Link>
                <Link to="/contact" className="btn btn-lg btn-outline-light">Talk to us</Link>
              </div>
            </div>
            <div className="export-list">
              <p className="export-label">We ship to customers in</p>
              <ul>{exportCountries.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          </div>
        </div>
      </Reveal>
    ),

    globalExport: (
      <Reveal as="section" className="section home-global">
        <div className="container">
          <div className="global-card">
            <div className="global-visual">
              <img src={heroModel} alt="Indian hair export" loading="lazy" />
              <div className="global-glow" />
              <div className="global-route global-route--one">India <FiArrowRight size={14} /> Worldwide</div>
              <div className="global-route global-route--two">Wholesale • Retail • Salon</div>
            </div>
            <div className="global-copy">
              <p className="home-eyebrow">Global Export</p>
              <SectionHeading title="Indian Hair, Prepared for Worldwide Buyers" rule />
              <p>Explore our export-ready collections and connect with the team for product availability, quantities and shipping requirements.</p>
              <div className="country-pills">
                {exportCountries.slice(0, 8).map((country) => <span key={country}>{country}</span>)}
              </div>
              <Link to="/contact" className="btn btn-primary btn-lg">Start an Enquiry <FiArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </Reveal>
    ),

    instagram: instaImages.length > 0 && (
      <Reveal as="section" className="section section--tight">
        <div className="container">
          <SectionHeading title="Follow Us on Instagram" sub={sc?.instagram?.handle} />
          <div className="gallery">
            {instaImages.slice(0, 6).map((img, i) => (
              instaUrl ? (
                <a href={instaUrl} target="_blank" rel="noopener noreferrer" key={i} aria-label={`Open Instagram, photo ${i + 1}`}>
                  <img src={img} alt="" loading="lazy" />
                </a>
              ) : (
                <span key={i}><img src={img} alt="" loading="lazy" /></span>
              )
            ))}
          </div>
        </div>
      </Reveal>
    ),
  };

  return (
    <>
      {/* ================= HERO ================= */}
      {scLoading ? <section className="hero hero--loading" aria-hidden="true" /> : <HeroSlider slides={slides} />}

      {/* ================= TRUST STRIP ================= */}
      <div className="container home-trust"><TrustBadges /></div>

      {/* ================= ORDERED SECTIONS ================= */}
      {keys.map((k) => (enabled(k) && sections[k] ? <div key={k} className="home-sec">{sections[k]}</div> : null))}

      {recentlyViewed.length > 0 && <RecentlyViewed items={recentlyViewed} />}

      {/* ================= NEWSLETTER ================= */}
      <section className="news">
        <div className="container news-inner">
          <h2>{news.title || 'Join the list'}</h2>
          <p>{news.description || 'New arrivals, styling edits and offers, straight to your inbox.'}</p>
          <NewsletterForm />
        </div>
      </section>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}