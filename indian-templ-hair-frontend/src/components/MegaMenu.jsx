import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import CategoryCard from './CategoryCard';
import Container from './Container';
import { megaMenu } from '../data/content';
import { resolveImageUrl } from '../lib/api';
import { cx } from '../lib/ui';
import catWigs from '../assets/photos/cat-wigs.jpg';
import catBlonde from '../assets/photos/cat-blonde.jpg';
import catBulk from '../assets/photos/cat-bulk.jpg';
import catRaw from '../assets/photos/cat-rawbundles.jpg';
import factorySorting from '../assets/photos/factory-sorting.jpg';
import factoryWefting from '../assets/photos/factory-wefting.jpg';

// Bundled photo used until the admin uploads a category image (same keyword rules as the Home page).
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

const QUICK_LINKS = [
  { to: '/shop', label: 'All products' },
  { to: '/shop?onSale=1', label: 'Offers & deals', sale: true },
  { to: '/wholesale', label: 'Wholesale enquiries' },
  { to: '/factory', label: 'Our process' },
  { to: '/contact', label: 'Contact us' },
];

const heading = 'm-0 font-sans text-[0.74rem] font-bold uppercase tracking-[0.18em] text-walnut';

/**
 * Shop mega menu. Uses live categories (linking to /shop?category=slug) when
 * available; falls back to the static menu from data/content.js.
 */
export default function MegaMenu({ categories = [], open, onNavigate, id }) {
  const tab = open ? 0 : -1;
  return (
    <div
      id={id} aria-hidden={!open}
      className={cx(
        'absolute inset-x-0 top-full z-[5] hidden max-h-[calc(100vh-var(--navbar-h,72px)-56px)] overflow-y-auto overscroll-contain border-t border-line bg-cream shadow-[0_30px_50px_-28px_rgb(30_20_16/0.4)] transition duration-[250ms] ease-soft nav:block',
        "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-brand before:to-transparent before:content-['']",
        open ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0',
      )}
    >
      <Container className="grid items-start gap-[clamp(28px,4vw,56px)] pb-9 pt-[30px] [grid-template-columns:minmax(0,1fr)_270px]">
        {categories.length > 0 ? (
          <>
            <div className="min-w-0">
              <div className="mb-[18px] flex items-center justify-between gap-4 border-b border-line pb-3">
                <h4 className={heading}>Shop by Category</h4>
                <Link to="/shop" onClick={onNavigate} tabIndex={tab} className="group inline-flex items-center gap-1.5 whitespace-nowrap text-[0.84rem] font-semibold text-brand transition-all hover:gap-2.5 hover:text-brand-dark">
                  View all products <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
                {categories.slice(0, 5).map((c) => (
                  <div key={c.id || c.slug} onClick={onNavigate}><CategoryCard category={c} fallback={categoryFallback(c)} /></div>
                ))}
              </div>
            </div>
            <aside className="rounded-xl border border-line bg-white px-[22px] pb-3 pt-5">
              <h4 className={cx(heading, 'mb-2')}>Quick Links</h4>
              <ul className="m-0 grid list-none p-0">
                {QUICK_LINKS.map((l) => (
                  <li key={l.to} className="border-line [&+li]:border-t">
                    <Link
                      to={l.to} onClick={onNavigate} tabIndex={tab}
                      className={cx('group flex items-center justify-between gap-3 py-3 text-[0.92rem] transition-colors hover:text-brand', l.sale ? 'font-semibold text-sale hover:text-sale' : 'text-ink')}
                    >
                      <span>{l.label}</span>
                      <FiArrowRight size={14} className="-translate-x-1.5 text-brand opacity-0 transition duration-200 ease-soft group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-7">
              {megaMenu.map((col) => (
                <div key={col.title}>
                  <h4 className={cx(heading, 'mb-3.5')}>{col.title}</h4>
                  <ul className="m-0 grid list-none gap-[9px] p-0">
                    {col.items.map((it) => (
                      <li key={it}><Link to="/shop" onClick={onNavigate} tabIndex={tab} className="text-[0.93rem] text-ink transition-colors hover:text-brand">{it}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link to="/shop" onClick={onNavigate} tabIndex={tab} className="block">
              <span className="block aspect-[4/5] overflow-hidden rounded-t-full"><img src={resolveImageUrl(megaMenu[0]?.img)} alt="" className="size-full object-cover" /></span>
              <span className="mt-2.5 block text-center font-display text-[1.05rem]">Shop the collection</span>
            </Link>
          </>
        )}
      </Container>
    </div>
  );
}
