import { Link } from 'react-router-dom';
import { imageOr, isExternal } from '../lib/media';

/** Wraps a tile in a router Link / external anchor, or a plain div when the banner has no link. */
function TileLink({ to, className, children, label }) {
  if (!to) return <div className={className}>{children}</div>;
  if (isExternal(to)) return <a href={to} className={className} aria-label={label} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <Link to={to} className={className} aria-label={label}>{children}</Link>;
}

/**
 * One banner rendered as a tile. Image = admin upload, else the bundled `fallback` photo,
 * else a neutral beige tile. Variants: card (promo), seasonal, special, mid (wide), tryon.
 */
export default function PromoTile({ banner, fallback = null, variant = 'card' }) {
  if (!banner) return null;
  const img = imageOr(banner.img, fallback);
  const label = banner.title || banner.ctaText || 'Offer';
  return (
    <TileLink to={banner.ctaLink} className={`ptile ptile--${variant}`} label={label}>
      <span className="ptile-copy">
        {banner.title && <strong className="ptile-title">{banner.title}</strong>}
        {banner.subtitle && <span className="ptile-sub">{banner.subtitle}</span>}
        {banner.ctaText && <span className="btn btn-primary btn-sm ptile-cta">{banner.ctaText}</span>}
      </span>
      <span className="ptile-img" aria-hidden="true">{img && <img src={img} alt="" loading="lazy" />}</span>
    </TileLink>
  );
}
