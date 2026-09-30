import { Link } from 'react-router-dom';
import { imageOr, isExternal } from '../lib/media';
import { btn, cx } from '../lib/ui';

/** Wraps a tile in a router Link / external anchor, or a plain div when the banner has no link. */
function TileLink({ to, className, children, label }) {
  if (!to) return <div className={className}>{children}</div>;
  if (isExternal(to)) return <a href={to} className={className} aria-label={label} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <Link to={to} className={className} aria-label={label}>{children}</Link>;
}

const BASE = 'group relative grid overflow-hidden rounded-xl border border-line text-espresso transition duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgb(30_20_16/0.45)]';

const VARIANT = {
  card: {
    root: 'min-h-[150px] grid-cols-[1.1fr_.9fr] items-stretch bg-[linear-gradient(120deg,#f3eadd,#eadbc6)]',
    copy: 'relative z-[2] flex flex-col items-start justify-center gap-1.5 p-4 sm:p-6',
    img: 'relative block min-h-[120px] before:absolute before:inset-0 before:z-[1] before:bg-gradient-to-r before:from-[#efe3d0] before:to-transparent before:to-40% before:content-[""]',
    title: 'text-[clamp(1.15rem,1.9vw,1.55rem)]',
    sub: 'text-muted',
    cta: true,
  },
  seasonal: {
    root: 'block aspect-[4/5] bg-sand',
    copy: 'absolute inset-x-0 bottom-0 z-[2] flex flex-col items-start justify-end gap-1.5 p-4 sm:p-6',
    img: 'absolute inset-0 before:absolute before:inset-0 before:z-[1] before:bg-gradient-to-t before:from-espresso/70 before:to-transparent before:to-55% before:content-[""]',
    title: 'text-[clamp(1.15rem,1.9vw,1.55rem)] text-white',
    sub: 'text-white/85',
    cta: false,
  },
  special: {
    root: 'min-h-[132px] grid-cols-1 bg-sand',
    copy: 'relative z-[2] flex flex-col items-start justify-center gap-1.5 p-4 sm:p-6',
    img: 'absolute inset-0 opacity-25',
    title: 'text-[clamp(1.15rem,1.9vw,1.55rem)]',
    sub: 'text-muted',
    cta: true,
  },
  mid: {
    root: 'min-h-[clamp(150px,20vw,240px)] grid-cols-[1fr_1fr] items-stretch bg-sand sm:grid-cols-[1fr_1.4fr]',
    copy: 'relative z-[2] flex flex-col items-start justify-center gap-1.5 p-4 sm:p-8',
    img: 'relative block min-h-[120px] before:absolute before:inset-0 before:z-[1] before:bg-gradient-to-r before:from-sand before:to-transparent before:to-40% before:content-[""]',
    title: 'text-[clamp(1.5rem,3vw,2.4rem)]',
    sub: 'text-muted',
    cta: true,
  },
  tryon: {
    root: 'aspect-video grid-cols-1 bg-espresso',
    copy: 'relative z-[2] flex flex-col items-start justify-end gap-1.5 p-4 sm:p-6',
    img: 'absolute inset-0 before:absolute before:inset-0 before:z-[1] before:bg-gradient-to-r before:from-espresso/75 before:to-transparent before:to-60% before:content-[""]',
    title: 'text-[clamp(1.15rem,1.9vw,1.55rem)] text-cream',
    sub: 'text-cream/70',
    cta: true,
  },
};

/**
 * One banner rendered as a tile. Image = admin upload, else the bundled `fallback` photo,
 * else a neutral beige tile. Variants: card (promo), seasonal, special, mid (wide), tryon.
 */
export default function PromoTile({ banner, fallback = null, variant = 'card' }) {
  if (!banner) return null;
  const v = VARIANT[variant] || VARIANT.card;
  const img = imageOr(banner.img, fallback);
  const label = banner.title || banner.ctaText || 'Offer';
  return (
    <TileLink to={banner.ctaLink} className={cx(BASE, v.root, !banner.ctaLink && 'hover:translate-y-0 hover:shadow-none')} label={label}>
      <span className={v.copy}>
        {banner.title && <strong className={cx('font-display font-normal leading-[1.15]', v.title)}>{banner.title}</strong>}
        {banner.subtitle && <span className={cx('max-w-[26ch] text-[0.8rem]', v.sub)}>{banner.subtitle}</span>}
        {v.cta && banner.ctaText && <span className={btn('primary', 'sm', 'pointer-events-none mt-1.5')}>{banner.ctaText}</span>}
      </span>
      <span className={v.img} aria-hidden="true">
        {img && <img src={img} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.04]" />}
      </span>
    </TileLink>
  );
}
