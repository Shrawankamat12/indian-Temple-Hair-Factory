import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useBanners } from '../hooks/useStoreData';
import { imageOr, isExternal } from '../lib/media';

const KEY = 'ith-popup-seen';

/** Shows the first active `popup` banner once per browser session, with a close button. */
export default function PromoPopup() {
  const { banners } = useBanners('popup');
  const { pathname } = useLocation();
  const banner = banners[0];
  const [open, setOpen] = useState(false);
  const skip = pathname.startsWith('/checkout') || pathname.startsWith('/order-confirmation');

  useEffect(() => {
    if (!banner || skip) return undefined;
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* storage unavailable */ }
    if (seen) return undefined;
    const t = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(t);
  }, [banner, skip]);

  function close() {
    setOpen(false);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ }
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open || !banner) return null;
  const img = imageOr(banner.img);
  const cta = banner.ctaText && banner.ctaLink && (
    isExternal(banner.ctaLink)
      ? <a href={banner.ctaLink} className="btn btn-primary" onClick={close}>{banner.ctaText}</a>
      : <Link to={banner.ctaLink} className="btn btn-primary" onClick={close}>{banner.ctaText}</Link>
  );

  return (
    <>
      <div className="overlay-backdrop open" onClick={close} aria-hidden="true" />
      <div className="popup" role="dialog" aria-modal="true" aria-label={banner.title || 'Offer'}>
        <button type="button" className="qv-close" onClick={close} aria-label="Close"><FiX size={18} /></button>
        {img && <div className="popup-img"><img src={img} alt="" /></div>}
        <div className="popup-body">
          {banner.title && <h2>{banner.title}</h2>}
          {banner.subtitle && <p>{banner.subtitle}</p>}
          {cta}
        </div>
      </div>
    </>
  );
}
