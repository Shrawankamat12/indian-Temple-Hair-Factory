import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiHeart, FiUser, FiShoppingBag, FiChevronDown, FiMenu } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';
import { useCategories, useCompanyInfo } from '../hooks/useStoreData';
import { imageOr } from '../lib/media';
import { menuCategories } from '../lib/categories';
import AnnouncementBar from './AnnouncementBar';
import MegaMenu from './MegaMenu';
import NavSearch from './NavSearch';
import MobileMenu from './MobileMenu';
import Container from './Container';
import { cx, iconBtn } from '../lib/ui';
import logo from '../assets/logo-header.png';

// Company pages stay reachable (routes are unchanged): utility links on desktop, full list in the drawer.
const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/factory', label: 'Our Process' },
  { to: '/wholesale', label: 'Wholesale' },
  { to: '/journal', label: 'Journal' },
  { to: '/contact', label: 'Contact' },
];
const UTILITY = LINKS.filter((l) => ['/about', '/wholesale', '/contact'].includes(l.to));

const navLink =
  'relative whitespace-nowrap py-3 text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-espresso transition-colors hover:text-brand after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 after:ease-soft hover:after:scale-x-100';

const headAct =
  'relative inline-flex flex-col items-center gap-0.5 px-1.5 py-0.5 text-[0.68rem] font-medium text-espresso transition-colors hover:text-brand';

export default function Navbar() {
  const { cartCount, wishlist, user } = useStore();
  const { categories: allCategories } = useCategories();
  const { company } = useCompanyInfo();
  // Logo uploaded in Admin → Settings → Business Information wins; the bundled file is only the fallback.
  const logoSrc = imageOr(company.logo, logo);
  const categories = menuCategories(allCategories);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef(null);
  const shopRef = useRef(null);
  const megaRef = useRef(null);
  const closeTimer = useRef(null);

  // publish the sticky bar height for pages with their own sticky toolbars
  useEffect(() => {
    const publish = () => document.documentElement.style.setProperty('--navbar-h', `${barRef.current?.offsetHeight || 72}px`);
    publish();
    window.addEventListener('resize', publish);
    return () => window.removeEventListener('resize', publish);
  }, [scrolled]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close everything on route change
  useEffect(() => { setMega(false); setMenuOpen(false); }, [location.pathname, location.search]);

  // Escape closes the mega menu; a click outside BOTH the "Shop" trigger and the mega panel closes it.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMega(false); };
    const onDown = (e) => {
      const inShop = shopRef.current?.contains(e.target);
      const inMega = megaRef.current?.contains(e.target);
      if (!inShop && !inMega) setMega(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openMega = () => { clearTimeout(closeTimer.current); setMega(true); };
  const closeMega = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setMega(false), 180); };
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="sticky -top-10 z-[60]">
      <AnnouncementBar />
      <div
        ref={barRef}
        className={cx('relative border-b border-line bg-white transition-shadow duration-300', scrolled && 'shadow-[0_10px_30px_-18px_rgb(30_20_16/0.35)]')}
      >
        <Container className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 py-2 nav:grid-cols-[auto_minmax(0,1fr)_auto] nav:grid-rows-[auto_auto] nav:gap-x-8 nav:gap-y-0 nav:py-1.5">
          <button
            type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}
            className={cx(iconBtn, '-ml-2.5 col-start-1 row-start-1 nav:hidden')}
          >
            <FiMenu size={22} />
          </button>

          {/* Logo: centred on mobile, spans both header rows on desktop */}
          <Link
            to="/" aria-label={`${company.brandName}, home`}
            className="group col-start-2 row-start-1 inline-flex items-center justify-self-center nav:col-start-1 nav:row-span-2 nav:justify-self-auto nav:py-0.5"
          >
            <img
              src={logoSrc} alt={company.brandName} width="102" height="92" decoding="async"
              className="h-[52px] w-auto max-w-none object-contain transition-transform duration-300 ease-soft group-hover:scale-[1.03] sm:h-[58px] nav:h-[100px]"
            />
          </Link>

          <NavSearch className="col-span-full row-start-2 nav:col-span-1 nav:col-start-2 nav:row-start-1 nav:my-2" />

          <div className="col-start-3 row-start-1 flex items-center gap-2 justify-self-end nav:gap-5">
            <Link className={cx(headAct, 'max-nav:hidden')} to={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Sign in'}>
              <FiUser size={20} /><span>{user ? 'Account' : 'Sign in'}</span>
            </Link>
            <Link className={headAct} to="/wishlist" aria-label={`Wishlist${wishlist.length ? `, ${wishlist.length} items` : ''}`}>
              <FiHeart size={20} /><span className="hidden nav:inline">Wishlist</span>
              {wishlist.length > 0 && <Count n={wishlist.length} />}
            </Link>
            <Link className={headAct} to="/cart" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`}>
              <FiShoppingBag size={20} /><span className="hidden nav:inline">Cart</span>
              {cartCount > 0 && <Count n={cartCount} />}
            </Link>
          </div>

          <nav
            aria-label="Primary"
            className="col-[2/-1] row-start-2 hidden min-h-11 min-w-0 items-center gap-[clamp(14px,2.2vw,34px)] overflow-y-hidden overflow-x-auto border-t border-line [scrollbar-width:none] nav:flex [&::-webkit-scrollbar]:hidden"
          >
            <div
              ref={shopRef} className="inline-flex items-center" onMouseEnter={openMega} onMouseLeave={closeMega}
              onBlur={(e) => {
                const next = e.relatedTarget;
                if (!e.currentTarget.contains(next) && !megaRef.current?.contains(next)) setMega(false);
              }}
            >
              <NavLink to="/shop" end className={({ isActive }) => cx(navLink, isActive && 'text-brand after:scale-x-100')}>Shop</NavLink>
              <button
                type="button" aria-label="Toggle shop menu" aria-expanded={mega} aria-controls="mega-menu"
                onClick={() => (mega ? setMega(false) : openMega())}
                className="inline-flex h-7 w-[22px] items-center justify-center border-0 bg-transparent text-brand"
              >
                <FiChevronDown size={14} className={cx('transition-transform duration-[250ms] ease-soft', mega && 'rotate-180')} />
              </button>
            </div>
            {categories.map((c) => (
              <Link key={c.slug} to={`/shop?category=${c.slug}`} className={navLink}>{c.name}</Link>
            ))}
            <Link to="/shop?onSale=1" className={cx(navLink, 'text-sale hover:text-sale after:bg-sale')}>Offers</Link>
            <span className="ml-auto flex gap-[22px]">
              {UTILITY.map((l) => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => cx('whitespace-nowrap text-[0.76rem] text-muted transition-colors hover:text-brand', isActive && 'text-brand')}>
                  {l.label}
                </NavLink>
              ))}
            </span>
          </nav>
        </Container>

        <div ref={megaRef} onMouseEnter={openMega} onMouseLeave={closeMega}>
          <MegaMenu id="mega-menu" categories={categories} open={mega} onNavigate={() => setMega(false)} />
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} links={LINKS} categories={categories} user={user} wishlistCount={wishlist.length} />
    </header>
  );
}

function Count({ n }) {
  return (
    <span className="absolute -right-0.5 -top-1 inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand px-1 text-[0.64rem] font-bold text-white">
      {n}
    </span>
  );
}
