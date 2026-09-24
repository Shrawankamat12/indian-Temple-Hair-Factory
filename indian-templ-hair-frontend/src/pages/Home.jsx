import { useState } from 'react';
import { FiArrowRight, FiHelpCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CategoryCircle from '../components/CategoryCircle';
import ProductCard from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import Reveal from '../components/Reveal';
import { ProductGridSkeleton } from '../components/Skeletons';
import NewsletterForm from '../components/NewsletterForm';
import RecentlyViewed from '../components/RecentlyViewed';
import QuickView from '../components/QuickView';
import { useRecentlyViewedList } from '../hooks/useRecentlyViewed';
import { resolveImageUrl } from '../lib/api';
import {
  useCategories, useProductsByBadge, useProductsByFlag, useProducts,
  useTestimonials, useSiteContent,
} from '../hooks/useStoreData';
import heroModel from '../assets/photos/hero-model.jpg';
import factorySorting from '../assets/photos/factory-sorting.jpg';
import factoryWefting from '../assets/photos/factory-wefting.jpg';
import factoryQc from '../assets/photos/factory-qc.jpg';
import factoryPacking from '../assets/photos/factory-packing.jpg';
import insta1 from '../assets/photos/insta-1.jpg';
import insta2 from '../assets/photos/insta-2.jpg';
import insta3 from '../assets/photos/insta-3.jpg';
import insta4 from '../assets/photos/insta-4.jpg';
import insta5 from '../assets/photos/insta-5.jpg';
import insta6 from '../assets/photos/insta-6.jpg';

const FALLBACK_FACTORY_GALLERY = [
  { label: 'Sorting Floor', image: factorySorting },
  { label: 'Wefting Studio', image: factoryWefting },
  { label: 'Quality Check', image: factoryQc },
  { label: 'Packing Line', image: factoryPacking },
];
const FALLBACK_INSTAGRAM = [insta1, insta2, insta3, insta4, insta5, insta6];

function mergeShelf(flagList = [], badgeList = []) {
  const seen = new Set(flagList.map((p) => p.id));
  return [...flagList, ...badgeList.filter((p) => !seen.has(p.id))];
}

export default function Home() {
  const { siteContent: sc } = useSiteContent();
  const { categories } = useCategories();

  const { products: bestSellerFlag } = useProductsByFlag('bestSeller');
  const { products: bestSellerBadge } = useProductsByBadge('Bestseller');
  const bestSellers = mergeShelf(bestSellerFlag, bestSellerBadge);

  const { products: newArrivalFlag } = useProductsByFlag('newArrival');
  const { products: newArrivalBadge } = useProductsByBadge('New');
  const newArrivals = mergeShelf(newArrivalFlag, newArrivalBadge);

  const { products: featuredProducts } = useProductsByFlag('featured');
  const { products: gridProducts, loading: gridLoading } = useProducts({ limit: 8 });
  const { testimonials } = useTestimonials();
  const recentlyViewed = useRecentlyViewedList();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const featuredCategories = (categories.filter((c) => c.featured).length ? categories.filter((c) => c.featured) : categories).slice(0, 5);
  const shelfProducts = (featuredProducts.length ? featuredProducts : bestSellers.length ? bestSellers : gridProducts).slice(0, 8);
  const newProducts = (newArrivals.length ? newArrivals : gridProducts).slice(0, 4);

  const sectionEnabled = (key) => {
    if (!sc?.homeSections) return true;
    const entry = sc.homeSections.find((s) => s.key === key);
    return entry ? entry.enabled !== false : true;
  };

  const hero = sc?.hero || {};
  const heroBadges = hero.badges?.length ? hero.badges : ['100% Authentic Indian Hair', 'Ethically Sourced', 'Worldwide Shipping'];
  const heroStats = hero.stats?.length ? hero.stats : [{ value: '10+', label: 'Years' }, { value: '50+', label: 'Countries' }, { value: '500+', label: 'Happy Clients' }];

  const why = sc?.whyChooseUs || {};
  const whyItems = why.items?.length ? why.items : [
    { title: 'No Middlemen', description: 'Every order ships straight from our factory floor to your door, at factory pricing.' },
    { title: '200+ Skilled Artisans', description: 'Hand-sorting and wefting done by a dedicated in-house team, never outsourced.' },
    { title: 'Cuticle-Aligned Hair', description: 'Root-to-tip alignment on every bundle, preserving natural shine and reducing tangling.' },
    { title: 'Exporting Since 2014', description: 'A decade of documented, compliant exports to distributors across 50+ countries.' },
  ];

  const processStepsData = sc?.processSteps?.length ? sc.processSteps : [
    { step: 'Sourcing', desc: 'Hair is collected from trusted collectors across India, cuticle intact and root-aligned.' },
    { step: 'Sorting', desc: 'Every bundle is hand-sorted for texture, length and root direction before production.' },
    { step: 'Quality Check', desc: 'Multi-point inspection for shedding, tangling and colour consistency.' },
    { step: 'Packing & Export', desc: 'Carefully packed and dispatched worldwide within 24–48 hours.' },
  ];
  const gallery = sc?.factoryGallery || {};
  const galleryImages = gallery.images?.length
    ? gallery.images.map((g) => ({ ...g, image: resolveImageUrl(g.image) }))
    : FALLBACK_FACTORY_GALLERY;

  const instaImages = sc?.instagram?.images?.length ? sc.instagram.images.map((img) => resolveImageUrl(img)) : FALLBACK_INSTAGRAM;

  const faqTeaser = sc?.faqTeaser || {};
  const faqItems = faqTeaser.items?.length ? faqTeaser.items : [
    { q: 'What are your shipping charges?', a: 'Shipping charges apply on all orders — see Shipping & Delivery for details.' },
    { q: 'Can I return or exchange my order?', a: 'Please review product details carefully before ordering — see our Returns policy.' },
    { q: 'How do I care for my hair?', a: 'Treat it like your own hair and use sulfate-free products.' },
    { q: 'Is your hair 100% human hair?', a: 'Yes, all our hair is 100% virgin human hair.' },
  ];

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hm-hero">
        <div className="container hm-hero-grid">
          <div>
            <span className="hm-hero-eyebrow eyebrow">{heroBadges[0]}</span>
            <h1 className="hm-hero-title">
              {hero.title || <>Pure Indian Hair.<br /><em>Global Beauty.</em></>}
            </h1>
            <p className="hm-hero-sub">
              {hero.subtitle || 'Premium-quality temple hair, ethically sourced from India and prepared with care for customers worldwide.'}
            </p>
            <div className="hm-hero-ctas">
              <Link to="/shop" className="btn btn-gold">Shop Collection</Link>
              <Link to="/about" className="btn btn-outline on-light">Discover Our Story</Link>
            </div>
            <div className="hm-hero-stats">
              {heroStats.map((s) => (
                <div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>
              ))}
            </div>
          </div>
          <div className="hm-hero-visual">
            <img src={resolveImageUrl(hero.image) || heroModel} alt="Premium human hair" />
            <span className="hm-hero-visual-tag">{heroBadges[1] || '100% Human Hair'}</span>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: '36px 0' }}>
        <TrustBadges />
      </div>

      {/* ================= CATEGORIES ================= */}
      {sectionEnabled('categories') && featuredCategories.length > 0 && (
        <Reveal as="section" className="section section--tight-top">
          <div className="container">
            <div className="hm-section-head">
              <div>
                <span className="eyebrow">Shop By Category</span>
                <h2>Explore Our Collection</h2>
                <p style={{ color: 'var(--taupe)', marginTop: 6, maxWidth: 480 }}>Discover premium Indian hair crafted for natural beauty and lasting quality.</p>
              </div>
              <Link to="/shop" className="btn btn-outline on-light btn-sm">View All</Link>
            </div>
            <div className="hm-cat-grid">
              {featuredCategories.map((c) => <CategoryCircle cat={c} key={c.id} />)}
            </div>
          </div>
        </Reveal>
      )}

      {/* ================= FEATURED PRODUCTS ================= */}
      {sectionEnabled('featured') && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="hm-section-head">
              <div>
                <span className="eyebrow">Editor's Picks</span>
                <h2>Featured hair</h2>
              </div>
              <Link to="/shop" className="btn btn-outline on-light btn-sm">Shop All</Link>
            </div>
            {gridLoading && shelfProducts.length === 0 ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="hm-product-row">
                {shelfProducts.map((p) => <ProductCard product={p} key={p.id} onQuickView={setQuickViewProduct} />)}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* ================= PROMO BANNER ================= */}
      <Reveal as="section" className="hm-banner">
        <div className="container">
          <span className="eyebrow" style={{ color: 'rgba(250,248,244,0.55)' }}>Factory Direct</span>
          <h2>No middlemen. Just quality hair, at honest prices.</h2>
          <p>Every order ships directly from our production floor — the same hair we supply to salons and distributors worldwide.</p>
          <Link to="/wholesale" className="btn btn-outline">Explore Wholesale</Link>
        </div>
      </Reveal>

      {/* ================= NEW ARRIVALS ================= */}
      {newProducts.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="hm-section-head">
              <div>
                <span className="eyebrow">Just In</span>
                <h2>New arrivals</h2>
              </div>
              <Link to="/shop" className="btn btn-outline on-light btn-sm">View All</Link>
            </div>
            <div className="hm-product-row">
              {newProducts.map((p) => <ProductCard product={p} key={p.id} onQuickView={setQuickViewProduct} />)}
            </div>
          </div>
        </Reveal>
      )}

      {/* ================= PROCESS ================= */}
      {sectionEnabled('process') && (
        <Reveal as="section" className="section" style={{ background: 'var(--paper-deep)' }}>
          <div className="container hm-process">
            <div>
              <span className="eyebrow">From Sourcing to Shipment</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(1.8rem,3vw,2.4rem)', margin: '10px 0 8px' }}>Our process</h2>
              <p style={{ color: 'var(--taupe)', marginBottom: 10 }}>Every bundle passes through the same disciplined process before it reaches you.</p>
              <div className="hm-process-list">
                {processStepsData.slice(0, 4).map((s, i) => (
                  <div className="hm-process-item" key={s.step}>
                    <span className="hm-process-num">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h4>{s.step}</h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hm-process-imgs">
              {galleryImages.slice(0, 3).map((g) => <img key={g.label} src={g.image} alt={g.label} loading="lazy" />)}
            </div>
          </div>
        </Reveal>
      )}

      {/* ================= TESTIMONIALS ================= */}
      {testimonials.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container">
            <div className="hm-section-head center">
              <span className="eyebrow">Customer Love</span>
              <h2>What buyers say</h2>
            </div>
            <div className="hm-testi-grid">
              {testimonials.slice(0, 3).map((t) => (
                <div className="hm-testi-card" key={t.id}>
                  <p>&ldquo;{t.message || t.text}&rdquo;</p>
                  <div className="hm-testi-who">
                    <span className="hm-testi-avatar">{(t.name || '?').charAt(0)}</span>
                    <div><strong>{t.name}</strong><span>{t.location || t.role}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* ================= INSTAGRAM ================= */}
      {sectionEnabled('instagram') && instaImages.length > 0 && (
        <Reveal as="section" className="section" style={{ paddingTop: testimonials.length ? undefined : 0 }}>
          <div className="container">
            <div className="hm-section-head center">
              <span className="eyebrow">Follow Along</span>
              <h2>{sc?.instagram?.handle || '@indiantemplehairexports'}</h2>
            </div>
            <div className="hm-gallery">
              {instaImages.slice(0, 6).map((img, i) => (
                <a href="#" key={i} onClick={(e) => e.preventDefault()}>
                  <img src={img} alt={`Gallery ${i + 1}`} loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* ================= WHY CHOOSE US ================= */}
      {whyItems.length > 0 && (
        <Reveal as="section" className="section" style={{ background: 'var(--paper-deep)' }}>
          <div className="container">
            <div className="hm-section-head center">
              <span className="eyebrow">Why Choose Us</span>
              <h2>{why.title || 'Built on trust'}</h2>
            </div>
            <div className="hm-testi-grid">
              {whyItems.slice(0, 4).map((it) => (
                <div key={it.title} style={{ padding: '10px 4px' }}>
                  <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', marginBottom: 8, fontWeight: 400 }}>{it.title}</h4>
                  <p style={{ color: 'var(--taupe)', fontSize: '0.88rem', lineHeight: 1.6 }}>{it.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* ================= FAQ TEASER ================= */}
      <Reveal as="section" className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="hm-section-head center">
            <span className="eyebrow">Questions</span>
            <h2>{faqTeaser.title || 'Frequently asked'}</h2>
          </div>
          <div>
            {faqItems.slice(0, 4).map((f) => (
              <details key={f.q} style={{ borderBottom: '1px solid var(--line)', padding: '18px 0' }}>
                <summary style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
                  <FiHelpCircle size={15} style={{ flex: 'none', color: 'var(--taupe)' }} />{f.q}
                </summary>
                <p style={{ color: 'var(--taupe)', fontSize: '0.88rem', marginTop: 10, lineHeight: 1.6, paddingLeft: 25 }}>{f.a}</p>
              </details>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 26 }}>
            <Link to="/faq" className="btn btn-outline on-light btn-sm">All FAQs <FiArrowRight size={13} /></Link>
          </div>
        </div>
      </Reveal>

      {recentlyViewed.length > 0 && <RecentlyViewed items={recentlyViewed} />}

      {/* ================= NEWSLETTER ================= */}
      <section className="hm-newsletter">
        <div className="hm-newsletter-inner">
          <h2>Join the list</h2>
          <p>New arrivals, styling edits and offers — straight to your inbox.</p>
          <NewsletterForm className="hm-newsletter-form" />
        </div>
      </section>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
