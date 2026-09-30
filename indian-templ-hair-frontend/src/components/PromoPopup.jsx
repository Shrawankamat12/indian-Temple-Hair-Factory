import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useBanners } from '../hooks/useStoreData';
import { imageOr } from '../lib/media';
import Overlay from './Overlay';
import Button from './Button';
import { closeBtn } from './QuickView';
import { cx } from '../lib/ui';

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
    /^https?:\/\//i.test(banner.ctaLink)
      ? <Button href={banner.ctaLink} onClick={close}>{banner.ctaText}</Button>
      : <Button to={banner.ctaLink} onClick={close}>{banner.ctaText}</Button>
  );

  return (
    <>
      <Overlay open onClick={close} className="z-[85]" />
      <div
        role="dialog" aria-modal="true" aria-label={banner.title || 'Offer'}
        className={cx('fixed left-1/2 top-1/2 z-[90] max-h-[90vh] w-[min(440px,92vw)] -translate-x-1/2 -translate-y-1/2 animate-pop-in overflow-auto rounded-xl bg-white shadow-deep')}
      >
        <button type="button" className={cx(closeBtn, 'absolute right-2.5 top-2.5 z-[2]')} onClick={close} aria-label="Close"><FiX size={18} /></button>
        {img && <div className="aspect-[16/10] bg-sand"><img src={img} alt="" className="size-full object-cover" /></div>}
        <div className="grid justify-items-start gap-2.5 p-[26px]">
          {banner.title && <h2 className="text-2xl">{banner.title}</h2>}
          {banner.subtitle && <p className="m-0 text-muted">{banner.subtitle}</p>}
          {cta}
        </div>
      </div>
    </>
  );
}
