import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import CategoryCard from './CategoryCard';
import { megaMenu } from '../data/content';
import { resolveImageUrl } from '../lib/api';
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

/**
 * Shop mega menu. Uses live categories (linking to /shop?category=slug) when
 * available; falls back to the static menu from data/content.js.
 */
export default function MegaMenu({ categories = [], open, onNavigate, id }) {
  const tab = open ? 0 : -1;
  return (
    <div className={`mega ${open ? 'open' : ''}`} id={id} aria-hidden={!open}>
      <div className="container mega-inner">
        {categories.length > 0 ? (
          <>
            <div className="mega-main">
              <div className="mega-head">
                <h4>Shop by Category</h4>
                <Link to="/shop" onClick={onNavigate} tabIndex={tab} className="mega-all">View all products <FiArrowRight size={14} /></Link>
              </div>
              <div className="mega-cats">
                {categories.slice(0, 5).map((c) => (
                  <div key={c.id || c.slug} onClick={onNavigate}><CategoryCard category={c} fallback={categoryFallback(c)} /></div>
                ))}
              </div>
            </div>
            <aside className="mega-side">
              <h4>Quick Links</h4>
              <ul>
                {QUICK_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} onClick={onNavigate} tabIndex={tab} className={l.sale ? 'mega-offer' : ''}>
                      <span>{l.label}</span><FiArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </>
        ) : (
          <>
            <div className="mega-cols">
              {megaMenu.map((col) => (
                <div key={col.title}>
                  <h4>{col.title}</h4>
                  <ul>
                    {col.items.map((it) => (
                      <li key={it}><Link to="/shop" onClick={onNavigate} tabIndex={tab}>{it}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link to="/shop" onClick={onNavigate} className="mega-feature" tabIndex={tab}>
              <span className="arch"><img src={resolveImageUrl(megaMenu[0]?.img)} alt="" /></span>
              <span className="mega-feature-label">Shop the collection</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}